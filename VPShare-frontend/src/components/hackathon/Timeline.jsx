import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const Timeline = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const timelineEvents = [
    {
      day: 'Day -7',
      title: 'Registration Starts',
      description: 'Registration opens for Event and Hackathon',
      duration: '7 days',
      icon: '📝',
      color: '#4CAF50'
    },
    {
      day: 'Day 0',
      title: 'Registration Ends',
      description: 'Last day to register for Event and Hackathon',
      icon: '⏰',
      color: '#FF9800'
    },
    {
      day: 'Day 1',
      title: 'Bootcamp Starts',
      description: 'Begin your journey with IBM Granite & GenAI Fundamentals',
      duration: '4 days',
      icon: '🚀',
      color: '#2196F3'
    },
    {
      day: 'Day 4',
      title: 'Bootcamp Ends',
      description: 'Complete advanced GenAI patterns and RAG implementation',
      icon: '🎓',
      color: '#2196F3'
    },
    {
      day: 'Day 5',
      title: '24-Hour Hackathon Challenge',
      description: 'Team formation, development sprint, and final presentations',
      duration: '24 hours',
      icon: '🏆',
      color: '#E91E63'
    },
    {
      day: 'Day 6',
      title: 'Results & Awards',
      description: 'Final judging, results announcement, and awards ceremony',
      icon: '🏅',
      color: '#FFD700'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="timeline-section"
    >
      <div className="container">
        <div className="timeline-header">
          <h2>Hackathon Timeline</h2>
          <p>A comprehensive journey from registration to winner announcement</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <div className="timeline-content">
                <div className="timeline-icon" style={{ backgroundColor: event.color }}>
                  <span>{event.icon}</span>
                </div>
                
                <div className="timeline-card">
                  <div className="timeline-day" style={{ color: event.color }}>
                    {event.day}
                  </div>
                  <h3 className="timeline-title">{event.title}</h3>
                  <p className="timeline-description">{event.description}</p>
                  {event.duration && (
                    <div className="timeline-duration">
                      Duration: {event.duration}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="timeline-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Duration</h3>
              <div className="summary-value">14 Days</div>
              <p>From registration to results</p>
            </div>
            <div className="summary-card">
              <h3>Bootcamp</h3>
              <div className="summary-value">4 Days</div>
              <p>Intensive learning program</p>
            </div>
            <div className="summary-card">
              <h3>Development</h3>
              <div className="summary-value">24 Hours</div>
              <p>Hackathon coding period</p>
            </div>
            <div className="summary-card">
              <h3>Team Size</h3>
              <div className="summary-value">1-4</div>
              <p>Members per team</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Timeline;
