// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth'; // Ensure Firebase auth is initialized

function PrivateRoute({ children }) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    // You can render a loading spinner or message here
    return <div>Loading authentication...</div>;
  }

  if (error) {
    // Handle authentication error
    console.error("Authentication error:", error);
    return <div>Error: {error.message}</div>; // Or redirect to an error page
  }

  if (!user) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // User is logged in, render the protected content
}

export default PrivateRoute;