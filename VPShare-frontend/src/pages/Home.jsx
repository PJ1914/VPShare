import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Home.css';
import SubscriptionBanner from '../components/SubscriptionBanner';
import HeroCarousel from '../components/HeroCarousel';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';
import WebIcon from '@mui/icons-material/Web';
import StorageIcon from '@mui/icons-material/Storage';

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
  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
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

        {/* Pricing Section */}
        <motion.section
          className="pricing"
          id="pricing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
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
              </ul>              <motion.div
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
              className="pricing-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Monthly Plan</h3>
              <p className="price"><span className="rupee">₹</span><span className="price-amount">99</span> / month</p>
              <ul>
                <li>30-day full access</li>
                <li>All courses and projects</li>
                <li>Priority support</li>
                <li>Monthly progress tracking</li>
              </ul>              <motion.div
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
              <ul>
                <li>1-year full access</li>
                <li>All courses and projects</li>
                <li>Priority support</li>
                <li>Early access to new courses</li>
              </ul>              <motion.div
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
          </div>          <motion.div
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
            <Link to="/payment/monthly" className="cta-button">
              See All Subscriptions
            </Link>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of learners mastering web development with CodeTapasya.</p>          <motion.div
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
        </motion.section>
      </main>
      <SubscriptionBanner />
    </>
  );
}

export default Home;