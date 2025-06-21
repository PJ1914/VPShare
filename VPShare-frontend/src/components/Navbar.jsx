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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.nav-links a')) {
        return;
      }
      if (
        isSidebarOpen &&
        profileItemRef.current &&
        !profileItemRef.current.contains(event.target) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
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
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isSidebarOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
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
            <li className="profile-item" ref={profileItemRef}>
              <button
                className="profile-link"
                onClick={toggleSidebar}
                aria-label="Open profile sidebar"
              >
                <div className="profile-picture-container">
                  <img
                    src={profilePicture}
                    alt="User Profile"
                    className="profile-picture"
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
              <span className="profile-sidebar-username">Profile</span>
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