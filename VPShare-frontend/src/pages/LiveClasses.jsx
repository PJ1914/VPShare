import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import LiveClassesHero from '../components/live-classes/LiveClassesHero';
import FeaturesSection from '../components/live-classes/FeaturesSection';
import AudienceSection from '../components/live-classes/AudienceSection';
import CurriculumModule from '../components/live-classes/CurriculumModule';
import RegistrationForm from '../components/live-classes/RegistrationForm';
import '../styles/LiveClasses.css';
import '../styles/RegistrationForm.css';

// Icons
import { Award, Calendar, Clock, Users, Sparkles } from 'lucide-react';

const LiveClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEnrollClick = () => {
    if (user) {
      navigate('/payment/live-classes');
    } else {
      navigate('/login', { state: { from: '/live-classes' } });
    }
  };

  const handleViewCurriculum = () => {
    document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEO 
        title="Python & AWS Full Stack Development - Live Classes | CodeTapasya"
        description="12-week mentor-led program from zero to deployed serverless web app. Learn Python, Flask, Django, FastAPI, and AWS. Starts Soon."
        keywords="python course, aws training, full stack development, flask, django, fastapi, live coding classes, serverless, lambda, dynamodb"
      />

      <div className="live-classes-page">
        <LiveClassesHero 
          onEnrollClick={handleEnrollClick}
          onViewCurriculum={handleViewCurriculum}
        />
        
        <FeaturesSection />
        
        <AudienceSection />
        
        <CurriculumModule />
        
        {/* Projects Highlight */}
        <section className="projects-highlight">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">Build Real-World Projects</h2>
              <p className="section-description">
                Every week, you'll work on practical projects that matter
              </p>
              <div className="projects-grid">
                <motion.div
                  className="project-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="project-icon">💡</div>
                  <h3>Problem Solvers</h3>
                  <p>Build applications that solve real-world problems</p>
                </motion.div>
                <motion.div
                  className="project-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="project-icon">�</div>
                  <h3>Scalable Solutions</h3>
                  <p>Create projects with potential to scale up</p>
                </motion.div>
                <motion.div
                  className="project-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="project-icon">☁️</div>
                  <h3>Cloud Deployed</h3>
                  <p>Final project deployed live on AWS</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <RegistrationForm />

        {/* Certification */}
        <section className="certification-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="certification-content"
            >
              <Award size={64} color="#6366f1" />
              <h2>CodeTapasya Certified</h2>
              <h3>Python & AWS Developer</h3>
              <p>Backed by real project experience and cloud deployment skills</p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="final-cta-content"
            >
              <h2>🎁 Start with FREE 1-Week Trial!</h2>
              <p>Experience the full course before making any commitment. No payment required for trial.</p>
              <div className="cta-details">
                <div className="detail">
                  <Calendar size={24} />
                  <span>Starts: <strong>Soon</strong></span>
                </div>
                <div className="detail">
                  <Clock size={24} />
                  <span>Duration: <strong>12 Weeks</strong></span>
                </div>
                <div className="detail">
                  <Users size={24} />
                  <span>Format: <strong>Online Live + Recorded</strong></span>
                </div>
              </div>
              <div className="trial-features">
                <h3>What's Included in FREE Trial:</h3>
                <div className="trial-points">
                  <span>✅ Full access to Week 1 live classes</span>
                  <span>✅ All course materials and resources</span>
                  <span>✅ Hands-on projects and assignments</span>
                  <span>✅ Direct mentor interaction</span>
                  <span>✅ No credit card required</span>
                </div>
              </div>
              <div className="enrollment-buttons">
                <motion.button
                  className="cta-button primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  🎉 Register for FREE Trial
                </motion.button>
              </div>
              <p className="group-savings-text">
                � After the trial, continue learning with flexible payment options!
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LiveClasses;
