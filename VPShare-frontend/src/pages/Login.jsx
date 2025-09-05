import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Box, Button, Typography, Paper, TextField, Alert, InputAdornment, IconButton, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import HomeIcon from '@mui/icons-material/Home';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Logo from '../assets/CT Logo.png';
import LoginImg from '../assets/Login-Img.png';
import '../styles/Login.css';

// Professional animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const socialButtonVariants = {
  hover: { 
    y: -2,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  tap: { 
    y: 0,
    transition: { duration: 0.1 }
  }
};

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [authCancelTimeout, setAuthCancelTimeout] = useState(null);
  const [isHackathonContext, setIsHackathonContext] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { getAndClearReturnPath } = useAuth();
  const { showNotification } = useNotification();

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is coming from hackathon context
    const returnPath = location.state?.from || 
                      new URLSearchParams(location.search).get('returnTo') || 
                      sessionStorage.getItem('loginReturnPath') || 
                      '/dashboard';
    
    const isFromHackathon = returnPath.includes('hackathon') || 
                           location.pathname.includes('hackathon') ||
                           new URLSearchParams(location.search).get('context') === 'hackathon';
    
    setIsHackathonContext(isFromHackathon);
    
    // Set page title based on context
    document.title = isFromHackathon 
      ? (isLogin ? 'Join CognitiveX Hackathon - Sign In' : 'Join CognitiveX Hackathon - Register')
      : (isLogin ? 'Login - CodeTapasya' : 'Register - CodeTapasya');
    
    // Store return path from URL params or current location state
    if (returnPath !== '/dashboard') {
      sessionStorage.setItem('loginReturnPath', returnPath);
    }
  }, [isLogin, location]);

  // Handle redirect results from OAuth providers
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in via redirect
          const returnPath = sessionStorage.getItem('auth_return_path') || getAndClearReturnPath();
          sessionStorage.removeItem('auth_return_path');
          
          showNotification({
            type: 'success',
            title: '🎉 Welcome!',
            message: `Successfully signed in with ${result.providerId.includes('google') ? 'Google' : 'GitHub'}.`,
            duration: 3000
          });
          
          navigate(returnPath);
        }
      } catch (error) {
        console.error('Redirect authentication error:', error);
        setError('Authentication failed. Please try again.');
        showNotification({
          type: 'error',
          title: 'Authentication Error',
          message: 'Failed to complete sign-in. Please try again.',
          duration: 4000
        });
      }
    };

    handleRedirectResult();
  }, [navigate, getAndClearReturnPath, showNotification]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };  // Enhanced Google Auth with timeout handling
  const handleGoogleSuccess = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    // Set timeout for auth cancellation (5 seconds instead of 15)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Authentication timed out. Please try again.');
      showNotification({
        type: 'warning',
        title: 'Authentication Timeout',
        message: 'Google sign-in took too long. Please try again.',
        duration: 4000
      });
    }, 5000);
    
    setAuthCancelTimeout(timeoutId);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account', // Force account selection for faster UX
        access_type: 'online' // Faster auth without offline access
      });
      
      // Try popup first, fallback to redirect if COOP policy blocks it
      try {
        const result = await signInWithPopup(auth, provider);
        
        clearTimeout(timeoutId);
        setAuthCancelTimeout(null);
        
        if (result.user) {
          const returnPath = getAndClearReturnPath();
          showNotification({
            type: 'success',
            title: '🎉 Welcome back!',
            message: `Successfully signed in with Google.`,
            duration: 3000
          });
          navigate(returnPath);
        }
      } catch (popupError) {
        // If popup is blocked or COOP policy interferes, use redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.message?.includes('Cross-Origin-Opener-Policy') ||
            popupError.message?.includes('window.closed')) {
          
          clearTimeout(timeoutId);
          setAuthCancelTimeout(null);
          
          showNotification({
            type: 'info',
            title: 'Redirecting...',
            message: 'Opening Google sign-in in a new tab.',
            duration: 2000
          });
          
          // Store the current path to return to after redirect
          sessionStorage.setItem('auth_return_path', getAndClearReturnPath());
          
          await signInWithRedirect(auth, provider);
          return;
        } else {
          throw popupError; // Re-throw other errors to be handled below
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setAuthCancelTimeout(null);
      
      if (error.code === 'auth/popup-closed-by-user') {
        showNotification({
          type: 'info',
          title: 'Sign-in Cancelled',
          message: 'Google sign-in was cancelled. Try again when ready.',
          duration: 3000
        });
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups and try again.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Enhanced GitHub Auth with timeout handling
  const handleGitHubSuccess = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    // Set timeout for auth cancellation (5 seconds)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('GitHub authentication timed out. Please try again.');
      showNotification({
        type: 'warning',
        title: 'Authentication Timeout',
        message: 'GitHub sign-in took too long. Please try again.',
        duration: 4000
      });
    }, 5000);
    
    setAuthCancelTimeout(timeoutId);
    
    try {
      const provider = new GithubAuthProvider();
      provider.setCustomParameters({
        allow_signup: 'true'
      });
      
      // Try popup first, fallback to redirect if COOP policy blocks it
      try {
        const result = await signInWithPopup(auth, provider);
        
        clearTimeout(timeoutId);
        setAuthCancelTimeout(null);
        
        if (result.user) {
          const returnPath = getAndClearReturnPath();
          showNotification({
            type: 'success',
            title: '🎉 Welcome!',
            message: `Successfully signed in with GitHub.`,
            duration: 3000
          });
          navigate(returnPath);
        }
      } catch (popupError) {
        // If popup is blocked or COOP policy interferes, use redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.message?.includes('Cross-Origin-Opener-Policy') ||
            popupError.message?.includes('window.closed')) {
          
          clearTimeout(timeoutId);
          setAuthCancelTimeout(null);
          
          showNotification({
            type: 'info',
            title: 'Redirecting...',
            message: 'Opening GitHub sign-in in a new tab.',
            duration: 2000
          });
          
          // Store the current path to return to after redirect
          sessionStorage.setItem('auth_return_path', getAndClearReturnPath());
          
          await signInWithRedirect(auth, provider);
          return;
        } else {
          throw popupError; // Re-throw other errors to be handled below
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setAuthCancelTimeout(null);
      
      if (error.code === 'auth/popup-closed-by-user') {
        showNotification({
          type: 'info',
          title: 'Sign-in Cancelled',
          message: 'GitHub sign-in was cancelled. Try again when ready.',
          duration: 3000
        });
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists. Try signing in with a different method.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign in with GitHub');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual login/register
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      const trimmedEmail = email.trim();
      if (isLogin) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      }
      
      const returnPath = getAndClearReturnPath();
      showNotification({
        type: 'success',
        title: `🎉 ${isLogin ? 'Welcome back!' : 'Account created!'}`,
        message: `Successfully ${isLogin ? 'signed in' : 'registered'}.`,
        duration: 3000
      });
      navigate(returnPath);
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <SEO 
        title={isHackathonContext 
          ? `${isLogin ? 'Join CognitiveX Hackathon - Sign In' : 'Join CognitiveX Hackathon - Register'} | GenAI Competition`
          : `${isLogin ? 'Sign In' : 'Create Account'} - CodeTapasya | Professional Development Platform`
        }
        description={isHackathonContext
          ? (isLogin 
              ? "Sign in to register for CognitiveX GenAI Hackathon. Join the ultimate AI competition and showcase your skills with industry experts."
              : "Create your account to participate in CognitiveX GenAI Hackathon. Learn, compete, and win amazing prizes in this AI challenge."
            )
          : (isLogin 
              ? "Sign in to your CodeTapasya account to access premium programming courses, track your progress, and continue your coding journey." 
              : "Create your CodeTapasya account to start learning programming with expert-led courses, hands-on projects, and career guidance."
            )
        }
        canonical={`https://codetapasya.com/login${!isLogin ? '?mode=register' : ''}${isHackathonContext ? '&context=hackathon' : ''}`}
        ogImage={isHackathonContext ? "https://codetapasya.com/og-hackathon.jpg" : "https://codetapasya.com/og-login.jpg"}
        keywords={isHackathonContext
          ? (isLogin 
              ? "hackathon login, CognitiveX sign in, GenAI competition, AI hackathon registration"
              : "hackathon register, CognitiveX signup, GenAI competition registration, AI hackathon join"
            )
          : (isLogin 
              ? "login, sign in, CodeTapasya login, programming courses access, student portal, developer login"
              : "register, sign up, create account, CodeTapasya registration, programming courses, learn coding"
            )
        }
        noIndex={true}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": isHackathonContext 
            ? (isLogin ? "Join CognitiveX Hackathon" : "Register for CognitiveX")
            : (isLogin ? "Sign In" : "Create Account"),
          "description": isHackathonContext
            ? "Join the CognitiveX GenAI Hackathon and compete with AI experts"
            : (isLogin 
                ? "Sign in to your CodeTapasya account to access courses and track your learning progress."
                : "Create your CodeTapasya account to start your programming journey."
              ),
          "url": `https://codetapasya.com/login${!isLogin ? '?mode=register' : ''}`,
          "isPartOf": {
            "@type": "WebSite",
            "name": isHackathonContext ? "CognitiveX Hackathon" : "CodeTapasya",
            "url": isHackathonContext ? "https://codetapasya.com/hackathon" : "https://codetapasya.com"
          }
        }}
      />
      
      <div className="login-wrapper">
        {/* Left Side - Login Form */}
        <div className="login-form-section">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper className="login-card" elevation={0}>
              {/* Brand Section */}
              <motion.div className="brand-section" variants={itemVariants}>
                <img 
                  src={Logo} 
                  alt={isHackathonContext ? "CognitiveX Hackathon" : "CodeTapasya"} 
                  className="brand-logo" 
                  style={{ 
                    height: isHackathonContext ? '60px' : '50px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
                <Typography className="brand-name">
                  {isHackathonContext ? "CognitiveX" : "CodeTapasya"}
                </Typography>
                {isHackathonContext && (
                  <Typography 
                    variant="caption" 
                    className="brand-subtitle"
                    style={{ 
                      color: '#666', 
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      marginTop: '4px'
                    }}
                  >
                    GenAI Hackathon
                  </Typography>
                )}
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants}>
                <Typography className="login-title">
                  {isHackathonContext 
                    ? (isLogin ? 'Welcome to CognitiveX!' : 'Join CognitiveX!')
                    : (isLogin ? 'Welcome Back' : 'Join CodeTapasya')
                  }
                </Typography>
                <Typography className="login-subtitle">
                  {isHackathonContext
                    ? (isLogin 
                        ? 'Where Ideas Evolve into AI - Sign in to register for the ultimate GenAI hackathon experience'
                        : 'Where Ideas Evolve into AI - Create your account to participate in the GenAI revolution'
                      )
                    : (isLogin 
                        ? 'Sign in to continue your professional development journey' 
                        : 'Create your account and start building your career in tech'
                      )
                  }
                </Typography>
              </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2'
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Authentication */}
          <motion.div className="auth-section" variants={itemVariants}>
            <Typography className="auth-label">
              {isHackathonContext 
                ? `${isLogin ? 'Sign in' : 'Sign up'} for hackathon with`
                : `Sign ${isLogin ? 'in' : 'up'} with`
              }
            </Typography>
            <div className="auth-buttons">
              <motion.div
                variants={socialButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className="google-auth-button"
                  onClick={handleGoogleSuccess}
                  disabled={isLoading}
                  aria-label={`${isLogin ? 'Sign in' : 'Sign up'} with Google`}
                >
                  <GoogleIcon />
                </Button>
              </motion.div>
              <motion.div
                variants={socialButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className="github-auth-button"
                  onClick={handleGitHubSuccess}
                  disabled={isLoading}
                  aria-label={`${isLogin ? 'Sign in' : 'Sign up'} with GitHub`}
                >
                  <GitHubIcon />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants}>
            <div className="divider">
              <span>or continue with email</span>
            </div>
          </motion.div>

          {/* Manual Form */}
          <motion.form 
            className="manual-form"
            onSubmit={handleManualSubmit}
            variants={itemVariants}
          >
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              fullWidth
              className="login-input"
              required
              disabled={isLoading}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              fullWidth
              className="login-input"
              required
              disabled={isLoading}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              autoComplete={isLogin ? "current-password" : "new-password"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                type="submit"
                className="submit-button"
                fullWidth
                disabled={isLoading}
                startIcon={isLogin ? <LoginIcon /> : <PersonAddIcon />}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </motion.div>
          </motion.form>

          {/* Toggle Section */}
          <motion.div className="toggle-section" variants={itemVariants}>
            <Typography className="toggle-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Typography>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                className="toggle-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setValidationErrors({});
                  setEmail('');
                  setPassword('');
                }}
                disabled={isLoading}
                startIcon={<SwitchAccountIcon />}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer Links */}
          <motion.div className="footer-links" variants={itemVariants}>
            {!isLogin && (
              <div className="legal-notice">
                By creating an account, you agree to our{' '}
                <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
              </div>
            )}
            
            <Link to="/" className="home-link">
              <HomeIcon />
              <span>{isHackathonContext ? 'Back to Hackathon' : 'Back to Home'}</span>
            </Link>
          </motion.div>
        </Paper>
      </motion.div>
    </div>

    {/* Right Side - Image Section */}
    <div className="login-image-section">
      <div className="decorative-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      
      <motion.div 
        className="image-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="image-illustration">
          <motion.img 
            src={LoginImg}
            alt="Professional Login Illustration"
            className="login-illustration-image"
            animate={{ 
              scale: [1, 1.02, 1],
              rotateY: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        
        <motion.h2 
          className="image-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {isHackathonContext
            ? (isLogin 
                ? 'Join the AI Revolution' 
                : 'Start Your AI Journey'
              )
            : (isLogin 
                ? 'Continue Your Journey' 
                : 'Start Your Tech Career'
              )
          }
        </motion.h2>
        
        <motion.p 
          className="image-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {isHackathonContext
            ? (isLogin 
                ? 'Access the CognitiveX GenAI Hackathon platform, register your team, and compete with the best AI innovators in a 4-day intensive bootcamp and 2-day challenge.'
                : 'Join CognitiveX GenAI Hackathon and transform your ideas into AI reality. Learn from IBM experts, compete for amazing prizes, and build the future of artificial intelligence.'
              )
            : (isLogin 
                ? 'Access your personalized learning dashboard, track progress, and continue building your programming skills with expert guidance.'
                : 'Join thousands of developers who started their journey with CodeTapasya. Learn from industry experts and build real-world projects.'
              )
          }
        </motion.p>
      </motion.div>
    </div>
  </div>
</Box>
  );
}

export default Login;