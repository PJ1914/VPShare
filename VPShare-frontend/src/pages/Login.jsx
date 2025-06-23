import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { Box, Button, Typography, Paper, TextField, Fade, Alert, InputAdornment, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Handle GitHub Auth
  const handleGitHubSuccess = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Extract the GitHub access token and store it in sessionStorage
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        sessionStorage.setItem('githubAccessToken', token);
      }
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
          </Typography>
          <Typography
            variant="body1"
            className="login-subtitle"
            sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, textAlign: { xs: 'center', sm: 'left' }, mb: { xs: 1, sm: 2 } }}
          >
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

          {/* Auth Buttons - Horizontal Alignment */}
          <motion.div
            className="auth-icons-row"
            style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', margin: '1.2rem 0 0.5rem 0' }}
            variants={formElementVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                variant="outlined"
                onClick={handleGoogleSuccess}
                className="google-auth-button"
                sx={{ minWidth: 56, width: 56, height: 56, borderRadius: '50%', p: 0, m: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Sign in with Google"
              >
                <GoogleIcon fontSize="large" />
              </Button>
            </motion.div>
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                variant="outlined"
                onClick={handleGitHubSuccess}
                className="github-auth-button"
                sx={{ minWidth: 56, width: 56, height: 56, borderRadius: '50%', p: 0, m: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Sign in with GitHub"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                className="login-input"
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'gray', mr: 1 }} />, 
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
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
              <motion.span whileHover="hover" variants={buttonHoverVariants} className="inline-block">
                <Button
                  variant="text"
                  onClick={() => setIsLogin(!isLogin)}
                  className="toggle-button"
                  startIcon={<SwitchAccountIcon />}
                >
                  {isLogin ? 'Register' : 'Login'}
                </Button>
              </motion.span>
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