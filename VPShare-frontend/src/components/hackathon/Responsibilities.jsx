import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Responsibilities = () => {
  const [activeTab, setActiveTab] = useState('smartbridge');

  const responsibilities = {
    smartbridge: {
      title: 'SmartBridge Responsibilities',
      icon: '🏢',
      color: '#2196F3',
      items: [
        'Event Planning & Coordination',
        'Registration Portal Management',
        'SmartBridge Hackathon Platform',
        'Branding & Marketing',
        'Instructor Led Virtual Technical Bootcamps',
        'Mentoring support during Hackathon (In Person)',
        'Reviews and Evaluations',
        'Finalizing Top 10 Teams',
        'E-Certificate Distribution',
        'Internship Opportunities for Top 3 Teams'
      ]
    },
    college: {
      title: 'College Responsibilities',
      icon: '🏫',
      color: '#4CAF50',
      items: [
        'Minimum 500+ Number of Registrations',
        'Labs/Seminar Halls for 2 Days Hackathon',
        'High-Speed Internet Connectivity (10 Mbps Download Speed Minimum)',
        'Projectors & Audio System for Mentoring',
        'Travel, Food & Accommodation for SB Team',
        'Any other Logistic Support during the Hackathon Execution',
        'Faculty & Student Volunteers for Coordination and Support',
        'Nominal Prize Money for top 3 Winning Teams (As per college choice)'
      ]
    },
    student: {
      title: 'Student Responsibilities',
      icon: '🎓',
      color: '#FF9800',
      items: [
        'Must register for the Hackathon',
        'Form a team and enroll for a problem statement',
        'Must register on IBM SkillsBuild & NASSCOM FSP',
        'Must complete the self-learning journey on IBM SkillsBuild through GLE link',
        'Must submit the project files within the set timeline',
        'Active participation in all bootcamp sessions',
        'Regular communication with mentors and team members',
        'Adherence to hackathon rules and code of conduct'
      ]
    }
  };

  const tabVariants = {
    inactive: { opacity: 0.7, scale: 0.95 },
    active: { opacity: 1, scale: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="responsibilities-section">
      <div className="container">
        <div className="responsibilities-header">
          <h2>Roles & Responsibilities</h2>
          <p>Clear guidelines for all stakeholders to ensure successful hackathon execution</p>
        </div>

        <div className="responsibilities-tabs">
          {Object.entries(responsibilities).map(([key, data]) => (
            <motion.button
              key={key}
              variants={tabVariants}
              animate={activeTab === key ? 'active' : 'inactive'}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
              style={{ 
                borderColor: activeTab === key ? data.color : 'transparent',
                backgroundColor: activeTab === key ? `${data.color}10` : 'transparent'
              }}
            >
              <span className="tab-icon">{data.icon}</span>
              <span className="tab-text">{data.title}</span>
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="responsibilities-content"
        >
          <div className="content-header">
            <div 
              className="content-icon"
              style={{ backgroundColor: responsibilities[activeTab].color }}
            >
              {responsibilities[activeTab].icon}
            </div>
            <h3>{responsibilities[activeTab].title}</h3>
          </div>

          <div className="responsibilities-grid">
            {responsibilities[activeTab].items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="responsibility-item"
              >
                <div className="item-number">{index + 1}</div>
                <div className="item-content">
                  <p>{item}</p>
                </div>
                <div 
                  className="item-indicator"
                  style={{ backgroundColor: responsibilities[activeTab].color }}
                ></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Success Factors */}
        <div className="success-factors">
          <h3>Key Success Factors</h3>
          <div className="factors-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="factor-card"
            >
              <div className="factor-icon">🤝</div>
              <h4>Collaboration</h4>
              <p>Strong partnership between all stakeholders ensures smooth execution</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="factor-card"
            >
              <div className="factor-icon">📋</div>
              <h4>Preparation</h4>
              <p>Thorough planning and preparation by all parties is crucial for success</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="factor-card"
            >
              <div className="factor-icon">💪</div>
              <h4>Commitment</h4>
              <p>Dedicated involvement from students, faculty, and organizers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="factor-card"
            >
              <div className="factor-icon">🎯</div>
              <h4>Focus</h4>
              <p>Clear objectives and focused execution towards learning and innovation</p>
            </motion.div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="important-notes">
          <h3>Important Notes</h3>
          <div className="notes-container">
            <div className="note-item warning">
              <div className="note-icon">⚠️</div>
              <div className="note-content">
                <h4>Registration Requirements</h4>
                <p>All participants must complete registration on both IBM SkillsBuild and NASSCOM FSP platforms before the bootcamp begins.</p>
              </div>
            </div>
            <div className="note-item info">
              <div className="note-icon">ℹ️</div>
              <div className="note-content">
                <h4>Infrastructure Requirements</h4>
                <p>Ensure stable internet connectivity and proper technical setup for seamless virtual and in-person sessions.</p>
              </div>
            </div>
            <div className="note-item success">
              <div className="note-icon">✅</div>
              <div className="note-content">
                <h4>Certification & Opportunities</h4>
                <p>Top-performing teams will receive internship opportunities and industry recognition along with certifications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Responsibilities;
