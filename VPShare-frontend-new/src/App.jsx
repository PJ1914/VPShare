import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

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
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Nested Courses Routes */}
                        {/* Nested Courses Routes */}
                        <Route path="/courses">
                            <Route element={<CoursesLayout />}>
                                <Route index element={<CourseList />} />
                                <Route path="assignments" element={<Assignments />} />
                                <Route path="projects" element={<Projects />} />
                                <Route path="quizzes" element={<Quizzes />} />
                            </Route>
                            <Route path=":id" element={<CourseDetail />} />
                        </Route>

                        <Route path="/playground" element={<Playground />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/prativeda" element={<Prativeda />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/payment/:plan" element={<Payment />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
