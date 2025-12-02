import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, User, LogOut,
    BookOpen, Code, LayoutDashboard, Home,
    Settings, ChevronDown, Bell, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import logoImg from '../../assets/CT Logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const profileRef = useRef(null);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses', path: '/courses', icon: BookOpen },
        { name: 'Playground', path: '/playground', icon: Code },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsProfileOpen(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <motion.nav
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                isScrolled
                    ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-1 group">
                            <motion.img
                                src={logoImg}
                                alt="CodeTapasya"
                                className="h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hidden sm:block">
                                CodeTapasya
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered with Animated Pill */}
                    <div className="hidden md:flex items-center space-x-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2",
                                        active
                                            ? "text-blue-600 dark:text-blue-300"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="navbar-active-pill"
                                            className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <div className="flex items-center space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors relative cursor-pointer"
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                                    </motion.button>

                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 focus:outline-none group cursor-pointer"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white dark:ring-gray-900 group-hover:ring-blue-200 dark:group-hover:ring-blue-900 transition-all"
                                        >
                                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                        </motion.div>
                                        <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", isProfileOpen && "transform rotate-180")} />
                                    </button>
                                </div>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "top right" }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
                                        >
                                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.displayName || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User className="mr-3 h-4 w-4" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/prativeda"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <FileText className="mr-3 h-4 w-4" />
                                                    Resume Maker
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Settings className="mr-3 h-4 w-4" />
                                                    Settings
                                                </Link>
                                            </div>
                                            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button size="sm" className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden space-x-4">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        "block px-4 py-3 rounded-xl text-base font-medium transition-all",
                                        isActive(link.path)
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex items-center">
                                        <link.icon className="w-5 h-5 mr-3" />
                                        {link.name}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <div className="pt-4 pb-6 border-t border-gray-200 dark:border-gray-800 px-4">
                                <div className="flex items-center mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-semibold text-gray-800 dark:text-white">{user.displayName || 'User'}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 mr-3" />
                                            Profile
                                        </div>
                                    </Link>
                                    <Link
                                        to="/prativeda"
                                        className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 mr-3" />
                                            Resume Maker
                                        </div>
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <Settings className="w-5 h-5 mr-3" />
                                            Settings
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <LogOut className="w-5 h-5 mr-3" />
                                            Sign out
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-4">
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center py-3">Sign In</Button>
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full justify-center py-3 shadow-lg">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
