import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import '../styles/SubscriptionBanner.css';

function SubscriptionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the banner only if not dismissed in this session
    const dismissed = sessionStorage.getItem('subscriptionBannerDismissed');
    if (!dismissed) {
      // Show after a short delay (e.g., 10 seconds)
      const timer = setTimeout(() => setVisible(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('subscriptionBannerDismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="subscription-banner">
      <span className="banner-icon"><StarIcon style={{ fontSize: '1.7rem' }} /></span>
      <span className="banner-message">
        Unlock all features and premium content with a CodeTapasya subscription!
      </span>
      <Link to="/payment/monthly" className="banner-subscribe-btn">
        Subscribe Now
      </Link>
      <button className="banner-close-btn" onClick={handleClose} aria-label="Close subscription reminder">×</button>
    </div>
  );
}

export default SubscriptionBanner;
