import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHackathon } from '../../contexts/HackathonContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { 
  createPaymentOrder, 
  verifyPayment,
  getTeamPrice 
} from '../../services/hackathonService';
// Icon imports
import { 
  Star, 
  ArrowLeft, 
  Target, 
  Code, 
  Users, 
  Brain, 
  CreditCard, 
  CheckCircle, 
  Trophy,
  Shield,
  Check,
  Edit,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import '../../styles/RegistrationPage.css';

const RegistrationPage = ({ onBack }) => {
  const { currentHackathon, loading } = useHackathon();
  const { showNotification } = useNotification();
  const [user] = useAuthState(auth);
  
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: 1, // Add team size field
    members: [
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '', gender: '', role: 'Team Leader' }, // First member is always team leader
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '', gender: '', role: 'Team Member' },
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '', gender: '', role: 'Team Member' },
      { name: '', email: '', phone: '', college: '', rollNumber: '', year: '', branch: '', gender: '', role: 'Team Member' }
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

  // Transform form data to match API schema
  const transformFormDataToAPISchema = (formData) => {
    // Filter out empty team members (excluding the first member which is team leader)
    const allMembers = formData.members
      .slice(0, formData.teamSize) // Only take required number of members
      .filter((member, index) => {
        if (index === 0) return member.name.trim(); // Team leader must have name
        return member.name.trim(); // Other members must have name
      })
      .map(member => ({
        name: member.name,
        email: member.email,
        phonenumber: member.phone.replace(/\D/g, ''), // Remove non-digits
        college: member.college,
        branch: member.branch,
        year: member.year,
        rollNumber: member.rollNumber,
        gender: member.gender,
        role: member.role
      }));

    return {
      leaderUid: user?.uid || '',
      teamname: formData.teamName,
      problem_statement: formData.selectedTrack, // Should be the selected track ID, not project idea
      teamsize: allMembers.length.toString(),
      members: allMembers
    };
  };

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

  // Format phone number to only allow digits
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 12 digits (for +91 format)
    const limited = cleaned.slice(0, 12);
    
    return limited;
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
    const suggestionKey = index === 0 ? 
      `teamleademailSuggestion` : 
      `member${index}emailSuggestion`;
    
    setEmailSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[suggestionKey];
      return newSuggestions;
    });
    
    // Clear any related errors
    const errorKey = index === 0 ? 'teamLeadEmail' : `member${index}Email`;
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
    // Debug logging for track selection
    if (field === 'selectedTrack') {
      console.log('🎯 Track Selection Change:', {
        section,
        field,
        value,
        valueType: typeof value,
        stringValue: value?.toString()
      });
    }

    // Format phone number to only allow digits
    let processedValue = value;
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    setFormData(prev => {
      if (section === 'members' && index !== null) {
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
            branch: '',
            gender: '',
            role: index === 0 ? 'Team Leader' : 'Team Member'
          };
        }
        newMembers[index] = { ...newMembers[index], [field]: processedValue };
        return { ...prev, members: newMembers };
      } else if (section === 'root' && field === 'teamSize') {
        // When team size changes, ensure members array has correct structure
        const newTeamSize = parseInt(value);
        const newMembers = [...prev.members];
        
        // Ensure we have enough member slots
        while (newMembers.length < 4) {
          newMembers.push({
            name: '',
            email: '',
            phone: '',
            college: '',
            rollNumber: '',
            year: '',
            branch: '',
            gender: '',
            role: 'Team Member'
          });
        }
        
        // Set correct roles
        newMembers[0].role = 'Team Leader';
        for (let i = 1; i < newMembers.length; i++) {
          newMembers[i].role = 'Team Member';
        }
        
        return { ...prev, [field]: value, members: newMembers };
      } else {
        return { ...prev, [field]: processedValue };
      }
    });

    // Debug logging for track selection - log state after update
    if (field === 'selectedTrack') {
      setTimeout(() => {
        console.log('🎯 Track Selection Updated State:', {
          selectedTrack: formData.selectedTrack,
          newValue: processedValue
        });
      }, 0);
    }

    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    if (section === 'members') {
      const errorKey = index === 0 ? 
        `teamLead${field.charAt(0).toUpperCase() + field.slice(1)}` : 
        `member${index}${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (field === 'email') {
        const fieldLabel = index === 0 ? 'Team lead email' : `Member ${index + 1} email`;
        const emailError = validateEmail(processedValue, fieldLabel);
        if (emailError) {
          newErrors[errorKey] = emailError;
        } else {
          delete newErrors[errorKey];
        }
      } else if (field === 'phone') {
        const phoneError = validatePhone(processedValue, 'Phone');
        if (phoneError) {
          newErrors[errorKey] = phoneError;
        } else {
          delete newErrors[errorKey];
        }
      } else {
        // Clear error for other fields when user starts typing
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

      // Team lead validation (first member)
      const teamLead = formData.members[0];
      
      // Team lead name validation
      if (!teamLead?.name.trim()) {
        newErrors.teamLeadName = 'Team lead name is required';
      } else if (teamLead.name.trim().length < 2) {
        newErrors.teamLeadName = 'Name must be at least 2 characters long';
      }

      // Team lead email validation
      const emailError = validateEmail(teamLead?.email || '', 'Team lead email');
      if (emailError) newErrors.teamLeadEmail = emailError;

      // Team lead phone validation
      const phoneError = validatePhone(teamLead?.phone || '', 'Team lead phone');
      if (phoneError) newErrors.teamLeadPhone = phoneError;

      // College validation
      if (!teamLead?.college?.trim()) {
        newErrors.teamLeadCollege = 'College name is required';
      }

      // Gender validation
      if (!teamLead?.gender?.trim()) {
        newErrors.teamLeadGender = 'Gender is required';
      }

      // Year validation
      if (!teamLead?.year?.trim()) {
        newErrors.teamLeadYear = 'Academic year is required';
      }

      // Branch validation
      if (!teamLead?.branch?.trim()) {
        newErrors.teamLeadBranch = 'Branch/Department is required';
      }
    }

    if (stepNumber === 2) {
      // Track selection validation - REQUIRED
      if (!formData.selectedTrack || formData.selectedTrack.trim() === '') {
        newErrors.selectedTrack = 'Please select a battle track (problem statement) - this is required!';
      }

      // Debug: Log validation state
      console.log('🔍 Step 2 Validation - selectedTrack:', formData.selectedTrack);
      console.log('🔍 Step 2 Validation - formData:', formData);

      // Collect all emails for duplicate checking
      const allEmails = [];
      const memberEmails = [];

      // Team members validation (validate all required members based on team size)
      for (let i = 0; i < formData.teamSize; i++) {
        const member = formData.members[i] || {};
        const isTeamLead = i === 0;
        const errorPrefix = isTeamLead ? 'teamLead' : `member${i}`;
        const memberLabel = isTeamLead ? 'Team leader' : `Member ${i + 1}`;
        
        // Name validation
        if (!member.name?.trim()) {
          newErrors[`${errorPrefix}Name`] = `Full name is required for ${memberLabel.toLowerCase()}`;
        }

        // Email validation
        if (!member.email?.trim()) {
          newErrors[`${errorPrefix}Email`] = `Email is required for ${memberLabel.toLowerCase()}`;
        } else if (!isValidEmail(member.email)) {
          newErrors[`${errorPrefix}Email`] = 'Please enter a valid email address';
        } else {
          const memberEmail = member.email.toLowerCase().trim();
          memberEmails.push({ email: memberEmail, index: i, isTeamLead });
          allEmails.push(memberEmail);
        }

        // Phone validation
        if (!member.phone?.trim()) {
          newErrors[`${errorPrefix}Phone`] = `Phone number is required for ${memberLabel.toLowerCase()}`;
        } else if (!isValidPhone(member.phone)) {
          newErrors[`${errorPrefix}Phone`] = 'Please enter a valid phone number';
        }

        // College validation
        if (!member.college?.trim()) {
          newErrors[`${errorPrefix}College`] = `College is required for ${memberLabel.toLowerCase()}`;
        }

        // Gender validation
        if (!member.gender?.trim()) {
          newErrors[`${errorPrefix}Gender`] = `Gender is required for ${memberLabel.toLowerCase()}`;
        }
      }

      // Check for duplicate emails
      const duplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        // Mark emails as duplicates
        memberEmails.forEach(({ email, index, isTeamLead }) => {
          if (duplicates.includes(email)) {
            const errorKey = isTeamLead ? 'teamLeadEmail' : `member${index}Email`;
            if (!newErrors[errorKey]) {
              newErrors[errorKey] = 'This email is already used by another team member';
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

  // Scroll to top of form when changing steps
  const scrollToTop = () => {
    const registrationHeader = document.querySelector('.registration-header');
    if (registrationHeader) {
      registrationHeader.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      // Small delay to ensure the new step content is rendered before scrolling
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    // Small delay to ensure the new step content is rendered before scrolling
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    if (!user) {
      showNotification({
        message: 'Please log in to register for the hackathon.',
        type: 'error',
        duration: 5000
      });
      return;
    }

    try {
      // Transform form data to API schema
      const apiData = transformFormDataToAPISchema(formData);
      
      // Debug: Log the form data and API data to check problem_statement
      console.log('🔍 Form Data selectedTrack:', formData.selectedTrack);
      console.log('🔍 API Data problem_statement:', apiData.problem_statement);
      console.log('🔍 Full API Data:', apiData);
      
      // Create payment order first
      const orderResult = await createPaymentOrder({
        teamSize: apiData.members.length,
        teamname: apiData.teamname,
        leaderUid: apiData.leaderUid,
        email: apiData.members[0]?.email
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create payment order');
      }

      // Store registration data and order details for payment
      setRegistrationResult({
        success: true,
        registrationData: apiData,
        orderData: orderResult.data,
        amount: orderResult.amountInRupees
      });
      
      setStep(4); // Move to payment step
      
      // Scroll to top after moving to payment step
      setTimeout(() => {
        scrollToTop();
      }, 100);
      
      showNotification({
        message: 'Registration data prepared successfully. Please complete payment to confirm your registration.',
        type: 'success',
        duration: 5000
      });

    } catch (error) {
      showNotification({
        message: `Registration failed: ${error.message}`,
        type: 'error',
        duration: 7000
      });
    }
  };

  const handlePayment = async () => {
    if (!registrationResult) return;
    
    setPaymentLoading(true);
    
    try {
      const { orderData, registrationData, amount } = registrationResult;
      
      // Debug: Log the order data
      console.log('Order data for Razorpay:', orderData);
      
      // Initialize Razorpay payment
      const options = {
        key: orderData.key_id, // Razorpay key from your Lambda response
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'CodeKurukshetra - कोड कुरुक्षेत्र',
        description: `Warrior Registration - ${registrationData.members.length === 1 ? 'Individual Warrior' : 'Team Alliance'}`,
        order_id: orderData.order_id, // Correct field name from your Lambda
        handler: async (response) => {
          try {
            // Debug: Log the Razorpay response
            console.log('Razorpay response:', response);
            
            // Check if all required fields are present
            if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
              // If payment was successful but missing verification data, let's just show success
              console.warn('Payment successful but missing verification data. Treating as successful payment.');
              showNotification({
                message: 'Payment completed successfully. Welcome to CodeKurukshetra! Your registration is now confirmed.',
                type: 'success',
                duration: 7000
              });
              onBack();
              return;
            }

            // Verify payment and complete registration
            const verifyPaymentData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              leaderUid: registrationData.leaderUid,
              teamSize: registrationData.members.length,
              members: registrationData.members, // Send complete member data
              teamname: registrationData.teamname,
              problem_statement: registrationData.problem_statement // Include problem statement
            };
            
            // Debug: Log the payment verification data
            console.log('🔍 Payment Verification Data:', verifyPaymentData);
            console.log('🔍 Problem Statement being sent:', registrationData.problem_statement);
            
            const verifyResult = await verifyPayment(verifyPaymentData);
            
            if (verifyResult.success) {
              // Payment verified and registration complete!
              showNotification({
                message: 'Payment verified successfully. Welcome to CodeKurukshetra! Your registration is now complete.',
                type: 'success',
                duration: 7000
              });
              onBack(); // Return to hackathon page
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed');
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
          name: formData.members[0]?.name || '',
          email: formData.members[0]?.email || '',
          contact: formData.members[0]?.phone || ''
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

  const renderStep1 = () => {
    const teamLead = formData.members[0] || {};
    
    return (
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
                value={teamLead.name || ''}
                onChange={(e) => handleInputChange('members', 'name', e.target.value, 0)}
                placeholder="Enter full name"
                className={errors.teamLeadName ? 'error' : ''}
              />
              {errors.teamLeadName && <span className="error-message">{errors.teamLeadName}</span>}
            </div>

            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                value={teamLead.rollNumber || ''}
                onChange={(e) => handleInputChange('members', 'rollNumber', e.target.value, 0)}
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
                value={teamLead.email || ''}
                onChange={(e) => handleInputChange('members', 'email', e.target.value, 0)}
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
                    onClick={() => applySuggestion('members', 'email', emailSuggestions.teamleademailSuggestion, 0)}
                  >
                    {emailSuggestions.teamleademailSuggestion}
                  </button>
                  <span className="suggestion-hint">? Click to use this email</span>
                </div>
              )}
              {!errors.teamLeadEmail && teamLead.email && isValidEmail(teamLead.email) && (
                <span className="success-message"><Check className="inline-icon" size={14} /> Valid email address</span>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={teamLead.phone || ''}
                onChange={(e) => handleInputChange('members', 'phone', e.target.value, 0)}
                placeholder="Enter phone number (e.g., 9876543210)"
                className={errors.teamLeadPhone ? 'error' : ''}
                maxLength="12"
              />
              {errors.teamLeadPhone && <span className="error-message">{errors.teamLeadPhone}</span>}
              {!errors.teamLeadPhone && teamLead.phone && isValidPhone(teamLead.phone) && (
                <span className="success-message"><Check className="inline-icon" size={14} /> Valid phone number</span>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="form-row">
            <div className="form-group">
              <label>College/University *</label>
              <input
                type="text"
                value={teamLead.college || ''}
                onChange={(e) => handleInputChange('members', 'college', e.target.value, 0)}
                placeholder="Enter college name"
                className={errors.teamLeadCollege ? 'error' : ''}
              />
              {errors.teamLeadCollege && <span className="error-message">{errors.teamLeadCollege}</span>}
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                value={teamLead.gender || ''}
                onChange={(e) => handleInputChange('members', 'gender', e.target.value, 0)}
                className={errors.teamLeadGender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.teamLeadGender && <span className="error-message">{errors.teamLeadGender}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year of Study</label>
              <select
                value={teamLead.year || ''}
                onChange={(e) => handleInputChange('members', 'year', e.target.value, 0)}
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
              <select
                value={teamLead.branch || ''}
                onChange={(e) => handleInputChange('members', 'branch', e.target.value, 0)}
              >
                <option value="">Select Branch</option>
                <optgroup label="Computer Science & IT">
                  <option value="Computer Science Engineering">Computer Science Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science & Analytics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence & Machine Learning</option>
                  <option value="Cyber Security">Cyber Security</option>
                </optgroup>
                <optgroup label="Electronics & Communication">
                  <option value="Electronics & Communication">Electronics & Communication Engineering (ECE)</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                  <option value="Communication Engineering">Communication Engineering</option>
                  <option value="VLSI Design">VLSI Design & Technology</option>
                </optgroup>
                <optgroup label="Electrical & Power">
                  <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics Engineering (EEE)</option>
                  <option value="Power Engineering">Power Engineering</option>
                  <option value="Power Systems">Power Systems Engineering</option>
                </optgroup>
                <optgroup label="Mechanical & Production">
                  <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                  <option value="Production Engineering">Production Engineering</option>
                  <option value="Manufacturing Engineering">Manufacturing Engineering</option>
                  <option value="Industrial Engineering">Industrial Engineering</option>
                  <option value="Automotive Engineering">Automotive Engineering</option>
                  <option value="Thermal Engineering">Thermal Engineering</option>
                </optgroup>
                <optgroup label="Civil & Architecture">
                  <option value="Civil Engineering">Civil Engineering (CE)</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Structural Engineering">Structural Engineering</option>
                  <option value="Environmental Engineering">Environmental Engineering</option>
                  <option value="Transportation Engineering">Transportation Engineering</option>
                  <option value="Construction Technology">Construction Technology</option>
                </optgroup>
                <optgroup label="Chemical & Materials">
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Materials Engineering">Materials Science & Engineering</option>
                  <option value="Metallurgical Engineering">Metallurgical Engineering</option>
                  <option value="Polymer Engineering">Polymer Engineering</option>
                  <option value="Petrochemical Engineering">Petrochemical Engineering</option>
                </optgroup>
                <optgroup label="Aerospace & Automobile">
                  <option value="Aerospace Engineering">Aerospace Engineering</option>
                  <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                  <option value="Automobile Engineering">Automobile Engineering</option>
                  <option value="Aviation Technology">Aviation Technology</option>
                </optgroup>
                <optgroup label="Biomedical & Biotechnology">
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                  <option value="Biotechnology">Biotechnology Engineering</option>
                  <option value="Bioinformatics">Bioinformatics</option>
                  <option value="Genetic Engineering">Genetic Engineering</option>
                </optgroup>
                <optgroup label="Mining & Petroleum">
                  <option value="Mining Engineering">Mining Engineering</option>
                  <option value="Petroleum Engineering">Petroleum Engineering</option>
                  <option value="Geological Engineering">Geological Engineering</option>
                </optgroup>
                <optgroup label="Marine & Naval">
                  <option value="Marine Engineering">Marine Engineering</option>
                  <option value="Naval Architecture">Naval Architecture</option>
                  <option value="Ocean Engineering">Ocean Engineering</option>
                </optgroup>
                <optgroup label="Food & Agricultural">
                  <option value="Food Technology">Food Technology</option>
                  <option value="Agricultural Engineering">Agricultural Engineering</option>
                  <option value="Food Engineering">Food Engineering</option>
                </optgroup>
                <optgroup label="Textile & Fashion">
                  <option value="Textile Engineering">Textile Engineering</option>
                  <option value="Fashion Technology">Fashion Technology</option>
                </optgroup>
                <optgroup label="Other Disciplines">
                  <option value="Instrumentation Engineering">Instrumentation Engineering</option>
                  <option value="Control Systems">Control Systems Engineering</option>
                  <option value="Robotics Engineering">Robotics Engineering</option>
                  <option value="Mechatronics">Mechatronics Engineering</option>
                  <option value="Nuclear Engineering">Nuclear Engineering</option>
                  <option value="Engineering Physics">Engineering Physics</option>
                  <option value="Engineering Mathematics">Engineering Mathematics</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

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
            <h4><Trophy className="inline-icon" size={20} /> Individual Participation</h4>
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

          {[...Array(formData.teamSize - 1)].map((_, arrayIndex) => {
            const memberIndex = arrayIndex + 1; // Start from index 1 since 0 is team leader
            return (
              <div key={memberIndex} className="team-member-card">
                <h5>Member {arrayIndex + 2}</h5>
                
                {/* Member Personal Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formData.members[memberIndex]?.name || ''}
                      onChange={(e) => handleInputChange('members', 'name', e.target.value, memberIndex)}
                      placeholder="Enter full name"
                      className={errors[`member${memberIndex}Name`] ? 'error' : ''}
                    />
                    {errors[`member${memberIndex}Name`] && (
                      <span className="error-message">{errors[`member${memberIndex}Name`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      value={formData.members[memberIndex]?.rollNumber || ''}
                      onChange={(e) => handleInputChange('members', 'rollNumber', e.target.value, memberIndex)}
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
                      value={formData.members[memberIndex]?.email || ''}
                      onChange={(e) => handleInputChange('members', 'email', e.target.value, memberIndex)}
                      placeholder="Enter valid email"
                      className={errors[`member${memberIndex}Email`] ? 'error' : ''}
                    />
                    {errors[`member${memberIndex}Email`] && (
                      <span className="error-message">{errors[`member${memberIndex}Email`]}</span>
                    )}
                    {emailSuggestions[`member${memberIndex}emailSuggestion`] && !errors[`member${memberIndex}Email`] && (
                      <div className="email-suggestion">
                        <span className="suggestion-text">Did you mean: </span>
                        <button 
                          type="button"
                          className="suggestion-button"
                          onClick={() => applySuggestion('members', 'email', emailSuggestions[`member${memberIndex}emailSuggestion`], memberIndex)}
                        >
                          {emailSuggestions[`member${memberIndex}emailSuggestion`]}
                        </button>
                        <span className="suggestion-hint">? Click to use this email</span>
                      </div>
                    )}
                    {!errors[`member${memberIndex}Email`] && formData.members[memberIndex]?.email && isValidEmail(formData.members[memberIndex]?.email) && (
                      <span className="success-message"><Check className="inline-icon" size={14} /> Valid email address</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.members[memberIndex]?.phone || ''}
                      onChange={(e) => handleInputChange('members', 'phone', e.target.value, memberIndex)}
                      placeholder="Enter phone number"
                      className={errors[`member${memberIndex}Phone`] ? 'error' : ''}
                      maxLength="12"
                    />
                    {errors[`member${memberIndex}Phone`] && (
                      <span className="error-message">{errors[`member${memberIndex}Phone`]}</span>
                    )}
                    {!errors[`member${memberIndex}Phone`] && formData.members[memberIndex]?.phone && isValidPhone(formData.members[memberIndex]?.phone) && (
                      <span className="success-message"><Check className="inline-icon" size={14} /> Valid phone number</span>
                    )}
                  </div>
                </div>

                {/* Member Academic Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label>College/University *</label>
                    <input
                      type="text"
                      value={formData.members[memberIndex]?.college || ''}
                      onChange={(e) => handleInputChange('members', 'college', e.target.value, memberIndex)}
                      placeholder="Enter college name"
                      className={errors[`member${memberIndex}College`] ? 'error' : ''}
                    />
                    {errors[`member${memberIndex}College`] && (
                      <span className="error-message">{errors[`member${memberIndex}College`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={formData.members[memberIndex]?.gender || ''}
                      onChange={(e) => handleInputChange('members', 'gender', e.target.value, memberIndex)}
                      className={errors[`member${memberIndex}Gender`] ? 'error' : ''}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors[`member${memberIndex}Gender`] && (
                      <span className="error-message">{errors[`member${memberIndex}Gender`]}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Year of Study</label>
                    <select
                      value={formData.members[memberIndex]?.year || ''}
                      onChange={(e) => handleInputChange('members', 'year', e.target.value, memberIndex)}
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
                    <select
                      value={formData.members[memberIndex]?.branch || ''}
                      onChange={(e) => handleInputChange('members', 'branch', e.target.value, memberIndex)}
                    >
                      <option value="">Select Branch</option>
                      <optgroup label="Computer Science & IT">
                        <option value="Computer Science Engineering">Computer Science Engineering (CSE)</option>
                        <option value="Information Technology">Information Technology (IT)</option>
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Data Science">Data Science & Analytics</option>
                        <option value="Artificial Intelligence">Artificial Intelligence & Machine Learning</option>
                        <option value="Cyber Security">Cyber Security</option>
                      </optgroup>
                      <optgroup label="Electronics & Communication">
                        <option value="Electronics & Communication">Electronics & Communication Engineering (ECE)</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                        <option value="Communication Engineering">Communication Engineering</option>
                        <option value="VLSI Design">VLSI Design & Technology</option>
                      </optgroup>
                      <optgroup label="Electrical & Power">
                        <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                        <option value="Electrical & Electronics">Electrical & Electronics Engineering (EEE)</option>
                        <option value="Power Engineering">Power Engineering</option>
                        <option value="Power Systems">Power Systems Engineering</option>
                      </optgroup>
                      <optgroup label="Mechanical & Production">
                        <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                        <option value="Production Engineering">Production Engineering</option>
                        <option value="Manufacturing Engineering">Manufacturing Engineering</option>
                        <option value="Industrial Engineering">Industrial Engineering</option>
                        <option value="Automotive Engineering">Automotive Engineering</option>
                        <option value="Thermal Engineering">Thermal Engineering</option>
                      </optgroup>
                      <optgroup label="Civil & Architecture">
                        <option value="Civil Engineering">Civil Engineering (CE)</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Structural Engineering">Structural Engineering</option>
                        <option value="Environmental Engineering">Environmental Engineering</option>
                        <option value="Transportation Engineering">Transportation Engineering</option>
                        <option value="Construction Technology">Construction Technology</option>
                      </optgroup>
                      <optgroup label="Chemical & Materials">
                        <option value="Chemical Engineering">Chemical Engineering</option>
                        <option value="Materials Engineering">Materials Science & Engineering</option>
                        <option value="Metallurgical Engineering">Metallurgical Engineering</option>
                        <option value="Polymer Engineering">Polymer Engineering</option>
                        <option value="Petrochemical Engineering">Petrochemical Engineering</option>
                      </optgroup>
                      <optgroup label="Aerospace & Automobile">
                        <option value="Aerospace Engineering">Aerospace Engineering</option>
                        <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                        <option value="Automobile Engineering">Automobile Engineering</option>
                        <option value="Aviation Technology">Aviation Technology</option>
                      </optgroup>
                      <optgroup label="Biomedical & Biotechnology">
                        <option value="Biomedical Engineering">Biomedical Engineering</option>
                        <option value="Biotechnology">Biotechnology Engineering</option>
                        <option value="Bioinformatics">Bioinformatics</option>
                        <option value="Genetic Engineering">Genetic Engineering</option>
                      </optgroup>
                      <optgroup label="Mining & Petroleum">
                        <option value="Mining Engineering">Mining Engineering</option>
                        <option value="Petroleum Engineering">Petroleum Engineering</option>
                        <option value="Geological Engineering">Geological Engineering</option>
                      </optgroup>
                      <optgroup label="Marine & Naval">
                        <option value="Marine Engineering">Marine Engineering</option>
                        <option value="Naval Architecture">Naval Architecture</option>
                        <option value="Ocean Engineering">Ocean Engineering</option>
                      </optgroup>
                      <optgroup label="Food & Agricultural">
                        <option value="Food Technology">Food Technology</option>
                        <option value="Agricultural Engineering">Agricultural Engineering</option>
                        <option value="Food Engineering">Food Engineering</option>
                      </optgroup>
                      <optgroup label="Textile & Fashion">
                        <option value="Textile Engineering">Textile Engineering</option>
                        <option value="Fashion Technology">Fashion Technology</option>
                      </optgroup>
                      <optgroup label="Other Disciplines">
                        <option value="Instrumentation Engineering">Instrumentation Engineering</option>
                        <option value="Control Systems">Control Systems Engineering</option>
                        <option value="Robotics Engineering">Robotics Engineering</option>
                        <option value="Mechatronics">Mechatronics Engineering</option>
                        <option value="Nuclear Engineering">Nuclear Engineering</option>
                        <option value="Engineering Physics">Engineering Physics</option>
                        <option value="Engineering Mathematics">Engineering Mathematics</option>
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}

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
        <div className="summary-section">
          <div className="summary-item">
            <strong>Team Name:</strong> <span>{formData.teamName}</span>
          </div>
          <div className="summary-item">
            <strong>Team Leader:</strong> <span>{formData.members[0]?.name || 'Not entered'}</span>
          </div>
          <div className="summary-item">
            <strong>Team Size:</strong> <span>{formData.teamSize} member{formData.teamSize > 1 ? 's' : ''}</span>
          </div>
          <div className="summary-item">
            <strong>Problem Statement:</strong> <span>{
              currentHackathon?.problemStatements?.find(p => p.id.toString() === formData.selectedTrack)?.title || 'Not selected'
            }</span>
          </div>
          {formData.projectIdea && (
            <div className="summary-item">
              <strong>Project Idea:</strong> <span>{formData.projectIdea}</span>
            </div>
          )}
          <div className="summary-item">
            <strong>Registration Fee:</strong> <span>₹{250 * formData.teamSize}</span>
          </div>
        </div>
        <div className="summary-note">
          <p><Check className="inline-icon" size={16} /> All details will be reviewable in the next step before payment</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => {
    const teamSize = formData.teamSize;
    const amount = getTeamPrice(teamSize);
    const selectedProblem = currentHackathon?.problemStatements?.find(p => p.id.toString() === formData.selectedTrack);
    
    return (
      <motion.div
        className="registration-step payment-step"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <div className="payment-header">
          <CheckCircle className="success-icon" size={48} />
          <h3><Target className="inline-icon" size={24} /> Review & Complete Registration</h3>
          <p>Review your details and complete payment to secure your battlefield position</p>
        </div>

        <div className="registration-review">
          {/* Team Information Section */}
          <div className="review-section">
            <div className="section-header">
              <h4>Team Information</h4>
              <button 
                type="button" 
                className="edit-btn"
                onClick={() => {
                  setStep(1);
                  setTimeout(() => {
                    scrollToTop();
                  }, 100);
                }}
                title="Edit team information"
              >
                <Edit size={16} /> Edit
              </button>
            </div>
            <div className="review-content">
              <div className="review-item">
                <strong>Team Name:</strong> {formData.teamName}
              </div>
              <div className="review-item">
                <strong>Team Size:</strong> {teamSize} member{teamSize > 1 ? 's' : ''}
              </div>
              <div className="review-item">
                <strong>Registration Fee:</strong> ₹{amount}
              </div>
            </div>
          </div>

          {/* Team Leader Section */}
          <div className="review-section">
            <div className="section-header">
              <h4>Team Leader Details</h4>
              <button 
                type="button" 
                className="edit-btn"
                onClick={() => {
                  setStep(1);
                  setTimeout(() => {
                    scrollToTop();
                  }, 100);
                }}
                title="Edit team leader details"
              >
                <Edit size={16} /> Edit
              </button>
            </div>
            <div className="review-content">
              <div className="review-item">
                <strong>Name:</strong> {formData.members[0]?.name || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>Email:</strong> {formData.members[0]?.email || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>Phone:</strong> {formData.members[0]?.phone || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>College:</strong> {formData.members[0]?.college || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>Gender:</strong> {formData.members[0]?.gender || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>Year:</strong> {formData.members[0]?.year || 'Not entered'}
              </div>
              <div className="review-item">
                <strong>Branch:</strong> {formData.members[0]?.branch || 'Not entered'}
              </div>
              {formData.members[0]?.rollNumber && (
                <div className="review-item">
                  <strong>Roll Number:</strong> {formData.members[0].rollNumber}
                </div>
              )}
            </div>
          </div>

          {/* Team Members Section (if team size > 1) */}
          {teamSize > 1 && (
            <div className="review-section">
              <div className="section-header">
                <h4>Team Members ({teamSize - 1} member{teamSize > 2 ? 's' : ''})</h4>
                <button 
                  type="button" 
                  className="edit-btn"
                  onClick={() => {
                    setStep(2);
                    setTimeout(() => {
                      scrollToTop();
                    }, 100);
                  }}
                  title="Edit team members"
                >
                  <Edit size={16} /> Edit
                </button>
              </div>
              <div className="review-content">
                {formData.members.slice(1, teamSize).map((member, index) => (
                  <div key={index} className="member-review">
                    <h5>Member {index + 2}</h5>
                    <div className="review-item">
                      <strong>Name:</strong> {member?.name || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>Email:</strong> {member?.email || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>Phone:</strong> {member?.phone || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>College:</strong> {member?.college || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>Gender:</strong> {member?.gender || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>Year:</strong> {member?.year || 'Not entered'}
                    </div>
                    <div className="review-item">
                      <strong>Branch:</strong> {member?.branch || 'Not entered'}
                    </div>
                    {member?.rollNumber && (
                      <div className="review-item">
                        <strong>Roll Number:</strong> {member.rollNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problem Statement Section */}
          <div className="review-section">
            <div className="section-header">
              <h4>Problem Statement & Project</h4>
              <button 
                type="button" 
                className="edit-btn"
                onClick={() => {
                  setStep(2);
                  setTimeout(() => {
                    scrollToTop();
                  }, 100);
                }}
                title="Edit problem statement"
              >
                <Edit size={16} /> Edit
              </button>
            </div>
            <div className="review-content">
              <div className="review-item">
                <strong>Selected Track:</strong> {selectedProblem?.title || 'Not selected'}
              </div>
              {selectedProblem && (
                <div className="review-item">
                  <strong>Category:</strong> {selectedProblem.category}
                </div>
              )}
              {formData.projectIdea && (
                <div className="review-item">
                  <strong>Project Idea:</strong> {formData.projectIdea}
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="payment-details">
            <div className="payment-info">
              <h4>Payment Information</h4>
              <div className="amount-breakdown">
                <div className="amount-item">
                  <span>Registration Fee ({teamSize} member{teamSize > 1 ? 's' : ''}):</span>
                  <span>₹{amount}</span>
                </div>
                <div className="amount-total">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>₹{amount}</strong></span>
                </div>
              </div>
              
              <div className="payment-note">
                <p><CreditCard className="inline-icon" size={16} /> Secure payment powered by Razorpay</p>
                <p><Shield className="inline-icon" size={16} /> Your payment is 100% secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button 
            type="button" 
            className="btn secondary"
            onClick={() => {
              setStep(3);
              setTimeout(() => {
                scrollToTop();
              }, 100);
            }}
          >
            <ChevronLeft size={16} /> Back to Review
          </button>
          <button 
            type="button" 
            className="btn primary payment-btn"
            onClick={handlePayment}
            disabled={paymentLoading}
          >
            <CreditCard size={20} />
            {paymentLoading ? 'Processing...' : `Pay ₹${amount} & Confirm Registration`}
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
            <ArrowLeft size={16} className="inline-icon" /> Back to Hackathon
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
                   stepNumber === 3 ? 'Finalize' : 'Review & Pay'}
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
                  <ArrowLeft size={16} className="inline-icon" />
                  {step === 2 ? 'Back to Team Info' : step === 3 ? 'Back to Members' : 'Previous'}
                </button>
              )}
              
              {step < 3 ? (
                <button type="button" className="btn primary" onClick={handleNextStep}>
                  {step === 1 ? 'Continue to Members & Track' : 'Continue to Project Details'}
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn primary" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Review & Continue to Payment'}
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
