import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/ModernGlobal.css';

const slides = [
  {
    title: 'Master Programming with CodeTapasya',
    subtitle: 'Professional coding education with industry-standard curriculum',
    description: 'Join thousands of successful developers who started their journey with us',
    cta: 'Start Learning',
    type: 'default',
    features: ['Expert Instructors', 'Real Projects', 'Career Support']
  },
  {
    title: 'TKR College Hackathon - CognitiveX',
    subtitle: 'Powered by SmartBridge & IBM',
    description: '4-Day Bootcamp + 2-Day- Challenge • GenAI Development • Industry Mentorship',
    cta: 'Register Now',
    type: 'hackathon',
    features: ['₹30,000 Prize Pool', 'IBM Certification', 'Industry Exposure']
  },
  {
    title: 'Full-Stack Development',
    subtitle: 'Master modern web technologies',
    description: 'React, Node.js, MongoDB, and more with hands-on projects',
    cta: 'View Courses',
    type: 'default',
    features: ['Project-Based Learning', 'Industry Mentors', 'Job Assistance']
  },
  {
    title: 'AI-Powered Learning',
    subtitle: 'Get personalized guidance with CodeTapasya AI',
    description: 'Smart recommendations, code reviews, and instant doubt resolution',
    cta: 'Try AI Assistant',
    type: 'default',
    features: ['24/7 AI Support', 'Code Analysis', 'Personalized Path']
  }
];

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleAction = (slide) => {
    if (slide.type === 'hackathon') {
      navigate('/hackathon');
    } else {
      navigate('/courses');
    }
  };

  return (
    <div className="professional-hero-carousel">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showArrows={true}
        showIndicators={true}
        interval={5000}
        swipeable
        emulateTouch
        transitionTime={800}
        className="carousel-wrapper"
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="carousel-arrow carousel-arrow-prev"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="carousel-arrow carousel-arrow-next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )
        }
      >
        {slides.map((slide, idx) => (
          <div key={idx} className={`professional-carousel-slide ${slide.type === 'hackathon' ? 'hackathon-slide' : ''}`}>
            <div className="carousel-container">
              <div className="carousel-content">
                <motion.div 
                  className="content-wrapper"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <motion.h1 
                    className="carousel-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    className="carousel-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.p 
                    className="carousel-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {slide.description}
                  </motion.p>
                  
                  {slide.features && (
                    <motion.div 
                      className="feature-pills"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      {slide.features.map((feature, index) => (
                        <span key={index} className="feature-pill">
                          {feature}
                        </span>
                      ))}
                    </motion.div>
                  )}
                  
                  <motion.button 
                    className="carousel-cta-button"
                    onClick={() => handleAction(slide)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {slide.cta}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroCarousel;