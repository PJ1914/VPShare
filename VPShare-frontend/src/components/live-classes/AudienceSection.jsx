import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, GraduationCap } from 'lucide-react';

const AudienceSection = () => {
  const audiences = [
    {
      icon: <GraduationCap size={40} />,
      title: 'Beginners',
      description: 'Want to start programming from scratch',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <CheckCircle size={40} />,
      title: 'College Students',
      description: 'Aiming for real-world backend projects',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: <CheckCircle size={40} />,
      title: 'Developers',
      description: 'Interested in Python, APIs, or AWS Cloud',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  return (
    <section className="audience-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Who Can Join?</h2>
          <p className="section-description">
            This program is designed for learners at all levels
          </p>
          
          <div className="audience-grid">
            {audiences.map((audience, index) => (
              <motion.div
                key={index}
                className="audience-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div 
                  className="audience-icon"
                  style={{ background: audience.gradient }}
                >
                  {audience.icon}
                </div>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
                <div className="audience-checkmark">
                  <CheckCircle size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AudienceSection;
