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
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import QuizIcon from '@mui/icons-material/Quiz';
import GitHubIcon from '@mui/icons-material/GitHub';
import Logo from '../assets/CT Logo.png';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // --- CHANGE START ---
  // Initialize profile picture with the default avatar. It will only be updated
  // after a successful check of the user's photoURL.
  const [profilePicture, setProfilePicture] = useState('/default-avatar.jpg');
  // --- CHANGE END ---
  const location = useLocation();
  const navigate = useNavigate();
  const profileItemRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Enhanced scroll detection for floating navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- CHANGE START: Refactored authentication and profile picture handling ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsMobileMenuOpen(false);
      setIsSidebarOpen(false);
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
  // Enhanced outside click handler with better performance
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Skip if clicking on nav links
      if (event.target.closest('.nav-links a')) {
        return;
      }
      
      // Handle sidebar closing
      if (
        isSidebarOpen &&
        profileItemRef.current &&
        !profileItemRef.current.contains(event.target) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
      
      // Handle mobile menu closing
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger')
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSidebarOpen, isMobileMenuOpen]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isMobileMenuOpen]);

  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isSidebarOpen]);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsSidebarOpen(false);
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
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
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
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
          {user ? (            <li className="profile-item" ref={profileItemRef}>
              <button
                className="profile-link"
                onClick={toggleSidebar}
                aria-label="Open profile sidebar"
                ref={profileButtonRef}
              >                <div className="profile-picture-container">
                  <motion.img
                    src={profilePicture}
                    alt="User Profile"
                    className="profile-picture"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onError={(e) => {
                      e.target.src = '/default-avatar.jpg';
                    }}
                  />
                </div>
              </button>
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
        </ul>        <motion.button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          ref={hamburgerRef}
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.div>
        </motion.button>
      </div>
      {/* Profile Sidebar and Backdrop */}
      {isSidebarOpen && (
        <div className="profile-sidebar-modal">
          <div
            className="profile-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            tabIndex={-1}
            aria-label="Close profile sidebar"
          ></div>
          <aside
            className="profile-sidebar"
            tabIndex={0}
            ref={sidebarRef}
            onKeyDown={e => {
              if (e.key === 'Escape') setIsSidebarOpen(false);
            }}
          >
            <div className="profile-sidebar-header">
              <img
                src={profilePicture}
                alt="User Profile"
                className="profile-sidebar-picture"
                onError={(e) => {
                  e.target.src = '/default-avatar.jpg';
                }}
              />
              <span className="profile-sidebar-username">
                {user?.displayName || user?.email?.split('@')[0] || 'Profile'}
              </span>
              <button className="profile-sidebar-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close profile sidebar">
                <CloseIcon />
              </button>
            </div>
            <ul className="profile-sidebar-list">
              <li>
                <Link to="/profile" className="profile-sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <PersonIcon className="sidebar-icon" /> Profile
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="profile-sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <AssignmentIcon className="sidebar-icon" /> Assignments
                </Link>
              </li>
              <li>
                <Link to="/projects" className="profile-sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <FolderIcon className="sidebar-icon" /> Projects
                </Link>
              </li>
              <li>
                <Link to="/quizzes" className="profile-sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <QuizIcon className="sidebar-icon" /> Quizzes
                </Link>
              </li>
              <li>
                <Link to="/github" className="profile-sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <GitHubIcon className="sidebar-icon" /> GitHub
                </Link>
              </li>
            </ul>
            <div className="profile-sidebar-separator"></div>
            <button className="profile-sidebar-link logout" onClick={() => { handleLogout(); setIsSidebarOpen(false); }}>
              <LogoutIcon className="sidebar-icon" /> Logout
            </button>
          </aside>
        </div>
      )}
    </nav>
  );
}

export default Navbar;