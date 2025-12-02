import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, FileText, FolderGit2, BrainCircuit, Crown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CourseSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const links = [
        { name: 'All Courses', path: '/courses', icon: BookOpen, end: true },
        { name: 'Assignments', path: '/courses/assignments', icon: FileText },
        { name: 'Projects', path: '/courses/projects', icon: FolderGit2 },
        { name: 'Quizzes', path: '/courses/quizzes', icon: BrainCircuit },
    ];

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-5rem)] sticky top-20 hidden lg:flex flex-col overflow-y-auto z-40 shadow-sm"
            initial={{ width: 72 }}
            animate={{ width: isExpanded ? 256 : 72 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="p-3 flex-1">
                <div className="h-8 mb-6 flex items-center px-2">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.h2
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                            >
                                Learning Hub
                            </motion.h2>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex justify-center"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="space-y-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={({ isActive }) => cn(
                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <link.icon className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-colors",
                                        !isExpanded && "mx-auto"
                                    )} />

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="ml-3 whitespace-nowrap overflow-hidden"
                                            >
                                                {link.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Active Indicator for Collapsed State */}
                                    {!isExpanded && (
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 w-1 rounded-r-full transition-all",
                                                isActive ? "bg-blue-600" : "bg-transparent"
                                            )}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-800">
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm">Pro Plan</h3>
                                <Crown className="w-4 h-4 text-yellow-300" />
                            </div>
                            <p className="text-xs text-purple-100 mb-3 leading-relaxed">
                                Get unlimited access to all courses and features.
                            </p>
                            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center justify-center group">
                                Upgrade Now
                                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-full aspect-square flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:shadow-lg transition-shadow"
                            title="Upgrade to Pro"
                        >
                            <Crown className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CourseSidebar;
