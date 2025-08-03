import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PolicyIcon from '@mui/icons-material/Policy';
import DescriptionIcon from '@mui/icons-material/Description';
import '../styles/ModernGlobal.css';

function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer 
      className="modern-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={footerVariants}
    >
      <div className="modern-container">
        <div className="modern-grid modern-grid-4" style={{ marginBottom: '3rem' }}>
          {/* Navigation Links */}
          <motion.div className="modern-footer-section" variants={itemVariants}>
            <h3 className="modern-heading-sm modern-footer-heading">Quick Links</h3>
            <ul className="modern-footer-list">
              <li>
                <Link to="/" className="modern-footer-link">
                  <HomeIcon fontSize="small" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="modern-footer-link">
                  <DashboardIcon fontSize="small" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/courses" className="modern-footer-link">
                  <SchoolIcon fontSize="small" />
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/profile" className="modern-footer-link">
                  <PersonIcon fontSize="small" />
                  Profile
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="modern-footer-section" variants={itemVariants}>
            <h3 className="modern-heading-sm modern-footer-heading">Contact Us</h3>
            <div className="modern-footer-contact">
              <a href="mailto:support@codetapasya.com" className="modern-footer-link">
                <EmailIcon fontSize="small" />
                support@codetapasya.com
              </a>
            </div>
          </motion.div>

          {/* Legal Links */}
          <motion.div className="modern-footer-section" variants={itemVariants}>
            <h3 className="modern-heading-sm modern-footer-heading">Legal</h3>
            <ul className="modern-footer-list">
              <li>
                <Link to="/privacy-policy" className="modern-footer-link">
                  <PolicyIcon fontSize="small" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="modern-footer-link">
                  <DescriptionIcon fontSize="small" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="modern-footer-link">
                  <DescriptionIcon fontSize="small" />
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="modern-footer-link">
                  <DescriptionIcon fontSize="small" />
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div className="modern-footer-section" variants={itemVariants}>
            <h3 className="modern-heading-sm modern-footer-heading">Follow Us</h3>
            <div className="modern-social-grid">
              <motion.a 
                href="https://github.com/CodeTapasya" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modern-social-link"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <GitHubIcon />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/company/code-tapasya/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modern-social-link"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <LinkedInIcon />
              </motion.a>
              <motion.a 
                href="https://www.instagram.com/code_tapasya?igsh=MW1uYTg4amQzZ2F5Yw==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modern-social-link"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <InstagramIcon />
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div 
          className="modern-footer-bottom"
          variants={itemVariants}
        >
          <div className="modern-flex-between modern-flex-wrap" style={{ gap: '1rem' }}>
            <p className="modern-text-sm">
              © {new Date().getFullYear()} CodeTapasya. All rights reserved.
            </p>
            <p className="modern-text-sm" style={{ opacity: 0.7 }}>
              Made with ❤️ for developers
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;