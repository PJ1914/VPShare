import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import '../../styles/LiveClassesBanner.css';

const LiveClassesBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="live-classes-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="banner-content">
        <div className="banner-icon">
          <Sparkles size={32} />
        </div>
        
        <div className="banner-text">
          <div className="banner-header">
            <h3>🎉 Live Classes Access Unlocked!</h3>
            <span className="new-badge">NEW</span>
          </div>
          <p>Start your Python & AWS Full Stack journey with live mentorship</p>
        </div>

        <div className="banner-details">
          <div className="detail-item">
            <Calendar size={18} />
            <span>Starts Soon</span>
          </div>
          <div className="detail-item">
            <Clock size={18} />
            <span>12 Weeks Program</span>
          </div>
        </div>

        <motion.button
          className="banner-cta"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/courses')}
        >
          View Curriculum
          <ArrowRight size={18} />
        </motion.button>
      </div>

      {/* Animated background */}
      <div className="banner-glow"></div>
    </motion.div>
  );
};

export default LiveClassesBanner;
