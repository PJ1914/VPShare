import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const MobileSidebar = ({ isOpen, onClose, activeSection, onNavigate }) => {
  const { isMobile, isTablet } = useResponsive();
  const [sectionProgress, setSectionProgress] = useState({});

  const navigationItems = [
    { 
      id: 'about', 
      label: 'About', 
      icon: '🎯', 
      description: 'Learn about the hackathon'
    },
    { 
      id: 'timeline', 
      label: 'Timeline', 
      icon: '📅', 
      description: 'Event schedule & milestones'
    },
    { 
      id: 'bootcamp', 
      label: 'Bootcamp', 
      icon: '🚀', 
      description: '4-day AI bootcamp program'
    },
    { 
      id: 'partners', 
      label: 'Partners', 
      icon: '🤝', 
      description: 'Our amazing partners'
    },
    { 
      id: 'responsibilities', 
      label: 'Guidelines', 
      icon: '📋', 
      description: 'Rules & responsibilities'
    },
    { 
      id: 'register', 
      label: 'Register', 
      icon: '📝', 
      description: 'Join the hackathon',
      highlight: true
    }
  ];

  // Calculate section progress based on scroll
  useEffect(() => {
    const calculateProgress = () => {
      const progress = {};
      navigationItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          const viewportTop = window.scrollY;
          const viewportBottom = viewportTop + window.innerHeight;
          
          if (viewportTop >= elementTop && viewportTop <= elementBottom) {
            const progressPercent = Math.min(100, 
              ((viewportTop - elementTop) / rect.height) * 100
            );
            progress[item.id] = Math.max(0, progressPercent);
          } else if (viewportBottom > elementBottom) {
            progress[item.id] = 100;
          } else {
            progress[item.id] = 0;
          }
        }
      });
      setSectionProgress(progress);
    };

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    if (isOpen && (isMobile || isTablet)) {
      window.addEventListener('scroll', handleScroll);
      calculateProgress();
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, isMobile, isTablet]);

  const handleItemClick = (sectionId) => {
    onNavigate(sectionId);
    onClose();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  if (!isMobile && !isTablet) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-sidebar-backdrop"
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mobile-sidebar"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '85%',
              maxWidth: '320px',
              height: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              zIndex: 9999,
              paddingTop: 'env(safe-area-inset-top, 0)',
              paddingLeft: 'env(safe-area-inset-left, 0)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '2rem 1.5rem 1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  color: '#fff',
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  🎯 CognitiveX
                </h3>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                  onTouchStart={(e) => {
                    e.target.style.transform = 'scale(0.95)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onTouchEnd={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                GenAI Hackathon Navigation
              </p>
            </div>

            {/* Navigation Items */}
            <div style={{
              flex: 1,
              padding: '1rem 0',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    borderLeft: activeSection === item.id ? '4px solid #fff' : '4px solid transparent',
                    background: activeSection === item.id 
                      ? 'rgba(255, 255, 255, 0.15)' 
                      : 'transparent',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    touchAction: 'manipulation'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.background = activeSection === item.id 
                      ? 'rgba(255, 255, 255, 0.15)' 
                      : 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#fff',
                        fontWeight: activeSection === item.id ? '600' : '500',
                        fontSize: '1rem',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {item.label}
                        {item.highlight && (
                          <span style={{
                            background: '#4CAF50',
                            color: '#fff',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: '600'
                          }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8rem',
                        lineHeight: '1.3'
                      }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {sectionProgress[item.id] > 0 && (
                    <div style={{
                      width: '100%',
                      height: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '1px',
                      marginTop: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sectionProgress[item.id]}%` }}
                        style={{
                          height: '100%',
                          background: '#4CAF50',
                          borderRadius: '1px'
                        }}
                      />
                    </div>
                  )}

                  {/* Active Indicator */}
                  {activeSection === item.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '8px',
                        background: '#4CAF50',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  🏆
                </div>
                <div>
                  <div style={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Ready to compete?
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.8rem'
                  }}>
                    Join 500+ participants
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSidebar;
