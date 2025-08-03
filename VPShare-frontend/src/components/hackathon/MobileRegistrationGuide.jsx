import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const MobileRegistrationGuide = ({ isVisible, onClose }) => {
  const { isMobile, isTablet } = useResponsive();
  const [currentTip, setCurrentTip] = useState(0);

  const registrationTips = [
    {
      title: "Welcome to Mobile Registration! 📱",
      content: "We've optimized the registration process specifically for mobile users. Here are some tips to help you complete your registration smoothly.",
      icon: "🎯"
    },
    {
      title: "Form Navigation",
      content: "Use the progress indicators at the top to see your progress. You can navigate between steps, but make sure to fill required fields.",
      icon: "📋"
    },
    {
      title: "Touch-Friendly Design",
      content: "All buttons and input fields are sized for easy touch interaction. Tap and hold for additional options where available.",
      icon: "👆"
    },
    {
      title: "Auto-Save Feature",
      content: "Your progress is automatically saved as you fill out the form. You can safely navigate away and return later.",
      icon: "💾"
    },
    {
      title: "Team Registration",
      content: "Easily add team members with the + button. Each member needs their own details for the hackathon.",
      icon: "👥"
    },
    {
      title: "Payment Process",
      content: "Mobile payments are secure and optimized for your device. Multiple payment options are available.",
      icon: "💳"
    },
    {
      title: "Need Help?",
      content: "If you encounter any issues during registration, use the help button or contact our support team.",
      icon: "🆘"
    }
  ];

  if (!isMobile && !isTablet) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mobile-guide-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="mobile-guide-content"
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <h3 style={{
                color: '#667eea',
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Registration Guide
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              {registrationTips.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index === currentTip ? '#667eea' : '#e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Tip Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center', minHeight: '200px' }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {registrationTips[currentTip].icon}
                </div>
                
                <h4 style={{
                  color: '#333',
                  fontSize: '1.2rem',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}>
                  {registrationTips[currentTip].title}
                </h4>
                
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  margin: 0
                }}>
                  {registrationTips[currentTip].content}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                onClick={() => setCurrentTip(Math.max(0, currentTip - 1))}
                disabled={currentTip === 0}
                style={{
                  background: currentTip === 0 ? '#e0e0e0' : '#667eea',
                  color: currentTip === 0 ? '#999' : '#fff',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '8px',
                  cursor: currentTip === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Previous
              </button>

              <span style={{
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {currentTip + 1} of {registrationTips.length}
              </span>

              {currentTip < registrationTips.length - 1 ? (
                <button
                  onClick={() => setCurrentTip(currentTip + 1)}
                  style={{
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started!
                </button>
              )}
            </div>

            {/* Skip Option */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                Skip guide and start registration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileRegistrationGuide;
