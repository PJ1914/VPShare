import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import Logo from '../assets/Logo 3.png';
import '../styles/Navbar.css';

// Animation variants for the logo
const logoVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  hover: { scale: 1.1, rotate: 5, transition: { duration: 0.3 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // --- CHANGE START ---
  // Initialize profile picture with the default avatar. It will only be updated
  // after a successful check of the user's photoURL.
  const [profilePicture, setProfilePicture] = useState('/default-avatar.jpg');
  // --- CHANGE END ---
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- CHANGE START: Refactored authentication and profile picture handling ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsMobileMenuOpen(false);
      setIsDropdownOpen(false);

      // Set profile picture directly; let <img onError> handle fallback
      if (currentUser && currentUser.photoURL) {
        setProfilePicture(currentUser.photoURL);
      } else {
        setProfilePicture('/default-avatar.jpg');
      }
    });

    return () => unsubscribe();
  }, []);
  // --- CHANGE END ---

  // Close dropdown and mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.nav-links a')) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger')
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <motion.img
            src={Logo}
            alt="CodeTapasya Logo"
            className="logo-image"
            data-logged-in={user ? 'true' : 'false'}
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          />
        </Link>
        <ul
          className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}
          ref={mobileMenuRef}
        >
          {/* ... (rest of the links are unchanged) ... */}
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <HomeIcon fontSize="small" className="nav-icon" />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className={location.pathname === '/dashboard' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <DashboardIcon fontSize="small" className="nav-icon" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/courses"
              className={location.pathname === '/courses' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <SchoolIcon fontSize="small" className="nav-icon" />
              Courses
            </Link>
          </li>
          <li>
            <Link
              to="/playground"
              className={location.pathname === '/playground' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <CodeIcon fontSize="small" className="nav-icon" />
              Playground
            </Link>
          </li>
          {user ? (
            <li className="profile-item" ref={dropdownRef}>
              <button
                className="profile-link"
                onClick={toggleDropdown}
                aria-label="Toggle profile menu"
              >
                <div className="profile-picture-container">
                  <img
                    src={profilePicture}
                    alt="User Profile"
                    className="profile-picture"
                    // --- CHANGE START ---
                    // The onError handler is now just a final safety net, e.g., if the default
                    // avatar file itself is missing. The console warning here is removed
                    // to avoid duplication with the logic in useEffect.
                    onError={(e) => {
                      e.target.src = '/default-avatar.jpg';
                    }}
                    // --- CHANGE END ---
                  />
                </div>
              </button>
              {isDropdownOpen && (
                <ul className="profile-dropdown">
                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <PersonIcon fontSize="small" className="dropdown-icon" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item logout-button"
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <LogoutIcon fontSize="small" className="dropdown-icon" />
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className={location.pathname === '/login' ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                <LoginIcon fontSize="small" className="nav-icon" />
                Login
              </Link>
            </li>
          )}
        </ul>
        <button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;