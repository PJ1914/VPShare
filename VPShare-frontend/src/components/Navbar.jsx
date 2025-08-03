import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import GitHubIcon from '@mui/icons-material/GitHub';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Logo from '../assets/CT Logo.png';
import '../styles/ModernNavbar.css';

// Animation variants for modern UI
const logoVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const mobileMenuVariants = {
  hidden: { 
    opacity: 0, 
    x: '100%',
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

const navItemVariants = {
  hover: { 
    scale: 1.05,
    y: -2,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profilePicture, setProfilePicture] = useState('/default-avatar.jpg');
  
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  // Get subscription status
  const { hasSubscription, plan, loading: subscriptionLoading } = useSubscription();

  // Enhanced scroll detection for glass morphism effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Authentication and profile management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      
      // Check admin status
      if (currentUser) {
        const adminEmails = ['admin@codetapasya.com', 'your-admin-email@domain.com'];
        setIsAdmin(adminEmails.includes(currentUser.email));
        
        // Set profile picture
        if (currentUser.photoURL) {
          setProfilePicture(currentUser.photoURL);
        } else {
          setProfilePicture('/default-avatar.jpg');
        }
        
        // Mock notifications - replace with real implementation
        setNotifications([
          { id: 1, message: 'Welcome to CodeTapasya!', type: 'info', unread: true },
          { id: 2, message: 'New course available', type: 'success', unread: true }
        ]);
      } else {
        setIsAdmin(false);
        setNotifications([]);
        setProfilePicture('/default-avatar.jpg');
      }
    });

    return () => unsubscribe();
  }, []);
  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerRef.current?.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isMobileMenuOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    setIsProfileDropdownOpen(false);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(prev => !prev);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleLogout = async () => {
    try {
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;
  return (
    <motion.nav 
      className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="brand">
          <motion.div
            className="brand-container"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <img
              src={Logo}
              alt="CodeTapasya"
              className="brand-logo"
            />
            <span className="brand-text">CodeTapasya</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <nav className="nav-menu">
            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/"
                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
              >
                <HomeIcon className="nav-icon" />
                <span>Home</span>
              </Link>
            </motion.div>

            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/dashboard"
                className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <DashboardIcon className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </motion.div>

            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/courses"
                className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}
              >
                <SchoolIcon className="nav-icon" />
                <span>Courses</span>
              </Link>
            </motion.div>

            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/playground"
                className={`nav-item ${location.pathname === '/playground' ? 'active' : ''}`}
              >
                <CodeIcon className="nav-icon" />
                <span>Playground</span>
              </Link>
            </motion.div>

            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/hackathon"
                className={`nav-item hackathon ${location.pathname === '/hackathon' ? 'active' : ''}`}
              >
                <RocketLaunchIcon className="nav-icon" />
                <span>Hackathon</span>
                <div className="hackathon-badge">Live</div>
              </Link>
            </motion.div>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <>
                {/* Notifications */}
                <motion.button
                  className="notification-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* Handle notifications */}}
                >
                  <NotificationsIcon />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </motion.button>

                {/* Profile Dropdown */}
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <motion.button
                    className="profile-trigger"
                    onClick={toggleProfileDropdown}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="profile-avatar"
                      onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                    />
                    <span className="profile-name">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <KeyboardArrowDownIcon 
                      className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        className="dropdown-menu"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <div className="dropdown-header">
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="dropdown-avatar"
                            onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                          />
                          <div className="dropdown-user-info">
                            <span className="dropdown-name">
                              {user.displayName || 'User'}
                            </span>
                            <span className="dropdown-email">{user.email}</span>
                          </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="dropdown-section">
                          <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <PersonIcon />
                            <span>Profile Settings</span>
                          </Link>
                          <Link to="/assignments" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <AssignmentIcon />
                            <span>Assignments</span>
                          </Link>
                          <Link to="/projects" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <FolderIcon />
                            <span>Projects</span>
                          </Link>
                          <Link to="/quizzes" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <QuizIcon />
                            <span>Quizzes</span>
                          </Link>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="dropdown-section">
                          <Link to="/resume-builder" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <AssignmentIndIcon />
                            <span>Resume Builder</span>
                          </Link>
                          <Link to="/ats-checker" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <FindInPageIcon />
                            <span>ATS Checker</span>
                          </Link>
                          <Link to="/github" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                            <GitHubIcon />
                            <span>GitHub Integration</span>
                          </Link>
                        </div>

                        {/* Subscription Status */}
                        <div className="dropdown-divider"></div>
                        <div className="subscription-section">
                          {hasSubscription ? (
                            <div className="subscription-active">
                              <WorkspacePremiumIcon />
                              <span>Premium Active</span>
                              {plan && <span className="plan-badge">{plan.toUpperCase()}</span>}
                            </div>
                          ) : (
                            <Link 
                              to="/payment/monthly" 
                              className="upgrade-btn"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <WorkspacePremiumIcon />
                              <span>Upgrade to Premium</span>
                            </Link>
                          )}
                        </div>

                        {isAdmin && (
                          <>
                            <div className="dropdown-divider"></div>
                            <Link to="/admin" className="dropdown-item admin" onClick={() => setIsProfileDropdownOpen(false)}>
                              <AdminPanelSettingsIcon />
                              <span>Admin Panel</span>
                            </Link>
                          </>
                        )}

                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <LogoutIcon />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                <Link to="/login" className="login-btn">
                  <LoginIcon />
                  <span>Sign In</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          ref={hamburgerRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-nav"
            ref={mobileMenuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="mobile-nav-content">
              {user && (
                <div className="mobile-user-info">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="mobile-avatar"
                    onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                  />
                  <div className="mobile-user-details">
                    <span className="mobile-name">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="mobile-email">{user.email}</span>
                  </div>
                </div>
              )}

              <nav className="mobile-menu">
                <Link
                  to="/"
                  className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon />
                  <span>Home</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <DashboardIcon />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/courses"
                  className={`mobile-nav-item ${location.pathname === '/courses' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <SchoolIcon />
                  <span>Courses</span>
                </Link>

                <Link
                  to="/playground"
                  className={`mobile-nav-item ${location.pathname === '/playground' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CodeIcon />
                  <span>Playground</span>
                </Link>

                <Link
                  to="/hackathon"
                  className={`mobile-nav-item hackathon ${location.pathname === '/hackathon' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RocketLaunchIcon />
                  <span>Hackathon</span>
                  <div className="mobile-badge">Live</div>
                </Link>

                {user && (
                  <>
                    <div className="mobile-divider"></div>
                    
                    <Link
                      to="/profile"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <PersonIcon />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/assignments"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <AssignmentIcon />
                      <span>Assignments</span>
                    </Link>

                    <Link
                      to="/projects"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FolderIcon />
                      <span>Projects</span>
                    </Link>

                    <Link
                      to="/quizzes"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <QuizIcon />
                      <span>Quizzes</span>
                    </Link>

                    <div className="mobile-divider"></div>

                    <Link
                      to="/resume-builder"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <AssignmentIndIcon />
                      <span>Resume Builder</span>
                    </Link>

                    <Link
                      to="/ats-checker"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FindInPageIcon />
                      <span>ATS Checker</span>
                    </Link>

                    <Link
                      to="/github"
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GitHubIcon />
                      <span>GitHub</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="mobile-nav-item admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <AdminPanelSettingsIcon />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div className="mobile-divider"></div>

                    <div className="mobile-subscription">
                      {hasSubscription ? (
                        <div className="mobile-premium">
                          <WorkspacePremiumIcon />
                          <span>Premium Active</span>
                        </div>
                      ) : (
                        <Link
                          to="/payment/monthly"
                          className="mobile-upgrade"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <WorkspacePremiumIcon />
                          <span>Upgrade to Premium</span>
                        </Link>
                      )}
                    </div>

                    <button
                      className="mobile-nav-item logout"
                      onClick={handleLogout}
                    >
                      <LogoutIcon />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}

                {!user && (
                  <Link
                    to="/login"
                    className="mobile-nav-item login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LoginIcon />
                    <span>Sign In</span>
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;