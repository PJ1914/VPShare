import React from 'react';
import { motion } from 'framer-motion';
import '../styles/MobileLoadingSpinner.css';

const MobileLoadingSpinner = ({ 
  show = true, 
  text = "Loading...", 
  fullScreen = false,
  color = "#2196F3" 
}) => {
  if (!show) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className={`mobile-loading-container ${fullScreen ? 'fullscreen' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="mobile-loading-content">
        {/* Main Spinner */}
        <motion.div 
          className="mobile-spinner"
          variants={spinnerVariants}
          animate="animate"
          style={{ borderTopColor: color }}
        />
        
        {/* Pulse Dots */}
        <div className="pulse-dots">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="pulse-dot"
              variants={dotVariants}
              animate="animate"
              style={{ 
                backgroundColor: color,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Loading Text */}
        <motion.p 
          className="loading-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <motion.div 
            className="progress-bar"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Loading screen with hackathon branding
export const HackathonMobileLoader = ({ show = true, stage = "Initializing" }) => {
  const stages = {
    "Initializing": "Setting up your hackathon experience...",
    "Loading": "Loading hackathon details...",
    "Processing": "Processing registration...",
    "Completing": "Almost ready!",
    "Ready": "Welcome to the hackathon!"
  };

  return (
    <MobileLoadingSpinner
      show={show}
      text={stages[stage] || stages["Loading"]}
      fullScreen={true}
      color="#667eea"
    />
  );
};

// Inline loader for forms and buttons
export const MobileInlineLoader = ({ 
  show = true, 
  size = "small", 
  color = "#2196F3",
  text = ""
}) => {
  if (!show) return null;

  return (
    <div className={`mobile-inline-loader ${size}`}>
      <motion.div 
        className="inline-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ borderTopColor: color }}
      />
      {text && <span className="inline-text">{text}</span>}
    </div>
  );
};

// Loading overlay for content sections
export const MobileSectionLoader = ({ 
  show = true, 
  section = "timeline",
  overlay = true 
}) => {
  if (!show) return null;

  const sectionMessages = {
    timeline: "Loading timeline events...",
    registration: "Processing registration form...",
    bootcamp: "Loading bootcamp schedule...",
    prizes: "Loading prize information...",
    speakers: "Loading speaker profiles...",
    sponsors: "Loading sponsor information..."
  };

  return (
    <motion.div 
      className={`mobile-section-loader ${overlay ? 'overlay' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="section-loader-content">
        <motion.div 
          className="section-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <p className="section-loading-text">
          {sectionMessages[section] || "Loading content..."}
        </p>
      </div>
    </motion.div>
  );
};

// Button loading state
export const MobileButtonLoader = ({ 
  loading = false, 
  children, 
  disabled = false,
  className = "",
  ...props 
}) => {
  return (
    <button 
      className={`mobile-btn-with-loader ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div 
          className="btn-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className={loading ? 'btn-text-hidden' : 'btn-text-visible'}>
        {children}
      </span>
    </button>
  );
};

export default MobileLoadingSpinner;
