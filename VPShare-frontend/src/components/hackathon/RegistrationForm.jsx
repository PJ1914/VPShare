import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import hackathonService, { initiateRazorpayPayment, validateRegistrationData, getTeamPrice, getTeamPriceInPaise, formatPrice, loadRazorpayScript, getHackathonPlanMapping, getBackendTeamSize } from '../../services/hackathonService';
import { config, logger } from '../../config/environment';
import DevNotice from '../DevNotice';
import '../../styles/Hackathon.css';

/*
💳 PAYMENT ENABLED 💳
Payment functionality is active in handleSubmit() function (around line 574)
Testing mode is commented out and available at the bottom of the payment flow.
To disable payments for testing:
1. Comment out the payment block in handleSubmit()
2. Uncomment the "TESTING MODE: Direct registration" block
3. Update the submit button text to show testing mode
4. Add testing notices to success page
*/

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
  const [registrationId, setRegistrationId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState(null);
  
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
        { 
          name: '', 
          email: '', 
          phone: '', 
          college: '', 
          department: '', 
          year: '', 
          role: 'Team Leader' 
        }
      ]
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

  const collegeOptions = [
    'TKR COLLEGE OF ENGINEERING AND TECHNOLOGY (K9)',
    'TEEGALA KRISHNA REDDY ENGINEERING COLLEGE (R9)'
  ];

  const departmentOptions = [
    'CIVIL',
    'EEE', 
    'ECE',
    'CSE',
    'IT',
    'AIML',
    'CSD',
    'CSG'
  ];

  const yearOptions = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year'
  ];

  // Auto-save functionality
  const saveFormDataToFirestore = useCallback(async (dataToSave, currentStep) => {
    if (!user || !user.uid) return;
    
    try {
      setIsAutoSaving(true);
      const db = getFirestore();
      const draftDoc = doc(db, 'hackathon_form_drafts', user.uid);
      
      await setDoc(draftDoc, {
        formData: dataToSave,
        currentStep: currentStep,
        lastSaved: serverTimestamp(),
        lastModified: Date.now() // Client timestamp for immediate feedback
      }, { merge: true });
      
      setLastSaved(new Date().toLocaleTimeString());
      console.log('Form data auto-saved successfully');
    } catch (error) {
      console.error('Failed to auto-save form data:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [user]);

  // Auto-restore functionality
  const restoreFormDataFromFirestore = useCallback(async () => {
    if (!user || !user.uid) return false;
    
    try {
      const db = getFirestore();
      const draftDoc = doc(db, 'hackathon_form_drafts', user.uid);
      const draftSnapshot = await getDoc(draftDoc);
      
      if (draftSnapshot.exists()) {
        const savedData = draftSnapshot.data();
        const { formData: savedFormData, currentStep } = savedData;
        
        // Check if this is a recent draft (within last 7 days)
        const lastModified = savedData.lastModified || 0;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        if (lastModified > sevenDaysAgo && !savedData.cleared) {
          // Show custom modal instead of browser confirm
          setPendingRestoreData({ formData: savedFormData, step: currentStep || 1 });
          setShowRestoreModal(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to restore form data:', error);
      return false;
    }
  }, [user]);

  // Handle restore confirmation
  const handleRestoreConfirm = useCallback(() => {
    if (pendingRestoreData) {
      setFormData(pendingRestoreData.formData);
      setStep(pendingRestoreData.step);
      console.log('Form data restored successfully');
    }
    setShowRestoreModal(false);
    setPendingRestoreData(null);
  }, [pendingRestoreData]);

  // Handle restore cancellation
  const handleRestoreCancel = useCallback(() => {
    setShowRestoreModal(false);
    setPendingRestoreData(null);
  }, []);

  // Clear draft after successful registration
  const clearFormDraft = useCallback(async () => {
    if (!user || !user.uid) return;
    
    try {
      const db = getFirestore();
      const draftDoc = doc(db, 'hackathon_form_drafts', user.uid);
      await setDoc(draftDoc, { cleared: true, clearedAt: serverTimestamp() });
      console.log('Form draft cleared after successful registration');
    } catch (error) {
      console.error('Failed to clear form draft:', error);
    }
  }, [user]);

  // Auto-restore on user authentication
  useEffect(() => {
    if (user && !authLoading) {
      restoreFormDataFromFirestore();
    }
  }, [user, authLoading, restoreFormDataFromFirestore]);

  // Handle automatic redirect to SmartInternz after successful payment
  useEffect(() => {
    if (success && step === 5) {
      let redirectTimer;
      let clickHandler;
      
      // Add click handler to detect clicks outside the success actions
      clickHandler = (event) => {
        const target = event.target;
        // Check if click is not on the action buttons
        if (!target.closest('.success-actions') && 
            !target.closest('.download-btn') && 
            !target.closest('.print-btn') &&
            !target.closest('.complete-registration-btn') &&
            !target.closest('.redirect-notice')) {
          
          // Show confirmation before redirect
          const shouldRedirect = window.confirm(
            'Your payment is complete! You need to complete your registration on SmartInternz platform. ' +
            'Would you like to proceed now?'
          );
          
          if (shouldRedirect) {
            window.open('https://smartinternz.com/cognitivex-hackathon-2025/register', '_blank');
          }
        }
      };
      
      // Auto-redirect after 2 minutes if no interaction
      redirectTimer = setTimeout(() => {
        const autoRedirect = window.confirm(
          'Your registration is complete! You will now be redirected to SmartInternz platform ' +
          'to complete additional details. Click OK to proceed.'
        );
        
        if (autoRedirect) {
          window.open('https://smartinternz.com/cognitivex-hackathon-2025/register', '_blank');
        }
      }, 120000); // 2 minutes
      
      // Add click listener
      document.addEventListener('click', clickHandler);
      
      // Cleanup
      return () => {
        if (redirectTimer) clearTimeout(redirectTimer);
        if (clickHandler) document.removeEventListener('click', clickHandler);
      };
    }
  }, [success, step]);

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && formData.personal_info.full_name) { // Only save if there's actual data
        saveFormDataToFirestore(formData, step);
      }
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData, step, user, saveFormDataToFirestore]);

  // Auto-save when step changes
  useEffect(() => {
    if (user && step > 1) {
      saveFormDataToFirestore(formData, step);
    }
  }, [step, formData, user, saveFormDataToFirestore]);

  // Warn user before leaving if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (user && formData.personal_info.full_name && !success) {
        e.preventDefault();
        e.returnValue = 'Your registration progress will be automatically saved, but you may lose any unsaved changes. Are you sure you want to leave?';
        return 'Your registration progress will be automatically saved, but you may lose any unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, formData.personal_info.full_name, success]);

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
          newTeamMembers.push({ 
            name: '', 
            email: '', 
            phone: '', 
            college: '', 
            department: '', 
            year: '', 
            role: `Member ${i + 1}` 
          });
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

  // Function to fill same college for all team members
  const fillSameCollegeForAll = () => {
    const leaderCollege = formData.team_info.team_members[0].college;
    if (!leaderCollege) {
      alert('Please select college for team leader first');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      team_info: {
        ...prev.team_info,
        team_members: prev.team_info.team_members.map((member, index) => ({
          ...member,
          college: index === 0 ? member.college : leaderCollege
        }))
      }
    }));
  };

  // Function to fill same department for all team members
  const fillSameDepartmentForAll = () => {
    const leaderDepartment = formData.team_info.team_members[0].department;
    if (!leaderDepartment) {
      alert('Please select department for team leader first');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      team_info: {
        ...prev.team_info,
        team_members: prev.team_info.team_members.map((member, index) => ({
          ...member,
          department: index === 0 ? member.department : leaderDepartment
        }))
      }
    }));
  };

  // Function to fill same year for all team members
  const fillSameYearForAll = () => {
    const leaderYear = formData.team_info.team_members[0].year;
    if (!leaderYear) {
      alert('Please select year for team leader first');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      team_info: {
        ...prev.team_info,
        team_members: prev.team_info.team_members.map((member, index) => ({
          ...member,
          year: index === 0 ? member.year : leaderYear
        }))
      }
    }));
  };

  // Function to fill all same info (college, department, year) for all team members
  const fillAllSameInfoForAll = () => {
    const leader = formData.team_info.team_members[0];
    if (!leader.college || !leader.department || !leader.year) {
      alert('Please fill all information (college, department, year) for team leader first');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      team_info: {
        ...prev.team_info,
        team_members: prev.team_info.team_members.map((member, index) => ({
          ...member,
          college: index === 0 ? member.college : leader.college,
          department: index === 0 ? member.department : leader.department,
          year: index === 0 ? member.year : leader.year
        }))
      }
    }));
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
        // Additional information (final step before payment)
        // No validation needed for optional fields
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
        const nextStepNumber = Math.min(step + 1, 3); // Only 3 steps now: Personal, Team, Additional
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
      // Get user token for payment
      const token = await user.getIdToken();
      
      // Calculate amount using backend-compatible pricing
      const teamSize = formData.team_info.team_size;
      const backendTeamSize = getBackendTeamSize(teamSize); // Backend only supports 1 and 3
      const baseAmount = getTeamPrice(teamSize);
      const amountInPaise = getTeamPriceInPaise(teamSize); // Get exact amount in paise (19900 or 54900)
      const amount = amountInPaise; // Use the paise amount directly
      
      // Step 1: Create payment order using user email as temporary identifier
      const tempRegistrationId = `temp_${user.uid}_${Date.now()}`;
      
      const orderPayload = { 
        payment_type: 'hackathon',
        registration_id: tempRegistrationId, // Use temporary ID for payment order
        team_size: backendTeamSize, // Use backend-compatible team size
        amount: amount
      };
      
      // Create payment order
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
            // Payment successful, now register the user
            console.log('Payment successful, proceeding with registration...');
            
            // Register the participant with the backend
            const registrationData = {
              personal_info: formData.personal_info,
              team_info: {
                ...formData.team_info,
                team_size: backendTeamSize
              },
              additional_info: formData.additional_info,
              user_id: user.uid,
              payment_info: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                temp_registration_id: tempRegistrationId
              }
            };

            const registrationResult = await hackathonService.register(registrationData);
            
            if (!registrationResult.success) {
              if (registrationResult.statusCode === 409 || 
                  (registrationResult.message && registrationResult.message.includes('already registered'))) {
                throw new Error('You have already registered for this hackathon. Please contact support for assistance.');
              }
              throw new Error(registrationResult.message || 'Registration failed after payment');
            }
            
            const { registration_id } = registrationResult.data;
            setRegistrationId(registration_id);
            
            // Get a fresh token for payment verification
            const freshToken = await user.getIdToken();
            
            // Verify payment with the actual registration_id
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_type: 'hackathon',
                registration_id: registration_id,
                team_size: backendTeamSize,
                amount: amountInPaise,
                email: formData.personal_info.email,
              },
              { 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
                timeout: 15000
              }
            );

            // Store registration data in Firestore
            const db = getFirestore();
            const registrationDoc = doc(db, 'hackathon_registrations', user.uid);
            await setDoc(registrationDoc, {
              personal_info: formData.personal_info,
              team_info: formData.team_info,
              additional_info: formData.additional_info,
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
              registration_date: serverTimestamp(),
              user_id: user.uid,
              status: 'active'
            }, { merge: true });
            
            // Clear the draft after successful registration
            await clearFormDraft();
            
            // Send confirmation email
            try {
              const emailPayload = {
                recipients: [registration_id],
                email_type: "confirmation",
              };
              
              const emailResponse = await axios.post(
                `${import.meta.env.VITE_HACKATHON_UTILS_API_URL}/send-email`,
                emailPayload,
                { 
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
                  timeout: 10000
                }
              );
              
              console.log('Confirmation email sent successfully:', emailResponse.data);
              
              // Check if there were any failed sends
              if (emailResponse.data?.data?.failed_count > 0) {
                console.warn('Some emails failed to send:', emailResponse.data.data.failed_sends);
              }
            } catch (emailError) {
              console.error('Failed to send confirmation email:', emailError);
              // Log more details for debugging
              if (emailError.response?.data) {
                console.error('Email API error details:', emailError.response.data);
              }
              // Don't fail the registration process if email fails
            }
            
            setPaymentStatus('success');
            setSuccess(true);
            setStep(5);
            
          } catch (error) {
            console.error('Post-payment registration error:', error);
            setPaymentStatus('failed');
            setErrors({ payment: `Registration failed after payment: ${error.response?.data?.error || error.message || 'Please contact support with your payment ID: ' + response.razorpay_payment_id}` });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('cancelled');
            setErrors({ payment: 'Payment was cancelled. No registration has been created. You can try again anytime.' });
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      /* TESTING MODE COMMENTED OUT - UNCOMMENT IF NEEDED FOR TESTING
      // TESTING MODE: Direct registration without payment
      console.log('Testing mode: Skipping payment, registering directly...');
      
      // Calculate amount for display purposes
      const teamSize = formData.team_info.team_size;
      const backendTeamSize = getBackendTeamSize(teamSize);
      const amount = getTeamPriceInPaise(teamSize);
      
      // Register the participant directly with the backend
      const registrationData = {
        personal_info: formData.personal_info,
        team_info: {
          ...formData.team_info,
          team_size: backendTeamSize
        },
        additional_info: formData.additional_info,
        user_id: user.uid
      };

      const registrationResult = await hackathonService.register(registrationData);
      
      if (!registrationResult.success) {
        if (registrationResult.statusCode === 409 || 
            (registrationResult.message && registrationResult.message.includes('already registered'))) {
          throw new Error('You have already registered for this hackathon. Please contact support for assistance.');
        }
        throw new Error(registrationResult.message || 'Registration failed');
      }
      
      const { registration_id } = registrationResult.data;
      setRegistrationId(registration_id);

      // Store registration data in Firestore
      const db = getFirestore();
      const registrationDoc = doc(db, 'hackathon_registrations', user.uid);
      await setDoc(registrationDoc, {
        personal_info: formData.personal_info,
        team_info: formData.team_info,
        additional_info: formData.additional_info,
        payment: {
          plan: `hackathon_team_${teamSize}`,
          status: 'testing_mode',
          startDate: serverTimestamp(),
          paymentId: 'test_payment_' + Date.now(),
          orderId: 'test_order_' + Date.now(),
          amount: amount,
          actualAmount: getTeamPrice(teamSize),
          teamSize: teamSize,
          registrationId: registration_id
        },
        registration_date: serverTimestamp(),
        user_id: user.uid,
        status: 'active'
      }, { merge: true });
      
      // Clear the draft after successful registration
      await clearFormDraft();
      
      setPaymentStatus('success');
      setSuccess(true);
      setStep(5);
      */
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific HTTP errors
      if (error.response?.status === 409) {
        setErrors({ 
          general: 'You have already registered for this hackathon. Please check your email for registration details.' 
        });
      } else if (error.response?.status === 400) {
        setErrors({ 
          payment: 'Registration failed. Please try again.' 
        });
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
        <select
          name="college"
          value={formData.personal_info.college}
          onChange={(e) => handleInputChange(e, 'personal_info')}
          className={errors.college ? 'error' : ''}
        >
          <option value="">Select College</option>
          {collegeOptions.map((college, index) => (
            <option key={index} value={college}>{college}</option>
          ))}
        </select>
        {errors.college && <span className="error-message">{errors.college}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Department *</label>
          <select
            name="department"
            value={formData.personal_info.department}
            onChange={(e) => handleInputChange(e, 'personal_info')}
            className={errors.department ? 'error' : ''}
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
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
            {yearOptions.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && <span className="error-message">{errors.year}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>
          Roll Number/Student ID 
          {formData.personal_info.year !== '1st Year' && <span style={{color: '#e74c3c'}}> *</span>}
          {formData.personal_info.year === '1st Year' && <span style={{color: '#7f8c8d', fontSize: '0.9em'}}> (Optional for 1st year)</span>}
        </label>
        <input
          type="text"
          name="roll_number"
          value={formData.personal_info.roll_number}
          onChange={(e) => handleInputChange(e, 'personal_info')}
          className={errors.rollNumber ? 'error' : ''}
          placeholder={formData.personal_info.year === '1st Year' ? "Enter your roll number (if available)" : "Enter your roll number"}
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
        
        {/* Quick fill buttons for teams with multiple members */}
        {formData.team_info.team_size > 1 && (
          <div className="quick-fill-buttons">
            <h5>Quick Fill Options (Fill same info for all members)</h5>
            <div className="button-group">
              <button 
                type="button" 
                className="quick-fill-btn"
                onClick={fillSameCollegeForAll}
                title="Fill same college for all team members"
              >
                Same College
              </button>
              <button 
                type="button" 
                className="quick-fill-btn"
                onClick={fillSameDepartmentForAll}
                title="Fill same department for all team members"
              >
                Same Department
              </button>
              <button 
                type="button" 
                className="quick-fill-btn"
                onClick={fillSameYearForAll}
                title="Fill same year for all team members"
              >
                Same Year
              </button>
              <button 
                type="button" 
                className="quick-fill-btn primary"
                onClick={fillAllSameInfoForAll}
                title="Fill all same info for all team members"
              >
                Fill All Same
              </button>
            </div>
          </div>
        )}

        {formData.team_info.team_members.map((member, index) => (
          <div key={index} className="team-member">
            <h5>{member.role}</h5>
            
            {/* Basic Information */}
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

            {/* Academic Information */}
            <div className="form-row">
              <div className="form-group">
                <label>College *</label>
                <select
                  value={member.college}
                  onChange={(e) => handleTeamMemberChange(index, 'college', e.target.value)}
                  className={errors[`teamMember${index}College`] ? 'error' : ''}
                >
                  <option value="">Select College</option>
                  {collegeOptions.map((college, idx) => (
                    <option key={idx} value={college}>{college}</option>
                  ))}
                </select>
                {errors[`teamMember${index}College`] && (
                  <span className="error-message">{errors[`teamMember${index}College`]}</span>
                )}
              </div>

              <div className="form-group">
                <label>Department *</label>
                <select
                  value={member.department}
                  onChange={(e) => handleTeamMemberChange(index, 'department', e.target.value)}
                  className={errors[`teamMember${index}Department`] ? 'error' : ''}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors[`teamMember${index}Department`] && (
                  <span className="error-message">{errors[`teamMember${index}Department`]}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Year *</label>
              <select
                value={member.year}
                onChange={(e) => handleTeamMemberChange(index, 'year', e.target.value)}
                className={errors[`teamMember${index}Year`] ? 'error' : ''}
              >
                <option value="">Select Year</option>
                {yearOptions.map((year, idx) => (
                  <option key={idx} value={year}>{year}</option>
                ))}
              </select>
              {errors[`teamMember${index}Year`] && (
                <span className="error-message">{errors[`teamMember${index}Year`]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAdditionalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="registration-step"
    >
      <h3>Additional Information</h3>
      
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
              <strong>Year:</strong> {formData.personal_info.year ? (formData.personal_info.year === 'graduate' ? 'Graduate' : `${getOrdinalSuffix(formData.personal_info.year)} Year`) : 'Not provided'}
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
              <strong>Bootcamp:</strong> 4 days of intensive learning and preparation
            </div>
            <div className="date-item">
              <strong>Hackathon:</strong> 2-day continuous coding challenge
            </div>
            <div className="date-item">
              <strong>Problem Statement:</strong> You will receive the official mail from noreply@codetapasya.com
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h4>🤝 Need Help?</h4>
          <div className="contact-details">
            <p><strong>Email:</strong> <a href="mailto:support@codetapasya.com">support@codetapasya.com</a></p>
            <p><strong>Website:</strong> <a href="https://codetapasya.com" target="_blank" rel="noopener noreferrer">codetapasya.com</a></p>
            <p><strong>Event Partner:</strong> SmartBridge & IBM</p>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary download-btn"
            onClick={() => {
              // Generate and download registration confirmation
              const registrationData = {
                registrationId: registrationId || 'DEMO-REG-001',
                teamName: formData.team_info.team_name,
                teamSize: formData.team_info.team_size,
                amountPaid: formatPrice(getTeamPrice(formData.team_info.team_size)),
                email: formData.personal_info.email,
                fullName: formData.personal_info.full_name,
                phone: formData.personal_info.phone,
                college: formData.personal_info.college,
                department: formData.personal_info.department,
                year: formData.personal_info.year,
                expectations: formData.additional_info.expectations || 'Not specified',
                linkedin: formData.additional_info.linkedin || 'Not provided',
                github: formData.additional_info.github || 'Not provided'
              };
              
              // Create downloadable content
              const content = `
CognitiveX GenAI Hackathon 2025 - Registration Confirmation

==================================================
REGISTRATION DETAILS
==================================================
Registration ID: ${registrationData.registrationId}
Team Name: ${registrationData.teamName}
Team Size: ${registrationData.teamSize} member(s)
Amount Paid: ${registrationData.amountPaid}

==================================================
PERSONAL INFORMATION
==================================================
Full Name: ${registrationData.fullName}
Email: ${registrationData.email}
Phone: ${registrationData.phone}
College: ${registrationData.college}
Department: ${registrationData.department}
Year: ${registrationData.year}

==================================================
ADDITIONAL INFORMATION
==================================================
Expectations: ${registrationData.expectations}
LinkedIn: ${registrationData.linkedin}
GitHub: ${registrationData.github}

==================================================
NEXT STEPS
==================================================
1. Check your email for detailed bootcamp information
2. Join the WhatsApp group for updates
3. Complete IBM SkillsBuild courses
4. Register on NASSCOM FSP platform
5. Complete registration on SmartInternz platform

==================================================
CONTACT & SUPPORT
==================================================
Email: support@codetapasya.com
Website: codetapasya.com
Event Partners: SmartBridge & IBM

Registration Date: ${new Date().toLocaleDateString()}
`;
              
              const blob = new Blob([content], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hackathon-registration-${registrationData.registrationId}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
          >
            📥 Download Registration Details
          </button>
          
          <button 
            className="btn-secondary print-btn"
            onClick={() => {
              // Print current page
              window.print();
            }}
          >
            🖨️ Print Confirmation
          </button>
          
          <button 
            className="btn-primary complete-registration-btn"
            onClick={() => {
              // Redirect to SmartInternz website for additional details
              window.open('https://smartinternz.com/cognitivex-hackathon-2025/register', '_blank');
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              marginTop: '1rem'
            }}
          >
            Click Here to the next process
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Register Another Team
          </button>
        </div>
        
        {/* Auto-redirect notice */}
        <div className="redirect-notice" style={{
          background: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
          padding: '1.5rem',
          borderRadius: '12px',
          margin: '2rem 0 0 0',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#92400e', marginBottom: '1rem', fontSize: '1.1rem' }}>
            🎯 Important: Complete Your Registration
          </h4>
          <p style={{ color: '#92400e', margin: '0 0 1rem 0', lineHeight: '1.6' }}>
            Your payment is confirmed! Now please click the button above to complete your registration 
            on the SmartInternz platform where you'll provide additional details about your problem statement selection.
          </p>
          <p style={{ color: '#92400e', margin: '0', fontSize: '0.9rem', fontStyle: 'italic' }}>
            💡 <strong>Tip:</strong> Save or print your registration details before proceeding to the next step.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderPersonalInfo();
      case 2: return renderTeamInfo();
      case 3: return renderAdditionalInfo();
      case 4: return renderReview();
      case 5: return renderSuccess();
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
            onClick={() => {
              // Set return path to hackathon registration
              sessionStorage.setItem('loginReturnPath', '/hackathon#register');
              window.location.href = '/login?returnTo=' + encodeURIComponent('/hackathon#register');
            }}
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
        {[1, 2, 3].map(stepNum => (
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
        <span className={step >= 3 ? 'active' : ''}>Additional</span>
      </div>

      {/* Auto-save Status Indicator */}
      {user && (
        <div className="auto-save-status" style={{
          textAlign: 'center',
          margin: '10px 0',
          fontSize: '11px',
          color: '#888',
          opacity: isAutoSaving ? 1 : 0.7
        }}>
          {isAutoSaving ? (
            <span style={{ color: '#2196F3' }}>
              💾 Saving your progress...
            </span>
          ) : lastSaved ? (
            <span style={{ color: '#4caf50' }}>
              ✅ Auto-saved at {lastSaved}
            </span>
          ) : (
            <span style={{ color: '#999' }}>
              📝 Your progress will be automatically saved
            </span>
          )}
        </div>
      )}

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
          
          {step < 3 ? (
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

      {/* Custom Restore Modal */}
      {showRestoreModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '520px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '24px' }}>💾</span>
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  color: '#1a1a1a',
                  fontSize: '20px',
                  fontWeight: '600',
                  letterSpacing: '-0.5px'
                }}>
                  CognitiveX GenAI Hackathon
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Resume Your Registration
                </p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{
                color: '#495057',
                lineHeight: '1.6',
                margin: 0,
                fontSize: '15px'
              }}>
                📝 We found a previously saved draft of your registration form. You can continue where you left off or start fresh.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleRestoreCancel}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e0e0e0',
                  backgroundColor: 'white',
                  color: '#666',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#ccc';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                Start Fresh
              </button>
              <button
                onClick={handleRestoreConfirm}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                }}
              >
                Continue Registration →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
