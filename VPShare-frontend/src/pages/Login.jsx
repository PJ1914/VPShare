import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Button, Typography, Paper, TextField, Fade } from '@mui/material';
import '../styles/Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Placeholder for Google Auth success handler
  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Auth Success:', credentialResponse);
    // Replace with your AuthContext or backend API call (e.g., via src/services/)
    // Example: navigate to /dashboard on success
  };

  // Placeholder for Google Auth error handler
  const handleGoogleError = () => {
    console.log('Google Auth Failed');
  };

  // Placeholder for manual login/register
  const handleManualSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? 'Login' : 'Register', { email, password });
    // Replace with your AuthContext or backend API call
  };

  return (
    <Box className="login-container">
      <Fade in={true} timeout={1000}>
        <Paper elevation={6} className="login-card">
          <Typography variant="h4" className="login-title">
            {isLogin ? 'Welcome Back' : 'Join VPShare'}
          </Typography>
          <Typography variant="body1" className="login-subtitle">
            Sign in with Google to start your web development journey
          </Typography>

          {/* Google Auth Button */}
          <Box className="google-auth">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text={isLogin ? 'signin_with' : 'signup_with'}
            />
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