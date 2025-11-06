import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Sparkles } from 'lucide-react';

const LiveClassesHero = ({ onEnrollClick, onViewCurriculum }) => {
  return (
    <section className="live-classes-hero">
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>
      
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-text"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-badge"
          >
            <Sparkles size={16} />
            <span>Enrollment Open - Limited Seats</span>
          </motion.div>
          
          <h1 className="hero-title">
            <span className="gradient-text">Python & AWS</span>
            <br />
            Full Stack Development
          </h1>
          
          <p className="hero-subtitle">
            By <strong className="brand-highlight">CodeTapasya</strong>
          </p>
          
          <p className="hero-description">
            Transform from beginner to cloud developer in just 12 weeks. 
            Master Python, Flask, Django, FastAPI, and deploy production-ready 
            serverless applications on AWS with hands-on mentorship.
          </p>
          
          <div className="hero-stats">
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Clock size={24} />
              <div className="stat-content">
                <span className="stat-label">Duration</span>
                <span className="stat-value">12 Weeks</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar size={24} />
              <div className="stat-content">
                <span className="stat-label">Starts</span>
                <span className="stat-value">Nov 10, 2025</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Users size={24} />
              <div className="stat-content">
                <span className="stat-label">Seats</span>
                <span className="stat-value">Limited</span>
              </div>
            </motion.div>
          </div>
          
          <div className="live-classes-cta">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-primary"
              onClick={() => {
                document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>🎁 Start FREE Trial</span>
              <Sparkles size={18} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-secondary"
              onClick={onViewCurriculum}
            >
              View Curriculum
            </motion.button>
          </div>
          
          <p className="trial-note">
            ✨ No payment required for 1-week trial | Full course access
          </p>
        </motion.div>
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="floating-elements">
        <motion.div
          className="floating-circle circle-1"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-circle circle-2"
          animate={{
            y: [0, 20, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-circle circle-3"
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </section>
  );
};

export default LiveClassesHero;
