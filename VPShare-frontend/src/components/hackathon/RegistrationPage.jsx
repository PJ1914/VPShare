import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHackathon } from '../../contexts/HackathonContext';
import { useNotification } from '../../contexts/NotificationContext';
import hackathonService from '../../services/hackathonService';
// Icon imports
import { Star, ArrowLeft, Target, Code, Users, Brain, CreditCard, CheckCircle } from 'lucide-react';
import '../../styles/RegistrationPage.css';

const RegistrationPage = ({ onBack }) => {
  const { currentHackathon, registerTeam, loading } = useHackathon();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: 1, // Add team size field
    teamLead: {
      name: '',
      email: '',
      phone: '',
      college: '',
      rollNumber: '',
      year: '',
      branch: ''
    },
    members: [
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '' },
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '' },
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '' }
    ],
    selectedTrack: '',
    projectIdea: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState({});
  const [step, setStep] = useState(1);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Email validation utility function with improved flexibility
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Enhanced phone number validation for Indian numbers
  const isValidPhone = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Handle different formats:
    // +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      const number = cleanPhone.substring(2);
      return /^[6-9]\d{9}$/.test(number);
    } else if (cleanPhone.length === 10) {
      return /^[6-9]\d{9}$/.test(cleanPhone);
    }
    return false;
  };

  // Email domain suggestion for common typos
  const getEmailSuggestion = (email) => {
    if (!email.includes('@')) return null;
    
    const [localPart, domainPart] = email.split('@');
    const domain = domainPart.toLowerCase();
    
    // Common email domains and their typical typos
    const domainCorrections = {
      // Gmail variations
      'gamil.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gml.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmails.com': 'gmail.com',
      'gail.com': 'gmail.com',
      'gmaik.com': 'gmail.com',
      'gmaio.com': 'gmail.com',
      
      // Yahoo variations
      'yaho.com': 'yahoo.com',
      'yahoo.co': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yaho.co.in': 'yahoo.co.in',
      'yahoo.con': 'yahoo.com',
      'yhoo.com': 'yahoo.com',
      'ymail.com': 'yahoo.com',
      
      // Hotmail variations
      'hotmai.com': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmailcom': 'hotmail.com',
      'hotmails.com': 'hotmail.com',
      
      // Outlook variations
      'outlok.com': 'outlook.com',
      'outlook.co': 'outlook.com',
      'outlooks.com': 'outlook.com',
      
      // Other common domains
      'rediffmail.co': 'rediffmail.com',
      'rediff.com': 'rediffmail.com',
      'live.co': 'live.com',
      'lives.com': 'live.com'
    };

    // Check for exact match in corrections
    if (domainCorrections[domain]) {
      return `${localPart}@${domainCorrections[domain]}`;
    }

    // Check for partial matches using similarity
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'rediffmail.com', 'live.com', 'yahoo.co.in', 'protonmail.com',
      'icloud.com', 'aol.com'
    ];

    for (const correctDomain of commonDomains) {
      if (calculateSimilarity(domain, correctDomain) > 0.6) {
        return `${localPart}@${correctDomain}`;
      }
    }

    return null;
  };

  // Calculate string similarity using Levenshtein distance
  const calculateSimilarity = (str1, str2) => {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - matrix[len2][len1] / maxLen;
  };

  // Enhanced real-time email validation
  const validateEmail = (email, fieldName) => {
    if (!email.trim()) {
      return `${fieldName} is required`;
    }
    
    // Check basic format first
    if (!email.includes('@') || email.split('@').length !== 2) {
      return `Please enter a valid email format (example: name@domain.com)`;
    }
    
    const [localPart, domainPart] = email.split('@');
    
    // Check if local part is empty
    if (!localPart.trim()) {
      return `Email must have a username before @ symbol`;
    }
    
    // Check if domain part is empty
    if (!domainPart.trim()) {
      return `Email must have a domain after @ symbol`;
    }
    
    // Check if domain has at least one dot
    if (!domainPart.includes('.')) {
      return `Domain must include a valid extension (like .com, .in, etc.)`;
    }
    
    if (!isValidEmail(email)) {
      const suggestion = getEmailSuggestion(email);
      if (suggestion) {
        // Store the suggestion for later use
        const suggestionKey = fieldName.toLowerCase().includes('team lead') ? 
          'teamleademailSuggestion' : 
          fieldName.toLowerCase().includes('member') ? 
            `${fieldName.toLowerCase().replace(/\s+/g, '').replace('email', '')}emailSuggestion` :
            `${fieldName.toLowerCase().replace(/\s+/g, '')}Suggestion`;
        
        setEmailSuggestions(prev => ({
          ...prev,
          [suggestionKey]: suggestion
        }));
        return `Invalid email format`;
      }
      return `Please enter a valid email address (example: name@domain.com)`;
    } else {
      // Clear suggestion if email is valid
      const suggestionKey = fieldName.toLowerCase().includes('team lead') ? 
        'teamleademailSuggestion' : 
        fieldName.toLowerCase().includes('member') ? 
          `${fieldName.toLowerCase().replace(/\s+/g, '').replace('email', '')}emailSuggestion` :
          `${fieldName.toLowerCase().replace(/\s+/g, '')}Suggestion`;
      
      setEmailSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[suggestionKey];
        return newSuggestions;
      });
    }
    
    return null;
  };

  // Function to apply email suggestion
  const applySuggestion = (section, field, suggestion, index = null) => {
    handleInputChange(section, field, suggestion, index);
    
    // Clear the suggestion after applying
    const suggestionKey = section === 'teamLead' ? 
      `teamleademailSuggestion` : 
      `member${index}emailSuggestion`;
    
    setEmailSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[suggestionKey];
      return newSuggestions;
    });
    
    // Clear any related errors
    const errorKey = section === 'teamLead' ? 'teamLeadEmail' : `member${index}Email`;
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };

  // Enhanced real-time phone validation
  const validatePhone = (phone, fieldName) => {
    if (!phone.trim()) {
      return `${fieldName} is required`;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return `Phone number must be at least 10 digits`;
    }
    
    if (cleanPhone.length > 12) {
      return `Phone number cannot be more than 12 digits`;
    }
    
    if (!isValidPhone(phone)) {
      if (cleanPhone.length === 10) {
        return `Indian mobile numbers must start with 6, 7, 8, or 9`;
      } else if (cleanPhone.length === 11) {
        return `For 11-digit numbers, use format: 91XXXXXXXXXX`;
      } else if (cleanPhone.length === 12) {
        return `For 12-digit numbers, use format: 91XXXXXXXXXX`;
      }
      return `Please enter a valid Indian mobile number (10 digits starting with 6-9)`;
    }
    
    return null;
  };

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      if (section === 'teamLead') {
        return {
          ...prev,
          teamLead: { ...prev.teamLead, [field]: value }
        };
      } else if (section === 'members' && index !== null) {
        const newMembers = [...prev.members];
        // Ensure the member object exists at the index
        if (!newMembers[index]) {
          newMembers[index] = {
            name: '',
            email: '',
            phone: '',
            college: '',
            rollNumber: '',
            year: '',
            branch: ''
          };
        }
        newMembers[index] = { ...newMembers[index], [field]: value };
        return { ...prev, members: newMembers };
      } else if (section === 'root' && field === 'teamSize') {
        // When team size changes, initialize members array appropriately
        const newTeamSize = parseInt(value);
        const requiredMembers = newTeamSize - 1; // Excluding team leader
        const newMembers = [...prev.members];
        
        // Add empty member objects if needed
        while (newMembers.length < requiredMembers) {
          newMembers.push({
            name: '',
            email: '',
            phone: '',
            college: '',
            rollNumber: '',
            year: '',
            branch: ''
          });
        }
        
        // Remove extra members if team size decreased
        if (newMembers.length > requiredMembers) {
          newMembers.splice(requiredMembers);
        }
        
        return { ...prev, [field]: value, members: newMembers };
      } else {
        return { ...prev, [field]: value };
      }
    });

    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    if (section === 'teamLead') {
      const errorKey = `teamLead${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (field === 'email') {
        const emailError = validateEmail(value, 'Team lead email');
        if (emailError) {
          newErrors[errorKey] = emailError;
        } else {
          delete newErrors[errorKey];
        }
      } else if (field === 'phone') {
        const phoneError = validatePhone(value, 'Phone');
        if (phoneError) {
          newErrors[errorKey] = phoneError;
        } else {
          delete newErrors[errorKey];
        }
      } else {
        // Clear error for other fields when user starts typing
        delete newErrors[errorKey];
      }
    } else if (section === 'members' && index !== null) {
      const errorKey = `member${index}${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (field === 'email' && value.trim()) {
        const emailError = validateEmail(value, `Member ${index + 2} email`);
        if (emailError) {
          newErrors[errorKey] = emailError;
        } else {
          delete newErrors[errorKey];
        }
      } else if (field === 'phone' && value.trim()) {
        const phoneError = validatePhone(value, 'Phone');
        if (phoneError) {
          newErrors[errorKey] = phoneError;
        } else {
          delete newErrors[errorKey];
        }
      } else {
        delete newErrors[errorKey];
      }
    } else {
      // Clear error for root level fields
      delete newErrors[field];
    }

    setErrors(newErrors);
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      // Team name validation
      if (!formData.teamName.trim()) {
        newErrors.teamName = 'Team name is required';
      } else if (formData.teamName.trim().length < 3) {
        newErrors.teamName = 'Team name must be at least 3 characters long';
      }

      // Team lead name validation
      if (!formData.teamLead.name.trim()) {
        newErrors.teamLeadName = 'Team lead name is required';
      } else if (formData.teamLead.name.trim().length < 2) {
        newErrors.teamLeadName = 'Name must be at least 2 characters long';
      }

      // Team lead email validation
      const emailError = validateEmail(formData.teamLead.email, 'Team lead email');
      if (emailError) newErrors.teamLeadEmail = emailError;

      // Team lead phone validation
      const phoneError = validatePhone(formData.teamLead.phone, 'Team lead phone');
      if (phoneError) newErrors.teamLeadPhone = phoneError;

      // College validation
      if (!formData.teamLead.college.trim()) {
        newErrors.teamLeadCollege = 'College name is required';
      }

      // Year validation
      if (!formData.teamLead.year.trim()) {
        newErrors.teamLeadYear = 'Academic year is required';
      }

      // Branch validation
      if (!formData.teamLead.branch.trim()) {
        newErrors.teamLeadBranch = 'Branch/Department is required';
      }
    }

    if (stepNumber === 2) {
      // Track selection validation
      if (!formData.selectedTrack) {
        newErrors.selectedTrack = 'Please select a battle track (problem statement)';
      }

      // Collect all emails for duplicate checking
      const allEmails = [formData.teamLead.email.toLowerCase().trim()];
      const memberEmails = [];

      // Team members validation (only validate required number based on team size)
      const requiredMembers = formData.teamSize - 1; // Exclude team leader
      
      for (let i = 0; i < requiredMembers; i++) {
        const member = formData.members[i] || {};
        
        // Name validation
        if (!member.name?.trim()) {
          newErrors[`member${i}Name`] = 'Full name is required for all team members';
        }

        // Email validation
        if (!member.email?.trim()) {
          newErrors[`member${i}Email`] = 'Email is required for all team members';
        } else if (!isValidEmail(member.email)) {
          newErrors[`member${i}Email`] = 'Please enter a valid email address';
        } else {
          const memberEmail = member.email.toLowerCase().trim();
          memberEmails.push({ email: memberEmail, index: i });
          allEmails.push(memberEmail);
        }

        // Phone validation
        if (!member.phone?.trim()) {
          newErrors[`member${i}Phone`] = 'Phone number is required for all team members';
        } else if (!isValidPhone(member.phone)) {
          newErrors[`member${i}Phone`] = 'Please enter a valid phone number';
        }

        // College validation
        if (!member.college?.trim()) {
          newErrors[`member${i}College`] = 'College is required for all team members';
        }
      }

      // Check for duplicate emails
      const duplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        // Mark team lead email as duplicate if it appears in members
        if (memberEmails.some(m => m.email === formData.teamLead.email.toLowerCase().trim())) {
          newErrors.teamLeadEmail = 'Team leader email cannot be the same as team member email';
        }
        
        // Mark member emails as duplicates
        memberEmails.forEach(({ email, index }) => {
          if (duplicates.includes(email)) {
            if (!newErrors[`member${index}Email`]) {
              newErrors[`member${index}Email`] = 'This email is already used by another team member';
            }
          }
        });
      }
    }

    if (stepNumber === 3) {
      // Terms agreement validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'Please agree to the terms and conditions to proceed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    // Filter out empty team members
    const validMembers = formData.members.filter(member => member.name.trim());
    
    const registrationData = {
      ...formData,
      members: validMembers,
      hackathonId: currentHackathon.id
    };

    const result = await registerTeam(registrationData);
    
    if (result.success) {
      setRegistrationResult(result);
      setStep(4); // Move to payment step
      
      showNotification({
        message: '🎯 Registration successful! Now complete payment to secure your battlefield position.',
        type: 'success',
        duration: 5000
      });
    } else {
      showNotification({
        message: `Registration failed: ${result.error}`,
        type: 'error',
        duration: 7000
      });
    }
  };

  const handlePayment = async () => {
    if (!registrationResult) return;
    
    setPaymentLoading(true);
    
    try {
      // Calculate team size and amount
      const validMembers = formData.members.filter(member => member.name.trim());
      const teamSize = 1 + validMembers.length; // Team lead + members
      
      // Create payment order
      const orderResult = await hackathonService.initiatePayment(
        registrationResult.registrationId,
        hackathonService.calculateAmount(teamSize),
        teamSize
      );
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create payment order');
      }
      
      // Initialize Razorpay payment
      const options = {
        key: orderResult.data.key_id,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: 'CodeKurukshetra - कोड कुरुक्षेत्र',
        description: `Warrior Registration - ${teamSize === 1 ? 'Individual Warrior' : 'Team Alliance'}`,
        order_id: orderResult.data.order_id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResult = await hackathonService.verifyPayment({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              registration_id: registrationResult.registrationId,
              team_size: teamSize,
              amount: orderResult.data.amount
            });
            
            if (verifyResult.success) {
              showNotification({
                message: '🎉 Payment successful! Welcome to CodeKurukshetra, warrior!',
                type: 'success',
                duration: 7000
              });
              onBack(); // Return to hackathon page
            } else {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            showNotification({
              message: 'Payment verification failed. Please contact support.',
              type: 'error',
              duration: 7000
            });
          }
        },
        prefill: {
          name: formData.teamLead.name,
          email: formData.teamLead.email,
          contact: formData.teamLead.phone
        },
        theme: {
          color: '#FF6B6B'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            showNotification({
              message: 'Payment cancelled. You can complete payment later.',
              type: 'warning',
              duration: 5000
            });
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      showNotification({
        message: `Payment failed: ${error.message}`,
        type: 'error',
        duration: 7000
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      className="registration-step"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h3>Team & Leader Information</h3>
      
      {/* Team Basic Info */}
      <div className="team-basic-info">
        <div className="form-row">
          <div className="form-group">
            <label>Team Name *</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => handleInputChange('root', 'teamName', e.target.value)}
              placeholder="Enter your warrior clan name"
              className={errors.teamName ? 'error' : ''}
            />
            {errors.teamName && <span className="error-message">{errors.teamName}</span>}
          </div>

          <div className="form-group">
            <label>Team Size *</label>
            <select
              value={formData.teamSize}
              onChange={(e) => handleInputChange('root', 'teamSize', parseInt(e.target.value))}
              className={errors.teamSize ? 'error' : ''}
            >
              <option value={1}>1 Member (Individual) - ₹250</option>
              <option value={2}>2 Members - ₹500</option>
              <option value={3}>3 Members - ₹750</option>
              <option value={4}>4 Members - ₹1000</option>
            </select>
            {errors.teamSize && <span className="error-message">{errors.teamSize}</span>}
            <div className="team-size-info">
              <small>Total Cost: ₹{250 * formData.teamSize} (₹250 per person)</small>
            </div>
          </div>
        </div>
      </div>

      <div className="team-lead-section">
        <h4>Team Leader Details</h4>
        
        {/* Leader Personal Info */}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.teamLead.name}
              onChange={(e) => handleInputChange('teamLead', 'name', e.target.value)}
              placeholder="Enter full name"
              className={errors.teamLeadName ? 'error' : ''}
            />
            {errors.teamLeadName && <span className="error-message">{errors.teamLeadName}</span>}
          </div>

          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              value={formData.teamLead.rollNumber}
              onChange={(e) => handleInputChange('teamLead', 'rollNumber', e.target.value)}
              placeholder="Enter roll number"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.teamLead.email}
              onChange={(e) => handleInputChange('teamLead', 'email', e.target.value)}
              placeholder="Enter valid email (e.g., warrior@gmail.com)"
              className={errors.teamLeadEmail ? 'error' : ''}
            />
            {errors.teamLeadEmail && <span className="error-message">{errors.teamLeadEmail}</span>}
            {emailSuggestions.teamleademailSuggestion && !errors.teamLeadEmail && (
              <div className="email-suggestion">
                <span className="suggestion-text">Did you mean: </span>
                <button 
                  type="button"
                  className="suggestion-button"
                  onClick={() => applySuggestion('teamLead', 'email', emailSuggestions.teamleademailSuggestion)}
                >
                  {emailSuggestions.teamleademailSuggestion}
                </button>
                <span className="suggestion-hint">? Click to use this email</span>
              </div>
            )}
            {!errors.teamLeadEmail && formData.teamLead.email && isValidEmail(formData.teamLead.email) && (
              <span className="success-message">✓ Valid email address</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.teamLead.phone}
              onChange={(e) => handleInputChange('teamLead', 'phone', e.target.value)}
              placeholder="Enter phone number (e.g., 9876543210)"
              className={errors.teamLeadPhone ? 'error' : ''}
            />
            {errors.teamLeadPhone && <span className="error-message">{errors.teamLeadPhone}</span>}
            {!errors.teamLeadPhone && formData.teamLead.phone && isValidPhone(formData.teamLead.phone) && (
              <span className="success-message">✓ Valid phone number</span>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="form-row">
          <div className="form-group">
            <label>College/University *</label>
            <input
              type="text"
              value={formData.teamLead.college}
              onChange={(e) => handleInputChange('teamLead', 'college', e.target.value)}
              placeholder="Enter college name"
              className={errors.teamLeadCollege ? 'error' : ''}
            />
            {errors.teamLeadCollege && <span className="error-message">{errors.teamLeadCollege}</span>}
          </div>

          <div className="form-group">
            <label>Year of Study</label>
            <select
              value={formData.teamLead.year}
              onChange={(e) => handleInputChange('teamLead', 'year', e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
              <option value="graduate">Graduate</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Branch/Major</label>
            <input
              type="text"
              value={formData.teamLead.branch}
              onChange={(e) => handleInputChange('teamLead', 'branch', e.target.value)}
              placeholder="e.g., Computer Science"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      className="registration-step"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h3>Team Members Information</h3>
      
      {formData.teamSize === 1 ? (
        <div className="single-member-notice">
          <div className="info-box">
            <h4>🏆 Individual Participation</h4>
            <p>You're registering as a solo warrior! No additional team member details needed.</p>
            <p><strong>Registration Fee:</strong> ₹250</p>
          </div>
        </div>
      ) : (
        <div className="team-members-section">
          <div className="members-header">
            <h4>Additional Team Members ({formData.teamSize - 1} member{formData.teamSize > 2 ? 's' : ''})</h4>
            <p>Please provide details for all team members (excluding the team leader)</p>
          </div>

          {[...Array(formData.teamSize - 1)].map((_, index) => (
            <div key={index} className="team-member-card">
              <h5>Member {index + 2}</h5>
              
              {/* Member Personal Info */}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.members[index]?.name || ''}
                    onChange={(e) => handleInputChange('members', 'name', e.target.value, index)}
                    placeholder="Enter full name"
                    className={errors[`member${index}Name`] ? 'error' : ''}
                  />
                  {errors[`member${index}Name`] && (
                    <span className="error-message">{errors[`member${index}Name`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    value={formData.members[index]?.rollNumber || ''}
                    onChange={(e) => handleInputChange('members', 'rollNumber', e.target.value, index)}
                    placeholder="Enter roll number"
                  />
                </div>
              </div>

              {/* Member Contact Info */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.members[index]?.email || ''}
                    onChange={(e) => handleInputChange('members', 'email', e.target.value, index)}
                    placeholder="Enter valid email"
                    className={errors[`member${index}Email`] ? 'error' : ''}
                  />
                  {errors[`member${index}Email`] && (
                    <span className="error-message">{errors[`member${index}Email`]}</span>
                  )}
                  {emailSuggestions[`member${index}emailSuggestion`] && !errors[`member${index}Email`] && (
                    <div className="email-suggestion">
                      <span className="suggestion-text">Did you mean: </span>
                      <button 
                        type="button"
                        className="suggestion-button"
                        onClick={() => applySuggestion('members', 'email', emailSuggestions[`member${index}emailSuggestion`], index)}
                      >
                        {emailSuggestions[`member${index}emailSuggestion`]}
                      </button>
                      <span className="suggestion-hint">? Click to use this email</span>
                    </div>
                  )}
                  {!errors[`member${index}Email`] && formData.members[index]?.email && isValidEmail(formData.members[index]?.email) && (
                    <span className="success-message">✓ Valid email address</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.members[index]?.phone || ''}
                    onChange={(e) => handleInputChange('members', 'phone', e.target.value, index)}
                    placeholder="Enter phone number"
                    className={errors[`member${index}Phone`] ? 'error' : ''}
                  />
                  {errors[`member${index}Phone`] && (
                    <span className="error-message">{errors[`member${index}Phone`]}</span>
                  )}
                  {!errors[`member${index}Phone`] && formData.members[index]?.phone && isValidPhone(formData.members[index]?.phone) && (
                    <span className="success-message">✓ Valid phone number</span>
                  )}
                </div>
              </div>

              {/* Member Academic Info */}
              <div className="form-row">
                <div className="form-group">
                  <label>College/University *</label>
                  <input
                    type="text"
                    value={formData.members[index]?.college || ''}
                    onChange={(e) => handleInputChange('members', 'college', e.target.value, index)}
                    placeholder="Enter college name"
                    className={errors[`member${index}College`] ? 'error' : ''}
                  />
                  {errors[`member${index}College`] && (
                    <span className="error-message">{errors[`member${index}College`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Year of Study</label>
                  <select
                    value={formData.members[index]?.year || ''}
                    onChange={(e) => handleInputChange('members', 'year', e.target.value, index)}
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Branch/Major</label>
                  <input
                    type="text"
                    value={formData.members[index]?.branch || ''}
                    onChange={(e) => handleInputChange('members', 'branch', e.target.value, index)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="team-cost-summary">
            <div className="cost-breakdown">
              <p><strong>Team Size:</strong> {formData.teamSize} member{formData.teamSize > 1 ? 's' : ''}</p>
              <p><strong>Total Registration Fee:</strong> ₹{250 * formData.teamSize}</p>
              <small>₹250 per person</small>
            </div>
          </div>
        </div>
      )}

      {/* Problem Statement Selection */}
      <div className="problem-selection">
        <h4>Choose Your Problem Statement *</h4>
        <div className="problems-grid">
          {currentHackathon?.problemStatements?.map(problem => (
            <div
              key={problem.id}
              className={`problem-option ${formData.selectedTrack === problem.id.toString() ? 'selected' : ''}`}
              onClick={() => handleInputChange('root', 'selectedTrack', problem.id.toString())}
            >
              <div className="problem-header">
                <div className="problem-number">#{problem.id}</div>
                <div className="difficulty">
                  {Array.from({ length: problem.difficulty }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <h5>{problem.title}</h5>
              <p className="problem-category">{problem.category}</p>
              <p className="problem-summary">{problem.problem}</p>
              <div className="tech-preview">
                {problem.techStack.slice(0, 3).map((tech, index) => (
                  <span key={index} className="tech-preview-tag">{tech}</span>
                ))}
                {problem.techStack.length > 3 && <span className="more">+{problem.techStack.length - 3}</span>}
              </div>
            </div>
          ))}
        </div>
        {errors.selectedTrack && <span className="error-message">{errors.selectedTrack}</span>}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      className="registration-step"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h3>Project Idea & Final Details</h3>
      
      <div className="form-group">
        <label>Project Idea (Optional)</label>
        <textarea
          value={formData.projectIdea}
          onChange={(e) => handleInputChange('root', 'projectIdea', e.target.value)}
          placeholder="Briefly describe your project idea or what you plan to build..."
          rows={4}
        />
      </div>

      <div className="terms-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('root', 'agreeToTerms', e.target.checked)}
          />
          <span className="checkmark"></span>
          I agree to the terms and conditions and hackathon rules *
        </label>
        {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
      </div>

      <div className="registration-summary">
        <h4>Registration Summary</h4>
        <div className="summary-item">
          <strong>Team Name:</strong> {formData.teamName}
        </div>
        <div className="summary-item">
          <strong>Team Leader:</strong> {formData.teamLead.name}
        </div>
        <div className="summary-item">
          <strong>Problem Statement:</strong> {
            currentHackathon?.problemStatements?.find(p => p.id.toString() === formData.selectedTrack)?.title || 'Not selected'
          }
        </div>
        <div className="summary-item">
          <strong>Team Size:</strong> {1 + formData.members.filter(m => m.name.trim()).length} members
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => {
    const validMembers = formData.members.filter(member => member.name.trim());
    const teamSize = 1 + validMembers.length;
    const amount = hackathonService.calculateAmount(teamSize);
    
    return (
      <motion.div
        className="registration-step payment-step"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <div className="payment-header">
          <CheckCircle className="success-icon" size={48} />
          <h3>🎯 Registration Successful!</h3>
          <p>Complete payment to secure your battlefield position</p>
        </div>

        <div className="payment-details">
          <div className="registration-info">
            <h4>Registration Details</h4>
            <div className="info-item">
              <strong>Registration ID:</strong> {registrationResult?.registrationId}
            </div>
            <div className="info-item">
              <strong>Team Name:</strong> {formData.teamName}
            </div>
            <div className="info-item">
              <strong>Team Size:</strong> {teamSize} {teamSize === 1 ? 'Individual Warrior' : 'Warriors'}
            </div>
          </div>

          <div className="payment-info">
            <h4>Payment Information</h4>
            <div className="amount-breakdown">
              <div className="amount-item">
                <span>Registration Fee:</span>
                <span>₹{amount}</span>
              </div>
              <div className="amount-total">
                <span><strong>Total Amount:</strong></span>
                <span><strong>₹{amount}</strong></span>
              </div>
            </div>
            
            <div className="payment-note">
              <p>💳 Secure payment powered by Razorpay</p>
              <p>🛡️ Your payment is 100% secure and encrypted</p>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button 
            type="button" 
            className="btn primary payment-btn"
            onClick={handlePayment}
            disabled={paymentLoading}
          >
            <CreditCard size={20} />
            {paymentLoading ? 'Processing...' : `Pay ₹${amount} & Confirm Registration`}
          </button>
          
          <button 
            type="button" 
            className="btn secondary"
            onClick={() => {
              showNotification({
                message: 'Registration saved! You can complete payment later from your profile.',
                type: 'info',
                duration: 5000
              });
              onBack();
            }}
          >
            Pay Later
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Hackathon
          </button>
          <h2>Join the Battle</h2>
          <p>Register for {currentHackathon?.name}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4].map(stepNumber => (
              <div
                key={stepNumber}
                className={`progress-step ${step >= stepNumber ? 'active' : ''} ${step > stepNumber ? 'completed' : ''}`}
              >
                <span className="step-number">{stepNumber}</span>
                <span className="step-label">
                  {stepNumber === 1 ? 'Team Info' : 
                   stepNumber === 2 ? 'Members & Track' : 
                   stepNumber === 3 ? 'Finalize' : 'Payment'}
                </span>
              </div>
            ))}
          </div>
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Form Content */}
        {step <= 3 ? (
          <form onSubmit={handleSubmit} className="registration-form">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button type="button" className="btn secondary" onClick={handlePrevStep}>
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button type="button" className="btn primary" onClick={handleNextStep}>
                  Next Step
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn primary" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Register Team'}
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="payment-container">
            {step === 4 && renderStep4()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
