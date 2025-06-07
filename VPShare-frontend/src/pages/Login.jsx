import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Box, Button, Typography, Paper, TextField, Fade, Alert } from '@mui/material';
import '../styles/Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <Fade in={true} timeout={1000}>
        <Paper elevation={6} className="login-card">
          <Typography variant="h4" className="login-title">
            {isLogin ? 'Welcome Back' : 'Join VPShare'}
          </Typography>
          <Typography variant="body1" className="login-subtitle">
            Sign in to start your web development journey
          </Typography>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Auth Button */}
          <Box className="google-auth">
            <Button
              variant="contained"
              startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20 }} />}
              onClick={handleGoogleSuccess}
              fullWidth
              sx={{ mb: 2, backgroundColor: '#4285F4', '&:hover': { backgroundColor: '#357ae8' } }}
            >
              Sign in with Google
            </Button>
          </Box>

          {/* Manual Login/Register Form */}
          <Box component="form" onSubmit={handleManualSubmit} className="manual-form">
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
            />
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
            />
            <Button
              type="submit"
              variant="contained"
              className="submit-button"
              fullWidth
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </Box>

          {/* Toggle Login/Register */}
          <Typography variant="body2" className="toggle-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <Button
              variant="text"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </Typography>

          {/* Link to Home */}
          <Typography variant="body2" className="home-link">
            <Link to="/">Back to Home</Link>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}

export default Login;