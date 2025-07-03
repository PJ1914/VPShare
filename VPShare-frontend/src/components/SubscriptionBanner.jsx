import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import { useSubscription } from '../contexts/SubscriptionContext';
import '../styles/SubscriptionBanner.css';

function SubscriptionBanner() {
  const [visible, setVisible] = useState(false);
  const { hasSubscription, loading } = useSubscription();

  useEffect(() => {
    // Don't show banner if user has subscription or while loading
    if (loading || hasSubscription) {
      setVisible(false);
      return;
    }

    // Show the banner only if not dismissed in this session
    const dismissed = sessionStorage.getItem('subscriptionBannerDismissed');
    if (!dismissed) {
      // Show after a short delay (e.g., 5 seconds)
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasSubscription, loading]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('subscriptionBannerDismissed', 'true');
  };

  if (!visible || hasSubscription) return null;
  return (
    <div className="subscription-banner">
      <span className="banner-icon"><StarIcon /></span>
      <span className="banner-message">
        🔓 Unlock full access to all course modules and premium features!
      </span>
      <Link to="/payment/monthly" className="banner-subscribe-btn">
        Subscribe
      </Link>
      <button className="banner-close-btn" onClick={handleClose} aria-label="Close subscription reminder">×</button>
    </div>
  );
}

export default SubscriptionBanner;
