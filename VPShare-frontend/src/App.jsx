import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Profile from './pages/UserProfile';
import Playground from './pages/Playground';
import AIChat from './components/ChatAssistant';
import Payment from './pages/Payment';
import PrivateRoute from './components/PrivateRoute';
import CourseDetail from './pages/CourseDetail';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <>
      <Navbar />
      <AIChat />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment/:plan" element={<Payment />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />

        {/* Course Detail with ErrorBoundary */}
        {/* The :id captures the course ID from the URL (e.g., /courses/123) */}
        <Route
          path="/courses/:id"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <CourseDetail />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />

        {/* Redirect unknown course paths (like /courses/) back to /courses. */}
        <Route path="/courses/*" element={<Navigate to="/courses" replace />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/playground"
          element={
            <PrivateRoute>
              <Playground />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;