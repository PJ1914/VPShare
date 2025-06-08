import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Box, Button, Typography, Paper, TextField, Fade, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google'; // MUI icon for Google Auth
import EmailIcon from '@mui/icons-material/Email'; // MUI icon for email field
import LockIcon from '@mui/icons-material/Lock'; // MUI icon for password field
import LoginIcon from '@mui/icons-material/Login'; // MUI icon for submit button
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount'; // MUI icon for toggle button
import HomeIcon from '@mui/icons-material/Home'; // MUI icon for home link
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle Google Auth
  const handleGoogleSuccess = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle manual login/register
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box className="login-container">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Paper elevation={6} className="login-card">
          <Typography variant="h4" className="login-title">
            {isLogin ? 'Welcome Back' : 'Join CodeTapasya'}
          </Typography>
          <Typography variant="body1" className="login-subtitle">
            Sign in to start your web development journey
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

          {/* Google Auth Button */}
          <motion.div
            className="google-auth"
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSuccess}
                fullWidth
                className="google-auth-button"
              >
                Sign in with Google
              </Button>
            </motion.div>
          </motion.div>

          {/* Manual Login/Register Form */}
          <Box component="form" onSubmit={handleManualSubmit} className="manual-form">
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                className="login-input"
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'gray', mr: 1 }} />,
                }}
              />
            </motion.div>
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                className="login-input"
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'gray', mr: 1 }} />,
                }}
              />
            </motion.div>
            <motion.div
              variants={formElementVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover="hover" variants={buttonHoverVariants}>
                <Button
                  type="submit"
                  variant="contained"
                  className="submit-button"
                  fullWidth
                  startIcon={<LoginIcon />}
                >
                  {isLogin ? 'Login' : 'Register'}
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
          >
            <Typography variant="body2">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <motion.div whileHover="hover" variants={buttonHoverVariants} display="inline-block">
                <Button
                  variant="text"
                  onClick={() => setIsLogin(!isLogin)}
                  className="toggle-button"
                  startIcon={<SwitchAccountIcon />}
                >
                  {isLogin ? 'Register' : 'Login'}
                </Button>
              </motion.div>
            </Typography>
          </motion.div>

          {/* Link to Home */}
          <motion.div
            className="home-link"
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <Typography variant="body2">
              <motion.div whileHover="hover" variants={buttonHoverVariants} display="inline-block">
                <Link to="/">
                  <HomeIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Back to Home
                </Link>
              </motion.div>
            </Typography>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default Login;