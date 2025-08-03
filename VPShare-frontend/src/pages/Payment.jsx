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
import { createApiClient, retryRequest, getErrorMessage } from '../utils/apiUtils';

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
  const [retryCount, setRetryCount] = useState(0);
  const [paymentApiClient, setPaymentApiClient] = useState(null);

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
      setSelectedPlan('monthly');
      navigate('/payment/monthly', { replace: true });
      setError('Invalid plan selected. Defaulting to Monthly Plan.');
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // No need to store token in state - we'll fetch fresh tokens just-in-time
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

  // Initialize API client on component mount
  // TEMPORARILY COMMENTED OUT FOR DEBUGGING - BYPASSING API CLIENT
  /*
  useEffect(() => {
    const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL);
    setPaymentApiClient(apiClient);
  }, []);
  */

  const handlePayment = async () => {
    if (!razorpayLoaded) return setError('Razorpay SDK not loaded. Please refresh the page and try again.');

    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    
    const planDetails = plans[selectedPlan] || plans.monthly;
    setLoading(true);
    setError('');
    
    try {
      // Get a fresh token right before the API call (just-in-time fetching)
      const freshToken = await user.getIdToken();

      // TEMPORARY: Bypass API client for debugging - use direct axios call
      const orderPayload = { 
        payment_type: 'subscription', // Be explicit for clarity
        plan: selectedPlan, 
        amount: planDetails.amount 
      };

      console.log('🔍 Direct axios call - Order payload:', orderPayload);
      console.log('🔍 Direct axios call - URL:', `${import.meta.env.VITE_API_BASE_URL}/create-order`);
      console.log('🔍 Direct axios call - Fresh token length:', freshToken?.length || 'No token');

      // Use direct axios call instead of API client
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-order`,
        orderPayload,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${freshToken}` 
          },
          timeout: 15000
        }
      );

      console.log('✅ Direct axios call succeeded:', orderResponse.status);
      
      const { order_id, amount, currency, key_id } = orderResponse.data || {};
      if (!order_id || !amount || !currency || !key_id) {
        throw new Error('Missing required order details from payment gateway');
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
            // Get fresh token for payment verification
            const verifyFreshToken = await user.getIdToken();
            
            console.log('💳 Payment verification - Direct axios call');
            
            // 1. Verify payment using direct axios call (bypassing API client)
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_type: 'subscription', // Be explicit here too
                plan: selectedPlan,
                amount: planDetails.amount,
                email: userData.email,
                duration: planDetails.duration,
              },
              { 
                headers: { 
                  'Content-Type': 'application/json', 
                  Authorization: `Bearer ${verifyFreshToken}` 
                },
                timeout: 15000 // 15 second timeout for payment verification
              }
            );

            console.log('✅ Payment verification succeeded:', verifyResponse.status);

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
              }
            } catch (firestoreError) {
              // Don't fail the entire flow - payment was successful
            }

            // 3. Send confirmation email after successful payment verification
            try {
              console.log('📧 Sending confirmation email - Direct axios call');
              
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/send-email`,
                {
                  email: userData.email,
                  plan: selectedPlan,
                  amount: planDetails.amount,
                  duration: planDetails.duration,
                },
                { 
                  headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${verifyFreshToken}` 
                  },
                  timeout: 10000 // 10 second timeout for email
                }
              );
              
              console.log('✅ Email sent successfully');
            } catch (emailErr) {
              console.log('⚠️ Email failed but payment succeeded:', emailErr.message);
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
          const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
          setError(`Payment failed: ${errorMsg}. Please try again or contact support.`);
          setLoading(false);
        });
        
        // Add error handling for Razorpay modal issues
        razorpay.on('modal.ondismiss', function() {
          setLoading(false);
        });
        
        razorpay.open();
      } catch (razorpayError) {
        setError('Failed to initialize payment gateway. This might be due to network issues. Please try again or contact support.');
        setLoading(false);
      }
      
    } catch (err) {
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Payment gateway error (500). This could be due to Razorpay configuration issues on the server. Please try again or contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
        return;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid payment request. Please refresh the page and try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <motion.div className="payment-page" initial="hidden" animate="visible" variants={sectionVariants} style={{ paddingBottom: window.innerWidth <= 600 ? '6.5rem' : undefined }}>
      <h1 className="payment-title">Unlock Your Coding Potential</h1>
      <p className="payment-subtitle">Choose a CodeTapasya plan to start learning today!</p>
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            margin: '1rem 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <div style={{ 
            color: '#dc2626', 
            fontSize: '1.25rem',
            marginTop: '0.125rem',
            flexShrink: 0
          }}>
            ⚠️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              color: '#7f1d1d', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Payment Error
            </div>
            <div style={{ 
              color: '#991b1b',
              lineHeight: '1.5',
              marginBottom: '0.75rem'
            }}>
              {error}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setError('')} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={e => e.target.style.backgroundColor = '#dc2626'}
              >
                Dismiss
              </button>
              {retryCount < 3 && (
                <button 
                  onClick={handlePayment} 
                  disabled={loading}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#1d4ed8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => !loading && (e.target.style.backgroundColor = '#1e40af')}
                  onMouseOut={e => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
                >
                  Try Again
                </button>
              )}
              {retryCount >= 3 && (
                <p style={{ 
                  color: '#7f1d1d',
                  fontSize: '0.875rem',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  Multiple attempts failed. Please contact support or try again later.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="plans-container">
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
        disabled={loading || !razorpayLoaded || !auth.currentUser}
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