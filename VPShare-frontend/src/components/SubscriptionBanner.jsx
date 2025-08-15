import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import { useSubscription } from '../contexts/SubscriptionContext';
import '../styles/SubscriptionBanner.css';

function SubscriptionBanner() {
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
    setIsClosing(true);
    // Let framer-motion handle the exit animation duration
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('subscriptionBannerDismissed', 'true');
      setIsClosing(false);
    }, 400); // Slightly longer to match exit animation
  };

  if (!visible || hasSubscription) return null;

  // Enhanced animation variants
  const bannerVariants = {
    initial: {
      opacity: 0,
      y: 100,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
        duration: 0.6,
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      transition: {
        type: "easeInOut",
        duration: 0.3,
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }
    },
    hover: {
      scale: 1.1,
      rotate: 10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    }
  };

  const buttonVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.4,
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    }
  };

  const closeButtonVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.6,
      }
    },
    hover: {
      scale: 1.1,
      rotate: 90,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    },
    tap: {
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {visible && !isClosing && (
        <motion.div 
          className="subscription-banner"
          variants={bannerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover="hover"
          layout
        >
          <motion.span 
            className="banner-icon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <StarIcon />
          </motion.span>
          
          <motion.span 
            className="banner-message"
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: {
                delay: 0.3,
                duration: 0.5,
                ease: "easeOut"
              }
            }}
          >
            ✨ Unlock premium features and accelerate your learning journey!
          </motion.span>
          
          <motion.div
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/payment/monthly" className="banner-subscribe-btn">
              Upgrade Now
            </Link>
          </motion.div>
          
          <motion.button 
            className="banner-close-btn" 
            onClick={handleClose} 
            aria-label="Close subscription reminder"
            variants={closeButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <CloseIcon />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SubscriptionBanner;
