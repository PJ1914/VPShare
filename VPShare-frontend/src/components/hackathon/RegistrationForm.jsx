import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import hackathonService, { initiateRazorpayPayment, validateRegistrationData, getTeamPrice, formatPrice, loadRazorpayScript, getHackathonPlanMapping, getBackendTeamSize } from '../../services/hackathonService';
import { config, logger } from '../../config/environment';
import DevNotice from '../DevNotice';

// Helper function for ordinal numbers
const getOrdinalSuffix = (num) => {
  const number = parseInt(num);
  if (number === 1) return '1st';
  if (number === 2) return '2nd';
  if (number === 3) return '3rd';
  return `${number}th`;
};

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [problemStatements, setProblemStatements] = useState([]);
  const [registrationId, setRegistrationId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Development mode check
  const isDevelopment = config.isDevelopment;
  
  const [formData, setFormData] = useState({
    // Personal Information
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      college: '',
      department: '',
      year: '',
      roll_number: ''
    },
    
    // Team Information
    team_info: {
      team_name: '',
      team_size: 1,
      team_members: [
        { name: '', email: '', phone: '', role: 'Team Leader' }
      ]
    },
    
    // Technical Information
    technical_info: {
      problem_statement: '',
      programming_languages: [],
      ai_experience: '',
      previous_hackathons: ''
    },
    
    // Commitments
    commitments: {
      ibm_skillsbuild: false,
      nasscom_registration: false
    },
    
    // Additional Information
    additional_info: {
      expectations: '',
      linkedin: '',
      github: ''
    }
  });

  // Authentication state listener with debouncing
  useEffect(() => {
    let timeoutId;
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce auth state changes to prevent multiple rapid calls
      timeoutId = setTimeout(() => {
        setUser(currentUser);
        setAuthLoading(false);
      }, 100);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, [user, isDevelopment]);

  // Check Firebase connection on component mount
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Test Firebase connection by checking auth state
        if (auth) {
          setFirebaseStatus('connected');
        }
      } catch (error) {
        setFirebaseStatus('error');
      }
    };

    checkFirebaseConnection();
  }, [isDevelopment]);

  // Load problem statements on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadProblemStatements = async () => {
      try {
        const result = await hackathonService.getProblemStatements();
        
        if (!isMounted) return; // Prevent state update if component unmounted
        
        if (result.success && result.data) {
          setProblemStatements(result.data);
          
          // Don't show development notice for fallback data - handle silently
        } else {
          // Use fallback data if API fails
          setProblemStatements(getFallbackProblemStatements());
        }
      } catch (error) {
        if (!isMounted) return; // Prevent state update if component unmounted
        
        // Use fallback problem statements silently
        setProblemStatements(getFallbackProblemStatements());
      }
    };

    loadProblemStatements();
    
    return () => {
      isMounted = false;
    };
  }, [isDevelopment]);

  const getFallbackProblemStatements = () => [
    'AI-Powered Healthcare Diagnosis System',
    'Smart Education Platform with Personalized Learning',
    'Sustainable Energy Management using AI',
    'AI-Driven Financial Risk Assessment',
    'Intelligent Transportation System',
    'Agricultural Optimization with Machine Learning',
    'Smart City Infrastructure Management',
    'AI-Enhanced Cybersecurity Solutions',
    'Automated Customer Service with NLP',
    'Predictive Analytics for Supply Chain Management'
  ];

  const programmingOptions = [
    'Python', 'JavaScript', 'Java', 'C++', 'R', 'Go', 'Scala', 'Julia', 'TypeScript', 'Swift'
  ];

  const aiExperienceOptions = [
    'Beginner (0-1 years)',
    'Intermediate (1-3 years)',
    'Advanced (3+ years)',
    'Expert (5+ years)'
  ];

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: inputValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTeamSizeChange = (size) => {
    setFormData(prev => {
      const newTeamMembers = [...prev.team_info.team_members];
      
      if (size > prev.team_info.team_size) {
        // Add new team members
        for (let i = prev.team_info.team_size; i < size; i++) {
          newTeamMembers.push({ name: '', email: '', phone: '', role: `Member ${i + 1}` });
        }
      } else if (size < prev.team_info.team_size) {
        // Remove team members
        newTeamMembers.splice(size);
      }
      
      return {
        ...prev,
        team_info: {
          ...prev.team_info,
          team_size: size,
          team_members: newTeamMembers
        }
      };
    });
  };

  const handleTeamMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      team_info: {
        ...prev.team_info,
        team_members: prev.team_info.team_members.map((member, i) => 
          i === index ? { ...member, [field]: value } : member
        )
      }
    }));
  };

  const handleProgrammingLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      technical_info: {
        ...prev.technical_info,
        programming_languages: prev.technical_info.programming_languages.includes(language)
          ? prev.technical_info.programming_languages.filter(lang => lang !== language)
          : [...prev.technical_info.programming_languages, language]
      }
    }));
  };

  const validateCurrentStep = () => {
    const validation = validateRegistrationData(formData);
    
    // Filter errors based on current step
    const stepErrors = {};
    
    switch (step) {
      case 1:
        // Personal information validation
        const personalFields = ['fullName', 'email', 'phone', 'college', 'department', 'year', 'rollNumber'];
        personalFields.forEach(field => {
          if (validation.errors[field]) {
            stepErrors[field] = validation.errors[field];
          }
        });
        break;
      
      case 2:
        // Team information validation
        const teamFields = ['teamName', 'teamSize', 'teamMembers'];
        teamFields.forEach(field => {
          if (validation.errors[field]) {
            stepErrors[field] = validation.errors[field];
          }
        });
        
        // Add team member specific errors
        Object.keys(validation.errors).forEach(key => {
          if (key.includes('teamMember')) {
            stepErrors[key] = validation.errors[key];
          }
        });
        break;
      
      case 3:
        // Technical information validation
        const technicalFields = ['problemStatement', 'programmingLanguages', 'aiExperience'];
        technicalFields.forEach(field => {
          if (validation.errors[field]) {
            stepErrors[field] = validation.errors[field];
          }
        });
        break;
      
      case 4:
        // Requirements validation
        const requirementFields = ['ibmSkillsBuild', 'nascomRegistration'];
        requirementFields.forEach(field => {
          if (validation.errors[field]) {
            stepErrors[field] = validation.errors[field];
          }
        });
        break;
      
      default:
        break;
    }
    
    // Set only the errors for the current step
    setErrors(stepErrors);
    
    // Return true if no errors for current step
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    try {
      // Ensure formData is properly structured
      if (!formData || typeof formData !== 'object') {
        return;
      }

      const isValid = validateCurrentStep();
      
      if (isValid) {
        const nextStepNumber = Math.min(step + 1, 5);
        setStep(nextStepNumber);
      }
    } catch (error) {
      // Set a generic error message for the user
      setErrors(prev => ({
        ...prev,
        general: 'An error occurred while processing the form. Please try again.'
      }));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication first
    if (!user) {
      setErrors({ 
        authentication: 'You must be logged in to register for the hackathon. Please sign in first.' 
      });
      return;
    }
    
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: First register the participant with the backend
      const registrationResult = await hackathonService.register(formData);
      
      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Registration failed');
      }
      
      const { registration_id, team_size } = registrationResult.data;
      setRegistrationId(registration_id);
      
      // Get user token for payment
      const token = await user.getIdToken();
      
      // Calculate amount using backend-compatible pricing
      const teamSize = team_size;
      const backendTeamSize = getBackendTeamSize(teamSize); // Backend only supports 1 and 3
      const baseAmount = getTeamPrice(teamSize);
      const amount = baseAmount * 100; // Convert to paise for Razorpay order creation
      const amountInPaise = baseAmount * 100; // Lambda expects amount in paise for verification
      
      // Use hackathon payment format that the Lambda expects
      const orderPayload = { 
        payment_type: 'hackathon',
        registration_id: registration_id,
        team_size: backendTeamSize, // Use backend-compatible team size
        amount: amount
      };
      
      // Use axios exactly like Payment.jsx does
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-order`,
        orderPayload,
        { 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );
      
      const { order_id, amount: orderAmount, currency, key_id } = orderResponse.data || {};
      if (!order_id || !orderAmount || !currency || !key_id) {
        throw new Error('Failed to create order: Missing required order details from payment gateway');
      }
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }
      
      // Use exact same Razorpay options structure as Payment.jsx
      const options = {
        key: key_id,
        amount: orderAmount,
        currency,
        order_id,
        name: 'CognitiveX GenAI Hackathon',
        description: `Hackathon Registration - ${teamSize === 1 ? 'Individual' : 'Team'} (${teamSize} members)`,
        prefill: {
          name: formData.personal_info.full_name,
          email: formData.personal_info.email,
          contact: formData.personal_info.phone,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response) {
          try {
            // Get a fresh token for payment verification (in case Razorpay modal took time)
            const freshToken = await user.getIdToken();
            
            // Verify payment using hackathon format
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_type: 'hackathon',
                registration_id: registration_id,
                team_size: backendTeamSize, // Use backend-compatible team size
                amount: amountInPaise, // Send amount in paise for Lambda validation
                email: formData.personal_info.email,
              },
              { 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
                timeout: 15000 // 15 second timeout for payment verification
              }
            );

            // Store hackathon registration data in Firestore (like Payment.jsx does with subscription)
            const db = getFirestore();
            
            const registrationDoc = doc(db, 'hackathon_registrations', user.uid);
            await setDoc(registrationDoc, {
              // Registration details
              personal_info: formData.personal_info,
              team_info: formData.team_info,
              technical_info: formData.technical_info,
              commitments: formData.commitments,
              additional_info: formData.additional_info,
              // Payment details
              payment: {
                plan: `hackathon_team_${teamSize}`,
                status: 'active',
                startDate: serverTimestamp(),
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amount,
                actualAmount: baseAmount,
                teamSize: teamSize,
                registrationId: registration_id
              },
              // Metadata
              registration_date: serverTimestamp(),
              user_id: user.uid,
              status: 'active'
            }, { merge: true });
            
            // Success - redirect to success step
            setPaymentStatus('success');
            setSuccess(true);
            setStep(6); // Success step
            
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            setErrors({ payment: `Payment verification failed: ${error.response?.data?.error || error.message || 'Please contact support.'}` });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('cancelled');
            setErrors({ payment: 'Payment was cancelled. Please try again.' });
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Registration/Payment error:', error);
      
      // In development mode, provide a fallback
      if (isDevelopment && (error.message.includes('Order creation failed') || error.message.includes('Network Error'))) {
        // Store registration data in Firebase without payment
        try {
          const db = getFirestore();
          
          const registrationDoc = doc(db, 'hackathon_registrations', user.uid);
          await setDoc(registrationDoc, {
            personal_info: formData.personal_info,
            team_info: formData.team_info,
            technical_info: formData.technical_info,
            commitments: formData.commitments,
            additional_info: formData.additional_info,
            payment_info: {
              payment_id: 'dev_test_payment',
              order_id: 'dev_test_order',
              amount: getTeamPrice(formData.team_info.team_size) * 100,
              status: 'development_mode'
            },
            registration_date: serverTimestamp(),
            user_id: user.uid,
            status: 'active'
          });
          
          setSuccess(true);
          setStep(6); // Success step
          setErrors({});
          
        } catch (firebaseError) {
          console.error('Firebase fallback error:', firebaseError);
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else {
        setErrors({ general: `Registration failed: ${error.message || 'Please try again.'}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Personal Information</h3>
      
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="full_name"
          value={formData.personal_info.full_name}
          onChange={(e) => handleInputChange(e, 'personal_info')}
          className={errors.fullName ? 'error' : ''}
          placeholder="Enter your full name"
        />
        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.personal_info.email}
            onChange={(e) => handleInputChange(e, 'personal_info')}
            className={errors.email ? 'error' : ''}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.personal_info.phone}
            onChange={(e) => handleInputChange(e, 'personal_info')}
            className={errors.phone ? 'error' : ''}
            placeholder="+91 XXXXX XXXXX"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>College/University *</label>
        <input
          type="text"
          name="college"
          value={formData.personal_info.college}
          onChange={(e) => handleInputChange(e, 'personal_info')}
          className={errors.college ? 'error' : ''}
          placeholder="Enter your college name"
        />
        {errors.college && <span className="error-message">{errors.college}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Department *</label>
          <input
            type="text"
            name="department"
            value={formData.personal_info.department}
            onChange={(e) => handleInputChange(e, 'personal_info')}
            className={errors.department ? 'error' : ''}
            placeholder="e.g., Computer Science"
          />
          {errors.department && <span className="error-message">{errors.department}</span>}
        </div>
        
        <div className="form-group">
          <label>Year of Study *</label>
          <select
            name="year"
            value={formData.personal_info.year}
            onChange={(e) => handleInputChange(e, 'personal_info')}
            className={errors.year ? 'error' : ''}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="graduate">Graduate</option>
          </select>
          {errors.year && <span className="error-message">{errors.year}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Roll Number/Student ID *</label>
        <input
          type="text"
          name="roll_number"
          value={formData.personal_info.roll_number}
          onChange={(e) => handleInputChange(e, 'personal_info')}
          className={errors.rollNumber ? 'error' : ''}
          placeholder="Enter your roll number"
        />
        {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
      </div>
    </motion.div>
  );

  const renderTeamInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Team Information</h3>
      
      <div className="form-group">
        <label>Team Name *</label>
        <input
          type="text"
          name="team_name"
          value={formData.team_info.team_name}
          onChange={(e) => handleInputChange(e, 'team_info')}
          className={errors.teamName ? 'error' : ''}
          placeholder="Enter your team name"
        />
        {errors.teamName && <span className="error-message">{errors.teamName}</span>}
      </div>

      <div className="form-group">
        <label>Team Size *</label>
        <div className="team-size-selector">
          {[1, 3].map(size => (
            <button
              key={size}
              type="button"
              className={`size-btn ${formData.team_info.team_size === size ? 'active' : ''}`}
              onClick={() => handleTeamSizeChange(size)}
            >
              {size === 1 ? '1 Member (Individual)' : '3 Members (Team)'}
              <span className="price">{formatPrice(getTeamPrice(size))}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="team-members">
        <h4>Team Members</h4>
        {formData.team_info.team_members.map((member, index) => (
          <div key={index} className="team-member">
            <h5>{member.role}</h5>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                  className={errors[`teamMember${index}Name`] ? 'error' : ''}
                  placeholder="Member name"
                />
                {errors[`teamMember${index}Name`] && (
                  <span className="error-message">{errors[`teamMember${index}Name`]}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                  className={errors[`teamMember${index}Email`] ? 'error' : ''}
                  placeholder="member@example.com"
                />
                {errors[`teamMember${index}Email`] && (
                  <span className="error-message">{errors[`teamMember${index}Email`]}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={member.phone}
                onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                className={errors[`teamMember${index}Phone`] ? 'error' : ''}
                placeholder="+91 XXXXX XXXXX"
              />
              {errors[`teamMember${index}Phone`] && (
                <span className="error-message">{errors[`teamMember${index}Phone`]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderTechnicalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Technical Information</h3>
      
      <div className="form-group">
        <label>Problem Statement *</label>
        <select
          name="problem_statement"
          value={formData.technical_info.problem_statement}
          onChange={(e) => handleInputChange(e, 'technical_info')}
          className={errors.problemStatement ? 'error' : ''}
        >
          <option value="">Select a problem statement</option>
          {problemStatements.map((statement, index) => {
            // Handle both string and object formats
            const isObject = typeof statement === 'object' && statement !== null;
            const value = isObject ? (statement.title || statement.name || `Problem ${index + 1}`) : statement;
            const displayText = isObject ? (statement.title || statement.name || `Problem ${index + 1}`) : statement;
            const key = isObject ? (statement.id || `obj-${index}`) : `str-${index}`;
            
            // Skip if no valid value
            if (!value || !displayText) return null;
            
            return (
              <option key={key} value={value}>
                {displayText}
              </option>
            );
          }).filter(Boolean)}
        </select>
        {errors.problemStatement && <span className="error-message">{errors.problemStatement}</span>}
      </div>

      <div className="form-group">
        <label>Programming Languages *</label>
        <div className="checkbox-grid">
          {programmingOptions.map(language => (
            <label 
              key={language} 
              className="checkbox-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: '#ffffff',
                border: '2px solid #e1e8ed',
                borderRadius: '10px',
                cursor: 'pointer',
                minHeight: '50px'
              }}
            >
              <input
                type="checkbox"
                checked={formData.technical_info.programming_languages.includes(language)}
                onChange={() => handleProgrammingLanguageToggle(language)}
                style={{
                  width: '20px',
                  height: '20px',
                  margin: '0',
                  accentColor: '#2196F3'
                }}
              />
              <span style={{
                color: '#2c3e50',
                fontWeight: '500',
                fontSize: '0.95rem'
              }}>
                {language}
              </span>
            </label>
          ))}
        </div>
        {errors.programmingLanguages && <span className="error-message">{errors.programmingLanguages}</span>}
      </div>

      <div className="form-group">
        <label>AI/ML Experience Level *</label>
        <select
          name="ai_experience"
          value={formData.technical_info.ai_experience}
          onChange={(e) => handleInputChange(e, 'technical_info')}
          className={errors.aiExperience ? 'error' : ''}
        >
          <option value="">Select your experience level</option>
          {aiExperienceOptions.map((level, index) => (
            <option key={index} value={level}>
              {level}
            </option>
          ))}
        </select>
        {errors.aiExperience && <span className="error-message">{errors.aiExperience}</span>}
      </div>

      <div className="form-group">
        <label>Previous Hackathon Experience</label>
        <textarea
          name="previous_hackathons"
          value={formData.technical_info.previous_hackathons}
          onChange={(e) => handleInputChange(e, 'technical_info')}
          placeholder="Describe your previous hackathon experiences (optional)"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>LinkedIn Profile</label>
          <input
            type="url"
            name="linkedin"
            value={formData.additional_info.linkedin}
            onChange={(e) => handleInputChange(e, 'additional_info')}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        
        <div className="form-group">
          <label>GitHub Profile</label>
          <input
            type="url"
            name="github"
            value={formData.additional_info.github}
            onChange={(e) => handleInputChange(e, 'additional_info')}
            placeholder="https://github.com/yourusername"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderRequirements = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Requirements & Commitments</h3>
      
      <div className="form-group">
        <label>What are your expectations from this hackathon?</label>
        <textarea
          name="expectations"
          value={formData.additional_info.expectations}
          onChange={(e) => handleInputChange(e, 'additional_info')}
          placeholder="Share your expectations and what you hope to achieve"
          rows="4"
        />
      </div>

      <div className="requirements-section">
        <div className="requirement-item" style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#fff8e1',
          border: '2px solid #ffcc02',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(255, 204, 2, 0.1)'
        }}>
          <label 
            className="checkbox-requirement"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              cursor: 'pointer',
              color: '#2c3e50',
              margin: '0',
              fontWeight: 'normal',
              width: '100%'
            }}
          >
            <input
              type="checkbox"
              name="ibm_skillsbuild"
              checked={formData.commitments.ibm_skillsbuild}
              onChange={(e) => handleInputChange(e, 'commitments')}
              className={errors.ibmSkillsBuild ? 'error' : ''}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ff9800',
                marginTop: '2px',
                flexShrink: '0',
                margin: '0'
              }}
            />
            <div className="requirement-content" style={{ flex: '1', color: '#2c3e50' }}>
              <h4 style={{
                color: '#e65100',
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'block'
              }}>
                IBM SkillsBuild Commitment *
              </h4>
              <p style={{
                color: '#6c757d',
                margin: '0',
                lineHeight: '1.5',
                fontSize: '0.95rem',
                display: 'block'
              }}>
                I commit to completing at least 2 courses on IBM SkillsBuild platform during the 4-day bootcamp period.
              </p>
            </div>
          </label>
          {errors.ibmSkillsBuild && <span className="error-message">{errors.ibmSkillsBuild}</span>}
        </div>

        <div className="requirement-item" style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#fff8e1',
          border: '2px solid #ffcc02',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(255, 204, 2, 0.1)'
        }}>
          <label 
            className="checkbox-requirement"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              cursor: 'pointer',
              color: '#2c3e50',
              margin: '0',
              fontWeight: 'normal',
              width: '100%'
            }}
          >
            <input
              type="checkbox"
              name="nasscom_registration"
              checked={formData.commitments.nasscom_registration}
              onChange={(e) => handleInputChange(e, 'commitments')}
              className={errors.nascomRegistration ? 'error' : ''}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ff9800',
                marginTop: '2px',
                flexShrink: '0',
                margin: '0'
              }}
            />
            <div className="requirement-content" style={{ flex: '1', color: '#2c3e50' }}>
              <h4 style={{
                color: '#e65100',
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'block'
              }}>
                NASSCOM FSP Registration *
              </h4>
              <p style={{
                color: '#6c757d',
                margin: '0',
                lineHeight: '1.5',
                fontSize: '0.95rem',
                display: 'block'
              }}>
                I commit to registering for NASSCOM's Future Skills Prime (FSP) platform as part of this program.
              </p>
            </div>
          </label>
          {errors.nascomRegistration && <span className="error-message">{errors.nascomRegistration}</span>}
        </div>
      </div>

      <div className="commitment-note" style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#ffecb3',
        borderLeft: '4px solid #ff9800',
        borderRadius: '8px'
      }}>
        <p style={{
          color: '#e65100',
          margin: '0',
          fontSize: '0.9rem'
        }}>
          <strong style={{ color: '#e65100' }}>Note:</strong> Both commitments are mandatory for participation. Failure to complete these requirements may result in disqualification from the hackathon.
        </p>
      </div>
    </motion.div>
  );

  const renderReview = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Review & Payment</h3>
      <p className="review-subtitle">Please review all your information before proceeding with payment</p>
      
      <div className="review-summary">
        {/* Personal Information */}
        <div className="summary-section">
          <h4>📋 Personal Information</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Name:</strong> {formData.personal_info.full_name || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Email:</strong> {formData.personal_info.email || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Phone:</strong> {formData.personal_info.phone || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>College:</strong> {formData.personal_info.college || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Department:</strong> {formData.personal_info.department || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Year:</strong> {formData.personal_info.year ? `${formData.personal_info.year}${formData.personal_info.year === 'graduate' ? '' : getOrdinalSuffix(formData.personal_info.year)} Year` : 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Roll Number:</strong> {formData.personal_info.roll_number || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="summary-section">
          <h4>👥 Team Information</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Team Name:</strong> {formData.team_info.team_name || 'Not provided'}
            </div>
            <div className="summary-item">
              <strong>Team Size:</strong> {formData.team_info.team_size} {formData.team_info.team_size === 1 ? 'member (Individual)' : 'members (Group)'}
            </div>
          </div>
          
          {/* Team Members Details */}
          <div className="team-members-review">
            <strong>Team Members:</strong>
            {formData.team_info.team_members.map((member, index) => (
              <div key={index} className="member-review">
                <div className="member-role">{member.role}:</div>
                <div className="member-details">
                  <span>{member.name || `Member ${index + 1} (Name not provided)`}</span>
                  {member.email && <span> • {member.email}</span>}
                  {member.phone && <span> • {member.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Information */}
        <div className="summary-section">
          <h4>💻 Technical Information</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Problem Statement:</strong> {formData.technical_info.problem_statement || 'Not selected'}
            </div>
            <div className="summary-item">
              <strong>Programming Languages:</strong> 
              <div className="languages-list">
                {formData.technical_info.programming_languages.length > 0 
                  ? formData.technical_info.programming_languages.join(', ')
                  : 'None selected'
                }
              </div>
            </div>
            <div className="summary-item">
              <strong>AI Experience:</strong> {formData.technical_info.ai_experience || 'Not specified'}
            </div>
            <div className="summary-item">
              <strong>Previous Hackathons:</strong> {formData.technical_info.previous_hackathons || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Commitments */}
        <div className="summary-section">
          <h4>✅ Requirements & Commitments</h4>
          <div className="commitments-review">
            <div className={`commitment-item ${formData.commitments.ibm_skillsbuild ? 'committed' : 'not-committed'}`}>
              <span className="commitment-status">{formData.commitments.ibm_skillsbuild ? '✅' : '❌'}</span>
              <span>IBM SkillsBuild Course Completion</span>
            </div>
            <div className={`commitment-item ${formData.commitments.nasscom_registration ? 'committed' : 'not-committed'}`}>
              <span className="commitment-status">{formData.commitments.nasscom_registration ? '✅' : '❌'}</span>
              <span>NASSCOM FSP Platform Registration</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(formData.additional_info.expectations || formData.additional_info.linkedin || formData.additional_info.github) && (
          <div className="summary-section">
            <h4>ℹ️ Additional Information</h4>
            <div className="summary-grid">
              {formData.additional_info.expectations && (
                <div className="summary-item">
                  <strong>Expectations:</strong> {formData.additional_info.expectations}
                </div>
              )}
              {formData.additional_info.linkedin && (
                <div className="summary-item">
                  <strong>LinkedIn:</strong> 
                  <a href={formData.additional_info.linkedin} target="_blank" rel="noopener noreferrer">
                    {formData.additional_info.linkedin}
                  </a>
                </div>
              )}
              {formData.additional_info.github && (
                <div className="summary-item">
                  <strong>GitHub:</strong> 
                  <a href={formData.additional_info.github} target="_blank" rel="noopener noreferrer">
                    {formData.additional_info.github}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="summary-section payment-section">
          <h4>💳 Payment Summary</h4>
          <div className="payment-breakdown">
            <div className="payment-row">
              <span>Registration Fee ({formData.team_info.team_size === 1 ? 'Individual' : 'Group'}):</span>
              <span>{formatPrice(getTeamPrice(formData.team_info.team_size))}</span>
            </div>
            <div className="payment-row total">
              <span><strong>Total Amount:</strong></span>
              <span><strong>{formatPrice(getTeamPrice(formData.team_info.team_size))}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.registration && (
        <div className="error-message registration-error">
          {errors.registration}
        </div>
      )}

      {errors.payment && (
        <div className="error-message payment-error">
          {errors.payment}
        </div>
      )}

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="terms-acceptance">
        <div className="terms-header">
          <strong>📝 Terms & Conditions</strong>
        </div>
        <div className="terms-content">
          <p><strong>By proceeding with payment, you confirm that:</strong></p>
          <ul>
            <li>All information provided is accurate and complete</li>
            <li>You will complete the IBM SkillsBuild courses during the bootcamp</li>
            <li>You will register for NASSCOM FSP platform as required</li>
            <li>You will participate in the full 4-day bootcamp and 24-hour hackathon</li>
            <li>You will follow all hackathon rules and guidelines</li>
            <li>You understand the refund policy as outlined in the hackathon guidelines</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="registration-step success-step"
    >
      <div className="success-content">
        <div className="success-icon">🎉</div>
        <h3>Registration Successful!</h3>
        <p>Congratulations! Your registration for the CognitiveX GenAI Hackathon has been confirmed.</p>
        
        <div className="success-details">
          <div className="detail-row">
            <strong>Registration ID:</strong> <span className="highlight">{registrationId || 'DEMO-REG-001'}</span>
          </div>
          <div className="detail-row">
            <strong>Team Name:</strong> <span>{formData.team_info.team_name || 'Your Team'}</span>
          </div>
          <div className="detail-row">
            <strong>Team Size:</strong> <span>{formData.team_info.team_size} {formData.team_info.team_size === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="detail-row">
            <strong>Amount Paid:</strong> <span className="amount">{formatPrice(getTeamPrice(formData.team_info.team_size))}</span>
          </div>
          <div className="detail-row">
            <strong>Payment Status:</strong> <span className="status-paid">✅ {isDevelopment ? 'Demo Mode' : 'Paid'}</span>
          </div>
          {isDevelopment && (
            <div className="detail-row">
              <strong>Firebase Status:</strong> <span className="status-firebase">
                {firebaseStatus === 'connected' ? '✅ Data Saved to Firestore' : '⏳ Checking Connection'}
              </span>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h4>📋 What's Next?</h4>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Check Your Email</strong>
                <p>Detailed information about the bootcamp will be sent to <strong>{formData.personal_info.email}</strong></p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Join WhatsApp Group</strong>
                <p>You'll receive a link to join our official hackathon WhatsApp group for updates</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Complete IBM SkillsBuild</strong>
                <p>Register and complete the required courses before the bootcamp starts</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>NASSCOM FSP Registration</strong>
                <p>Complete your registration on the NASSCOM Future Skills Platform</p>
              </div>
            </div>
          </div>
        </div>

        <div className="important-dates">
          <h4>📅 Important Dates</h4>
          <div className="dates-list">
            <div className="date-item">
              <strong>Bootcamp:</strong> 5 days of intensive learning and preparation
            </div>
            <div className="date-item">
              <strong>Hackathon:</strong> 2-day continuous coding challenge
            </div>
            <div className="date-item">
              <strong>Problem Statement:</strong> {formData.technical_info.problem_statement || 'Will be revealed during bootcamp'}
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h4>🤝 Need Help?</h4>
          <div className="contact-details">
            <p><strong>Email:</strong> <a href="mailto:hackathon@tkrcollege.ac.in">hackathon@tkrcollege.ac.in</a></p>
            <p><strong>Website:</strong> <a href="https://codetapasya.com" target="_blank" rel="noopener noreferrer">codetapasya.com</a></p>
            <p><strong>Event Partner:</strong> SmartBridge & IBM</p>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Register Another Team
          </button>
          <button 
            className="btn-secondary"
            onClick={() => window.print()}
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderPersonalInfo();
      case 2: return renderTeamInfo();
      case 3: return renderTechnicalInfo();
      case 4: return renderRequirements();
      case 5: return renderReview();
      case 6: return renderSuccess();
      default: return renderPersonalInfo();
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="registration-container">
        <div className="auth-loading" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="registration-container">
        <div className="auth-required" style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          margin: '40px 0'
        }}>
          <h2 style={{ marginBottom: '20px' }}>🔐 Authentication Required</h2>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            You need to be logged in to register for the CognitiveX Hackathon.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <strong>Why do we need authentication?</strong>
            <ul style={{ textAlign: 'left', marginTop: '10px', maxWidth: '400px', margin: '10px auto 0' }}>
              <li>Secure your registration data</li>
              <li>Manage your team participation</li>
              <li>Track your progress and commitments</li>
              <li>Enable team collaboration features</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              background: 'white',
              color: '#ee5a52',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="registration-container">
        {renderSuccess()}
      </div>
    );
  }

  return (
    <div className="registration-container">
      {/* DevNotice for API issues */}
      <DevNotice 
        show={showDevNotice}
        onDismiss={() => setShowDevNotice(false)}
        message="APIs are not available in development. Using local fallback data."
      />
      
      {/* Authentication Error */}
      {errors.authentication && (
        <div className="error-message" style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          color: '#c62828',
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '0 0 20px 0'
        }}>
          {errors.authentication}
        </div>
      )}

      {/* Progress Indicator */}
      <div className="progress-indicator">
        {[1, 2, 3, 4, 5].map(stepNum => (
          <div
            key={stepNum}
            className={`progress-step ${step >= stepNum ? 'active' : ''}`}
          >
            {stepNum}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="step-labels">
        <span className={step >= 1 ? 'active' : ''}>Personal</span>
        <span className={step >= 2 ? 'active' : ''}>Team</span>
        <span className={step >= 3 ? 'active' : ''}>Technical</span>
        <span className={step >= 4 ? 'active' : ''}>Requirements</span>
        <span className={step >= 5 ? 'active' : ''}>Review</span>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {/* Display general error if any */}
          {errors.general && (
            <div className="error-message general-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {errors.general}
            </div>
          )}
          
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary"
              disabled={loading}
            >
              Previous
            </button>
          )}
          
          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary"
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary payment-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(getTeamPrice(formData.team_info.team_size))}`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
