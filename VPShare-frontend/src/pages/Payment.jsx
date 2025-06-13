import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../styles/Payment.css';

// Animation variants
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

  // Define all plan details
  const plans = {
    'one-day': {
      name: 'One-Day Plan',
      price: 10,
      amount: 10 * 100,
      duration: '24 hours',
      features: ['24-hour full access', 'All courses and projects', 'Community support'],
    },
    weekly: {
      name: 'Weekly Plan',
      price: 49,
      amount: 49 * 100,
      duration: '7 days',
      features: ['7-day full access', 'All courses and projects', 'Community support', 'Weekly progress tracking'],
    },
    monthly: {
      name: 'Monthly Plan',
      price: 99,
      amount: 99 * 100,
      duration: '30 days',
      features: ['30-day full access', 'All courses and projects', 'Priority support', 'Monthly progress tracking'],
    },
    'six-month': {
      name: '6-Month Plan',
      price: 449,
      amount: 449 * 100,
      duration: '6 months',
      features: ['6-month full access', 'All courses and projects', 'Priority support', 'Exclusive projects'],
    },
    yearly: {
      name: 'Yearly Plan',
      price: 799,
      amount: 799 * 100,
      duration: '1 year',
      features: ['1-year full access', 'All courses and projects', 'Priority support', 'Early access to new courses'],
    },
  };

  // Validate initial plan
  useEffect(() => {
    if (!plans[initialPlan]) {
      setSelectedPlan('monthly');
      navigate('/payment/monthly', { replace: true });
      setError('Invalid plan selected. Defaulting to Monthly Plan.');
    }
  }, [initialPlan, navigate]);

  // Load Razorpay script with retry mechanism
  useEffect(() => {
    const loadRazorpayScript = async (retries = 3, delay = 2000) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => setRazorpayLoaded(true);
      script.onerror = async () => {
        if (retries > 0) {
          setTimeout(() => loadRazorpayScript(retries - 1, delay * 2), delay);
        } else {
          setError('Failed to load Razorpay SDK after multiple attempts. Please try again later.');
          setRazorpayLoaded(false);
        }
      };

      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };

    loadRazorpayScript();
  }, []);

  // Fetch user data from Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserData({
          name: user.displayName || 'User Name',
          email: user.email || 'user@example.com',
          contact: user.phoneNumber || '9999999999',
        });
      } else {
        setError('User not authenticated. Please log in to proceed with payment.');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Get the selected plan details
  const planDetails = plans[selectedPlan] || plans.monthly;

  // Send email notification via AWS Lambda
  const sendPaymentEmailNotification = async (paymentId) => {
    try {
      await fetch('https://your-api-id.execute-api.your-region.amazonaws.com/prod/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          subject: 'CodeTapasya: Subscription Confirmation',
          message: `Thank you for subscribing to the ${planDetails.name}!\n\nDetails:\nPlan: ${planDetails.name}\nPrice: ₹${planDetails.price}\nDuration: ${planDetails.duration}\nPayment ID: ${paymentId}\nDate: ${new Date().toLocaleString()}\n\nStart learning now at CodeTapasya!`,
        }),
      });
    } catch (err) {
      console.error('Error sending payment confirmation email:', err);
    }
  };

  // Handle Razorpay payment
  const handlePayment = () => {
    if (!razorpayLoaded) {
      setError('Razorpay SDK not loaded. Please try again.');
      return;
    }

    if (!planDetails.amount) {
      setError('Please select a valid plan.');
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setError('Payment configuration error. Please contact support.');
      return;
    }

    setLoading(true);
    setError('');

    const options = {
      key: razorpayKey,
      amount: planDetails.amount,
      currency: 'INR',
      name: 'CodeTapasya',
      description: `Subscription for ${planDetails.name}`,
      image: '/Logo Of CT.png',
      handler: function (response) {
        sendPaymentEmailNotification(response.razorpay_payment_id);
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(false);
        navigate('/dashboard');
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.contact,
      },
      notes: {
        plan: planDetails.name,
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          alert('Payment cancelled.');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on('payment.failed', function (response) {
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
  };

  return (
    <motion.div
      className="payment-page"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
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
              setSelectedPlan(planKey);
              navigate(`/payment/${planKey}`, { replace: true });
              setError('');
            }}
          >
            {selectedPlan === planKey && (
              <CheckCircleIcon className="selected-icon" />
            )}
            <h3>{plans[planKey].name}</h3>
            <p className="price">₹{plans[planKey].price} <span>/{plans[planKey].duration}</span></p>
            <ul>
              {plans[planKey].features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="selected-plan-details">
        <h2>Plan Summary: {planDetails.name}</h2>
        <p className="price">Total: ₹{planDetails.price} for {planDetails.duration}</p>
        <ul>
          {planDetails.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <motion.button
        className="pay-button"
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {loading ? (
          <span className="loading-spinner">Processing...</span>
        ) : (
          'Proceed to Pay'
        )}
      </motion.button>
    </motion.div>
  );
}

export default Payment;