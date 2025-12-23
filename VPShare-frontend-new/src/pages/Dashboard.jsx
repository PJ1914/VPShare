import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import useDashboardStore from '../store/useDashboardStore'; // New Store
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { GlowingEffect } from '../components/ui/GlowingEffect';
import {
    BookOpen, Clock, Trophy, Flame,
    ArrowRight, PlayCircle, CheckCircle,
    Code, Database, Layout, Server, Zap,
    Loader2, StickyNote, Bell, Timer, Edit3, Save, X,
    Users, MessageCircle, Share2, Award, TrendingUp, UserPlus,
    Play, Pause, RotateCcw, Bookmark, Lightbulb, Target, Video, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import axiosRetry from 'axios-retry';
// Firestore/Axios imports removed as logic is now in store
import { db } from '../config/firebase'; // Keep db for any specialized direct use if strictly needed, but store handles data.
// import { doc, getDoc } from 'firebase/firestore'; // Clean up if truly unused later.

// Configure axios-retry
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // Add navigate hook
    const { studyTimer, startTimer, pauseTimer, resetTimer, formatTime } = useTimer();

    // Use Dashboard Store
    // Use Dashboard Store - Atomic Selectors (Performance Optimization like UserProfile)
    const loading = useDashboardStore(state => state.loading);
    const stats = useDashboardStore(state => state.stats);
    const activeCourses = useDashboardStore(state => state.activeCourses);
    const recentActivity = useDashboardStore(state => state.recentActivity);
    const leaderboard = useDashboardStore(state => state.leaderboard);
    const studyBuddies = useDashboardStore(state => state.studyBuddies);
    const courseNotes = useDashboardStore(state => state.courseNotes);
    const studyReminders = useDashboardStore(state => state.studyReminders);
    const dailyTip = useDashboardStore(state => state.dailyTip);
    const courseBookmarks = useDashboardStore(state => state.courseBookmarks);
    const upcomingClasses = useDashboardStore(state => state.upcomingClasses);
    const pendingAssignments = useDashboardStore(state => state.pendingAssignments);

    // Actions
    const fetchDashboardData = useDashboardStore(state => state.fetchDashboardData);
    const saveNoteStore = useDashboardStore(state => state.saveNote);
    const deleteNoteStore = useDashboardStore(state => state.deleteNote);
    const addReminderStore = useDashboardStore(state => state.addReminder);
    const saveBookmarkStore = useDashboardStore(state => state.saveBookmark);
    const removeBookmarkStore = useDashboardStore(state => state.removeBookmark);

    // Local UI State (Modals, Inputs)
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderTime, setReminderTime] = useState('09:00');
    const [reminderCourseId, setReminderCourseId] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareAchievement, setShareAchievement] = useState(null);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [bookmarkLesson, setBookmarkLesson] = useState(null);

    // Initial Fetch
    useEffect(() => {
        if (user) {
            fetchDashboardData(user);
        }
    }, [user, fetchDashboardData]);

    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'frontend': return <Layout className="w-5 h-5" />;
            case 'backend': return <Server className="w-5 h-5" />;
            case 'databases': return <Database className="w-5 h-5" />;
            default: return <Code className="w-5 h-5" />;
        }
    };

    const getActivityIcon = (iconName, type) => {
        const iconClass = "h-5 w-5";
        const colorClass = {
            course: 'text-blue-500',
            progress: 'text-green-500',
            milestone: 'text-yellow-500',
            completion: 'text-purple-500',
            streak: 'text-orange-500',
            recommendation: 'text-indigo-500'
        }[type] || 'text-gray-500';

        const IconComponent = {
            BookOpen: BookOpen,
            Trophy: Trophy,
            Flame: Flame,
            Zap: Zap,
            CheckCircle: CheckCircle
        }[iconName] || CheckCircle;

        return <IconComponent className={`${iconClass} ${colorClass}`} />;
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return time.toLocaleDateString();
    };

    // Interactive Features Functions
    const handleQuickResume = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const handleSaveNote = async (courseId) => {
        await saveNoteStore(user, courseId, noteText);
        setEditingNote(null);
        setNoteText('');
    };

    const handleEditNote = (courseId) => {
        setEditingNote(courseId);
        setNoteText(courseNotes[courseId] || '');
    };

    const handleCancelNote = () => {
        setEditingNote(null);
        setNoteText('');
    };

    const handleDeleteNote = async (courseId) => {
        await deleteNoteStore(user, courseId);
    };

    const openReminderModal = (courseId) => {
        setReminderCourseId(courseId);
        setShowReminderModal(true);
    };

    const handleSetReminder = async () => {
        if (!reminderCourseId) return;
        await addReminderStore(user, { courseId: reminderCourseId, reminderTime, isActive: true });
        setShowReminderModal(false);
        setReminderCourseId(null);
    };

    const handleBookmarkLesson = (courseId, lessonTitle, lessonId) => {
        setBookmarkLesson({ courseId, lessonTitle, lessonId });
        setShowBookmarkModal(true);
    };

    const saveBookmark = async () => {
        if (!bookmarkLesson) return;
        await saveBookmarkStore(user, bookmarkLesson);
        setShowBookmarkModal(false);
        setBookmarkLesson(null);
    };

    const removeBookmark = async (courseId, lessonId) => {
        await removeBookmarkStore(user, courseId, lessonId);
    };

    // Stub for generateDailyTip - functionality moved to store init primarily
    const generateDailyTip = () => {
        // Optional: Could trigger a store action to rotate tip
        // For now, no-op or simple console log as it's minor
        console.log("Tip rotation requested");
    };

    // Social funcs
    const handleShareAchievement = (achievement) => {
        setShareAchievement(achievement);
        setShowShareModal(true);
    };

    const handleConnectWithBuddy = (buddyId) => {
        console.log('Connecting with buddy:', buddyId);
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
                            Welcome back, {user?.displayName || 'Developer'} 👋
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
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
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
                                </div>
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
                                    {activeCourses.some(c => c.isRecommended) && activeCourses.some(c => c.isStarted) && (
                                        <span className="ml-2 text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                            + Recommendations
                                        </span>
                                    )}
                                    {activeCourses.some(c => c.isRecommended) && !activeCourses.some(c => c.isStarted) && (
                                        <span className="ml-2 text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                            Based on your interests
                                        </span>
                                    )}
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
                                            <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                                <GlowingEffect
                                                    spread={40}
                                                    glow={true}
                                                    disabled={false}
                                                    proximity={64}
                                                    inactiveZone={0.01}
                                                    borderWidth={3}
                                                />
                                                <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group bg-white dark:bg-gray-900">
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                                                                    {getCategoryIcon(course.category)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                            {course.title}
                                                                        </h3>
                                                                        {course.isRecommended && (
                                                                            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full whitespace-nowrap">
                                                                                Recommended
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {course.isRecommended
                                                                            ? `${course.totalLessons} lessons • Popular choice`
                                                                            : `${course.completedLessons} of ${course.totalLessons} lessons completed`
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {!course.isRecommended && (
                                                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    {course.progress}%
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            {!course.isRecommended && (
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                        style={{ width: `${course.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between pt-2">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">
                                                                        {course.isRecommended ? 'Perfect for beginners' : 'Next:'}
                                                                    </span>
                                                                    {course.isRecommended ? '' : ` ${course.lastLesson}`}
                                                                </p>
                                                                <div className="flex items-center space-x-2">
                                                                    {course.isStarted && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleQuickResume(course.id)}
                                                                            className="group-hover:translate-x-1 transition-transform"
                                                                        >
                                                                            <Timer className="w-3 h-3 mr-1" />
                                                                            Quick Resume
                                                                        </Button>
                                                                    )}
                                                                    <Link to={`/courses/${course.id}`}>
                                                                        <Button size="sm" className="group-hover:translate-x-1 transition-transform">
                                                                            {course.isRecommended ? (
                                                                                <>
                                                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                                                    Start Course
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    {course.isStarted ? 'Resume' : 'Start'}
                                                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>

                                                            {/* Interactive Features Section */}
                                                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                                                                <div className="flex items-center justify-between">
                                                                    {/* Course Notes */}
                                                                    <div className="flex-1 mr-4">
                                                                        {editingNote === course.id ? (
                                                                            <div className="space-y-2">
                                                                                <textarea
                                                                                    value={noteText}
                                                                                    onChange={(e) => setNoteText(e.target.value)}
                                                                                    placeholder="Add a note about this course..."
                                                                                    className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                                                                                    rows="2"
                                                                                />
                                                                                <div className="flex space-x-2">
                                                                                    <Button size="xs" onClick={() => handleSaveNote(course.id)}>
                                                                                        <Save className="w-3 h-3 mr-1" />
                                                                                        Save
                                                                                    </Button>
                                                                                    <Button size="xs" variant="outline" onClick={handleCancelNote}>
                                                                                        <X className="w-3 h-3 mr-1" />
                                                                                        Cancel
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center space-x-2">
                                                                                <StickyNote className="w-4 h-4 text-gray-400" />
                                                                                {courseNotes[course.id] ? (
                                                                                    <>
                                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                                                                                            {courseNotes[course.id]}
                                                                                        </p>
                                                                                        <Button size="xs" variant="ghost" onClick={() => handleEditNote(course.id)}>
                                                                                            <Edit3 className="w-3 h-3" />
                                                                                        </Button>
                                                                                        <Button size="xs" variant="ghost" onClick={() => handleDeleteNote(course.id)}>
                                                                                            <X className="w-3 h-3 text-red-500" />
                                                                                        </Button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <p className="text-sm text-gray-400 italic">No notes yet</p>
                                                                                        <Button size="xs" variant="ghost" onClick={() => handleEditNote(course.id)}>
                                                                                            <Edit3 className="w-3 h-3" />
                                                                                        </Button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Study Reminder */}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
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
                            {/* Dynamic: Upcoming Live Classes */}
                            {upcomingClasses && upcomingClasses.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                                        <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center justify-between">
                                                    <div className="flex items-center text-red-500">
                                                        <Video className="w-5 h-5 mr-2" />
                                                        Live Solution Sessions
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {upcomingClasses.map(cls => (
                                                        <div key={cls.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400 font-bold text-center min-w-[50px]">
                                                                <div className="text-xs uppercase">{new Date(cls.startTime).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                                <div className="text-lg leading-none">{new Date(cls.startTime).getDate()}</div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{cls.title}</h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {cls.durationMinutes} min
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" className="w-full text-xs h-8" onClick={() => navigate('/courses/live-classes')}>
                                                        View Schedule
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}

                            {/* Dynamic: Pending Assignments */}
                            {pendingAssignments && pendingAssignments.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                                        <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center text-amber-600">
                                                    <FileText className="w-5 h-5 mr-2" />
                                                    Due Assignments
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {pendingAssignments.map(assignment => (
                                                        <div key={assignment.id || assignment._id} className="group flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/courses/assignments/${assignment.id || assignment._id}`)}>
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${new Date(assignment.dueDate) < new Date() ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                                <div className="truncate">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{assignment.title}</p>
                                                                    <p className="text-xs text-gray-500 truncate">{assignment.course} • Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}
                            <motion.div variants={itemVariants}>
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
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
                                                                <div className="mt-1">
                                                                    {getActivityIcon(activity.icon, activity.type)}
                                                                </div>
                                                                {/* Connector line */}
                                                                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 left-2.5 -z-10 last:hidden"></div>
                                                            </div>
                                                            <div className="pb-4">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {activity.action}: <span className="text-gray-600 dark:text-gray-300">{activity.target}</span>
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {formatTimeAgo(activity.timestamp)}
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
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
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
                                </div>
                            </motion.div >

                            {/* Study Timer Card */}
                            <motion.div variants={itemVariants}>
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
                                    <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                                    Focus Timer
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-xs font-mono ${studyTimer.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                    {studyTimer.isActive ? 'RUNNING' : 'PAUSED'}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center justify-center py-2">
                                                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-6 tracking-wider">
                                                    {formatTime(studyTimer.timeLeft)}
                                                </div>

                                                <div className="flex w-full gap-3">
                                                    {studyTimer.isActive ? (
                                                        <Button
                                                            onClick={pauseTimer}
                                                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                                                        >
                                                            <Pause className="w-4 h-4 mr-2" /> Pause
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={startTimer}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                            disabled={studyTimer.timeLeft === 0}
                                                        >
                                                            <Play className="w-4 h-4 mr-2" /> Start Focus
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        onClick={resetTimer}
                                                        className="px-3"
                                                        title="Reset Timer"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>

                            {/* Community & Leaderboard */}
                            <motion.div variants={itemVariants}>
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
                                    <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                                                Community
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Leaderboard */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Leaderboard</h4>
                                                    <Button variant="ghost" size="xs" className="text-indigo-600 dark:text-indigo-400">View All</Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {leaderboard.slice(0, 3).map((user, i) => (
                                                        <div key={user.id} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center">
                                                                <span className={`w-5 text-center mr-2 font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'}`}>
                                                                    {i + 1}
                                                                </span>
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium mr-3 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                                    {user.avatar}
                                                                </div>
                                                                <span className={`font-medium ${user.isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                    {user.name} {user.isCurrentUser && '(You)'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-xs font-mono text-gray-500">
                                                                <Flame className="w-3 h-3 mr-1 text-orange-500" />
                                                                {user.streak}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Study Buddies */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Study Buddies</h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {studyBuddies.map(buddy => (
                                                            <div key={buddy.id} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium text-gray-600 relative cursor-pointer hover:z-10 transition-transform hover:scale-110" title={buddy.name}>
                                                                {buddy.avatar}
                                                                {buddy.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>}
                                                            </div>
                                                        ))}
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 cursor-pointer transition-colors" onClick={() => handleConnectWithBuddy('new')}>
                                                            <UserPlus className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{studyBuddies.filter(b => b.online).length} Online</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>

                            {/* Daily Tip */}
                            {
                                dailyTip && (
                                    <motion.div variants={itemVariants}>
                                        <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                            <GlowingEffect
                                                spread={40}
                                                glow={true}
                                                disabled={false}
                                                proximity={64}
                                                inactiveZone={0.01}
                                                borderWidth={3}
                                            />
                                            <Card className="border-none shadow-sm h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center">
                                                        <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                                                        Daily Tip
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                                                                {dailyTip.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            {dailyTip.tip}
                                                        </p>
                                                        <Button variant="ghost" size="xs" onClick={generateDailyTip} className="text-amber-600 dark:text-amber-400">
                                                            New Tip
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                )
                            }

                            {/* Course Bookmarks */}
                            <motion.div variants={itemVariants}>
                                <div className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
                                    <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Bookmark className="w-5 h-5 mr-2 text-indigo-500" />
                                                    Bookmarked Lessons
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {Object.values(courseBookmarks).flat().length}
                                                </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {Object.values(courseBookmarks).flat().length > 0 ? (
                                                <div className="space-y-2">
                                                    {Object.values(courseBookmarks).flat().slice(0, 3).map((bookmark, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {bookmark.lessonTitle}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {activeCourses.find(c => c.id === bookmark.courseId)?.title}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="xs"
                                                                variant="ghost"
                                                                onClick={() => removeBookmark(bookmark.courseId, bookmark.lessonId)}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {Object.values(courseBookmarks).flat().length > 3 && (
                                                        <Button variant="ghost" size="xs" className="w-full">
                                                            View All Bookmarks
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                                    <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p>No bookmarks yet</p>
                                                    <p className="text-xs">Save important lessons to review later</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        </div >
                    </div >
                </motion.div >
            </div >

            {/* Study Reminder Modal */}
            {
                showReminderModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Set Study Reminder
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Get reminded to study {window.currentCourseForReminder?.title}
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reminder Time
                                    </label>
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowReminderModal(false);
                                            setReminderTime('09:00');
                                            window.currentCourseForReminder = null;
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bookmark Modal */}
            {
                showBookmarkModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Save Lesson Bookmark
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Lesson Title
                                    </label>
                                    <input
                                        type="text"
                                        value={bookmarkLesson?.lessonTitle || ''}
                                        readOnly
                                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Course
                                    </label>
                                    <input
                                        type="text"
                                        value={activeCourses.find(c => c.id === bookmarkLesson?.courseId)?.title || ''}
                                        readOnly
                                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        onClick={saveBookmark}
                                        className="flex-1"
                                    >
                                        <Bookmark className="w-4 h-4 mr-2" />
                                        Save Bookmark
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowBookmarkModal(false);
                                            setBookmarkLesson(null);
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
