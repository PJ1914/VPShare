import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Bootcamp = () => {
  const [activeDay, setActiveDay] = useState(1);

  const bootcampContent = [
    {
      day: 1,
      title: 'Getting Started with IBM Granite & Prompt-Driven Generation',
      topics: [
        'Introduction to IBM Granite & GenAI Fundamentals',
        'Environment Setup',
        'Basic Prompt-Driven Generation (Demo)'
      ],
      icon: '🚀',
      color: '#4CAF50'
    },
    {
      day: 2,
      title: 'Frontend for GenAI – Streamlit UI',
      topics: [
        'Intro to Streamlit',
        'Building a Simple LLM Chat Interface',
        'Deploying a Basic App'
      ],
      icon: '🎨',
      color: '#2196F3'
    },
    {
      day: 3,
      title: 'Wrapping Models with UI Variants + Shareable Demos',
      topics: [
        'Gradio for GenAI Interfaces',
        'Comparing Streamlit vs Gradio UX',
        'Packaging as Web Demos'
      ],
      icon: '🔧',
      color: '#FF9800'
    },
    {
      day: 4,
      title: 'RAG, Vector DBs & Advanced GenAI Patterns',
      topics: [
        'Introduction to RAG (Retrieval-Augmented Generation)',
        'Embedding & Vector DB Integration',
        'Multimodal & Agentic Patterns (Advanced)'
      ],
      icon: '🧠',
      color: '#9C27B0'
    },
    {
      day: 5,
      title: '24-Hour Hackathon Challenge',
      topics: [
        'Team Formation & Problem Statement Selection',
        'Solution Design & Architecture Planning',
        'Development Sprint with Mentorship',
        'Testing & Performance Optimization',
        'Final Presentation & Demo',
        'Judging & Awards Ceremony'
      ],
      icon: '🏆',
      color: '#E91E63'
    }
  ];

  const hackathonPhases = [
    {
      phase: 'Phase 1',
      title: 'Team Formation & Ideation',
      description: 'Form teams and brainstorm innovative solutions for selected problem statements.'
    },
    {
      phase: 'Phase 2',
      title: 'Solution Architecture',
      description: 'Design the technical architecture and create development roadmap.'
    },
    {
      phase: 'Phase 3',
      title: 'Development Sprint',
      description: 'Build your AI solution with continuous mentorship and guidance.'
    },
    {
      phase: 'Phase 4',
      title: 'Integration & Testing',
      description: 'Integrate components and perform comprehensive testing.'
    },
    {
      phase: 'Phase 5',
      title: 'Final Presentation',
      description: 'Present your solution to judges and demonstrate functionality.'
    },
    {
      phase: 'Phase 6',
      title: 'Evaluation & Awards',
      description: 'Final judging and awards ceremony for winning solutions.'
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
          <h2>4-Day Comprehensive Bootcamp + Hackathon</h2>
          <p>Master Generative AI concepts with hands-on experience using IBM tools, culminating in a 24-hour hackathon challenge</p>
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
                      Teams will have 24 hours to develop innovative AI solutions. Mentors will be available 
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
