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
    teamLead: {
      name: '',
      email: '',
      phone: '',
      college: '',
      year: '',
      branch: ''
    },
    members: [
      { name: '', email: '', phone: '', college: '', year: '', branch: '' },
      { name: '', email: '', phone: '', college: '', year: '', branch: '' },
      { name: '', email: '', phone: '', college: '', year: '', branch: '' }
    ],
    selectedTrack: '',
    projectIdea: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Email validation utility function
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Phone number validation utility function
  const isValidPhone = (phone) => {
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Real-time email validation
  const validateEmail = (email, fieldName) => {
    if (!email.trim()) {
      return `${fieldName} is required`;
    }
    if (!isValidEmail(email)) {
      const suggestion = getEmailSuggestion(email);
      const baseMessage = `Please enter a valid email address. Example: user@domain.com`;
      return suggestion ? `${baseMessage}. Did you mean: ${suggestion}?` : baseMessage;
    }
    return null;
  };

  // Real-time phone validation
  const validatePhone = (phone, fieldName) => {
    if (!phone.trim()) {
      return `${fieldName} is required`;
    }
    if (!isValidPhone(phone)) {
      return `Please enter a valid Indian phone number (10 digits starting with 6-9)`;
    }
    return null;
  };

  // Email domain suggestion for common typos
  const getEmailSuggestion = (email) => {
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'rediffmail.com', 'live.com', 'yahoo.co.in'
    ];
    
    if (!email.includes('@')) return null;
    
    const [localPart, domain] = email.split('@');
    const lowerDomain = domain.toLowerCase();
    
    const similarDomains = commonDomains.filter(d => {
      // Check for similar domains (1-2 character difference)
      if (Math.abs(d.length - lowerDomain.length) > 2) return false;
      
      let differences = 0;
      const maxLen = Math.max(d.length, lowerDomain.length);
      
      for (let i = 0; i < maxLen; i++) {
        if (d[i] !== lowerDomain[i]) differences++;
        if (differences > 2) return false;
      }
      
      return differences > 0 && differences <= 2;
    });
    
    return similarDomains.length > 0 ? `${localPart}@${similarDomains[0]}` : null;
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
        newMembers[index] = { ...newMembers[index], [field]: value };
        return { ...prev, members: newMembers };
      } else {
        return { ...prev, [field]: value };
      }
    });

    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    if (section === 'teamLead') {
      const errorKey = `teamLead${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (field === 'email') {
        const emailError = validateEmail(value, 'Email');
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
        const emailError = validateEmail(value, 'Email');
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

      // Team members validation (if any members are added)
      formData.members.forEach((member, index) => {
        if (member.name.trim()) { // Only validate if member name is provided
          // If name is provided, email is required
          if (!member.email.trim()) {
            newErrors[`member${index}Email`] = 'Email is required for team members';
          } else if (!isValidEmail(member.email)) {
            newErrors[`member${index}Email`] = 'Please enter a valid email address';
          } else {
            const memberEmail = member.email.toLowerCase().trim();
            memberEmails.push({ email: memberEmail, index });
            allEmails.push(memberEmail);
          }

          // If name is provided, phone is required
          if (!member.phone.trim()) {
            newErrors[`member${index}Phone`] = 'Phone number is required for team members';
          } else if (!isValidPhone(member.phone)) {
            newErrors[`member${index}Phone`] = 'Please enter a valid phone number';
          }

          // College validation for members
          if (!member.college.trim()) {
            newErrors[`member${index}College`] = 'College is required for team members';
          }
        }
      });

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

      <div className="team-lead-section">
        <h4>Team Leader Details</h4>
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
            <label>Email *</label>
            <input
              type="email"
              value={formData.teamLead.email}
              onChange={(e) => handleInputChange('teamLead', 'email', e.target.value)}
              placeholder="Enter valid email (e.g., warrior@gmail.com)"
              className={errors.teamLeadEmail ? 'error' : ''}
            />
            {errors.teamLeadEmail && <span className="error-message">{errors.teamLeadEmail}</span>}
            {!errors.teamLeadEmail && formData.teamLead.email && isValidEmail(formData.teamLead.email) && (
              <span className="success-message">✓ Valid email address</span>
            )}
          </div>
        </div>

        <div className="form-row">
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
        </div>

        <div className="form-row">
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
      <h3>Team Members (Optional)</h3>
      <p>Add up to 3 additional team members. You can participate alone or with a team.</p>
      
      {formData.members.map((member, index) => (
        <div key={index} className="team-member-section">
          <h4>Member {index + 1}</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleInputChange('members', 'name', e.target.value, index)}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => handleInputChange('members', 'email', e.target.value, index)}
                placeholder="Enter valid email (e.g., member@gmail.com)"
                className={errors[`member${index}Email`] ? 'error' : ''}
              />
              {errors[`member${index}Email`] && (
                <span className="error-message">{errors[`member${index}Email`]}</span>
              )}
              {!errors[`member${index}Email`] && member.email && isValidEmail(member.email) && (
                <span className="success-message">✓ Valid email address</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={member.phone}
                onChange={(e) => handleInputChange('members', 'phone', e.target.value, index)}
                placeholder="Enter phone number (e.g., 9876543210)"
                className={errors[`member${index}Phone`] ? 'error' : ''}
              />
              {errors[`member${index}Phone`] && (
                <span className="error-message">{errors[`member${index}Phone`]}</span>
              )}
              {!errors[`member${index}Phone`] && member.phone && isValidPhone(member.phone) && (
                <span className="success-message">✓ Valid phone number</span>
              )}
            </div>

            <div className="form-group">
              <label>College/University</label>
              <input
                type="text"
                value={member.college}
                onChange={(e) => handleInputChange('members', 'college', e.target.value, index)}
                placeholder="Enter college name"
                className={errors[`member${index}College`] ? 'error' : ''}
              />
              {errors[`member${index}College`] && (
                <span className="error-message">{errors[`member${index}College`]}</span>
              )}
            </div>
          </div>
        </div>
      ))}

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
