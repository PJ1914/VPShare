import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import '../styles/Payment.css';

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
      features: ['24-hour full access', 'All courses and projects', 'Community support'],
    },
    weekly: {
      name: 'Weekly Plan',
      price: 49,
      amount: 4900,
      duration: '7 days',
      features: ['7-day full access', 'All courses and projects', 'Community support', 'Weekly progress tracking'],
    },
    monthly: {
      name: 'Monthly Plan',
      price: 99,
      amount: 9900,
      duration: '30 days',
      features: ['30-day full access', 'All courses and projects', 'Priority support', 'Monthly progress tracking'],
    },
    'six-month': {
      name: '6-Month Plan',
      price: 449,
      amount: 44900,
      duration: '6 months',
      features: ['6-month full access', 'All courses and projects', 'Priority support', 'Exclusive projects'],
    },
    yearly: {
      name: 'Yearly Plan',
      price: 799,
      amount: 79900,
      duration: '1 year',
      features: ['1-year full access', 'All courses and projects', 'Priority support', 'Early access to new courses'],
    },
  };

  useEffect(() => {
    console.log('Checking Firebase auth...');
    if (!plans[initialPlan]) {
      console.warn('Invalid plan:', initialPlan);
      setSelectedPlan('monthly');
      navigate('/payment/monthly', { replace: true });
      setError('Invalid plan selected. Defaulting to Monthly Plan.');
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User authenticated:', user.email);
        try {
          const token = await user.getIdToken();
          console.log('Firebase token retrieved');
          setUserToken(token);
          setUserData({
            name: user.displayName || 'User Name',
            email: user.email || 'user@example.com',
            contact: user.phoneNumber || '9999999999',
          });
        } catch (err) {
          console.error('Auth error:', err);
          setError('Failed to authenticate. Please log in again.');
          navigate('/login');
        }
      } else {
        console.error('No user authenticated');
        setError('User not authenticated. Please log in.');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [initialPlan, navigate]);

  useEffect(() => {
    console.log('Loading Razorpay SDK...');
    const loadRazorpayScript = async (retries = 3, delay = 2000) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded');
        setRazorpayLoaded(true);
      };
      script.onerror = async () => {
        console.error('Razorpay SDK failed to load, retries left:', retries);
        if (retries > 0) {
          setTimeout(() => loadRazorpayScript(retries - 1, delay * 2), delay);
        } else {
          setError('Failed to load Razorpay SDK. Please try again.');
          setRazorpayLoaded(false);
        }
      };
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };
    loadRazorpayScript();
  }, []);

const handlePayment = async () => {
  console.log('handlePayment called, razorpayLoaded:', razorpayLoaded, 'userToken:', !!userToken);
  if (!razorpayLoaded) return setError('Razorpay SDK not loaded.');
  if (!userToken) return setError('User not authenticated.');

  const planDetails = plans[selectedPlan] || plans.monthly;
  setLoading(true);
  setError('');

  try {
    console.log('Calling /create-order with plan:', selectedPlan);
    const orderResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/create-order`,
      {
        plan: selectedPlan,
        amount: planDetails.amount,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const { order_id, amount, currency, key_id } = orderResponse.data || {};

    if (!order_id || !amount || !currency || !key_id) {
      console.error('Missing order details:', orderResponse.data);
      setError('Failed to create order: Missing required order details');
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
      image: '/Logo Of CT.png',
      handler: async function (response) {
        try {
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
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          navigate('/dashboard');
        } catch (err) {
          console.error('verify-payment error:', err.response?.data || err.message);
          setError(`Payment verification failed: ${err.response?.data?.error || err.message}`);
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
          console.log('Payment modal dismissed');
          setLoading(false);
          alert('Payment cancelled.');
        },
      },
      method: {
        card: true,
        upi: true,
        netbanking: true,
        wallet: true,
        emi: false,
        paylater: false,
      },
    };

    console.log('Opening Razorpay modal with options:', options);
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    razorpay.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });

  } catch (err) {
    console.error('create-order error:', err.message, err.response?.data);
    let errorMessage = err.message || 'Unknown error';
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    }
    setError(`Failed to create order: ${errorMessage}`);
    setLoading(false);
  }
};

  return (
    <motion.div className="payment-page" initial="hidden" animate="visible" variants={sectionVariants}>
      <h1 className="payment-title">Unlock Your Coding Potential</h1>
      <p className="payment-subtitle">Choose a CodeTapasya plan to start learning today!</p>
      {error && <div className="error-message">{error}</div>}
      <div className="plans-container">
        {Object.keys(plans).map((planKey) => (
          <motion.div
            key={planKey}
            className={`plan-card ${selectedPlan === planKey ? 'selected' : ''}`}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            animate={selectedPlan === planKey ? 'selected' : 'initial'}
            onClick={() => {
              console.log('Selected plan:', planKey);
              setSelectedPlan(planKey);
              navigate(`/payment/${planKey}`, { replace: true });
              setError('');
            }}
          >
            {selectedPlan === planKey && <CheckCircleIcon className="selected-icon" />}
            <h3>{plans[planKey].name}</h3>
            <p className="price">₹{plans[planKey].price} <span>/{plans[planKey].duration}</span></p>
            <ul>
              {plans[planKey].features.map((feature, index) => <li key={index}>{feature}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="selected-plan-details">
        <h2>Plan Summary: {plans[selectedPlan].name}</h2>
        <p className="price">Total: ₹{plans[selectedPlan].price} for {plans[selectedPlan].duration}</p>
        <ul>
          {plans[selectedPlan].features.map((feature, index) => <li key={index}>{feature}</li>)}
        </ul>
      </div>
      <motion.button
        className="pay-button"
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded || !userToken}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {loading ? <span className="loading-spinner">Processing...</span> : 'Proceed to Pay'}
      </motion.button>
    </motion.div>
  );
}

export default Payment;