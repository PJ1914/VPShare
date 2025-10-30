import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHackathon } from '../contexts/HackathonContext';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { useNotification } from '../contexts/NotificationContext';
import DynamicHackathonLanding from '../components/hackathon/DynamicHackathonLanding';
import RegistrationPage from '../components/hackathon/RegistrationPage';
import HackathonDashboard from '../components/hackathon/HackathonDashboard';
// Icon imports
import { Sword, Sparkles } from 'lucide-react';
import '../styles/DynamicHackathon.css';

const Hackathon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useResponsive();
  const { showNotification } = useNotification();
  const { currentHackathon } = useHackathon();
  const { user } = useAuth();

  // Determine current view based on URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/registration')) return 'registration';
    if (path.includes('/dashboard')) return 'dashboard';
    return 'landing';
  };

  const [currentView, setCurrentView] = useState(getCurrentView());

  // Update view when URL changes
  useEffect(() => {
    setCurrentView(getCurrentView());
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (currentHackathon) {
        showNotification({
          message: `Welcome to ${currentHackathon.name}! Prepare for the ultimate coding battle.`,
          type: 'info',
          duration: 5000
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [showNotification, currentHackathon]);

  if (isLoading) {
    return (
      <div className="hackathon-loading">
        <div className="loading-container">
          {/* Animated Logo */}
          <motion.div
            className="loading-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="sword-container"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="sword-wrapper">
                <motion.div
                  className="sword"
                  animate={{ 
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Sword size={48} />
                </motion.div>
              </div>
              
              {/* Glowing rings */}
              <div className="loading-rings">
                <motion.div
                  className="ring ring-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="ring ring-2"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="ring ring-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            className="loading-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="loading-title">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                कोड कुरुक्षेत्र
              </motion.span>
            </h2>
            <h3 className="loading-subtitle">CodeKurukshetra</h3>
            
            <motion.p
              className="loading-message"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparing the battlefield...
            </motion.p>
          </motion.div>

          {/* Loading Progress Bar */}
          <motion.div
            className="loading-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            <motion.div
              className="progress-dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="dot"
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Particles */}
          <div className="particles">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  y: [-20, -60, -20],
                  x: [0, Math.random() * 40 - 20, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  left: `${10 + (i * 10)}%`,
                  bottom: '20%'
                }}
              >
                <Sparkles size={16} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'registration':
        return <RegistrationPage onBack={() => navigate('/hackathon')} />;
      case 'dashboard':
        if (!user) {
          showNotification({
            message: 'Please login to access the dashboard',
            type: 'warning',
            duration: 3000
          });
          navigate('/hackathon');
          return null;
        }
        return <HackathonDashboard user={user} onBack={() => navigate('/hackathon')} />;
      default:
        return (
          <DynamicHackathonLanding 
            onNavigateToRegistration={() => navigate('/hackathon/registration')}
            onNavigateToDashboard={() => {
              if (user) {
                navigate('/hackathon/dashboard');
              } else {
                showNotification({
                  message: 'Please login to access the dashboard',
                  type: 'warning',
                  duration: 3000
                });
              }
            }}
          />
        );
    }
  };

  return (
    <div className="dynamic-hackathon">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Hackathon;
