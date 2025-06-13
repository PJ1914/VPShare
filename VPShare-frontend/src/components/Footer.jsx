import { Link } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer glassy-effect">
      <div className="footer-container">
        {/* Navigation Links */}
        <div className="footer-section footer-links">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li>
              <Link to="/" className="footer-link" aria-label="Go to Home page">Home</Link>
            </li>
            <li>
              <Link to="/dashboard" className="footer-link" aria-label="Go to Dashboard page">Dashboard</Link>
            </li>
            <li>
              <Link to="/courses" className="footer-link" aria-label="Go to Courses page">Courses</Link>
            </li>
            <li>
              <Link to="/profile" className="footer-link" aria-label="Go to Profile page">Profile</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section footer-contact">
          <h3 className="footer-heading">Contact Us</h3>
          <p>
            <a href="mailto:support@vpshare.com" className="footer-link" aria-label="Email support">support@vpshare.com</a>
          </p>
        </div>

        {/* Social Media */}
        <div className="footer-section footer-social">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow on Twitter">
              <TwitterIcon className="social-icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow on LinkedIn">
              <LinkedInIcon className="social-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow on Instagram">
              <InstagramIcon className="social-icon" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CodeTapasya. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;