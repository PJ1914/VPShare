import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, BookOpen, Cloud, ChevronDown } from 'lucide-react';

const CurriculumModule = () => {
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    {
      id: 1,
      title: 'Python Fundamentals',
      duration: 'Weeks 1-4',
      icon: <Code size={28} />,
      color: '#6366f1',
      topics: [
        'Setting up environment & Python basics',
        'Data structures (lists, tuples, dictionaries)',
        'Control flow and looping',
        'Functions and OOP basics'
      ],
      projects: [
        'Command-line To-Do List',
        'Priority Task Manager',
        'Number Guessing Game',
        'Simple Car Class System'
      ]
    },
    {
      id: 2,
      title: 'Backend Development',
      duration: 'Weeks 5-8',
      icon: <BookOpen size={28} />,
      color: '#8b5cf6',
      topics: [
        'Introduction to Flask & REST APIs',
        'Flask forms and API testing',
        'Django full-stack framework',
        'FastAPI for high-performance APIs'
      ],
      projects: [
        'Flask "Hello World" Multi-page App',
        'Contact Form with Backend',
        'Django Contact Management',
        'FastAPI Contact API'
      ]
    },
    {
      id: 3,
      title: 'Frontend & AWS Deployment',
      duration: 'Weeks 9-12',
      icon: <Cloud size={28} />,
      color: '#f59e0b',
      topics: [
        'API integration with fetch',
        'API integration with axios',
        'AWS Lambda & API Gateway',
        'DynamoDB and serverless deployment'
      ],
      projects: [
        'Static page with public API',
        'Enhanced API integration',
        'Serverless Hello World on AWS',
        'Full-Stack Serverless Application'
      ]
    }
  ];

  return (
    <section id="curriculum" className="curriculum-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Course Curriculum</h2>
          <p className="section-description">
            Structured 12-week learning path with weekly hands-on projects
          </p>
          
          <div className="modules-container">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                className={`module-card ${activeModule === module.id ? 'active' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
              >
                <div className="module-header">
                  <div 
                    className="module-icon-wrapper"
                    style={{ backgroundColor: `${module.color}15`, borderColor: module.color }}
                  >
                    <div style={{ color: module.color }}>
                      {module.icon}
                    </div>
                  </div>
                  
                  <div className="module-info">
                    <h3>{module.title}</h3>
                    <span className="module-duration">{module.duration}</span>
                  </div>
                  
                  <motion.div
                    className="expand-indicator"
                    animate={{ rotate: activeModule === module.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} />
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {activeModule === module.id && (
                    <motion.div
                      className="module-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="content-grid">
                        <div className="content-section">
                          <h4>📚 Topics Covered</h4>
                          <ul className="topic-list">
                            {module.topics.map((topic, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <span className="bullet"></span>
                                {topic}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="content-section">
                          <h4>🚀 Hands-On Projects</h4>
                          <ul className="project-list">
                            {module.projects.map((project, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <span className="bullet"></span>
                                {project}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CurriculumModule;
