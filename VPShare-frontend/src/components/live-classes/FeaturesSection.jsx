import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Target size={28} />,
      title: 'Zero to Production',
      description: 'Start with no experience, end with a deployed cloud application',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <Users size={28} />,
      title: 'Live Mentorship',
      description: 'Direct access to experienced mentors during live sessions',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: <Zap size={28} />,
      title: 'Hands-On Projects',
      description: 'Build real projects every week, not just theory',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Why Choose This Program?</h2>
          <p className="section-description">
            A comprehensive learning experience designed for your success
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div 
                  className="feature-icon-wrapper"
                  style={{ background: feature.gradient }}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="feature-shine"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
