import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Bootcamp = () => {
  const [activeDay, setActiveDay] = useState(1);

  const bootcampContent = [
    {
      day: 1,
      title: 'Kurukshetra Chronicles: Introduction to AI Warfare',
      topics: [
        'The Epic of AI: Understanding Modern Artificial Intelligence',
        'Setting up Your Digital Arsenal (Environment & Tools)',
        'First Battle: Basic AI Model Integration',
        'Warriors Assembly: Team Formation Strategies'
      ],
      icon: '⚔️',
      color: '#D2691E'
    },
    {
      day: 2,
      title: 'Dharma of Code: Building Ethical AI Solutions',
      topics: [
        'Principles of Responsible AI Development',
        'Frontend Battlefield: React & Modern UI Frameworks',
        'Creating Intuitive AI Interfaces',
        'User Experience in AI Applications'
      ],
      icon: '�️',
      color: '#8B4513'
    },
    {
      day: 3,
      title: 'Weapons of Mass Innovation: Advanced AI Techniques',
      topics: [
        'Machine Learning Models & Deep Learning',
        'Natural Language Processing Mastery',
        'Computer Vision & Image Processing',
        'Integration Strategies for Multi-modal AI'
      ],
      icon: '�️',
      color: '#B8860B'
    },
    {
      day: 4,
      title: 'Strategizing Victory: AI Architecture & Deployment',
      topics: [
        'Scalable AI System Architecture',
        'Cloud Integration & Deployment Strategies',
        'Performance Optimization Techniques',
        'Real-world Problem Analysis'
      ],
      icon: '🏹',
      color: '#CD853F'
    },
    {
      day: 5,
      title: 'The Great War: 48-Hour CodeKurukshetra Battle',
      topics: [
        'Battle Begins: Problem Statement Revelation',
        'Forming Your Warrior Alliance (Team Strategy)',
        'Day 1: Architecture Planning & Initial Development',
        'Night Guard: Continuous Development & Testing',
        'Day 2: Final Sprint & Solution Refinement',
        'Victory Presentation: Demo to the Council of Judges'
      ],
      icon: '👑',
      color: '#A0522D'
    }
  ];

  const hackathonPhases = [
    {
      phase: 'Phase 1',
      title: 'The Call to Arms: Registration & Team Assembly',
      description: 'Warriors register for battle and form strategic alliances with fellow innovators.'
    },
    {
      phase: 'Phase 2', 
      title: 'War Council: Strategy & Architecture Planning',
      description: 'Teams analyze the battlefield, plan their approach, and design their solution architecture.'
    },
    {
      phase: 'Phase 3',
      title: 'First Day of Battle: Development Sprint',
      description: 'The coding war begins! Teams start building their innovative solutions with mentor guidance.'
    },
    {
      phase: 'Phase 4',
      title: 'Night Watch: Continuous Development',
      description: 'The battle continues through the night with testing, integration, and refinement.'
    },
    {
      phase: 'Phase 5',
      title: 'Final Assault: Solution Completion',
      description: 'Last sprint to complete, test, and polish the final solution for presentation.'
    },
    {
      phase: 'Phase 6',
      title: 'Victory Ceremony: Presentation & Judgment',
      description: 'Teams present their solutions to the council of judges for final evaluation and awards.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bootcamp-section"
    >
      <div className="container">
        <div className="bootcamp-header">
          <h2>CodeKurukshetra: The Ultimate AI Battle</h2>
          <p>Inspired by the epic Mahabharata, embark on a 4-day journey of learning and a 48-hour hackathon battle to create revolutionary AI solutions</p>
        </div>

        <div className="bootcamp-nav">
          {bootcampContent.map((day) => (
            <button
              key={day.day}
              className={`day-btn ${activeDay === day.day ? 'active' : ''}`}
              onClick={() => setActiveDay(day.day)}
              style={{ 
                borderColor: activeDay === day.day ? day.color : 'transparent',
                color: activeDay === day.day ? day.color : '#666'
              }}
              aria-label={`View Day ${day.day} content`}
            >
              <span className="day-icon">{day.icon}</span>
              <span className="day-text">Day {day.day}</span>
            </button>
          ))}
        </div>

        <div className="bootcamp-content">
          {bootcampContent.map((day) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: activeDay === day.day ? 1 : 0,
                x: activeDay === day.day ? 0 : 20,
                display: activeDay === day.day ? 'block' : 'none'
              }}
              className="day-content"
            >
              <div className="day-header">
                <div className="day-icon-large" style={{ backgroundColor: day.color }}>
                  {day.icon}
                </div>
                <div className="day-info">
                  <h3>Day {day.day}</h3>
                  <h4>{day.title}</h4>
                </div>
              </div>

              <div className="day-topics">
                <h5>Topics Covered:</h5>
                <ul>
                  {day.topics.map((topic, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {topic}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {day.day === 5 && (
                <div className="hackathon-phases">
                  <h5>24-Hour Hackathon Process:</h5>
                  <div className="phases-grid">
                    {hackathonPhases.map((phase, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="phase-card"
                      >
                        <div className="phase-number">{phase.phase}</div>
                        <h6>{phase.title}</h6>
                        <p>{phase.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="hackathon-requirements">
                    <h6>Hackathon Guidelines:</h6>
                    <p>
                      Teams will have College hours to develop innovative AI solutions. Mentors will be available 
                      throughout the hackathon to provide guidance. All submissions must be completed within 
                      the designated time frame for judging consideration.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bootcamp-features">
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Hands-on Learning</h4>
              <p>Practical experience with IBM Cloud Services and Granite AI models</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>Expert Mentors</h4>
              <p>Learn from industry experts and IBM certified instructors</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4>Certification</h4>
              <p>Earn badges on IBM SkillsBuild platform upon completion</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h4>Real Projects</h4>
              <p>Work on industry-relevant AI projects and use cases</p>
            </div>
          </div>
        </div>

        <div className="bootcamp-requirements">
          <h3>What You'll Need</h3>
          <div className="requirements-grid">
            <div className="requirement">
              <span className="req-icon">💻</span>
              <span>Laptop with internet connection</span>
            </div>
            <div className="requirement">
              <span className="req-icon">🔧</span>
              <span>Basic programming knowledge (Python preferred)</span>
            </div>
            <div className="requirement">
              <span className="req-icon">📚</span>
              <span>IBM SkillsBuild account registration</span>
            </div>
            <div className="requirement">
              <span className="req-icon">🎯</span>
              <span>Enthusiasm to learn AI technologies</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Bootcamp;
