import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
  const industryPartners = [
    { name: 'Salesforce', logo: 'salesforce', category: 'CRM & Cloud' },
    { name: 'Tableau', logo: 'tableau', category: 'Data Visualization' },
    { name: 'ServiceNow', logo: 'servicenow', category: 'Digital Workflows' },
    { name: 'MongoDB', logo: 'mongodb', category: 'Database' },
    { name: 'Google', logo: 'google', category: 'Cloud & AI' },
    { name: 'AWS', logo: 'aws', category: 'Cloud Computing' },
    { name: 'IBM', logo: 'ibm', category: 'AI & Cloud' },
    { name: 'Qlik', logo: 'qlik', category: 'Analytics' },
    { name: 'Katalon', logo: 'katalon', category: 'Testing' }
  ];

  const governmentPartners = [
    { name: 'Ministry of Education', logo: 'moe', description: 'Supporting educational innovation' },
    { name: 'AICTE', logo: 'aicte', description: 'Technical Education Council' }
  ];

  const professionalPartners = [
    { name: 'SWAYAM Plus', logo: 'swayam', description: 'Online Learning Platform' },
    { name: 'NASSCOM FutureSkills Prime', logo: 'nasscom', description: 'Skill Development' },
    { name: 'NSDC Academy', logo: 'nsdc', description: 'Skill Development Corporation' },
    { name: 'Task Skills University', logo: 'task', description: 'Professional Skills' },
    { name: 'MepHavi', logo: 'mephavi', description: 'Technology Partner' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="partners-section"
    >
      <div className="container">
        <div className="partners-header">
          <h2>Our Ecosystem Partners</h2>
          <p>Collaborating with industry leaders to provide world-class learning experiences</p>
        </div>

        {/* Main Organizers */}
        <div className="main-organizers">
          <h3>Main Organizers & Collaborators</h3>
          <div className="organizer-cards">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="organizer-card primary featured"
            >
              <div className="organizer-logo">
                <img src="/api/placeholder/120/60" alt="TKR College" />
              </div>
              <div className="organizer-info">
                <h4>TKR College of Engineering & Technology</h4>
                <p className="host-badge">🏛️ PROUD HOST INSTITUTION</p>
                <p>Premier Engineering College driving innovation in AI & Technology</p>
                <div className="organizer-stats">
                  <span>🎓 Excellence in Education</span>
                  <span>🚀 Innovation Hub</span>
                  <span>🏆 Industry Partnerships</span>
                </div>
                <div className="host-highlight">
                  <p>Leading the charge in Generative AI education and fostering the next generation of AI innovators</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="organizer-card primary"
            >
              <div className="organizer-logo">
                <img src="/api/placeholder/120/60" alt="SmartBridge" />
              </div>
              <div className="organizer-info">
                <h4>SmartBridge</h4>
                <p>Leading EdTech solutions provider</p>
                <div className="organizer-stats">
                  <span>1.25M+ Students Skilled</span>
                  <span>2.7K+ Colleges</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="organizer-card primary"
            >
              <div className="organizer-logo">
                <img src="/api/placeholder/120/60" alt="IBM SkillsBuild" />
              </div>
              <div className="organizer-info">
                <h4>IBM SkillsBuild</h4>
                <p>AI & Cloud Technology Partner</p>
                <div className="organizer-stats">
                  <span>Global AI Platform</span>
                  <span>Industry Leader</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Industry Partners */}
        <div className="partner-category">
          <h3>Industry Partners</h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="partner-grid industry-partners"
          >
            {industryPartners.map((partner, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="partner-card"
              >
                <div className="partner-logo">
                  <img src={`/api/placeholder/100/50?text=${partner.name}`} alt={partner.name} />
                </div>
                <div className="partner-info">
                  <h4>{partner.name}</h4>
                  <p>{partner.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Government Collaboration */}
        <div className="partner-category">
          <h3>Government Collaboration</h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="partner-grid government-partners"
          >
            {governmentPartners.map((partner, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="partner-card government"
              >
                <div className="partner-logo">
                  <img src={`/api/placeholder/120/60?text=${partner.name}`} alt={partner.name} />
                </div>
                <div className="partner-info">
                  <h4>{partner.name}</h4>
                  <p>{partner.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Professional Partners */}
        <div className="partner-category">
          <h3>Professional Partner Network</h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="partner-grid professional-partners"
          >
            {professionalPartners.map((partner, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="partner-card"
              >
                <div className="partner-logo">
                  <img src={`/api/placeholder/100/50?text=${partner.name}`} alt={partner.name} />
                </div>
                <div className="partner-info">
                  <h4>{partner.name}</h4>
                  <p>{partner.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Partnership Benefits */}
        <div className="partnership-benefits">
          <h3>What Our Partnership Brings</h3>
          <div className="benefits-grid">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🚀</div>
              <h4>Industry Exposure</h4>
              <p>Direct access to latest industry tools and technologies</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🎯</div>
              <h4>Real-world Projects</h4>
              <p>Work on actual industry challenges and problem statements</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🏆</div>
              <h4>Certification & Recognition</h4>
              <p>Globally recognized certifications and skill badges</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="benefit-card"
            >
              <div className="benefit-icon">💼</div>
              <h4>Career Opportunities</h4>
              <p>Internship and job opportunities with partner companies</p>
            </motion.div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info">
          <h3>Partnership & Collaboration</h3>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">Website:</span>
              <span className="contact-value">www.smartinternz.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <span className="contact-value">info@thesmartbridge.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Contact Person:</span>
              <span className="contact-value">Akshay Kumar Kothuri</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <span className="contact-value">+91 9052126814</span>
            </div>
          </div>
          
          <div className="social-links">
            <p>Follow us on:</p>
            <div className="social-buttons">
              <button className="social-btn facebook">Facebook</button>
              <button className="social-btn instagram">Instagram</button>
              <button className="social-btn linkedin">LinkedIn</button>
            </div>
            <p className="social-handle">@SmartInternz</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Partners;
