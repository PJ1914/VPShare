import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/CodeKurukshetra.css';

const CodeKurukshetra = () => {
  const [activePhase, setActivePhase] = useState(1);

  const hackathonTimeline = [
    {
      phase: 1,
      title: 'Day 1: The Battle Begins',
      time: 'September 20, 2025 - 10:00 AM',
      duration: '24 Hours',
      activities: [
        'Opening Ceremony & Problem Statement Revelation',
        'Team Formation & Strategic Planning (2-4 members)',
        'Initial Development Sprint Begins',
        'Mentor Check-ins & Technical Support',
        'Evening Progress Review',
        'Midnight Development Marathon'
      ],
      icon: '⚔️',
      color: '#7B241C'
    },
    {
      phase: 2,
      title: 'Day 2: The Final Assault',
      time: 'Day 2 - 10:00 AM',
      duration: '24 Hours',
      activities: [
        'Morning Stand-up & Progress Assessment',
        'Feature Implementation & Bug Fixes',
        'Testing & Performance Optimization',
        'Final Code Review & Documentation',
        'Presentation Preparation',
        'Final Submission & Demo Presentations'
      ],
      icon: '🏆',
      color: '#FF8C00'
    }
  ];

  const battlePhases = [
    {
      phase: 'Registration',
      title: 'Assembling Your Army',
      description: 'Form teams of 1-4 warriors. Registration fee ₹250 per person.',
      timeframe: 'Before Event'
    },
    {
      phase: 'Opening',
      title: 'The War Horn Sounds',
      description: 'Problem statements revealed. Choose your battlefield and begin strategizing.',
      timeframe: 'Day 1 - 10:00 AM'
    },
    {
      phase: 'Development',
      title: 'The Coding War',
      description: '48 hours of intense development with continuous mentor support.',
      timeframe: '48 Hours'
    },
    {
      phase: 'Submission',
      title: 'Present Your Weapons',
      description: 'Demo your solution to the council of judges.',
      timeframe: 'Day 2 - 6:00 PM'
    },
    {
      phase: 'Victory',
      title: 'Crown the Champions',
      description: 'Awards ceremony and recognition of the victorious teams.',
      timeframe: 'Day 2 - 8:00 PM'
    }
  ];

  const prizes = [
    {
      position: '1st Place',
      amount: '₹1,00,000',
      icon: '👑',
      color: '#FFD700'
    },
    {
      position: '2nd Place',
      amount: '₹75,000',
      icon: '🥈',
      color: '#C0C0C0'
    },
    {
      position: '3rd Place',
      amount: '₹50,000',
      icon: '🥉',
      color: '#CD7F32'
    },
    {
      position: 'Special Categories',
      amount: '₹25,000 each',
      icon: '🏅',
      color: '#4CAF50'
    }
  ];

  const tracks = [
    {
      name: 'AI & Machine Learning',
      description: 'Build intelligent solutions using AI/ML technologies',
      icon: '🤖',
      color: '#FF6B6B'
    },
    {
      name: 'Web & Mobile Development',
      description: 'Create innovative web and mobile applications',
      icon: '💻',
      color: '#4ECDC4'
    },
    {
      name: 'Blockchain & Web3',
      description: 'Develop decentralized applications and solutions',
      icon: '⛓️',
      color: '#45B7D1'
    },
    {
      name: 'IoT & Hardware',
      description: 'Build Internet of Things and hardware solutions',
      icon: '🔧',
      color: '#96CEB4'
    },
    {
      name: 'Social Impact',
      description: 'Create solutions for social good and community impact',
      icon: '🌍',
      color: '#FFEAA7'
    },
    {
      name: 'Open Innovation',
      description: 'Build anything innovative that doesn\'t fit other categories',
      icon: '💡',
      color: '#DDA0DD'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="codekurukshetra-section"
    >
      <div className="container">
        {/* Hero Section */}
        <div className="hackathon-hero">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title"
          >
            CodeKurukshetra
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-subtitle"
          >
            Battle of Ideas — Code the Dharma
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hero-details"
          >
            <span className="detail-item">48 Hours</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">September 20-21, 2025</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">Teams Only</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">₹250/person</span>
          </motion.div>
        </div>

        {/* About Section */}
        <div className="about-section">
          <h2>The Epic Battle Awaits</h2>
          <p>
            Inspired by the great epic Mahabharata, CodeKurukshetra is where modern-day warriors 
            battle with code instead of weapons. Join this 48-hour intensive hackathon where teams 
            of 2-4 developers fight to create the most innovative solutions and claim victory.
          </p>
          <div className="legacy-mention">
            <h3>Building on Our Legacy</h3>
            <p>
              Following the tremendous success of <strong>CognitiveX</strong> with over <strong>1500+ participants</strong>, 
              CodeKurukshetra aims to take innovation to the next level with focused team battles and 
              industry-relevant problem statements.
            </p>
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="timeline-nav">
          <h2>48-Hour Battle Timeline</h2>
          <div className="phase-buttons">
            {hackathonTimeline.map((day) => (
              <button
                key={day.phase}
                className={`phase-btn ${activePhase === day.phase ? 'active' : ''}`}
                onClick={() => setActivePhase(day.phase)}
                style={{ 
                  borderColor: activePhase === day.phase ? day.color : 'transparent',
                  color: activePhase === day.phase ? day.color : '#666'
                }}
              >
                <span className="phase-icon">{day.icon}</span>
                <span className="phase-text">Day {day.phase}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="timeline-content">
          {hackathonTimeline.map((day) => (
            <motion.div
              key={day.phase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: activePhase === day.phase ? 1 : 0,
                x: activePhase === day.phase ? 0 : 20,
                display: activePhase === day.phase ? 'block' : 'none'
              }}
              className="day-content"
            >
              <div className="day-header">
                <div className="day-icon-large" style={{ backgroundColor: day.color }}>
                  {day.icon}
                </div>
                <div className="day-info">
                  <h3>{day.title}</h3>
                  <p className="day-time">{day.time}</p>
                  <span className="day-duration">{day.duration}</span>
                </div>
              </div>

              <div className="day-activities">
                <h5>Battle Activities:</h5>
                <ul>
                  {day.activities.map((activity, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {activity}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Battle Phases */}
        <div className="battle-phases">
          <h2>Battle Phases</h2>
          <div className="phases-grid">
            {battlePhases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="phase-card"
              >
                <div className="phase-header">
                  <h4>{phase.phase}</h4>
                  <span className="phase-time">{phase.timeframe}</span>
                </div>
                <h5>{phase.title}</h5>
                <p>{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        <div className="tracks-section">
          <h2>Choose Your Battlefield</h2>
          <div className="tracks-grid">
            {tracks.map((track, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="track-card"
                style={{ borderColor: track.color }}
              >
                <div className="track-icon" style={{ backgroundColor: track.color }}>
                  {track.icon}
                </div>
                <h4>{track.name}</h4>
                <p>{track.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Prizes */}
        <div className="prizes-section">
          <h2>Victory Rewards</h2>
          <div className="prizes-grid">
            {prizes.map((prize, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="prize-card"
              >
                <div className="prize-icon" style={{ color: prize.color }}>
                  {prize.icon}
                </div>
                <h4>{prize.position}</h4>
                <div className="prize-amount">{prize.amount}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="requirements-section">
          <h2>Warrior Requirements</h2>
          <div className="requirements-grid">
            <div className="requirement">
              <span className="req-icon">👥</span>
              <span>Team of 2-4 members (No individual entries)</span>
            </div>
            <div className="requirement">
              <span className="req-icon">💻</span>
              <span>Laptop with development environment</span>
            </div>
            <div className="requirement">
              <span className="req-icon">🌐</span>
              <span>Stable internet connection</span>
            </div>
            <div className="requirement">
              <span className="req-icon">🎯</span>
              <span>Programming skills in any language</span>
            </div>
            <div className="requirement">
              <span className="req-icon">💰</span>
              <span>Registration fee: ₹250 per person</span>
            </div>
            <div className="requirement">
              <span className="req-icon">🏫</span>
              <span>Valid student ID (for student category)</span>
            </div>
          </div>
        </div>

        {/* Registration CTA */}
        <div className="registration-cta">
          <h2>Ready for Battle?</h2>
          <p>Assemble your team and register for CodeKurukshetra</p>
          <div className="cta-buttons">
            <button className="cta-btn primary">
              Register Team - ₹250/person
            </button>
            <button className="cta-btn secondary">
              View Rules & Guidelines
            </button>
          </div>
          <p className="registration-note">
            Limited seats available. Early bird registrations get exclusive perks!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CodeKurukshetra;
