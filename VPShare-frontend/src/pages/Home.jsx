import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/ModernGlobal.css';
import '../styles/HackathonGallery.css';
import SubscriptionBanner from '../components/SubscriptionBanner';
import HeroCarousel from '../components/HeroCarousel';
import SEO from '../components/SEO';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';
import WebIcon from '@mui/icons-material/Web';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Animation variants for buttons and cards
const hoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

function Home() {
  // Get subscription context
  const { hasSubscription, plan, expiresAt, loading: subscriptionLoading } = useSubscription();
  
  // Get auth context
  const { user, loading: authLoading } = useAuth();
  
  // Get notification context
  const { showHackathonNotification, showLoginPrompt } = useNotification();
  
  // State for hackathon notification
  const [hackathonNotificationShown, setHackathonNotificationShown] = useState(false);

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show hackathon notification for new visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem('hackathon-notification-shown');
    
    if (!hasVisited && !hackathonNotificationShown) {
      // Show notification after a short delay
      const timer = setTimeout(() => {
        showHackathonNotification();
        setHackathonNotificationShown(true);
        localStorage.setItem('hackathon-notification-shown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showHackathonNotification, hackathonNotificationShown]);

  // Show login prompt for unauthenticated users after some time
  useEffect(() => {
    // Only show login prompt if user is not authenticated and doesn't have subscription
    if (!user && !authLoading && !hasSubscription && !subscriptionLoading) {
      const timer = setTimeout(() => {
        const lastLoginPrompt = localStorage.getItem('last-login-prompt');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (!lastLoginPrompt || (now - parseInt(lastLoginPrompt)) > oneHour) {
          showLoginPrompt();
          localStorage.setItem('last-login-prompt', now.toString());
        }
      }, 15000); // Show after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, hasSubscription, subscriptionLoading, showLoginPrompt]);

  // Define plan hierarchy for upgrade suggestions
  const planHierarchy = {
    'one-day': { level: 1, name: 'One-Day Plan', nextPlan: 'weekly' },
    'weekly': { level: 2, name: 'Weekly Plan', nextPlan: 'monthly' },
    'monthly': { level: 3, name: 'Monthly Plan', nextPlan: 'six-month' },
    'six-month': { level: 4, name: '6-Month Plan', nextPlan: 'yearly' },
    'yearly': { level: 5, name: 'Yearly Plan', nextPlan: null }
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get upgrade recommendation
  const getUpgradeRecommendation = () => {
    if (!hasSubscription || !plan) return null;
    
    const currentPlan = planHierarchy[plan];
    if (!currentPlan || !currentPlan.nextPlan) return null;
    
    const daysLeft = getDaysUntilExpiry();
    const nextPlan = currentPlan.nextPlan;
    
    return {
      currentPlan: currentPlan.name,
      nextPlan: planHierarchy[nextPlan]?.name,
      nextPlanKey: nextPlan,
      daysLeft,
      isExpiringSoon: daysLeft !== null && daysLeft <= 7
    };
  };

  const upgradeInfo = getUpgradeRecommendation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "CodeTapasya",
    "url": "https://codetapasya.com",
    "logo": "https://codetapasya.com/logo.png",
    "description": "Leading online programming education platform offering interactive courses, coding playground, and hands-on projects.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@codetapasya.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Programming Courses",
      "itemListElement": [
        {
          "@type": "Course",
          "name": "JavaScript Programming",
          "description": "Learn JavaScript from basics to advanced concepts",
          "provider": {
            "@type": "Organization",
            "name": "CodeTapasya"
          }
        },
        {
          "@type": "Course",
          "name": "React Development",
          "description": "Master React for modern web development",
          "provider": {
            "@type": "Organization",
            "name": "CodeTapasya"
          }
        },
        {
          "@type": "Course",
          "name": "Python Programming",
          "description": "Learn Python for web development and data science",
          "provider": {
            "@type": "Organization",
            "name": "CodeTapasya"
          }
        }
      ]
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Access to blogs, sample projects, and community"
      },
      {
        "@type": "Offer",
        "name": "Monthly Plan",
        "price": "99",
        "priceCurrency": "INR",
        "description": "Full access to all courses and features"
      },
      {
        "@type": "Offer",
        "name": "Yearly Plan",
        "price": "799",
        "priceCurrency": "INR",
        "description": "Annual subscription with additional benefits"
      }
    ]
  };

  return (
    <>
      <SEO
        title="CodeTapasya - Learn Programming Online | Best Coding Courses in India"
        description="Master programming with CodeTapasya's interactive courses. Learn JavaScript, React, Python, Node.js with hands-on projects, coding playground, and expert guidance. Start free today!"
        keywords="programming courses, learn coding online, JavaScript course, React tutorial, Python programming, Node.js, web development bootcamp, coding playground, online programming India, best coding courses"
        url="https://codetapasya.com"
        image="https://codetapasya.com/og-home.jpg"
        structuredData={structuredData}
      />
      
      <div className="modern-page">
        {/* Hero Carousel Section */}
        <motion.section 
          className="modern-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <HeroCarousel />
        </motion.section>

        <div className="modern-container">
          {/* Vision Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="modern-card-icon">
                  <WorkspacePremiumIcon />
                </div>
                <div>
                  <h2 className="modern-heading-md modern-card-title">Our Vision</h2>
                  <p className="modern-card-subtitle">Empowering the next generation of developers</p>
                </div>
              </div>
              <p className="modern-text">
                At CodeTapasya, we empower beginners to master web development with structured learning, hands-on projects, and a vibrant community. Our goal is to make tech skills accessible to all!
              </p>
            </div>
          </motion.section>

          {/* Featured Tools Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <h2 className="modern-heading-lg">Featured Tools & Features</h2>
            <p className="modern-text modern-fade-in">Discover the powerful tools that make CodeTapasya stand out!</p>
            
            <div className="modern-grid modern-grid-3">
              <motion.div 
                className="modern-card modern-slide-up" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <CodeIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">Coding Playground</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Test and run your code instantly with our built-in playground—perfect for experimenting and learning on the go!</p>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card modern-slide-up" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <GitHubIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">GitHub Integration</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Connect your GitHub account to import repositories and showcase your projects seamlessly.</p>
                  <div className="modern-card-actions">
                    <motion.div
                      role="button"
                      tabIndex={0}
                      className="modern-flex modern-flex-center"
                      variants={hoverVariants}
                      whileHover="hover"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.querySelector('a').click();
                        }
                      }}
                    >
                      <Link to="/github" className="modern-btn modern-btn-secondary modern-btn-sm">
                        Connect Now
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card modern-slide-up" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <SchoolIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">Learning Courses</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Access a wide range of coding courses with practical projects, from Python to React, designed for all levels.</p>
                  <div className="modern-card-actions">
                    <motion.div
                      role="button"
                      tabIndex={0}
                      className="modern-flex modern-flex-center"
                      variants={hoverVariants}
                      whileHover="hover"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.querySelector('a').click();
                        }
                      }}
                    >
                      <Link to="/courses" className="modern-btn modern-btn-primary modern-btn-sm">
                        Explore Courses
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Learning Paths Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <h2 className="modern-heading-lg">Explore Our Learning Paths</h2>
            
            <div className="modern-grid modern-grid-3">
              <motion.div 
                className="modern-card modern-card-compact modern-slide-in-left" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <WebIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">Frontend Development</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Learn HTML, CSS, JavaScript, and React to build stunning user interfaces.</p>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card modern-card-compact modern-slide-up" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <CodeIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">Backend Development</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Master Node.js, Express, and APIs to power your applications.</p>
                </div>
              </motion.div>

              <motion.div 
                className="modern-card modern-card-compact modern-slide-in-right" 
                variants={hoverVariants} 
                whileHover="hover"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <StorageIcon />
                  </div>
                  <div>
                    <h3 className="modern-card-title">Databases</h3>
                  </div>
                </div>
                <div className="modern-card-content">
                  <p className="modern-text-sm">Understand MySQL and MongoDB to manage data effectively.</p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Successfully Completed Hackathon Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <div className="modern-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))' }}>
              <div className="modern-flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                  <motion.div
                    className="modern-badge modern-badge-success"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ marginBottom: '1rem', display: 'inline-block' }}
                  >
                    ✅ SUCCESSFULLY COMPLETED
                  </motion.div>
                  <h2 className="modern-heading-lg">TKR College Hackathon - CognitiveX</h2>
                  <p className="modern-text">
                    Powered by <strong>SmartBridge</strong> & <strong>IBM</strong>
                  </p>
                  <p className="modern-text-sm" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
                    A landmark achievement in GenAI education and innovation
                  </p>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="hackathon-gallery hackathon-gallery-grid">
                <div className="hackathon-gallery-small-grid">
                  <img 
                    src="/src/assets/tkr-hack-1.jpeg" 
                    alt="TKR Hackathon - Opening Ceremony"
                    className="hackathon-gallery-image"
                    loading="lazy"
                  />
                  <img 
                    src="/src/assets/tkr-hack-2.jpeg" 
                    alt="TKR Hackathon - Participants Working"
                    className="hackathon-gallery-image"
                    loading="lazy"
                  />
                  <img 
                    src="/src/assets/tkr-hack-3.jpeg" 
                    alt="TKR Hackathon - Team Collaboration"
                    className="hackathon-gallery-image"
                    loading="lazy"
                  />
                  <img 
                    src="/src/assets/tkr-hack-4.jpeg" 
                    alt="TKR Hackathon - Project Presentations"
                    className="hackathon-gallery-image"
                    loading="lazy"
                  />
                </div>
                <div>
                  <img 
                    src="/src/assets/tkr-hack-winners.jpeg" 
                    alt="TKR Hackathon - Winners Celebration"
                    className="hackathon-gallery-main-image"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="modern-grid modern-grid-2" style={{ marginBottom: '2rem' }}>
                <div>
                  <h3 className="modern-heading-sm" style={{ marginBottom: '1.5rem' }}>Event Highlights</h3>
                  <div className="modern-flex-col">
                    <div className="modern-flex" style={{ alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎓</span>
                      <div>
                        <h4 className="modern-text" style={{ fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>4-Day Intensive Bootcamp</h4>
                        <p className="modern-text-sm">Comprehensive training on IBM Granite & GenAI fundamentals</p>
                      </div>
                    </div>
                    <div className="modern-flex" style={{ alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>⚡</span>
                      <div>
                        <h4 className="modern-text" style={{ fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>2-Day Hackathon Marathon</h4>
                        <p className="modern-text-sm">Innovative solutions built with cutting-edge AI technologies</p>
                      </div>
                    </div>
                    <div className="modern-flex" style={{ alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🏆</span>
                      <div>
                        <h4 className="modern-text" style={{ fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Outstanding Winners</h4>
                        <p className="modern-text-sm">Amazing prizes awarded to exceptional innovations</p>
                      </div>
                    </div>
                    <div className="modern-flex" style={{ alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🤝</span>
                      <div>
                        <h4 className="modern-text" style={{ fontWeight: '600', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Industry Recognition</h4>
                        <p className="modern-text-sm">Real-world problem solving with industry mentorship</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="modern-heading-sm" style={{ marginBottom: '1.5rem' }}>Success Metrics</h3>
                  <div className="modern-grid modern-grid-3">
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>1500+</div>
                      <div className="modern-text-sm">Participants</div>
                    </div>
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>250+</div>
                      <div className="modern-text-sm">Teams</div>
                    </div>
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>₹50k</div>
                      <div className="modern-text-sm">Prize Pool</div>
                    </div>
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>15+</div>
                      <div className="modern-text-sm">Mentors</div>
                    </div>
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>100%</div>
                      <div className="modern-text-sm">Completion</div>
                    </div>
                    <div className="modern-card modern-card-compact" style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="modern-heading-md" style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>5⭐</div>
                      <div className="modern-text-sm">Rating</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 className="modern-heading-sm" style={{ marginBottom: '1rem' }}>Event Journey</h3>
                <div className="modern-flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { number: '✅', title: 'Registration', subtitle: 'Massive Response', status: 'completed' },
                    { number: '✅', title: 'Bootcamp', subtitle: '4 Days Excellence', status: 'completed' },
                    { number: '✅', title: 'Hackathon', subtitle: '48 Hours Innovation', status: 'completed' },
                    { number: '🏆', title: 'Results', subtitle: 'Grand Success', status: 'completed' }
                  ].map((step, index) => (
                    <div key={index} className="modern-flex" style={{ alignItems: 'center', flex: '1', minWidth: '200px' }}>
                      <div 
                        className="modern-card-icon" 
                        style={{ 
                          marginRight: '1rem', 
                          fontSize: '1rem',
                          background: 'linear-gradient(135deg, var(--success), #10b981)',
                          color: 'white'
                        }}
                      >
                        {step.number}
                      </div>
                      <div>
                        <div className="modern-text" style={{ fontWeight: '600', margin: '0', color: 'var(--text-primary)' }}>{step.title}</div>
                        <div className="modern-text-sm" style={{ color: 'var(--success)' }}>{step.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <h3 className="modern-heading-sm" style={{ marginBottom: '1rem', color: 'var(--success)' }}>🎉 Legacy Achievement</h3>
                <p className="modern-text">
                  The TKR College Hackathon - CognitiveX stands as a testament to the power of collaborative learning and innovation in AI. 
                  With <strong>1500+ participants</strong> from diverse backgrounds, this event successfully demonstrated the potential of 
                  GenAI technologies in solving real-world problems. The overwhelming participation and exceptional project outcomes 
                  have set a new benchmark for future hackathons.
                </p>
                <p className="modern-text-sm" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                  "This hackathon exceeded all expectations and showcased the incredible talent in AI development among our students." 
                  - TKR College Leadership
                </p>
              </div>

              <div className="modern-flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                <motion.div
                  variants={hoverVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/hackathon" className="modern-btn modern-btn-success modern-btn-lg">
                    🏆 View Success Story
                  </Link>
                </motion.div>
                <p className="modern-text-sm" style={{ textAlign: 'center', opacity: 0.8 }}>
                  Celebrating innovation, collaboration, and AI excellence
                </p>
              </div>
            </div>
          </motion.section>

          {/* Dynamic Pricing Section */}
          <motion.section
            className="modern-section"
            id="pricing"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            {subscriptionLoading ? (
              <div className="modern-card modern-flex-center" style={{ padding: '3rem' }}>
                <div className="modern-skeleton" style={{ width: '300px', height: '50px' }}></div>
              </div>
            ) : hasSubscription && plan ? (
              // User has active subscription - show current plan and upgrade options
              <div>
                <h2 className="modern-heading-lg">Your Current Plan</h2>
                <motion.div
                  className="modern-card"
                  variants={hoverVariants}
                  whileHover="hover"
                  style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))', marginBottom: '2rem' }}
                >
                  <div className="modern-card-header">
                    <div className="modern-card-icon" style={{ background: 'linear-gradient(135deg, var(--success), #10b981)' }}>
                      <WorkspacePremiumIcon />
                    </div>
                    <div>
                      <h3 className="modern-card-title">{planHierarchy[plan]?.name || plan}</h3>
                      <span className="modern-badge modern-badge-success">Premium Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="modern-text modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <AccessTimeIcon fontSize="small" />
                      {getDaysUntilExpiry() !== null && getDaysUntilExpiry() > 0 ? (
                        <>
                          Expires in {getDaysUntilExpiry()} {getDaysUntilExpiry() === 1 ? 'day' : 'days'} 
                          ({expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Unknown'})
                        </>
                      ) : (
                        'Plan has expired'
                      )}
                    </p>
                    <div className="modern-grid modern-grid-2">
                      <div>
                        <h4 className="modern-text" style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Plan Benefits:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            ✅ Full access to all courses
                          </li>
                          <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            ✅ All projects and assignments
                          </li>
                          <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            ✅ Priority support
                          </li>
                          <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            ✅ Coding playground access
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {upgradeInfo && (
                  <div>
                    <h3 className="modern-heading-md modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <TrendingUpIcon fontSize="medium" color="success" />
                      Upgrade Recommendation
                    </h3>
                    <motion.div
                      className="modern-card"
                      variants={hoverVariants}
                      whileHover="hover"
                      style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))' }}
                    >
                      <div className="modern-flex-between" style={{ gap: '2rem' }}>
                        <div>
                          <h4 className="modern-heading-sm">Upgrade to {upgradeInfo.nextPlan}</h4>
                          <p className="modern-text">
                            {upgradeInfo.isExpiringSoon 
                              ? `Your plan expires soon! Upgrade to ${upgradeInfo.nextPlan} for longer access and better value.`
                              : `Get more value with our ${upgradeInfo.nextPlan} - enjoy longer access and save money!`
                            }
                          </p>
                          {upgradeInfo.isExpiringSoon && (
                            <p className="modern-text modern-badge modern-badge-warning">
                              ⚠️ Expiring in {upgradeInfo.daysLeft} {upgradeInfo.daysLeft === 1 ? 'day' : 'days'}!
                            </p>
                          )}
                        </div>
                        <motion.div
                          role="button"
                          tabIndex={0}
                          variants={hoverVariants}
                          whileHover="hover"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.querySelector('a').click();
                            }
                          }}
                        >
                          <Link to={`/payment/${upgradeInfo.nextPlanKey}`} className="modern-btn modern-btn-accent">
                            Upgrade Now
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              // User has no subscription - show standard pricing
              <div>
                <h2 className="modern-heading-lg">Pricing Plans</h2>
                <p className="modern-text">Choose a plan that fits your learning journey. Start for free or unlock premium content.</p>
                
                <div className="modern-grid modern-grid-3" style={{ marginBottom: '2rem' }}>
                  <motion.div
                    className="modern-card"
                    variants={hoverVariants}
                    whileHover="hover"
                  >
                    <div className="modern-card-header">
                      <div className="modern-card-icon">
                        <SchoolIcon />
                      </div>
                      <div>
                        <h3 className="modern-card-title">Free Plan</h3>
                        <div className="modern-flex" style={{ alignItems: 'baseline', gap: '0.25rem' }}>
                          <span className="modern-heading-md" style={{ color: 'var(--success)' }}>₹0</span>
                          <span className="modern-text-sm">/ forever</span>
                        </div>
                      </div>
                    </div>
                    <div className="modern-card-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ Access to blogs
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ View sample projects
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          ✅ Community access
                        </li>
                      </ul>
                      <div className="modern-card-actions">
                        <motion.div
                          role="button"
                          tabIndex={0}
                          variants={hoverVariants}
                          whileHover="hover"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.querySelector('a').click();
                            }
                          }}
                        >
                          <Link to="/courses" className="modern-btn modern-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            Explore Free
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="modern-card"
                    variants={hoverVariants}
                    whileHover="hover"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                      border: '2px solid var(--primary)',
                      position: 'relative'
                    }}
                  >
                    <div className="modern-badge modern-badge-primary" style={{ position: 'absolute', top: '-10px', right: '1rem' }}>
                      Most Popular
                    </div>
                    <div className="modern-card-header">
                      <div className="modern-card-icon">
                        <WorkspacePremiumIcon />
                      </div>
                      <div>
                        <h3 className="modern-card-title">Monthly Plan</h3>
                        <div className="modern-flex" style={{ alignItems: 'baseline', gap: '0.25rem' }}>
                          <span className="modern-heading-md" style={{ color: 'var(--primary)' }}>₹99</span>
                          <span className="modern-text-sm">/ month</span>
                        </div>
                      </div>
                    </div>
                    <div className="modern-card-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ 30-day full access
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ All courses and projects
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ Priority support
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          ✅ Monthly progress tracking
                        </li>
                      </ul>
                      <div className="modern-card-actions">
                        <motion.div
                          role="button"
                          tabIndex={0}
                          variants={hoverVariants}
                          whileHover="hover"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.querySelector('a').click();
                            }
                          }}
                        >
                          <Link to="/payment/monthly" className="modern-btn modern-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Subscribe Now
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="modern-card"
                    variants={hoverVariants}
                    whileHover="hover"
                  >
                    <div className="modern-card-header">
                      <div className="modern-card-icon">
                        <TrendingUpIcon />
                      </div>
                      <div>
                        <h3 className="modern-card-title">Yearly Plan</h3>
                        <div className="modern-flex" style={{ alignItems: 'baseline', gap: '0.25rem' }}>
                          <span className="modern-heading-md" style={{ color: 'var(--secondary)' }}>₹799</span>
                          <span className="modern-text-sm">/ year</span>
                        </div>
                        <span className="modern-badge modern-badge-success" style={{ marginTop: '0.5rem' }}>Save ₹389!</span>
                      </div>
                    </div>
                    <div className="modern-card-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ 1-year full access
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ All courses and projects
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          ✅ Priority support
                        </li>
                        <li className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          ✅ Early access to new courses
                        </li>
                      </ul>
                      <div className="modern-card-actions">
                        <motion.div
                          role="button"
                          tabIndex={0}
                          variants={hoverVariants}
                          whileHover="hover"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.querySelector('a').click();
                            }
                          }}
                        >
                          <Link to="/payment/yearly" className="modern-btn modern-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Subscribe Now
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="modern-flex-center"
                  variants={hoverVariants}
                  whileHover="hover"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.querySelector('a').click();
                    }
                  }}
                >
                  <Link to="/payment/one-day" className="modern-btn modern-btn-ghost">
                    See All Subscriptions
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.section>

          {/* Call to Action */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <div className="modern-card modern-flex-center" style={{ textAlign: 'center', padding: '3rem' }}>
              {hasSubscription && plan ? (
                // User has subscription - show different message
                <>
                  <h2 className="modern-heading-lg">Continue Your Learning Journey!</h2>
                  <p className="modern-text" style={{ marginBottom: '2rem' }}>
                    You're all set with your {planHierarchy[plan]?.name || plan}. Keep exploring and building amazing projects!
                  </p>
                  <motion.div
                    role="button"
                    tabIndex={0}
                    variants={hoverVariants}
                    whileHover="hover"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.currentTarget.querySelector('a').click();
                      }
                    }}
                  >
                    <Link to="/courses" className="modern-btn modern-btn-primary modern-btn-lg">
                      Explore Courses
                    </Link>
                  </motion.div>
                </>
              ) : (
                // User has no subscription - show join message
                <>
                  <h2 className="modern-heading-lg">Ready to Start Your Journey?</h2>
                  <p className="modern-text" style={{ marginBottom: '2rem' }}>
                    Join thousands of learners mastering web development with CodeTapasya.
                  </p>
                  <motion.div
                    role="button"
                    tabIndex={0}
                    variants={hoverVariants}
                    whileHover="hover"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.currentTarget.querySelector('a').click();
                      }
                    }}
                  >
                    <Link to="/payment/monthly" className="modern-btn modern-btn-primary modern-btn-lg">
                      Join Now
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.section>
        </div>
      </div>
      <SubscriptionBanner />
    </>
  );
}

export default Home;