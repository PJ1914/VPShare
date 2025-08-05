import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import AppsIcon from '@mui/icons-material/Apps';
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
    y: '-100%',
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  visible: { 
    opacity: 1,
    y: 0,
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

// Helper component for the dropdown menu
const ProfileDropdownMenu = ({ user, isAdmin, hasSubscription, plan, onLogout, onClose }) => (
  <motion.div
    className="dropdown-menu"
    variants={dropdownVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    {/* Header */}
    <div className="dropdown-header">
      <img
        src={user.photoURL || '/default-avatar.jpg'}
        alt="Profile"
        className="dropdown-avatar"
        onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
      />
      <div className="dropdown-user-info">
        <span className="dropdown-name">{user.displayName || 'User'}</span>
        <span className="dropdown-email">{user.email}</span>
      </div>
    </div>
    <div className="dropdown-divider"></div>

    {/* Main Links */}
    <div className="dropdown-section">
      <Link to="/profile" className="dropdown-item" onClick={onClose}>
        <PersonIcon />
        <span>Profile Settings</span>
      </Link>
      <Link to="/assignments" className="dropdown-item" onClick={onClose}>
        <AssignmentIcon />
        <span>Assignments</span>
      </Link>
      <Link to="/projects" className="dropdown-item" onClick={onClose}>
        <FolderIcon />
        <span>Projects</span>
      </Link>
      <Link to="/quizzes" className="dropdown-item" onClick={onClose}>
        <QuizIcon />
        <span>Quizzes</span>
      </Link>
    </div>
    <div className="dropdown-divider"></div>

    {/* Tools */}
    <div className="dropdown-section">
      <Link to="/resume-builder" className="dropdown-item" onClick={onClose}>
        <AssignmentIndIcon />
        <span>Resume Builder</span>
      </Link>
      <Link to="/ats-checker" className="dropdown-item" onClick={onClose}>
        <FindInPageIcon />
        <span>ATS Checker</span>
      </Link>
      <Link to="/github" className="dropdown-item" onClick={onClose}>
        <GitHubIcon />
        <span>GitHub Integration</span>
      </Link>
    </div>
    <div className="dropdown-divider"></div>

    {/* Subscription */}
    <div className="subscription-section">
      {hasSubscription ? (
        <div className="subscription-active">
          <WorkspacePremiumIcon />
          <span>Premium Active</span>
          {plan && <span className="plan-badge">{plan.toUpperCase()}</span>}
        </div>
      ) : (
        <Link to="/payment/monthly" className="upgrade-btn" onClick={onClose}>
          <WorkspacePremiumIcon />
          <span>Upgrade to Premium</span>
        </Link>
      )}
    </div>

    {/* Admin Link */}
    {isAdmin && (
      <>
        <div className="dropdown-divider"></div>
        <Link to="/admin" className="dropdown-item admin" onClick={onClose}>
          <AdminPanelSettingsIcon />
          <span>Admin Panel</span>
        </Link>
      </>
    )}
    
    <div className="dropdown-divider"></div>
    <button className="dropdown-item logout" onClick={onLogout}>
      <LogoutIcon />
      <span>Sign Out</span>
    </button>
  </motion.div>
);

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
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    setIsProfileDropdownOpen(false);
    console.log('New mobile menu state:', newState);
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
        {/* Mobile Menu Button - Left Side - FORCE VISIBLE */}
        <motion.button
          className="vp-navbar-grid-menu-btn"
          onClick={toggleMobileMenu}
          ref={hamburgerRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
          style={{
            display: 'flex !important',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.5rem',
            minWidth: '44px',
            minHeight: '44px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease',
            zIndex: 1001,
            visibility: 'visible !important',
            opacity: '1 !important'
          }}
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <AppsIcon />}
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
                      <ProfileDropdownMenu
                        user={user}
                        isAdmin={isAdmin}
                        hasSubscription={hasSubscription}
                        plan={plan}
                        onLogout={handleLogout}
                        onClose={() => setIsProfileDropdownOpen(false)}
                      />
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
                    <ProfileDropdownMenu
                      user={user}
                      isAdmin={isAdmin}
                      hasSubscription={hasSubscription}
                      plan={plan}
                      onLogout={handleLogout}
                      onClose={() => setIsProfileDropdownOpen(false)}
                    />
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

        {/* Mobile Navigation - MODERN BEAUTIFUL DESIGN - MOBILE ONLY */}
        {isMobileMenuOpen && (
          <>
            {console.log('Mobile menu is rendering with beautiful design')}
            
            {/* Mobile Grid Menu - FULL SCREEN OVERLAY - MOBILE ONLY */}
            <div
              ref={mobileMenuRef}
              className="mobile-menu-overlay"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                zIndex: 999999,
                display: 'flex',
                flexDirection: 'column',
                visibility: 'visible',
                opacity: 1,
                overflow: 'hidden',
                margin: 0,
                padding: 0
              }}
            >
              {/* Close Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '1.5rem 2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Header */}
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'white'
              }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: 0,
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Navigation
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.9,
                  fontWeight: '300'
                }}>
                  Choose where you'd like to go
                </p>
              </div>
              
              {/* Navigation Grid - Scrollable Content */}
              <div style={{
                flex: 1,
                padding: '1rem 2rem 2rem 2rem',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  {/* Home */}
                  <Link
                    to="/"
                    onClick={() => {
                      console.log('Home clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 1rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      minHeight: '120px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                    }}
                  >
                    <HomeIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                    Home
                  </Link>
                  
                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={() => {
                      console.log('Dashboard clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 1rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      minHeight: '120px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                    }}
                  >
                    <DashboardIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                    Dashboard
                  </Link>
                  
                  {/* Playground */}
                  <Link
                    to="/playground"
                    onClick={() => {
                      console.log('Playground clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 1rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      minHeight: '120px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                    }}
                  >
                    <CodeIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                    Playground
                  </Link>
                  
                  {/* Hackathon */}
                  <Link
                    to="/hackathon"
                    onClick={() => {
                      console.log('Hackathon clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 1rem',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 142, 83, 0.3))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      minHeight: '120px',
                      position: 'relative',
                      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 107, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 107, 0.3)';
                    }}
                  >
                    <RocketLaunchIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                    Hackathon
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 10px rgba(255, 107, 107, 0.4)',
                      animation: 'pulse 2s infinite'
                    }}>
                      Live
                    </div>
                  </Link>
                  
                  {/* Courses */}
                  <Link
                    to="/courses"
                    onClick={() => {
                      console.log('Courses clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 1rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      minHeight: '120px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                    }}
                  >
                    <SchoolIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                    Courses
                  </Link>
                  
                  {/* Additional Tools Section - if user is logged in */}
                  {user && (
                    <Link
                      to="/profile"
                      onClick={() => {
                        console.log('Profile clicked');
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem 1rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        minHeight: '120px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                      }}
                    >
                      <PersonIcon style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.9 }} />
                      Profile
                    </Link>
                  )}
                </div>
                
                {/* User Section */}
                {user && (
                  <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    maxWidth: '500px',
                    margin: '3rem auto 0 auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}>
                    <img
                      src={profilePicture}
                      alt="Profile"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                      onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                    />
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white', marginBottom: '0.2rem' }}>
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sign In Button */}
                {!user && (
                  <div style={{ 
                    marginTop: '3rem',
                    maxWidth: '500px',
                    margin: '3rem auto 0 auto'
                  }}>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.2rem 2rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '15px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                      }}
                    >
                      <LoginIcon style={{ fontSize: '1.3rem' }} />
                      Sign In to Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </motion.nav>
  );
}

export default Navbar;

