import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
// import codingAnimation from '../assets/coding-animation.json'; // Placeholder for Lottie animation file
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
            <motion.a
              href="#pricing"
              className="cta-button"
              variants={hoverVariants}
              whileHover="hover"
            >
              Get Started Today
            </motion.a>
          </motion.div>
          <motion.div
            className="hero-animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* <Lottie animationData={codingAnimation} loop={true} style={{ height: '300px' }} /> */}
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
              <p className="price">0 / forever</p>
              <ul>
                <li>Access to beginner tutorials</li>
                <li>Community support</li>
                <li>Basic projects</li>
              </ul>
              <motion.a
                href="#"
                className="cta-button secondary"
                variants={hoverVariants}
                whileHover="hover"
              >
                Start Free
              </motion.a>
            </motion.div>
            <motion.div
              className="pricing-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Monthly Plan</h3>
              <p className="price">99 RS / month</p>
              <ul>
                <li>All Free Plan features</li>
                <li>Advanced tutorials</li>
                <li>Exclusive projects</li>
                <li>Priority support</li>
              </ul>
              <motion.a
                href="#"
                className="cta-button"
                variants={hoverVariants}
                whileHover="hover"
              >
                Subscribe Now
              </motion.a>
            </motion.div>
            <motion.div
              className="pricing-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Lifetime Plan</h3>
              <p className="price">599 RS / one-time</p>
              <ul>
                <li>All Monthly Plan features</li>
                <li>Lifetime access to all content</li>
                <li>Early access to new courses</li>
                <li>Personalized mentorship</li>
              </ul>
              <motion.a
                href="#"
                className="cta-button"
                variants={hoverVariants}
                whileHover="hover"
              >
                Get Lifetime Access
              </motion.a>
            </motion.div>
          </div>
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
          <motion.a
            href="#pricing"
            className="cta-button"
            variants={hoverVariants}
            whileHover="hover"
          >
            Join Now
          </motion.a>
        </motion.section>
      </main>
    </>
  );
}

export default Home;