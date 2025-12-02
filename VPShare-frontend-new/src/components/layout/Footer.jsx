import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            CodeTapasya
                        </Link>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Empowering developers to master their craft through structured learning and practice.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/courses" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Courses</Link></li>
                            <li><Link to="/live-classes" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Live Classes</Link></li>
                            <li><Link to="/hackathon" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Hackathons</Link></li>
                            <li><Link to="/playground" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Playground</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Pricing</Link></li>
                            <li><Link to="/contact" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Contact Us</Link></li>
                            <li><Link to="/faq" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Terms of Service</Link></li>
                            <li><Link to="/refund" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} VPShare (CodeTapasya). All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
