import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Home.css';

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
        {/* Hero Section */}
        <motion.section
          className="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1>Master Web Development with CodeTapasya</h1>
            <p className="hero-subtitle">
              Your journey to becoming a full-stack developer starts here. Learn Frontend, Backend, and Databases with ease.
            </p>
            <motion.div
              role="button"
              tabIndex={0}
              variants={hoverVariants}
              whileHover="hover"
            >
              <Link to="/payment/monthly" className="cta-button">
                Get Started Today
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

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
            At CodeTapasya, we believe anyone can become a web developer with the right guidance. Our mission is to empower beginners with clear, structured, and hands-on learning paths in Frontend, Backend, and Databases. We provide simple tutorials, practical projects, and a supportive community to help you succeed.
          </p>
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
            <motion.div
              className="path-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Frontend Development</h3>
              <p>Learn HTML, CSS, JavaScript, and modern frameworks like React to build stunning user interfaces.</p>
            </motion.div>
            <motion.div
              className="path-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Backend Development</h3>
              <p>Master server-side programming with Node.js, Express, and APIs to power your applications.</p>
            </motion.div>
            <motion.div
              className="path-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Databases</h3>
              <p>Understand SQL and NoSQL databases like MySQL and MongoDB to store and manage data effectively.</p>
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
              <p className="price">0 RS / forever</p>
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
              <p className="price">99 RS / month</p>
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
              <p className="price">799 RS / year</p>
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
          <p>Join thousands of beginners learning web development with CodeTapasya.</p>
          <motion.div
            role="button"
            tabIndex={0}
            variants={hoverVariants}
            whileHover="hover"
          >
            <Link to="/payment/monthly" className="cta-button">
              Join Now
            </Link>
          </motion.div>
        </motion.section>
      </main>
    </>
  );
}

export default Home;