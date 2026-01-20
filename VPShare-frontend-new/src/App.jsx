import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimerProvider } from './contexts/TimerContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './pages/Dashboard';
import CoursesLayout from './pages/CoursesLayout';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';

import Playground from './pages/Playground';
import UserProfile from './pages/UserProfile';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Leaderboard from './pages/Leaderboard';
import AdminGrading from './pages/AdminGrading';
import Projects from './pages/Projects';
import Quizzes from './pages/Quizzes';
import LiveClasses from './pages/LiveClasses';
import LiveClassSession from './pages/LiveClassSession';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import Prativeda from './pages/Prativeda';
import Admin from './pages/Admin';
import AdminCourses from './pages/AdminCourses';
import LessonView from './pages/LessonView';

import HackathonsPage from './pages/HackathonsPage';
import HackathonDetailPage from './pages/HackathonDetailPage';
import RegistrationPage from './pages/RegistrationPage';
import TeamManagementPage from './pages/TeamManagementPage';
import LeaderboardPage from './pages/LeaderboardPage';
import JudgingDashboard from './pages/JudgingDashboard';

import SubmissionPage from './pages/SubmissionPage';

import GlobalScrollbar from './components/ui/GlobalScrollbar';

// Placeholder components for routes
const NotFound = () => <div className="p-8 text-center text-2xl">404 - Page Not Found</div>;

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TimerProvider>
                    <GlobalScrollbar />
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />

                            {/* Nested Courses Routes */}
                            <Route path="/courses" element={
                                <PrivateRoute>
                                    <CoursesLayout />
                                </PrivateRoute>
                            }>
                                <Route index element={<CourseList />} />
                                <Route path="assignments" element={<Assignments />} />
                                <Route path="assignments/:id" element={<AssignmentDetail />} />
                                <Route path="projects" element={<Projects />} />
                                <Route path="quizzes" element={<Quizzes />} />
                                <Route path="live-classes" element={<LiveClasses />} />
                                <Route path="live-classes/:id" element={<LiveClassSession />} />
                                <Route path=":id" element={<CourseDetail />} />
                            </Route>
                            <Route path="/courses/:courseId/learn" element={
                                <PrivateRoute>
                                    <LessonView />
                                </PrivateRoute>
                            } />

                            <Route path="/playground" element={
                                <PrivateRoute>
                                    <Playground />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <UserProfile />
                                </PrivateRoute>
                            } />
                            <Route path="/settings" element={
                                <PrivateRoute>
                                    <Settings />
                                </PrivateRoute>
                            } />
                            <Route path="/prativeda" element={
                                <PrivateRoute>
                                    <Prativeda />
                                </PrivateRoute>
                            } />
                            <Route path="/courses/assignments/:id/leaderboard" element={
                                <PrivateRoute>
                                    <Leaderboard />
                                </PrivateRoute>
                            } />
                            <Route path="/admin" element={<Navigate to="/admin/assignments" replace />} />
                            <Route path="/admin/assignments" element={
                                <AdminRoute>
                                    <Admin defaultTab="assignments" />
                                </AdminRoute>
                            } />
                            <Route path="/admin/courses" element={
                                <AdminRoute>
                                    <AdminCourses />
                                </AdminRoute>
                            } />
                            <Route path="/admin/hackathons" element={
                                <AdminRoute>
                                    <Admin defaultTab="hackathons" hideTabs={true} />
                                </AdminRoute>
                            } />
                            <Route path="/admin/grading/:assignmentId/:studentId" element={
                                <AdminRoute>
                                    <AdminGrading />
                                </AdminRoute>
                            } />
                            <Route path="/payment" element={
                                <PrivateRoute>
                                    <Payment />
                                </PrivateRoute>
                            } />
                            <Route path="/payment/:plan" element={
                                <PrivateRoute>
                                    <Payment />
                                </PrivateRoute>
                            } />

                            {/* Hackathon Routes */}
                            <Route path="/hackathons" element={<HackathonsPage />} />
                            <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
                            <Route path="/hackathons/:id/leaderboard" element={<LeaderboardPage />} />

                            <Route path="/hackathons/:id/register" element={
                                <PrivateRoute>
                                    <RegistrationPage />
                                </PrivateRoute>
                            } />
                            <Route path="/hackathons/:id/team" element={
                                <PrivateRoute>
                                    <TeamManagementPage />
                                </PrivateRoute>
                            } />
                            <Route path="/hackathons/:id/submissions/create" element={
                                <PrivateRoute>
                                    <SubmissionPage />
                                </PrivateRoute>
                            } />

                            <Route path="/hackathons/:id/judge" element={
                                <AdminRoute>
                                    <JudgingDashboard />
                                </AdminRoute>
                            } />



                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                </TimerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
