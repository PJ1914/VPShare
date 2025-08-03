import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HackathonHero from '../components/hackathon/HackathonHero';
import RegistrationForm from '../components/hackathon/RegistrationForm';
import Timeline from '../components/hackathon/Timeline';
import Bootcamp from '../components/hackathon/Bootcamp';
import Partners from '../components/hackathon/Partners';
import Responsibilities from '../components/hackathon/Responsibilities';
import MobileSidebar from '../components/hackathon/MobileSidebar';
import { HackathonMobileLoader, MobileSectionLoader } from '../components/MobileLoadingSpinner';
import { useResponsive } from '../hooks/useResponsive';
import { useNotification } from '../contexts/NotificationContext';
import { mobileDetection, mobilePerformance, mobileUX, mobileA11y } from '../utils/mobileOptimization';
import '../styles/Hackathon.css';
import '../styles/HackathonMobile.css';
import '../styles/MobileUtils.css';
import '../styles/MobileLoadingSpinner.css';

const Hackathon = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing');
  const { isMobile, isTablet, deviceType } = useResponsive();
  const { showNotification } = useNotification();

  const sections = [
    { id: 'about', label: 'About' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'bootcamp', label: 'Bootcamp' },
    { id: 'partners', label: 'Partners' },
    { id: 'responsibilities', label: 'Guidelines' },
    { id: 'register', label: 'Register' }
  ];

  // Show welcome notification when hackathon page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification({
        type: 'hackathon',
        title: 'Welcome to CognitiveX!',
        message: 'Explore the hackathon details and register to join the ultimate GenAI experience.',
        duration: 6000
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [showNotification]);

  // Mobile-specific optimizations
  useEffect(() => {
    // Initialize loading sequence
    const initializeApp = async () => {
      setLoadingStage('Initializing');
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isMobile || isTablet) {
        setLoadingStage('Loading');
        
        // Add mobile-specific body classes
        document.body.classList.add('mobile-hackathon');
        
        // Optimize touch scrolling
        document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
        
        // Initialize mobile optimizations
        if (typeof mobileUX !== 'undefined') {
          mobileUX.preventZoomOnInput();
        }
        if (typeof mobileA11y !== 'undefined') {
          mobileA11y.ensureTouchTargetSize();
        }
        if (typeof mobilePerformance !== 'undefined') {
          mobilePerformance.lazyLoadImages();
        }
        
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      setLoadingStage('Ready');
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };

    initializeApp();
    
    // Prevent zoom on input focus for iOS
    const addNoZoomInputs = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select, textarea');
      inputs.forEach(input => {
        if (parseFloat(getComputedStyle(input).fontSize) < 16) {
          input.style.fontSize = '16px';
        }
      });
    };
    
    // Add mobile performance optimizations
    const optimizeForMobile = () => {
      // Lazy load non-critical sections
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mobile-visible');
          }
        });
      }, { threshold: 0.1 });
      
      const sections = document.querySelectorAll('.hackathon-section');
      sections.forEach(section => observer.observe(section));
      
      return () => observer.disconnect();
    };
    
    if (isMobile || isTablet) {
      setTimeout(addNoZoomInputs, 100);
      const cleanup = optimizeForMobile();
      
      return () => {
        document.body.classList.remove('mobile-hackathon');
        cleanup?.();
      };
    }
  }, [isMobile, isTablet]);

  // Handle navigation with smooth scrolling - Enhanced for mobile
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    
    // Show section-specific notifications
    if (sectionId === 'register') {
      showNotification({
        type: 'info',
        title: 'Ready to Register?',
        message: 'Fill out the registration form to secure your spot in the hackathon!',
        duration: 4000
      });
    }
    
    // Smooth scroll to section with mobile offset
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = isMobile ? 120 : 80;
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Add haptic feedback for mobile devices
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  // Update active section based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'timeline', 'bootcamp', 'partners', 'responsibilities', 'register'];
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`hackathon-page ${deviceType}`}>
      {/* Mobile Loading Screen */}
      <HackathonMobileLoader show={isLoading} stage={loadingStage} />
      
      {/* Mobile Menu Button */}
      {(isMobile || isTablet) && (
        <button
          className={`mobile-menu-btn ${mobileSidebarOpen ? 'open' : ''}`}
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeSection={activeSection}
        onNavigate={handleNavigation}
      />

      {/* Navigation */}
      <nav className="hackathon-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>CognitiveX</h2>
            <span>GenAI Hackathon</span>
          </div>
          {/* Desktop Navigation - Hidden on Mobile */}
          {!isMobile && !isTablet && (
            <div className="nav-links">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(section.id)}
                  aria-label={`Navigate to ${section.label} section`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <HackathonHero />

      {/* Main Content */}
      <main className="hackathon-main">
        <section id="about" className={activeSection === 'about' ? 'active' : ''}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section about-section"
          >
            <div className="container">
              <div className="about-grid">
                <div className="about-smartbridge">
                  <h2>About SmartBridge</h2>
                  <p>
                    SmartBridge, founded in 2015, is a leading EdTech solutions provider bridging 
                    academia & industry. Our mission is to create a sustainable talent pipeline for 
                    emerging industries by fostering strong industry-academia collaborations.
                  </p>
                  <p>
                    We offer project-based learning, credit courses, virtual internship programs, 
                    global certifications in technologies like AI, Machine Learning, Data Science, 
                    IoT, Cloud Computing, Cybersecurity etc., providing hands-on experience to build 
                    critical, job-ready skills.
                  </p>
                  
                  <div className="impact-stats">
                    <div className="stat">
                      <h3>1.25M+</h3>
                      <p>Students Skilled</p>
                    </div>
                    <div className="stat">
                      <h3>580K+</h3>
                      <p>Virtual Internships</p>
                    </div>
                    <div className="stat">
                      <h3>35K+</h3>
                      <p>Educators Upskilled</p>
                    </div>
                    <div className="stat">
                      <h3>2.7K+</h3>
                      <p>Colleges Benefitted</p>
                    </div>
                  </div>
                </div>

                <div className="about-cognitivex">
                  <h2>What is CognitiveX?</h2>
                  <p>
                    CognitiveX is an initiative by SmartBridge, launched in collaboration with 
                    IBM SkillsBuild. The program features a 5-day bootcamp followed by a 24-hour 
                    hackathon, offering students a unique opportunity to work on real-world 
                    challenges while gaining hands-on experience with IBM tools.
                  </p>
                  <p>
                    This initiative aims to enhance practical skills and industry exposure in 
                    the field of generative AI.
                  </p>

                  <div className="hackathon-journey">
                    <h3>Hackathon Journey</h3>
                    <div className="journey-steps">
                      <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <h4>Registration & Problem Statement Selection</h4>
                          <p>Register for the event and select your problem statement</p>
                        </div>
                      </div>
                      <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <h4>Attend Bootcamps & Complete Badge</h4>
                          <p>4-day bootcamp with hands-on IBM Cloud Services experience</p>
                        </div>
                      </div>
                      <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <h4>Work on Problem Statement</h4>
                          <p>Develop your solution based on the selected problem statement</p>
                        </div>
                      </div>
                      <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <h4>Evaluation & Awards</h4>
                          <p>Submit solutions and compete for innovative prototype prizes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="timeline" className={activeSection === 'timeline' ? 'active' : ''}>
          <Timeline />
        </section>
        
        <section id="bootcamp" className={activeSection === 'bootcamp' ? 'active' : ''}>
          <Bootcamp />
        </section>
        
        <section id="partners" className={activeSection === 'partners' ? 'active' : ''}>
          <Partners />
        </section>
        
        <section id="responsibilities" className={activeSection === 'responsibilities' ? 'active' : ''}>
          <Responsibilities />
        </section>
        
        <section id="register" className={activeSection === 'register' ? 'active' : ''}>
          <RegistrationForm />
        </section>
      </main>
    </div>
  );
};

export default Hackathon;
