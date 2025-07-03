import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import '../styles/Payment.css';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import StarIcon from '@mui/icons-material/Star';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import DiamondIcon from '@mui/icons-material/Diamond';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DiscountIcon from '@mui/icons-material/Discount';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = {
  initial: { scale: 1, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  hover: { scale: 1.05, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', transition: { duration: 0.3 } },
  selected: { borderColor: '#2563eb', backgroundColor: '#e0f2fe', transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

function Payment() {
  const { plan: initialPlan } = useParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || 'monthly');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ name: 'Guest User', email: 'guest@example.com', contact: '9999999999' });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [error, setError] = useState('');
  const [userToken, setUserToken] = useState(null);
  const plans = {
    'one-day': {
      name: 'One-Day Plan',
      price: 10,
      amount: 1000,
      duration: '24 hours',
      features: ['24-hour full access', 'All courses and projects', 'Community support', 'Code playground access'],
      popular: false,
    },
    weekly: {
      name: 'Weekly Plan',
      price: 49,
      amount: 4900,
      duration: '7 days',
      features: ['7-day full access', 'All courses and projects', 'Community support', 'Weekly progress tracking', 'Assignment submissions'],
      popular: false,
    },
    monthly: {
      name: 'Monthly Plan',
      price: 99,
      amount: 9900,
      duration: '30 days',
      features: ['30-day full access', 'All courses and projects', 'Priority support', 'Monthly progress tracking', 'Certificate eligibility'],
      popular: true,
    },
    'six-month': {
      name: '6-Month Plan',
      price: 449,
      amount: 44900,
      duration: '6 months',
      features: ['6-month full access', 'All courses and projects', 'Priority support', 'Exclusive projects', 'Career guidance', 'Interview prep'],
      popular: false,
    },
    yearly: {
      name: 'Yearly Plan',
      price: 799,
      amount: 79900,
      duration: '1 year',
      features: ['1-year full access', 'All courses and projects', 'Priority support', 'Early access to new courses'],
      popular: false,
    },
  };

  // Plan icon mapping for mobile UI (premium look)
  const planIcons = {
    'one-day': <FlashOnIcon className="plan-icon" />, // orange lightning
    weekly: <CalendarTodayIcon className="plan-icon" />, // green calendar
    monthly: <CreditCardIcon className="plan-icon" />, // blue card
    'six-month': <DiamondIcon className="plan-icon" />, // purple diamond
    yearly: <WorkspacePremiumIcon className="plan-icon" />, // gold premium
  };

  useEffect(() => {
    // Initialize Firebase auth check without verbose logging
    if (!plans[initialPlan]) {
      console.warn('Invalid plan selected. Defaulting to Monthly Plan.');
      setSelectedPlan('monthly');
      navigate('/payment/monthly', { replace: true });
      setError('Invalid plan selected. Defaulting to Monthly Plan.');
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setUserToken(token);
          setUserData({
            name: user.displayName || 'User Name',
            email: user.email || 'user@example.com',
            contact: user.phoneNumber || '9999999999',
          });
        } catch (err) {
          setError('Failed to authenticate. Please log in again.');
          navigate('/login');
        }
      } else {
        setError('User not authenticated. Please log in.');
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [initialPlan, navigate]);

  useEffect(() => {
    // Prevent duplicate script loads
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      setError('Failed to load Razorpay SDK. Please try again.');
      setRazorpayLoaded(false);
    };
    document.body.appendChild(script);
    
    // Note: You may see "x-rtb-fingerprint-id" console warnings from Razorpay SDK
    // This is internal to Razorpay's tracking system and can be safely ignored
    
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) return setError('Razorpay SDK not loaded.');
    if (!userToken) return setError('User not authenticated.');
    const planDetails = plans[selectedPlan] || plans.monthly;
    setLoading(true);
    setError('');
    
    try {
      // Create order payload
      const orderPayload = { plan: selectedPlan, amount: planDetails.amount };
      
      // Only log in development environment
      if (import.meta.env.DEV) {
        console.log('Sending order payload to AWS Lambda:', orderPayload);
      }
      
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-order`,
        orderPayload,
        { 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Only log in development environment (remove sensitive data in production)
      if (import.meta.env.DEV) {
        console.log('AWS Lambda response received successfully');
      }
      
      const { order_id, amount, currency, key_id } = orderResponse.data || {};
      if (!order_id || !amount || !currency || !key_id) {
        console.error('Missing order details in response');
        setError('Failed to create order: Missing required order details from payment gateway');
        setLoading(false);
        return;
      }
      
      const options = {
        key: key_id,
        amount,
        currency,
        order_id,
        name: 'CodeTapasya',
        description: `Subscription for ${planDetails.name}`,
        // Remove image to avoid mixed content issues
        // image: `${window.location.origin}/Logo Of CT.png`,
        handler: async function (response) {
          try {
            // 1. Verify payment first
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
                amount: planDetails.amount,
                email: userData.email,
                duration: planDetails.duration,
              },
              { 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
                timeout: 15000 // 15 second timeout for payment verification
              }
            );

            // 2. Update Firestore with subscription data
            try {
              const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
              const db = getFirestore();
              const auth = await import('firebase/auth');
              const user = auth.getAuth().currentUser;
              
              if (user) {
                // Calculate expiry date based on plan
                const expiryDate = new Date();
                switch (selectedPlan) {
                  case 'one-day':
                    expiryDate.setDate(expiryDate.getDate() + 1);
                    break;
                  case 'weekly':
                    expiryDate.setDate(expiryDate.getDate() + 7);
                    break;
                  case 'monthly':
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                    break;
                  case 'six-month':
                    expiryDate.setMonth(expiryDate.getMonth() + 6);
                    break;
                  case 'yearly':
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    break;
                  default:
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                }
                
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                  subscription: {
                    plan: selectedPlan,
                    status: 'active',
                    startDate: serverTimestamp(),
                    expiresAt: expiryDate,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    amount: planDetails.amount
                  },
                  lastUpdated: serverTimestamp()
                }, { merge: true });
                
                if (import.meta.env.DEV) {
                  console.log('Firestore subscription updated successfully');
                }
              }
            } catch (firestoreError) {
              console.error('Firestore update error:', firestoreError);
              // Don't fail the entire flow - payment was successful
            }

            // 3. Send confirmation email after successful payment verification
            try {
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/send-email`,
                {
                  email: userData.email,
                  plan: selectedPlan,
                  amount: planDetails.amount,
                  duration: planDetails.duration,
                },
                { 
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
                  timeout: 10000 // 10 second timeout for email
                }
              );
              if (import.meta.env.DEV) {
                console.log('Confirmation email sent successfully');
              }
            } catch (emailErr) {
              console.error('Email sending failed:', emailErr.response?.data?.error || 'Email service unavailable');
              // Don't fail the entire flow if email fails - payment was successful
            }

            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}. A confirmation email has been sent to ${userData.email}. Your subscription is now active!`);
            
            // Set flag for CourseDetail to refresh subscription
            sessionStorage.setItem('returnFromPayment', 'true');
            
            // Force refresh subscription context before navigation
            if (window.location.pathname.includes('/payment')) {
              // Add a small delay to ensure Firestore update is processed
              setTimeout(() => {
                navigate('/dashboard?from=payment');
                // Force full page reload to refresh subscription status
                window.location.reload();
              }, 1000);
            } else {
              navigate('/dashboard?from=payment');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Payment verification failed';
            setError(`Payment verification failed: ${errorMsg}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
        },
        notes: { plan: planDetails.name },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // User dismissing the modal is normal behavior, not an error condition
            if (import.meta.env.DEV) {
              console.log('Payment modal dismissed by user');
            }
          },
        },
        method: {
          card: true,
          upi: true,
          netbanking: true,
          wallet: true,
        },
        remember_customer: false,
      };
      
      try {
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response) {
          console.error('Payment failed - please try again');
          const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
          setError(`Payment failed: ${errorMsg}. Please try again or contact support.`);
          setLoading(false);
        });
        
        // Add error handling for Razorpay modal issues
        razorpay.on('modal.ondismiss', function() {
          if (import.meta.env.DEV) {
            console.log('Payment modal was dismissed');
          }
          setLoading(false);
        });
        
        razorpay.open();
      } catch (razorpayError) {
        console.error('Razorpay initialization error:', razorpayError);
        setError('Failed to initialize payment gateway. This might be due to network issues. Please try again or contact support.');
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Order creation error:', err);
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Payment gateway error (500). This could be due to Razorpay configuration issues on the server. Please try again or contact support.';
        if (import.meta.env.DEV) {
          console.error('500 Error Details:', {
            url: err.config?.url,
            status: err.response?.status,
            message: 'Server configuration or Razorpay API issue'
          });
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
        return;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid payment request. Please refresh the page and try again.';
        if (import.meta.env.DEV) {
          console.error('400 Error - Bad Request:', err.response?.status);
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Test payment function for debugging (development only)
  const testRazorpayConnection = () => {
    if (!import.meta.env.DEV) {
      console.warn('Test function only available in development mode');
      return;
    }
    
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }
    
    // Test with minimal options
    const testOptions = {
      key: 'rzp_test_9999999999', // dummy test key
      amount: 100, // ₹1
      currency: 'INR',
      name: 'Test Payment',
      description: 'Connection Test',
      handler: function(response) {
        console.log('Test payment successful');
      },
      modal: {
        ondismiss: function() {
          console.log('Test modal dismissed');
        }
      }
    };
    
    try {
      const razorpay = new window.Razorpay(testOptions);
      console.log('Razorpay initialized successfully');
    } catch (error) {
      console.error('Razorpay initialization failed');
      setError('Payment gateway initialization failed. Please try refreshing the page.');
    }
  };

  return (
    <motion.div className="payment-page" initial="hidden" animate="visible" variants={sectionVariants} style={{ paddingBottom: window.innerWidth <= 600 ? '6.5rem' : undefined }}>
      <h1 className="payment-title">Unlock Your Coding Potential</h1>
      <p className="payment-subtitle">Choose a CodeTapasya plan to start learning today!</p>
      {error && (
        <div className="error-message">
          {error}
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => setError('')} 
              style={{ 
                marginRight: '10px',
                padding: '5px 10px', 
                backgroundColor: '#ff4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Dismiss
            </button>
            {error.includes('Server error') || error.includes('gateway') ? (
              <button 
                onClick={() => {
                  setError('');
                  // Retry after a short delay
                  setTimeout(() => handlePayment(), 1000);
                }}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
                disabled={loading}
              >
                Retry Payment
              </button>
            ) : null}
          </div>
        </div>
      )}      <div className="plans-container">
        {Object.keys(plans).map((planKey) => (
          <motion.div
            key={planKey}
            className={`plan-card ${selectedPlan === planKey ? 'selected' : ''} ${plans[planKey].popular ? 'popular' : ''}`}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            animate={selectedPlan === planKey ? 'selected' : 'initial'}
            onClick={() => {
              setSelectedPlan(planKey);
              navigate(`/payment/${planKey}`, { replace: true });
              setError('');
            }}
          >
            <div className="plan-header">
              <div className="plan-icon-wrapper">
                {planIcons[planKey]}
              </div>
              <div className="plan-info">
                <h3 className="plan-name">{plans[planKey].name}</h3>
                <p className="plan-duration">
                  <AccessTimeIcon fontSize="small" />
                  {plans[planKey].duration}
                </p>
              </div>
              {selectedPlan === planKey && <VerifiedIcon className="selected-icon" />}
            </div>
            
            <div className="plan-pricing">
              <span className="price">₹{plans[planKey].price}</span>
              <span className="per-period">for {plans[planKey].duration}</span>
            </div>
            
            <div className="plan-features">
              {plans[planKey].features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <CheckCircleIcon className="feature-check" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>      <div className="selected-plan-details">
        <div className="plan-summary-header">
          <h2>
            <MonetizationOnIcon />
            Plan Summary: {plans[selectedPlan].name}
          </h2>
          {plans[selectedPlan].popular && (
            <div className="popular-indicator">
              <TrendingUpIcon />
              Popular Choice
            </div>
          )}
        </div>
        
        <div className="pricing-breakdown">
          <div className="price-display">
            <span className="total-label">Total Amount</span>
            <span className="total-price">₹{plans[selectedPlan].price}</span>
            <span className="duration-label">for {plans[selectedPlan].duration}</span>
          </div>
        </div>
        
        <div className="features-included">
          <h3>
            <VerifiedIcon />
            What's Included
          </h3>
          <div className="features-grid">
            {plans[selectedPlan].features.map((feature, index) => (
              <div key={index} className="feature-highlight">
                <CheckCircleIcon className="feature-icon" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="security-info">
          <SecurityIcon />
          <span>Secure payment powered by Razorpay</span>
        </div>
        
        <div className="legal-notice">
          <p>By proceeding with payment, you agree to our 
            <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer"> Terms & Conditions</Link>, 
            <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer"> Privacy Policy</Link>, and 
            <Link to="/refund-policy" target="_blank" rel="noopener noreferrer"> Refund Policy</Link>.
          </p>
          {error && (error.includes('gateway') || error.includes('500')) && (
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '10px' }}>
              Having trouble with payment? This might be a temporary server issue. Please contact support at support@codetapasya.com or try again later.
            </p>
          )}
        </div>
      </div>      <motion.button
        className="pay-button"
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded || !userToken}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        style={{ 
          position: window.innerWidth <= 600 ? 'fixed' : undefined, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: window.innerWidth <= 600 ? '100vw' : undefined, 
          zIndex: 100 
        }}
      >
        {loading ? (
          <span className="loading-spinner">
            <AccessTimeIcon />
            {loading === 'creating-order' ? 'Creating Order...' : 
             loading === 'processing-payment' ? 'Processing Payment...' : 
             'Processing Payment...'}
          </span>
        ) : (
          <span className="pay-button-content">
            <CreditCardIcon />
            Proceed to Pay ₹{plans[selectedPlan].price}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}

export default Payment;