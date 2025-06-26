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
import Assignments from './pages/Assignments';
import GitHubPage from './pages/GitHub';
import Projects from './pages/Projects';
import Quizzes from './pages/Quizzes';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';

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

        {/* Redirect unknown course paths */}
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

        <Route
          path="/assignments"
          element={
            <PrivateRoute>
              <Assignments />
            </PrivateRoute>
          }
        />

        <Route
          path="/github"
          element={
            <PrivateRoute>
              <GitHubPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <PrivateRoute>
              <Quizzes />
            </PrivateRoute>
          }
        />

        {/* Public Policy Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;