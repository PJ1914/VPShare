import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/CodeKurukshetra.css';

const HackathonHistory = () => {
  const [selectedEvent, setSelectedEvent] = useState('cognitiveX');

  const pastHackathons = {
    cognitiveX: {
      name: 'CognitiveX',
      subtitle: 'AI Innovation Challenge',
      year: '2024',
      participants: '1500+',
      description: 'CognitiveX was our flagship AI hackathon that brought together over 1500 brilliant minds to explore the frontiers of artificial intelligence and machine learning.',
      highlights: [
        'Over 1500+ passionate developers and innovators',
        '48-hour intensive coding marathon',
        'IBM Granite AI models integration',
        'Industry expert mentorship',
        'Real-world problem solving',
        'Prestigious awards and recognition'
      ],
      technologies: ['IBM Granite', 'Python', 'Streamlit', 'Gradio', 'Vector DBs', 'RAG'],
      winners: [
        {
          position: '1st Place',
          team: 'AI Innovators',
          project: 'Healthcare Diagnostic Assistant',
          prize: '₹50,000'
        },
        {
          position: '2nd Place', 
          team: 'Code Warriors',
          project: 'Smart Education Platform',
          prize: '₹30,000'
        },
        {
          position: '3rd Place',
          team: 'Tech Titans',
          project: 'Environmental Monitoring System',
          prize: '₹20,000'
        }
      ],
      stats: [
        { label: 'Participants', value: '1500+' },
        { label: 'Teams', value: '300+' },
        { label: 'Projects', value: '150+' },
        { label: 'Mentors', value: '25+' },
        { label: 'Hours', value: '48' },
        { label: 'Prize Pool', value: '₹2,00,000' }
      ]
    }
  };

  const currentEvent = pastHackathons[selectedEvent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hackathon-history-section"
    >
      <div className="container">
        <div className="history-header">
          <h2>Hackathon Legacy</h2>
          <p>Celebrating our journey of innovation and the brilliant minds who made it possible</p>
        </div>

        <div className="event-selector">
          {Object.keys(pastHackathons).map((eventKey) => (
            <button
              key={eventKey}
              className={`event-btn ${selectedEvent === eventKey ? 'active' : ''}`}
              onClick={() => setSelectedEvent(eventKey)}
            >
              {pastHackathons[eventKey].name}
            </button>
          ))}
        </div>

        <motion.div
          key={selectedEvent}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="event-details"
        >
          <div className="event-hero">
            <div className="event-title">
              <h3>{currentEvent.name}</h3>
              <span className="event-subtitle">{currentEvent.subtitle}</span>
              <span className="event-year">{currentEvent.year}</span>
            </div>
            <div className="participant-count">
              <span className="count">{currentEvent.participants}</span>
              <span className="label">Participants</span>
            </div>
          </div>

          <div className="event-description">
            <p>{currentEvent.description}</p>
          </div>

          <div className="event-stats">
            <h4>Event Statistics</h4>
            <div className="stats-grid">
              {currentEvent.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="stat-card"
                >
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="event-highlights">
            <h4>Key Highlights</h4>
            <div className="highlights-grid">
              {currentEvent.highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="highlight-item"
                >
                  <span className="highlight-icon">✨</span>
                  <span className="highlight-text">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="technologies-used">
            <h4>Technologies Explored</h4>
            <div className="tech-tags">
              {currentEvent.technologies.map((tech, index) => (
                <span key={index} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="winners-section">
            <h4>Champions & Winners</h4>
            <div className="winners-grid">
              {currentEvent.winners.map((winner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="winner-card"
                >
                  <div className="winner-position">{winner.position}</div>
                  <h5>{winner.team}</h5>
                  <p>{winner.project}</p>
                  <div className="winner-prize">{winner.prize}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="testimonials">
            <h4>Participant Voices</h4>
            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>"CognitiveX was an incredible experience! The mentorship and learning opportunities were unparalleled."</p>
                <span className="testimonial-author">- Participant from CognitiveX</span>
              </div>
              <div className="testimonial-card">
                <p>"The 48-hour challenge pushed our limits and helped us create something truly innovative."</p>
                <span className="testimonial-author">- Winning Team Member</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HackathonHistory;
