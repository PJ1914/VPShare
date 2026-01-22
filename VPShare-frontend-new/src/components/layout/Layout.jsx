import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(false);
    const isPlayground = location.pathname === '/playground';
    const isLearning = location.pathname.includes('/learn/');

    // Reset navbar visibility when route changes
    useEffect(() => {
        setShowNavbar(false);
    }, [location.pathname]);

    if (isLearning) {
        return <>{children}</>;
    }

    if (isPlayground) {
        return (
            <div className="h-screen overflow-hidden bg-gray-950">
                {/* Hover trigger area at top */}
                <div
                    className="fixed top-0 left-0 right-0 h-2 z-50"
                    onMouseEnter={() => setShowNavbar(true)}
                />

                {/* Navbar with slide animation */}
                <AnimatePresence>
                    {showNavbar && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="fixed top-0 left-0 right-0 z-40 shadow-2xl"
                            onMouseLeave={() => setShowNavbar(false)}
                        >
                            <Navbar />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fullscreen playground */}
                <main className="h-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
