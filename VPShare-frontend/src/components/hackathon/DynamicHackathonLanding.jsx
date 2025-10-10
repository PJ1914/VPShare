import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHackathon } from '../../contexts/HackathonContext';
// Icon imports
import { Rocket, Code, Users, Brain, Lightbulb, Star, Award, Clock, MapPin, Calendar, Target, Zap, Shield } from 'lucide-react';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { FaCode, FaLaptopCode, FaAws, FaGithub, FaMicrosoft, FaGoogle, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiReact, SiNodedotjs, SiPython, SiJavascript, SiMongodb } from 'react-icons/si';
import '../../styles/DynamicHackathon.css';

const DynamicHackathonLanding = ({ onNavigateToRegistration, onNavigateToDashboard }) => {
  // Add error boundary for context
  let currentHackathon = null;
  try {
    const hackathonContext = useHackathon();
    currentHackathon = hackathonContext?.currentHackathon;
  } catch (error) {
    console.error('HackathonContext error in DynamicHackathonLanding:', error);
    // Fallback - context might not be available yet
  }
  
  const [activePhase, setActivePhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!currentHackathon) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(currentHackathon.startDate).getTime();
      const distance = startTime - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ expired: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentHackathon]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!currentHackathon?.problemStatements || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentCardIndex(prev => 
        prev >= currentHackathon.problemStatements.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Increased delay to 5 seconds

    return () => clearInterval(interval);
  }, [currentHackathon?.problemStatements, isModalOpen]);

  if (!currentHackathon) {
    return (
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Code size={48} />
        </motion.div>
        <p>Loading hackathon data...</p>
      </div>
    );
  }

  return (
    <div className="dynamic-hackathon-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              <span className="sanskrit">{currentHackathon.sanskrit}</span>
              <span className="english">{currentHackathon.name}</span>
            </h1>
            <p className="hero-subtitle">{currentHackathon.subtitle}</p>
            
            {/* Event Date Banner */}
            <motion.div 
              className="event-date-banner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="date-content">
                <span className="date-text">October 25-26, 2025</span>
                <span className="venue-text">Virtual & Hybrid Event</span>
              </div>
            </motion.div>
            
            <p className="hero-description">{currentHackathon.description}</p>
            
            {/* GitHub Partnership Badge */}
            <motion.div 
              className="github-partnership-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="partnership-content">
                <FaGithub className="github-icon" />
                <span className="partnership-text">Official GitHub Partnership</span>
              </div>
            </motion.div>
            
            {/* Countdown Timer */}
            <div className="countdown-timer">
              {timeLeft.expired ? (
                <div className="timer-expired">Battle in Progress!</div>
              ) : (
                <div className="timer-grid">
                  <div className="timer-item">
                    <span className="timer-number">{timeLeft.days || 0}</span>
                    <span className="timer-label">Days</span>
                  </div>
                  <div className="timer-item">
                    <span className="timer-number">{timeLeft.hours || 0}</span>
                    <span className="timer-label">Hours</span>
                  </div>
                  <div className="timer-item">
                    <span className="timer-number">{timeLeft.minutes || 0}</span>
                    <span className="timer-label">Minutes</span>
                  </div>
                  <div className="timer-item">
                    <span className="timer-number">{timeLeft.seconds || 0}</span>
                    <span className="timer-label">Seconds</span>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="hero-actions">
              <motion.button
                className="cta-button primary"
                onClick={onNavigateToRegistration}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join the Battle
              </motion.button>
              <motion.button
                className="cta-button secondary"
                onClick={onNavigateToDashboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Dashboard
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Statements */}
      <section className="problem-statements-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Choose Your Challenge</h2>
            <p>Select from 10 cutting-edge problem statements across multiple domains</p>
          </motion.div>

          <div className="carousel-container">
            {/* Mobile-friendly horizontal scroll */}
            <div className="carousel-scroll-wrapper">
              <div className="carousel-track">
                {currentHackathon.problemStatements.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    className="carousel-card"
                    style={{ background: problem.color }}
                    initial={{ 
                      opacity: 0, 
                      y: 50,
                      scale: 0.9
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -8,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      y: -4,
                      transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    onClick={() => {
                      setSelectedProblem(problem);
                      setIsModalOpen(true);
                    }}
                  >
                    <motion.div 
                      className="problem-header"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    >
                      <motion.div 
                        className="problem-number"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        #{problem.id}
                      </motion.div>
                      <motion.div 
                        className="difficulty-rating"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {Array.from({ length: problem.difficulty }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              delay: index * 0.1 + 0.3 + (i * 0.1), 
                              duration: 0.3,
                              type: "spring",
                              stiffness: 300
                            }}
                          >
                            <Star size={14} fill="currentColor" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                    
                    <motion.h3 
                      className="problem-title"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                    >
                      {problem.title}
                    </motion.h3>
                    <motion.p 
                      className="problem-category"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.4 }}
                    >
                      {problem.category}
                    </motion.p>
                    
                    <div className="problem-content">
                      <motion.div 
                        className="problem-description"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                      >
                        <h4>Problem:</h4>
                        <p>{problem.problem.substring(0, 70)}...</p>
                      </motion.div>
                      
                      <motion.div 
                        className="tech-stack"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.6, duration: 0.4 }}
                      >
                        <h4>Tech Stack:</h4>
                        <div className="tech-tags">
                          {problem.techStack.slice(0, 2).map((tech, techIndex) => (
                            <motion.span 
                              key={techIndex} 
                              className="tech-tag"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ 
                                delay: index * 0.1 + 0.7 + (techIndex * 0.1), 
                                duration: 0.3,
                                ease: [0.25, 0.46, 0.45, 0.94]
                              }}
                              whileHover={{ 
                                scale: 1.1,
                                transition: { duration: 0.2 }
                              }}
                            >
                              {tech}
                            </motion.span>
                          ))}
                          {problem.techStack.length > 2 && (
                            <motion.span 
                              className="tech-tag more-tech"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ 
                                delay: index * 0.1 + 0.9, 
                                duration: 0.3 
                              }}
                              whileHover={{ 
                                scale: 1.1,
                                transition: { duration: 0.2 }
                              }}
                            >
                              +{problem.techStack.length - 2}
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="tap-to-expand"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.8, duration: 0.4 }}
                        whileHover={{ 
                          y: -3,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <span>Tap to explore →</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Scroll hint for mobile */}
            <motion.div 
              className="scroll-hint"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <span>← Swipe to explore more challenges →</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Battle Timeline</h2>
            <p>The journey from warrior to legend</p>
          </motion.div>

          <div className="timeline-container">
            {currentHackathon.timeline.map((phase, index) => (
              <motion.div
                key={index}
                className={`timeline-item ${index % 2 === 0 ? 'timeline-left' : 'timeline-right'} ${index === activePhase ? 'active' : ''}`}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 0 ? -80 : 80,
                  y: 20
                }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
                onClick={() => setActivePhase(index)}
              >
                <div className="timeline-content">
                  <motion.h3 
                    className="timeline-phase"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                  >
                    {phase.phase}
                  </motion.h3>
                  <motion.h4 
                    className="timeline-title"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                  >
                    {phase.title}
                  </motion.h4>
                  <motion.p 
                    className="timeline-description"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
                  >
                    {phase.description}
                  </motion.p>
                  <motion.span 
                    className="timeline-time"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                  >
                    {phase.time}
                  </motion.span>
                </div>
                <motion.div 
                  className="timeline-marker"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.15 + 0.1, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                  }}
                >
                  <span className="timeline-icon">{phase.icon}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="prizes-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Glory Awaits the Victorious</h2>
            <p>Claim your rightful rewards</p>
          </motion.div>

          <div className="prizes-grid">
            {currentHackathon.prizes.map((prize, index) => (
              <motion.div
                key={index}
                className={`prize-card rank-${prize.rank}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="prize-icon">{prize.icon}</div>
                <h3 className="prize-rank">{prize.sanskrit}</h3>
                <h4 className="prize-title">{prize.title}</h4>
                <div className="prize-amount">₹{prize.amount.toLocaleString()}</div>
                <p className="prize-description">{prize.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statements Summary */}
      <section className="summary-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Problem Statements Summary</h2>
            <p>Quick overview of all available challenges</p>
          </motion.div>

          <div className="summary-table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Problem Statement</th>
                  <th>Category</th>
                  <th>Tech Stack</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {currentHackathon.problemStatements.map((problem) => (
                  <tr key={problem.id}>
                    <td>{problem.id}</td>
                    <td className="problem-title-cell">{problem.title}</td>
                    <td className="category-cell">{problem.category}</td>
                    <td className="tech-stack-cell">
                      <div className="mini-tech-tags">
                        {problem.techStack.slice(0, 3).map((tech, index) => (
                          <span key={index} className="mini-tech-tag">{tech}</span>
                        ))}
                        {problem.techStack.length > 3 && (
                          <span className="more-tech">+{problem.techStack.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="difficulty-cell">
                      {Array.from({ length: problem.difficulty }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* GitHub Partnership Section */}
      <section className="github-partnership-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>GitHub Partnership</h2>
            <p>Empowered by GitHub's developer platform</p>
          </motion.div>

          <div className="github-partnership-grid">
            <motion.div
              className="github-feature-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FaGithub className="github-feature-icon" />
              <h3>GitHub Student Pack</h3>
              <p>Access to GitHub Student Developer Pack with Pro features until graduation</p>
            </motion.div>

            <motion.div
              className="github-feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FaCode className="github-feature-icon" />
              <h3>GitHub Copilot</h3>
              <p>Free GitHub Copilot access for students with AI-powered coding assistance and productivity tools</p>
            </motion.div>

            <motion.div
              className="github-feature-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <FaLaptopCode className="github-feature-icon" />
              <h3>Codespaces & More</h3>
              <p>GitHub Codespaces, Actions, and 100+ developer tools included in the Student Pack</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rules & Judging */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <motion.div
              className="info-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3>Battle Rules</h3>
              <ul>
                {currentHackathon.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="info-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3>Judging Criteria</h3>
              <ul>
                {currentHackathon.judging.map((criteria, index) => (
                  <li key={index}>
                    <span className="criteria-name">{criteria.criteria}</span>
                    <span className="criteria-weight">{criteria.weight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Problem Modal */}
      {isModalOpen && selectedProblem && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: selectedProblem.color }}
          >
            <button 
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            
            <div className="modal-header">
              <div className="modal-problem-number">#{selectedProblem.id}</div>
              <div className="modal-difficulty">
                {Array.from({ length: selectedProblem.difficulty }).map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
            </div>
            
            <h2 className="modal-title">{selectedProblem.title}</h2>
            <p className="modal-category">{selectedProblem.category}</p>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3><Target size={20} /> Problem Statement</h3>
                <p>{selectedProblem.problem}</p>
              </div>
              
              <div className="modal-section">
                <h3><Calendar size={20} /> Your Task</h3>
                <p>{selectedProblem.task}</p>
              </div>
              
              <div className="modal-section">
                <h3><Zap size={20} /> Key Features Required</h3>
                <p>{selectedProblem.features}</p>
              </div>
              
              <div className="modal-section">
                <h3><Code size={20} /> Recommended Tech Stack</h3>
                <div className="modal-tech-stack">
                  {selectedProblem.techStack.map((tech, index) => (
                    <span key={index} className="modal-tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-section">
                <h3><Star size={20} /> Expected Impact</h3>
                <p>{selectedProblem.impact}</p>
              </div>
              
              <div className="modal-section">
                <h3><Brain size={20} /> Bonus Points</h3>
                <ul>
                  <li>Innovative use of AI/ML algorithms</li>
                  <li>Exceptional user experience design</li>
                  <li>Scalable and efficient architecture</li>
                  <li>Real-world applicability and feasibility</li>
                  <li>Creative problem-solving approach</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-select-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  onNavigateToRegistration();
                }}
              >
                Choose This Challenge
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DynamicHackathonLanding;
