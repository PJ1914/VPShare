import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import partner logos
import SmartBridgeLogo from '../../assets/thesmartbridge.png';
import TKRESLogo from '../../assets/TKRES-Logo.jpg';

const Partners = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [partnerModal, setPartnerModal] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const industryPartners = [];

  const governmentPartners = [];

  const professionalPartners = [];

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

  const categories = [
    { id: 'all', name: 'Main Organizers', icon: '�' }
  ];

  const getFilteredPartners = () => {
    return []; // No additional partners to show
  };

  const openPartnerModal = (partner) => {
    setPartnerModal(partner);
  };

  const closePartnerModal = () => {
    setPartnerModal(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="partners-section"
    >
      <div className="container">
        <motion.div 
          className="partners-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Our Organizers</h2>
          <p>Driving innovation in AI education and hackathon excellence</p>
          
          {/* Interactive Filter Buttons */}
          <div className="partner-filters">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="filter-icon">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Stats Counter */}
          <motion.div 
            className="partner-stats"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Main Organizers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">Host Institution</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">EdTech Partner</span>
            </div>
          </motion.div>
        </motion.div>

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
                <img src={TKRESLogo} alt="TKR College" />
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
                <img src={SmartBridgeLogo} alt="SmartBridge" />
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
          </div>
        </div>

        {/* Dynamic Partner Grid with Filtering - Hidden since no additional partners */}
        <div style={{ display: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              className="dynamic-partner-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`partner-grid ${selectedCategory === 'all' ? 'mixed-grid' : `${selectedCategory}-partners`}`}
              >
                {getFilteredPartners().map((partner, index) => (
                  <motion.div
                    key={`${selectedCategory}-${index}`}
                    variants={itemVariants}
                    className={`partner-card interactive ${partner.category ? 'industry' : partner.initiatives ? 'government' : 'professional'}`}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      y: -5
                    }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredPartner(index)}
                    onHoverEnd={() => setHoveredPartner(null)}
                    onClick={() => openPartnerModal(partner)}
                    layout
                  >
                    <div className="partner-logo">
                      <motion.img 
                        src={partner.logo} 
                        alt={partner.name}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      />
                      {hoveredPartner === index && (
                        <motion.div
                          className="hover-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="view-details">👁️ View Details</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="partner-info">
                      <h4>{partner.name}</h4>
                      <p>{partner.category || partner.description}</p>
                      
                      {/* Industry Partner Technologies */}
                      {partner.technologies && (
                        <div className="tech-tags">
                          {partner.technologies.slice(0, 2).map((tech, techIndex) => (
                            <span key={techIndex} className="tech-tag">{tech}</span>
                          ))}
                          {partner.technologies.length > 2 && (
                            <span className="tech-tag more">+{partner.technologies.length - 2}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Professional Partner Stats */}
                      {partner.courses && (
                        <div className="partner-stats-mini">
                          <span className="stat">📚 {partner.courses}+ Courses</span>
                          <span className="stat">👥 {partner.learners} Learners</span>
                        </div>
                      )}
                      
                      {/* Government Partner Initiatives */}
                      {partner.initiatives && (
                        <div className="initiatives">
                          {partner.initiatives.slice(0, 1).map((initiative, initIndex) => (
                            <span key={initIndex} className="initiative-tag">{initiative}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Interactive Elements */}
                    <div className="card-actions">
                      <motion.button
                        className="learn-more-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPartnerModal(partner);
                        }}
                      >
                        Learn More
                      </motion.button>
                      {partner.website && (
                        <motion.a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="visit-website-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          🌐 Visit
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Partnership Benefits */}
        <div className="partnership-benefits">
          <h3>What Our Organizers Bring</h3>
          <div className="benefits-grid">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🎓</div>
              <h4>Academic Excellence</h4>
              <p>Premier engineering education and innovation support</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🚀</div>
              <h4>EdTech Platform</h4>
              <p>Advanced learning platform with 1.25M+ skilled students</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="benefit-card"
            >
              <div className="benefit-icon">🏆</div>
              <h4>Certification & Recognition</h4>
              <p>Industry-recognized certifications and skill validation</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="benefit-card"
            >
              <div className="benefit-icon">💼</div>
              <h4>Career Development</h4>
              <p>Pathways to internships and placement opportunities</p>
            </motion.div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info">
          <h3>Organizer Contact & Information</h3>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">Host Institution:</span>
              <span className="contact-value">TKR College of Engineering & Technology</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">EdTech Partner:</span>
              <span className="contact-value">SmartBridge</span>
            </div>
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
        </div>

        {/* Interactive Partner Modal */}
        <AnimatePresence>
          {partnerModal && (
            <motion.div
              className="partner-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePartnerModal}
            >
              <motion.div
                className="partner-modal"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div className="modal-logo">
                    <img src={partnerModal.logo} alt={partnerModal.name} />
                  </div>
                  <div className="modal-title">
                    <h3>{partnerModal.name}</h3>
                    <p>{partnerModal.category || partnerModal.description}</p>
                  </div>
                  <button className="close-modal" onClick={closePartnerModal}>✕</button>
                </div>
                
                <div className="modal-content">
                  {partnerModal.description && (
                    <div className="modal-section">
                      <h4>About</h4>
                      <p>{partnerModal.description}</p>
                    </div>
                  )}
                  
                  {partnerModal.technologies && (
                    <div className="modal-section">
                      <h4>Technologies & Expertise</h4>
                      <div className="tech-grid">
                        {partnerModal.technologies.map((tech, index) => (
                          <span key={index} className="tech-badge">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {partnerModal.initiatives && (
                    <div className="modal-section">
                      <h4>Key Initiatives</h4>
                      <div className="initiatives-grid">
                        {partnerModal.initiatives.map((initiative, index) => (
                          <span key={index} className="initiative-badge">{initiative}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(partnerModal.courses || partnerModal.learners) && (
                    <div className="modal-section">
                      <h4>Platform Statistics</h4>
                      <div className="stats-grid">
                        {partnerModal.courses && (
                          <div className="stat-box">
                            <span className="stat-number">{partnerModal.courses}+</span>
                            <span className="stat-label">Courses Available</span>
                          </div>
                        )}
                        {partnerModal.learners && (
                          <div className="stat-box">
                            <span className="stat-number">{partnerModal.learners}</span>
                            <span className="stat-label">Active Learners</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  {partnerModal.website && (
                    <motion.a
                      href={partnerModal.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-btn primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🌐 Visit Website
                    </motion.a>
                  )}
                  <motion.button
                    className="modal-btn secondary"
                    onClick={closePartnerModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Partners;
