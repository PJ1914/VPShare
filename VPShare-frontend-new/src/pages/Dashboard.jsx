import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import {
    BookOpen, Clock, Trophy, Flame,
    ArrowRight, PlayCircle, CheckCircle,
    Code, Database, Layout, Server, Zap,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';

// Fallback courses data if DB is empty
const FALLBACK_COURSES = [
    {
        id: 'web-dev-101',
        title: 'Full Stack Web Development',
        totalLessons: 24,
        category: 'frontend',
        description: 'Master the MERN stack'
    },
    {
        id: 'python-ds',
        title: 'Python for Data Science',
        totalLessons: 18,
        category: 'data-science',
        description: 'Analyze data with Python'
    },
    {
        id: 'backend-node',
        title: 'Node.js Backend Mastery',
        totalLessons: 20,
        category: 'backend',
        description: 'Build scalable APIs'
    },
    {
        id: 'react-advanced',
        title: 'Advanced React Patterns',
        totalLessons: 15,
        category: 'frontend',
        description: 'Level up your React skills'
    }
];

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        coursesInProgress: 0,
        hoursSpent: 0,
        certificates: 0,
        streak: 0
    });
    const [activeCourses, setActiveCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // 1. Fetch User Stats & Profile
                // In a real app, you might have a 'users' collection with this info
                // For now, we'll calculate it or fetch from a user profile doc
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const userData = userDocSnap.exists() ? userDocSnap.data() : {};

                // 2. Fetch User Progress (Courses in progress)
                // Assuming a structure: userProgress collection -> { userId, courseId, progress, ... }
                const progressQuery = query(
                    collection(db, 'userProgress'),
                    where('userId', '==', user.uid)
                );
                const progressSnap = await getDocs(progressQuery);

                let inProgressCount = 0;
                let completedCount = 0;
                let totalHours = userData.totalHours || 0;

                const progressMap = {};
                progressSnap.forEach(doc => {
                    const data = doc.data();
                    progressMap[data.courseId] = data;
                    if (data.progress < 100 && data.progress > 0) inProgressCount++;
                    if (data.progress === 100) completedCount++;
                });

                // 3. Map Progress to Courses
                // In a real scenario, we'd fetch course details from a 'courses' collection
                // Here we merge with our fallback list for display
                const mappedCourses = FALLBACK_COURSES.map(course => {
                    const userCourseData = progressMap[course.id];
                    if (userCourseData) {
                        return {
                            ...course,
                            progress: userCourseData.progress || 0,
                            lastLesson: userCourseData.lastLesson || 'Start your journey',
                            completedLessons: userCourseData.completedLessons || 0,
                            isStarted: true
                        };
                    }
                    return null;
                }).filter(Boolean); // Only show started courses in "Continue Learning"

                // If no courses started, show some recommendations from fallback
                const displayCourses = mappedCourses.length > 0
                    ? mappedCourses
                    : FALLBACK_COURSES.slice(0, 2).map(c => ({ ...c, progress: 0, lastLesson: 'Not started', completedLessons: 0, isStarted: false }));

                setActiveCourses(displayCourses);

                // 4. Fetch Recent Activity
                // Assuming an 'activities' collection
                const activityQuery = query(
                    collection(db, 'activities'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc'),
                    limit(5)
                );

                // Note: This query requires an index. If it fails, we'll catch it.
                let activities = [];
                try {
                    const activitySnap = await getDocs(activityQuery);
                    activities = activitySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (err) {
                    console.log("Activity query failed (likely missing index), using empty list", err);
                }

                setRecentActivity(activities);

                setStats({
                    coursesInProgress: inProgressCount,
                    hoursSpent: totalHours,
                    certificates: completedCount,
                    streak: userData.streak || 0
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'frontend': return <Layout className="w-5 h-5" />;
            case 'backend': return <Server className="w-5 h-5" />;
            case 'data-science': return <Database className="w-5 h-5" />;
            default: return <Code className="w-5 h-5" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Pagination Logic
    const [coursePage, setCoursePage] = useState(1);
    const coursesPerPage = 4;

    const totalCoursePages = Math.ceil(activeCourses.length / coursesPerPage);
    const currentActiveCourses = activeCourses.slice(
        (coursePage - 1) * coursesPerPage,
        coursePage * coursesPerPage
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <SkeletonDashboard />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.displayName?.split(' ')[0] || 'Developer'}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            You're making great progress. Keep it up!
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link to="/courses">
                            <Button>Browse Courses</Button>
                        </Link>
                        <Link to="/playground">
                            <Button variant="outline">Open Playground</Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Courses in Progress', value: stats.coursesInProgress, icon: BookOpen, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                            { label: 'Hours Spent', value: stats.hoursSpent, icon: Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                            { label: 'Certificates', value: stats.certificates, icon: Trophy, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
                            { label: 'Current Streak', value: `${stats.streak} Days`, icon: Flame, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                        ].map((stat, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
                                    <CardContent className="p-6 flex items-center space-x-4">
                                        <div className={`p-3 rounded-xl ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Continue Learning */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                                    {activeCourses.some(c => c.isStarted) ? 'Continue Learning' : 'Recommended for You'}
                                </h2>
                                <Link to="/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                    View All
                                </Link>
                            </div>

                            {activeCourses.length === 0 ? (
                                <Card className="p-8 text-center border-dashed border-2 bg-transparent">
                                    <p className="text-gray-500">No courses started yet.</p>
                                    <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">Start your first course</Link>
                                </Card>
                            ) : (
                                <>
                                    {currentActiveCourses.map((course) => (
                                        <motion.div key={course.id} variants={itemVariants}>
                                            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group bg-white dark:bg-gray-900">
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                                                                {getCategoryIcon(course.category)}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                    {course.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {course.completedLessons} of {course.totalLessons} lessons completed
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {course.progress}%
                                                        </span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${course.progress}%` }}
                                                            ></div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Next:</span> {course.lastLesson}
                                                            </p>
                                                            <Button size="sm" className="group-hover:translate-x-1 transition-transform">
                                                                {course.isStarted ? 'Resume' : 'Start'}
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                    <Pagination
                                        currentPage={coursePage}
                                        totalPages={totalCoursePages}
                                        onPageChange={setCoursePage}
                                        className="justify-start"
                                    />
                                </>
                            )}
                        </div>

                        {/* Recent Activity & Sidebar */}
                        <div className="space-y-8">
                            <motion.div variants={itemVariants}>
                                <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {recentActivity.length > 0 ? (
                                            <div className="space-y-6">
                                                {recentActivity.map((activity) => (
                                                    <div key={activity.id} className="flex space-x-3 relative">
                                                        <div className="flex flex-col items-center">
                                                            <div className="mt-1 text-blue-500">
                                                                <CheckCircle className="h-5 w-5" />
                                                            </div>
                                                            {/* Connector line */}
                                                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 left-2.5 -z-10 last:hidden"></div>
                                                        </div>
                                                        <div className="pb-4">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {activity.action}: <span className="text-gray-600 dark:text-gray-300">{activity.target}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleDateString() : 'Just now'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                                No recent activity. Start learning to see your progress here!
                                            </div>
                                        )}
                                        <Button variant="ghost" className="w-full mt-2 text-sm">View All Activity</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-none text-white shadow-lg overflow-hidden relative">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>

                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold">Weekly Challenge</h3>
                                            <Trophy className="w-5 h-5 text-yellow-300" />
                                        </div>
                                        <p className="text-purple-100 text-sm mb-6">
                                            Build a Weather App using React and OpenWeatherMap API.
                                        </p>
                                        <div className="flex items-center justify-between text-sm mb-6">
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Hard</span>
                                            <span className="font-bold text-yellow-300">500 XP</span>
                                        </div>
                                        <Button variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100 border-none font-semibold shadow-lg">
                                            Accept Challenge
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
