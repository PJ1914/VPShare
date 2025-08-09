import React from 'react';
import { motion } from 'framer-motion';

const HackathonHero = () => {
  const handleRegisterClick = () => {
    const registerSection = document.getElementById('register');
    if (registerSection) {
      registerSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLearnMoreClick = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <section className="hackathon-hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <div className="hero-particles"></div>
      </div>
      
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text"
        >
          <div className="hero-badges">
            <span className="badge">TKR College</span>
            <span className="badge">× SmartBridge</span>
            <span className="badge">× IBM SkillsBuild</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-main">CognitiveX:</span>
            <span className="title-sub">GenAI Hackathon</span>
          </h1>
          
          <p className="hero-tagline">Where Ideas Evolve into AI</p>
          
          <div className="hero-highlights">
            <div className="highlight">
              <span className="highlight-number">4</span>
              <span className="highlight-text">Day Bootcamp</span>
            </div>
            <div className="highlight">
              <span className="highlight-number">2</span>
              <span className="highlight-text">Day Challenge</span>
            </div>
            <div className="highlight">
              <span className="highlight-number">∞</span>
              <span className="highlight-text">Opportunities</span>
            </div>
          </div>
          
          <div className="hero-actions">
            <button 
              className="btn-primary register-btn"
              onClick={handleRegisterClick}
            >
              Register Now
            </button>
            <button 
              className="btn-secondary learn-more-btn"
              onClick={handleLearnMoreClick}
            >
              Learn More
            </button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-visual"
        >
          <div className="ai-visualization">
            <div className="neural-network">
              <div className="node"></div>
              <div className="node"></div>
              <div className="node"></div>
              <div className="node"></div>
              <div className="node"></div>
              <div className="connections"></div>
            </div>
            <div className="floating-elements">
              <div className="element ai">AI</div>
              <div className="element ml">ML</div>
              <div className="element data">Data</div>
              <div className="element cloud">Cloud</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="hero-scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default HackathonHero;
