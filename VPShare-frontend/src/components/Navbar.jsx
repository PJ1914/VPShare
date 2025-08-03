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
      } else {
        setIsAdmin(false);
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
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
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

  return (
    <motion.nav 
      className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        {/* Mobile Menu Button - Left Side */}
        <motion.button
          className="navbar-mobile-menu-btn"
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

        {/* Logo Section - Center for mobile/tablet, Left for desktop */}
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

        {/* Mobile Profile Section - Right side for mobile/tablet */}
        <div className="mobile-profile-section">
          {user ? (
            <>
              {/* Mobile Profile Avatar */}
              <div className="mobile-profile-dropdown" ref={profileDropdownRef}>
                <motion.button
                  className="mobile-profile-trigger"
                  onClick={toggleProfileDropdown}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="mobile-profile-avatar"
                    onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      className="mobile-dropdown-menu"
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
              <Link to="/login" className="mobile-login-btn">
                <LoginIcon />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Button - Remove from here */}
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          {/* Mobile Navigation Backdrop */}
          <div
            className="mobile-nav-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
          />
          
          {/* Mobile Navigation Sidebar */}
          <div
            className="mobile-nav"
            ref={mobileMenuRef}
            style={{ 
              position: 'fixed',
              top: '70px',
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              background: 'white',
              zIndex: 1051,
              boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.2)',
              borderLeft: '2px solid #6366f1'
            }}
          >
              <div className="mobile-nav-content" style={{ background: 'white', minHeight: '100%' }}>
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
                  <a
                    href="/"
                    style={{ 
                      display: 'block', 
                      padding: '15px 20px', 
                      color: 'black', 
                      backgroundColor: 'lightblue',
                      textDecoration: 'none',
                      margin: '5px 0',
                      borderRadius: '8px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🏠 Home
                  </a>

                  <a
                    href="/dashboard"
                    style={{ 
                      display: 'block', 
                      padding: '15px 20px', 
                      color: 'black', 
                      backgroundColor: 'lightgreen',
                      textDecoration: 'none',
                      margin: '5px 0',
                      borderRadius: '8px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </a>

                  <a
                    href="/courses"
                    style={{ 
                      display: 'block', 
                      padding: '15px 20px', 
                      color: 'black', 
                      backgroundColor: 'lightyellow',
                      textDecoration: 'none',
                      margin: '5px 0',
                      borderRadius: '8px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📚 Courses
                  </a>

                  <a
                    href="/playground"
                    style={{ 
                      display: 'block', 
                      padding: '15px 20px', 
                      color: 'black', 
                      backgroundColor: 'lightcoral',
                      textDecoration: 'none',
                      margin: '5px 0',
                      borderRadius: '8px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💻 Playground
                  </a>

                  <a
                    href="/hackathon"
                    style={{ 
                      display: 'block', 
                      padding: '15px 20px', 
                      color: 'white', 
                      backgroundColor: 'orange',
                      textDecoration: 'none',
                      margin: '5px 0',
                      borderRadius: '8px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🚀 Hackathon
                  </a>
                </nav>
            </div>
          </div>
          </>
        )}
    </motion.nav>
  );
}

