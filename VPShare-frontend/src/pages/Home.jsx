import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Home.css';
import SubscriptionBanner from '../components/SubscriptionBanner';
import HeroCarousel from '../components/HeroCarousel';
import SEO from '../components/SEO';
import { useSubscription } from '../contexts/SubscriptionContext';
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

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      
      <main className="home-main">
        {/* Hero Carousel Section */}
        <HeroCarousel />

        {/* Vision Section */}
        <motion.section
          className="vision"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Our Vision</h2>
          <p>
            At CodeTapasya, we empower beginners to master web development with structured learning, hands-on projects, and a vibrant community. Our goal is to make tech skills accessible to all!
          </p>
        </motion.section>

        {/* Featured Tools Section */}
        <motion.section
          className="featured-tools"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Featured Tools & Features</h2>
          <p>Discover the powerful tools that make CodeTapasya stand out!</p>
          <div className="tools-container">
            <motion.div className="tool-card" variants={hoverVariants} whileHover="hover">
              <CodeIcon fontSize="large" color="primary" className="tool-icon" />
              <h3>Coding Playground</h3>
              <p>Test and run your code instantly with our built-in playground—perfect for experimenting and learning on the go!</p>
            </motion.div>            <motion.div className="tool-card" variants={hoverVariants} whileHover="hover">
              <GitHubIcon fontSize="large" color="secondary" className="tool-icon" />
              <h3>GitHub Integration</h3>
              <p>Connect your GitHub account to import repositories and showcase your projects seamlessly.</p>
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
                <Link to="/github" className="cta-button secondary">
                  Connect Now
                </Link>
              </motion.div>
            </motion.div>            <motion.div className="tool-card" variants={hoverVariants} whileHover="hover">
              <SchoolIcon fontSize="large" color="success" className="tool-icon" />
              <h3>Learning Courses</h3>
              <p>Access a wide range of coding courses with practical projects, from Python to React, designed for all levels.</p>
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
                <Link to="/courses" className="cta-button">
                  Explore Courses
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Learning Paths Section */}
        <motion.section
          className="learning-paths"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Explore Our Learning Paths</h2>
          <div className="paths-container">
            <motion.div className="path-card" variants={hoverVariants} whileHover="hover">
              <WebIcon fontSize="large" color="primary" className="path-icon" />
              <h3>Frontend Development</h3>
              <p>Learn HTML, CSS, JavaScript, and React to build stunning user interfaces.</p>
            </motion.div>
            <motion.div className="path-card" variants={hoverVariants} whileHover="hover">
              <CodeIcon fontSize="large" color="secondary" className="path-icon" />
              <h3>Backend Development</h3>
              <p>Master Node.js, Express, and APIs to power your applications.</p>
            </motion.div>
            <motion.div className="path-card" variants={hoverVariants} whileHover="hover">
              <StorageIcon fontSize="large" color="success" className="path-icon" />
              <h3>Databases</h3>
              <p>Understand MySQL and MongoDB to manage data effectively.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Dynamic Pricing Section */}
        <motion.section
          className="pricing"
          id="pricing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          {subscriptionLoading ? (
            <div className="pricing-loading">
              <h2>Loading subscription status...</h2>
            </div>
          ) : hasSubscription && plan ? (
            // User has active subscription - show current plan and upgrade options
            <div className="subscription-status-section">
              <h2>Your Current Plan</h2>
              <motion.div
                className="current-plan-card"
                variants={hoverVariants}
                whileHover="hover"
              >
                <div className="plan-header">
                  <WorkspacePremiumIcon fontSize="large" color="primary" />
                  <h3>{planHierarchy[plan]?.name || plan}</h3>
                  <span className="premium-badge">Premium Active</span>
                </div>
                <div className="plan-details">
                  <p className="expiry-info">
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
                  <ul className="plan-benefits">
                    <li>Full access to all courses</li>
                    <li>All projects and assignments</li>
                    <li>Priority support</li>
                    <li>Coding playground access</li>
                  </ul>
                </div>
              </motion.div>

              {upgradeInfo && (
                <div className="upgrade-section">
                  <h3>
                    <TrendingUpIcon fontSize="medium" color="success" />
                    Upgrade Recommendation
                  </h3>
                  <motion.div
                    className="upgrade-card"
                    variants={hoverVariants}
                    whileHover="hover"
                  >
                    <div className="upgrade-content">
                      <h4>Upgrade to {upgradeInfo.nextPlan}</h4>
                      <p>
                        {upgradeInfo.isExpiringSoon 
                          ? `Your plan expires soon! Upgrade to ${upgradeInfo.nextPlan} for longer access and better value.`
                          : `Get more value with our ${upgradeInfo.nextPlan} - enjoy longer access and save money!`
                        }
                      </p>
                      {upgradeInfo.isExpiringSoon && (
                        <p className="urgency-text">⚠️ Expiring in {upgradeInfo.daysLeft} {upgradeInfo.daysLeft === 1 ? 'day' : 'days'}!</p>
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
                      <Link to={`/payment/${upgradeInfo.nextPlanKey}`} className="cta-button upgrade-button">
                        Upgrade Now
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            // User has no subscription - show standard pricing
            <div className="standard-pricing">
              <h2>Pricing Plans</h2>
              <p>Choose a plan that fits your learning journey. Start for free or unlock premium content.</p>
              <div className="pricing-container">
                <motion.div
                  className="pricing-card"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <h3>Free Plan</h3>
                  <p className="price"><span className="rupee">₹</span><span className="price-amount">0</span> / forever</p>
                  <ul>
                    <li>Access to blogs</li>
                    <li>View sample projects</li>
                    <li>Community access</li>
                  </ul>
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
                    <Link to="/courses" className="cta-button secondary">
                      Explore Free
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="pricing-card featured"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <div className="featured-badge">Most Popular</div>
                  <h3>Monthly Plan</h3>
                  <p className="price"><span className="rupee">₹</span><span className="price-amount">99</span> / month</p>
                  <ul>
                    <li>30-day full access</li>
                    <li>All courses and projects</li>
                    <li>Priority support</li>
                    <li>Monthly progress tracking</li>
                  </ul>
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
                    <Link to="/payment/monthly" className="cta-button">
                      Subscribe Now
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="pricing-card"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <h3>Yearly Plan</h3>
                  <p className="price"><span className="rupee">₹</span><span className="price-amount">799</span> / year</p>
                  <p className="savings">Save ₹389!</p>
                  <ul>
                    <li>1-year full access</li>
                    <li>All courses and projects</li>
                    <li>Priority support</li>
                    <li>Early access to new courses</li>
                  </ul>
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
                    <Link to="/payment/yearly" className="cta-button">
                      Subscribe Now
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
              <motion.div
                className="see-all-subscriptions"
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
                <Link to="/payment/one-day" className="cta-button">
                  See All Subscriptions
                </Link>
              </motion.div>
            </div>
          )}
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          {hasSubscription && plan ? (
            // User has subscription - show different message
            <>
              <h2>Continue Your Learning Journey!</h2>
              <p>You're all set with your {planHierarchy[plan]?.name || plan}. Keep exploring and building amazing projects!</p>
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
                <Link to="/courses" className="cta-button">
                  Explore Courses
                </Link>
              </motion.div>
            </>
          ) : (
            // User has no subscription - show join message
            <>
              <h2>Ready to Start Your Journey?</h2>
              <p>Join thousands of learners mastering web development with CodeTapasya.</p>
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
                <Link to="/payment/monthly" className="cta-button">
                  Join Now
                </Link>
              </motion.div>
            </>
          )}
        </motion.section>
      </main>
      <SubscriptionBanner />
    </>
  );
}

export default Home;