import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, Home, Code, BookOpen, Trophy, LayoutDashboard, Video, FileText, Sparkles, Rocket, CreditCard } from 'lucide-react';
import logoImg from '../../assets/CT Logo-2.png';

const Footer = () => {
    const footerSections = [
        {
            title: 'Explore',
            links: [
                { name: 'Home', path: '/', icon: Home },
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'All Courses', path: '/courses', icon: BookOpen },
                { name: 'Hackathons', path: '/hackathons', icon: Trophy },
                { name: 'Playground', path: '/playground', icon: Code },
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Live Classes', path: '/courses/live-classes', icon: Video },
                { name: 'Assignments', path: '/courses/assignments', icon: FileText },
                { name: 'Prativeda AI', path: '/prativeda', icon: Sparkles },
                { name: 'Projects', path: '/courses/projects', icon: Rocket },
                { name: 'Pricing Plans', path: '/payment', icon: CreditCard },
            ]
        },
        {
            title: 'Company & Legal',
            links: [
                { name: 'About Us', path: '/about' },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-conditions' },
                { name: 'Refund Policy', path: '/refund-policy' },
                { name: 'Contact Support', path: 'mailto:support@codetapasya.com', icon: Mail },
            ]
        },
    ];

    const socialLinks = [
        {
            name: 'GitHub',
            url: 'https://github.com/CodeTapasya',
            icon: Github,
            color: 'hover:text-gray-900 dark:hover:text-white'
        },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/company/code-tapasya/',
            icon: Linkedin,
            color: 'hover:text-blue-600'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/code_tapasya?igsh=MW1uYTg4amQzZ2F5Yw==',
            icon: Instagram,
            color: 'hover:text-pink-600'
        },
    ];

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <footer className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={itemVariants}
                        className="lg:col-span-2"
                    >
                        <Link to="/" className="flex items-center space-x-2 group mb-3 sm:mb-4">
                            <motion.img
                                src={logoImg}
                                alt="CodeTapasya"
                                className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            />
                            <span className="text-base sm:text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                CodeTapasya
                            </span>
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm leading-relaxed">
                            Master coding through structured learning and real-world challenges.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-1.5 sm:p-2 md:p-2.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:scale-110 hover:shadow-md`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.a>
                            ))}
                            <motion.a
                                href="mailto:support@codetapasya.com"
                                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all hover:scale-110 hover:shadow-md"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Footer Links Sections */}
                    {footerSections.map((section, idx) => (
                        <motion.div
                            key={section.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-3 md:mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group"
                                        >
                                            {link.icon && (
                                                <link.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                            <span className="group-hover:translate-x-0.5 transition-transform">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Bottom */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={itemVariants}
                    transition={{ delay: 0.3 }}
                    className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                            © {new Date().getFullYear()} CodeTapasya. All rights reserved.
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 flex items-center">
                            Made with <span className="text-red-500 mx-1 animate-pulse">❤️</span> for developers
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
