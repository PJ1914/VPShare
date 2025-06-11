import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Payment.css';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const cardVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

function Payment() {
  const { plan: initialPlan } = useParams(); // Get the initial plan from URL
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || 'monthly'); // Default to monthly if no plan in URL
  const [loading, setLoading] = useState(false);

  // Define all plan details
  const plans = {
    'one-day': {
      name: 'One-Day Plan',
      price: 10,
      amount: 10 * 100, // Amount in paisa for Razorpay
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

  // Get the selected plan details
  const planDetails = plans[selectedPlan] || plans.monthly;

  // Handle Razorpay payment
  const handlePayment = () => {
    if (!planDetails.amount) {
      alert('Please select a valid plan.');
      return;
    }

    setLoading(true);

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
      amount: planDetails.amount,
      currency: 'INR',
      name: 'CodeTapasya',
      description: `Subscription for ${planDetails.name}`,
      image: '/Logo Of CT.png', // Ensure this path is correct
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(false);
        navigate('/dashboard');
      },
      prefill: {
        name: 'User Name', // Replace with actual user data
        email: 'user@example.com',
        contact: '9999999999',
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
      alert(`Payment failed: ${response.error.description}`);
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
      <h1>Choose Your Subscription Plan</h1>
      <div className="plans-container">
        {Object.keys(plans).map((planKey) => (
          <motion.div
            key={planKey}
            className={`plan-card ${selectedPlan === planKey ? 'selected' : ''}`}
            variants={cardVariants}
            whileHover="hover"
            onClick={() => setSelectedPlan(planKey)}
          >
            <h3>{plans[planKey].name}</h3>
            <p className="price">{plans[planKey].price} RS / {plans[planKey].duration}</p>
            <ul>
              {plans[planKey].features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="selected-plan-details">
        <h2>Selected Plan: {planDetails.name}</h2>
        <p className="price">{planDetails.price} RS / {planDetails.duration}</p>
        <ul>
          {planDetails.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <motion.button
        className="pay-button"
        onClick={handlePayment}
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
      >
        {loading ? 'Processing...' : 'Pay Now with Razorpay'}
      </motion.button>
    </motion.div>
  );
}

export default Payment;