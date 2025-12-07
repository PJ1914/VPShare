import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimerProvider } from './contexts/TimerContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './pages/Dashboard';
import CoursesLayout from './pages/CoursesLayout';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';

import Playground from './pages/Playground';
import UserProfile from './pages/UserProfile';
import Assignments from './pages/Assignments';
import Projects from './pages/Projects';
import Quizzes from './pages/Quizzes';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import Prativeda from './pages/Prativeda';

// Placeholder components for routes
const NotFound = () => <div className="p-8 text-center text-2xl">404 - Page Not Found</div>;

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TimerProvider>
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
                                <Route path="projects" element={<Projects />} />
                                <Route path="quizzes" element={<Quizzes />} />
                                <Route path=":id" element={<CourseDetail />} />
                            </Route>

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

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                </TimerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
