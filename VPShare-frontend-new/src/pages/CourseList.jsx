import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    BookOpen, Clock, Star, Search,
    Layout, Server, Database, Code,
    CheckCircle, PlayCircle, Loader2, Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { courseService } from '../services/courseService';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { SkeletonCourseCard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';
import { getSEOForPage } from '../utils/seo';

// Configure axios-retry
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

const CourseList = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [error, setError] = useState(null);
    const [debugLog, setDebugLog] = useState([]);
    const [showDebug, setShowDebug] = useState(false);

    const addLog = (msg, data) => {
        console.log(`[CourseList] ${msg}`, data);
        setDebugLog(prev => [...prev, { time: new Date().toISOString(), msg, data: data ? JSON.stringify(data, null, 2) : null }]);
    };

    const categories = [
        { id: 'All', name: 'All Courses', icon: BookOpen },
        { id: 'Frontend', name: 'Frontend', icon: Layout },
        { id: 'Backend', name: 'Backend', icon: Server },
        { id: 'Databases', name: 'Databases', icon: Database },
        { id: 'Programming Languages', name: 'Programming', icon: Code }
    ];

    const CATEGORY_MAP = {
        html: 'Frontend', css: 'Frontend', javascript: 'Frontend', react: 'Frontend',
        node: 'Backend', express: 'Backend', api: 'Backend',
        sql: 'Databases', database: 'Databases', mongodb: 'Databases',
        python: 'Programming Languages', java: 'Programming Languages'
    };

    const mapCourseToCategory = (courseId, title = '') => {
        const source = title ? title.toLowerCase() : courseId.toLowerCase();
        for (const [key, category] of Object.entries(CATEGORY_MAP)) {
            if (source.includes(key)) return category;
        }
        return 'Programming Languages';
    };

    const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

    const getAuthHeaders = async () => {
        try {
            if (!user) throw new Error('Not authenticated');
            const token = await user.getIdToken(true);
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    };

    const makeAuthenticatedRequest = async (url, options = {}, retries = 2) => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(url, { headers, ...options });
            return response;
        } catch (error) {
            console.error(`API request failed for ${url}:`, error);
            if (error.response?.status === 403) {
                if (retries > 0) {
                    addLog(`Retrying 403 request to ${url}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return makeAuthenticatedRequest(url, options, retries - 1);
                }
            }
            throw error;
        }
    };

    useEffect(() => {
        const fetchCoursesAndProgress = async () => {
            try {
                setLoading(true);
                setError(null);
                setDebugLog([]);

                // USE DIRECT FIREBASE SERVICE INSTEAD OF API
                // This ensures admin changes are immediately visible
                const coursesData = await courseService.listCourses();
                // Filter for published or if admin shows all? Usually users see published.
                // Assuming listCourses returns all, we filter client side for now.
                // If you want user to see DRAFTS, remove the filter.
                // For now, let's show published only for regular users, but we don't have role check easily here without deep context.
                // Let's show ALL for now as per "appear in /courses page" request usually implies immediately seeing it.
                // Or filter by status 'published'.

                const publishedCourses = coursesData.filter(c => c.status === 'published');

                // If fallback to empty if no published
                const displayCourses = publishedCourses.length > 0 ? publishedCourses : [];

                setCourses(displayCourses);

                // Mock progress for now since we bypassed the API
                // or fetch progress separately if needed.
                // setCourses(coursesWithProgress);

                setLoading(false);
                return;

                /* 
                // OLD API LOGIC COMMENTED OUT
                const apiUrl = import.meta.env.VITE_COURSES_API_URL;
                // ...
                */
            } catch (error) {
                console.error('Fetch failed', error);
                setError('Failed to load courses');
                setLoading(false);
            }
        };

        fetchCoursesAndProgress();
    }, [user]);

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.icon : Code;
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const currentCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Courses</h1>
                        <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, index) => (
                            <SkeletonCourseCard key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 relative">
            <SEO {...getSEOForPage('courses')} />
            <button
                onClick={() => setShowDebug(!showDebug)}
                className="fixed bottom-4 right-4 z-50 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800"
                title="Toggle Debug Info"
            >
                <Bug className="w-5 h-5" />
            </button>

            {showDebug && (
                <div className="fixed inset-x-0 bottom-0 h-96 bg-gray-900 text-green-400 p-4 z-40 overflow-y-auto font-mono text-xs border-t-2 border-green-500 shadow-2xl">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                        <h3 className="font-bold text-lg">Debug Console</h3>
                        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">Close</button>
                    </div>
                    <div className="space-y-1">
                        {debugLog.map((log, i) => (
                            <div key={i} className="border-b border-gray-800 pb-1 mb-1">
                                <span className="text-gray-500">[{log.time.split('T')[1].split('.')[0]}]</span> <span className="font-bold">{log.msg}</span>
                                {log.data && <pre className="mt-1 text-gray-300 overflow-x-auto">{log.data}</pre>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Explore Courses
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 space-y-4"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                    >
                        <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">Error Loading Courses</h3>
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                        >
                            Retry
                        </Button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="wait">
                        {currentCourses.length === 0 ? (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="col-span-full text-center py-12"
                            >
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {courses.length === 0 ? "The API returned no courses." : "Try adjusting your filters or search term"}
                                </p>
                            </motion.div>
                        ) : (
                            currentCourses.map((course) => {
                                const Icon = getCategoryIcon(course.category);
                                const isStarted = course.progress > 0;
                                const isLocked = !user?.isPremium && course.isPremium;

                                return (
                                    <motion.div
                                        key={`${course.id}-${selectedCategory}`}
                                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: -20, opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        layout
                                    >
                                        <Card className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group bg-white dark:bg-gray-900 h-full flex flex-col">
                                            <div className="relative h-36 overflow-hidden">
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>

                                                {/* Premium Badge */}
                                                {course.isPremium && (
                                                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1 z-10">
                                                        <Shield className="w-3 h-3 fill-current" />
                                                        PREMIUM
                                                    </div>
                                                )}

                                                {isStarted && (
                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <div className="flex items-center justify-between text-white text-xs mb-1">
                                                            <span>Progress</span>
                                                            <span>{course.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/30 rounded-full h-1.5">
                                                            <div
                                                                className="bg-white h-1.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${course.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <CardContent className="p-4 flex-1 flex flex-col">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                                                        <Icon className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {course.category}
                                                    </span>
                                                </div>

                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {course.title}
                                                </h3>

                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                                    {course.description}
                                                </p>

                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                        <span className="font-medium">{course.rating}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>{course.totalModules} modules</span>
                                                    </div>
                                                </div>

                                                <Link to={`/courses/${course.id}/learn`} className="w-full">
                                                    <Button
                                                        size="sm"
                                                        className={cn(
                                                            "w-full group-hover:translate-y-[-2px] transition-transform",
                                                            isLocked ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                                                        )}
                                                    >
                                                        {isLocked ? (
                                                            <>
                                                                <Lock className="w-3 h-3 mr-1" />
                                                                Unlock
                                                            </>
                                                        ) : isStarted ? (
                                                            <>
                                                                <PlayCircle className="w-3 h-3 mr-1" />
                                                                Continue
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Start
                                                            </>
                                                        )}
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default CourseList;
