import React from 'react';
import { motion } from 'framer-motion';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging
    console.error('API Error Boundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.code === 'ERR_NETWORK' || 
                            this.state.error?.message?.includes('Network Error') ||
                            this.state.error?.message?.includes('Failed to fetch');
      
      const isServerError = this.state.error?.response?.status >= 500;
      const isAuthError = this.state.error?.response?.status === 401 || 
                         this.state.error?.response?.status === 403;

      return (
        <motion.div 
          className="api-error-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            margin: '1rem'
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <WarningIcon 
              style={{ fontSize: 64, color: '#ef4444', marginBottom: '1rem' }}
            />
          </motion.div>

          <h2 style={{ 
            color: '#dc2626', 
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            {isNetworkError ? 'Connection Problem' : 
             isServerError ? 'Server Error' :
             isAuthError ? 'Authentication Required' :
             'Something went wrong'}
          </h2>

          <p style={{ 
            color: '#7f1d1d', 
            marginBottom: '2rem',
            maxWidth: '500px',
            lineHeight: '1.6'
          }}>
            {isNetworkError ? 
              'Unable to connect to our servers. Please check your internet connection and try again.' :
             isServerError ?
              'Our servers are experiencing issues. We\'re working to fix this as quickly as possible.' :
             isAuthError ?
              'You need to log in again to access this content. Your session may have expired.' :
              'An unexpected error occurred while loading this content. Please try refreshing the page.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button
              className="modern-btn modern-btn-primary"
              onClick={this.handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem'
              }}
            >
              <RefreshIcon style={{ fontSize: 18 }} />
              Try Again
            </motion.button>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/" 
                className="modern-btn modern-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  textDecoration: 'none'
                }}
              >
                <HomeIcon style={{ fontSize: 18 }} />
                Go Home
              </Link>
            </motion.div>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left',
              background: '#fff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              maxWidth: '100%',
              overflow: 'auto'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                fontSize: '0.8rem',
                color: '#6b7280',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <br /><br />
                    Component Stack:
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          {this.state.retryCount > 0 && (
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: '#6b7280' 
            }}>
              Retry attempts: {this.state.retryCount}
            </p>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withApiErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ApiErrorBoundary>
        <Component {...props} />
      </ApiErrorBoundary>
    );
  };
};

export default ApiErrorBoundary;
