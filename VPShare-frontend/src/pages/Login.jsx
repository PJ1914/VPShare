import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { Box, Button, Typography, Paper, TextField, Fade, Alert, InputAdornment, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleIcon from '@mui/icons-material/Google'; // MUI icon for Google Auth
import EmailIcon from '@mui/icons-material/Email'; // MUI icon for email field
import LockIcon from '@mui/icons-material/Lock'; // MUI icon for password field
import LoginIcon from '@mui/icons-material/Login'; // MUI icon for submit button
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount'; // MUI icon for toggle button
import HomeIcon from '@mui/icons-material/Home'; // MUI icon for home link
import GitHubIcon from '@mui/icons-material/GitHub'; // MUI icon for GitHub Auth
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import '../styles/Login.css';

// Animation variants for the login card
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Animation variants for form elements
const formElementVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// Animation variants for buttons
const buttonHoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Animation variants for error message
const errorVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Set page title
    document.title = isLogin ? 'Login - CodeTapasya' : 'Register - CodeTapasya';
  }, [isLogin]);
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
  };  // Handle Google Auth
  const handleGoogleSuccess = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Handle GitHub Auth
  const handleGitHubSuccess = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('repo');
      const result = await signInWithPopup(auth, provider);
      
      // Extract the GitHub access token and store it in sessionStorage
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        sessionStorage.setItem('githubAccessToken', token);
      }
      navigate('/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign in with GitHub');
      }
    } finally {
      setIsLoading(false);
    }
  };  // Handle manual login/register
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
      navigate('/dashboard');
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
        title="Login - CodeTapasya | Sign In to Your Account"
        description="Sign in to your CodeTapasya account to access premium programming courses, track your progress, and continue your coding journey."
        canonical="https://codetapasya.com/login"
        ogImage="https://codetapasya.com/og-login.jpg"
        keywords="login, sign in, CodeTapasya login, programming courses access, student portal"
        noIndex={true}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Login",
          "description": "Sign in to your CodeTapasya account to access courses and track your learning progress.",
          "url": "https://codetapasya.com/login",
          "isPartOf": {
            "@type": "WebSite",
            "name": "CodeTapasya",
            "url": "https://codetapasya.com"
          }
        }}
      />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Paper
          elevation={6}
          className="login-card"
          sx={{
            width: { xs: '100%', sm: '400px' },
            maxWidth: '100%',
            mx: 'auto',
            borderRadius: { xs: 0, sm: '14px' },
            boxShadow: { xs: 'none', sm: '0 4px 24px rgba(16,185,129,0.13), 0 1.5px 4px rgba(30,64,175,0.08)' },
            p: { xs: 2, sm: 4 }
          }}
        >
          <Typography
            variant="h4"
            className="login-title"
            sx={{ fontSize: { xs: '1.3rem', sm: '2rem' }, textAlign: { xs: 'center', sm: 'left' } }}
          >
            {isLogin ? 'Welcome Back' : 'Join CodeTapasya'}
          </Typography>          <Typography
            variant="body1"
            className="login-subtitle"
            sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, textAlign: { xs: 'center', sm: 'center' }, mb: { xs: 1, sm: 2 } }}
          >
            {isLogin ? 'Sign in to continue your web development journey' : 'Create your account and start learning'}
          </Typography>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Buttons - Horizontal Alignment */}
          <motion.div
            className="auth-icons-row"
            style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', margin: '1.2rem 0 0.5rem 0' }}
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                variant="outlined"
                onClick={handleGoogleSuccess}
                disabled={isLoading}
                className="google-auth-button"
                sx={{ 
                  minWidth: 56, 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  p: 0, 
                  m: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: isLoading ? 0.6 : 1
                }}
                aria-label={isLoading ? 'Signing in...' : 'Sign in with Google'}
              >
                <GoogleIcon fontSize="large" />
              </Button>
            </motion.div>
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                variant="outlined"
                onClick={handleGitHubSuccess}
                disabled={isLoading}
                className="github-auth-button"
                sx={{ 
                  minWidth: 56, 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  p: 0, 
                  m: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: isLoading ? 0.6 : 1
                }}
                aria-label={isLoading ? 'Signing in...' : 'Sign in with GitHub'}
              >
                <GitHubIcon fontSize="large" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Manual Login/Register Form */}
          <Box
            component="form"
            onSubmit={handleManualSubmit}
            className="manual-form"
            sx={{
              width: { xs: '100%', sm: '80%' },
              mx: 'auto',
              gap: { xs: 1, sm: 2 }
            }}
          >
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                fullWidth
                margin="normal"
                variant="outlined"
                className="login-input"
                required
                disabled={isLoading}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                autoComplete="email"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'gray', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </motion.div>
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >              <TextField
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
                margin="normal"
                variant="outlined"
                className="login-input"
                required
                disabled={isLoading}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                autoComplete={isLogin ? "current-password" : "new-password"}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'gray', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((show) => !show)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                        tabIndex={0}
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1rem', sm: '1rem' }
                  }
                }}
              />
            </motion.div>
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >              <motion.div whileHover="hover" variants={buttonHoverVariants}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  className="submit-button"
                  fullWidth
                  startIcon={<LoginIcon />}
                  aria-label={isLoading ? 'Processing...' : (isLogin ? 'Login to your account' : 'Create new account')}
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                </Button>
              </motion.div>
            </motion.div>
          </Box>

          {/* Toggle Login/Register */}
          <motion.div
            className="toggle-text"
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >            <Typography variant="body2">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <motion.span whileHover="hover" variants={buttonHoverVariants} className="inline-block">
                <Button
                  variant="text"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setValidationErrors({});
                    setEmail('');
                    setPassword('');
                  }}
                  disabled={isLoading}
                  className="toggle-button"
                  startIcon={<SwitchAccountIcon />}
                  aria-label={isLogin ? 'Switch to register form' : 'Switch to login form'}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Button>
              </motion.span>
            </Typography>
          </motion.div>

          {/* Legal notice for registration */}
          {!isLogin && (
            <motion.div
              className="legal-notice-signup"
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.75 }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                By signing up, you agree to our{' '}
                <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981' }}>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981' }}>
                  Privacy Policy
                </Link>
              </Typography>
            </motion.div>
          )}

          {/* Link to Home */}
          <motion.div
            className="home-link"
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <Typography variant="body2">
              <motion.span whileHover="hover" variants={buttonHoverVariants} className="inline-block">
                <Link to="/">
                  <HomeIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Back to Home
                </Link>
              </motion.span>
            </Typography>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default Login;