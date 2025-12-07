import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
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
    Play, Pause, RotateCcw, Bookmark, Lightbulb, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, setDoc, deleteDoc } from 'firebase/firestore';
import axios from 'axios';
import axiosRetry from 'axios-retry';

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

const Dashboard = () => {
    const { user } = useAuth();
    const {
        studyTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        switchMode,
        setCustomTime,
        formatTime
    } = useTimer();
    
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        coursesInProgress: 0,
        hoursSpent: 0,
        certificates: 0,
        streak: 0
    });
    const [activeCourses, setActiveCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    
    // Interactive Features State
    const [courseNotes, setCourseNotes] = useState({});
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [studyReminders, setStudyReminders] = useState([]);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderTime, setReminderTime] = useState('09:00');
    
    // Social & Community State
    const [leaderboard, setLeaderboard] = useState([]);
    const [studyBuddies, setStudyBuddies] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [discussionThreads, setDiscussionThreads] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareAchievement, setShareAchievement] = useState(null);
    
    // New Features State
    const [dailyTip, setDailyTip] = useState(null);
    const [courseBookmarks, setCourseBookmarks] = useState({});
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [bookmarkLesson, setBookmarkLesson] = useState(null);

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
                    console.log(`Retrying 403 request to ${url}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return makeAuthenticatedRequest(url, options, retries - 1);
                }
            }
            throw error;
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                const apiUrl = import.meta.env.VITE_COURSES_API_URL;
                console.log('Dashboard: Starting fetch', { apiUrl, userUid: user?.uid });

                if (!apiUrl) {
                    console.error('API configuration missing.');
                    setLoading(false);
                    return;
                }

                // 1. Fetch User Stats & Profile
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const userData = userDocSnap.exists() ? userDocSnap.data() : {};

                // 2. Fetch Actual Courses from API
                console.log(`Dashboard: Fetching courses from ${apiUrl}/courses`);
                const coursesResponse = await makeAuthenticatedRequest(`${apiUrl}/courses`);
                console.log('Dashboard: Courses response received', coursesResponse.data);

                const rawCourses = Array.isArray(coursesResponse.data)
                    ? coursesResponse.data
                    : coursesResponse.data.Items || [];

                console.log(`Dashboard: Parsed ${rawCourses.length} raw courses`);

                if (!rawCourses.length) {
                    setActiveCourses([]);
                    setLoading(false);
                    return;
                }

                // 3. Process courses with modules and progress
                const coursesWithModules = await Promise.all(
                    rawCourses.slice(0, 6).map(async (course) => { // Limit to 6 courses for dashboard
                        try {
                            const courseId = stripPrefix(course.SK);

                            let modulesCount = 0;
                            try {
                                const modulesResponse = await makeAuthenticatedRequest(`${apiUrl}/courses/${courseId}/modules`);
                                const modules = Array.isArray(modulesResponse.data)
                                    ? modulesResponse.data
                                    : modulesResponse.data.Items || [];
                                modulesCount = modules.length;
                            } catch (modErr) {
                                console.log(`Dashboard: Module fetch failed for ${courseId}`, modErr.message);
                            }

                            const category = mapCourseToCategory(courseId, course.title);

                            let progress = 0;
                            let completedModules = 0;
                            let isStarted = false;

                            try {
                                const progressDocId = `${user.uid}_${courseId}`;
                                const progressDocRef = doc(db, 'userProgress', progressDocId);
                                const progressSnap = await getDoc(progressDocRef);

                                if (progressSnap.exists()) {
                                    const progressData = progressSnap.data();
                                    completedModules = progressData.completedSections?.length || 0;
                                    progress = modulesCount > 0
                                        ? Math.min(100, Math.round((completedModules / (modulesCount * 3)) * 100))
                                        : 0;
                                    isStarted = progress > 0;
                                }
                            } catch (progressError) {
                                // Ignore progress errors
                            }

                            return {
                                id: courseId,
                                title: course.title || 'Untitled Course',
                                description: course.description || 'No description provided.',
                                thumbnail: course.thumbnail || `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop`,
                                category,
                                progress,
                                totalLessons: modulesCount * 3, // Estimate lessons
                                completedLessons: completedModules,
                                isStarted,
                                lastLesson: isStarted ? 'Continue your journey' : 'Start your journey'
                            };
                        } catch (moduleError) {
                            console.log(`Dashboard: Error processing course ${course.SK}`, moduleError.message);
                            return null;
                        }
                    })
                );

                const validCourses = coursesWithModules.filter(Boolean);

                // Filter: Only show started courses in "Continue Learning"
                const startedCourses = validCourses.filter(c => c.isStarted);
                
                // Sort started courses by progress (highest first)
                startedCourses.sort((a, b) => b.progress - a.progress);

                // Generate interest-based recommendations (always show 2-3)
                const userInterests = userData.interests || [];
                const preferredCategories = userData.preferredCategories || [];
                
                // Get courses user hasn't started for recommendations
                const unstartedCourses = validCourses.filter(c => !c.isStarted);
                
                let recommendedCourses = unstartedCourses;
                
                // Filter by user interests if available
                if (preferredCategories.length > 0) {
                    recommendedCourses = unstartedCourses.filter(course => 
                        preferredCategories.includes(course.category)
                    );
                }
                
                // If still no courses or no preferences, show popular courses
                if (recommendedCourses.length === 0) {
                    recommendedCourses = unstartedCourses
                        .sort((a, b) => {
                            // Sort by category popularity first (Frontend, Backend, etc.)
                            const categoryOrder = ['Frontend', 'Backend', 'Programming Languages', 'Databases'];
                            const aCategoryIndex = categoryOrder.indexOf(a.category);
                            const bCategoryIndex = categoryOrder.indexOf(b.category);
                            
                            if (aCategoryIndex !== bCategoryIndex) {
                                return aCategoryIndex - bCategoryIndex;
                            }
                            
                            // Then by estimated popularity (more modules = more comprehensive)
                            return (b.totalLessons || 0) - (a.totalLessons || 0);
                        });
                }
                
                // Take top 3 recommendations
                const topRecommendations = recommendedCourses.slice(0, 3).map(course => ({
                    ...course,
                    isRecommended: true,
                    isStarted: false,
                    progress: 0,
                    lastLesson: 'Start your journey',
                    completedLessons: 0
                }));

                // Combine started courses + recommendations (max 6 total)
                let displayCourses = [...startedCourses];
                
                // Add recommendations if we have space (show max 6 courses total)
                const remainingSlots = Math.max(0, 6 - startedCourses.length);
                if (remainingSlots > 0 && topRecommendations.length > 0) {
                    displayCourses = [...displayCourses, ...topRecommendations.slice(0, remainingSlots)];
                }

                console.log('Dashboard: Setting courses', { 
                    started: startedCourses.length, 
                    recommended: topRecommendations.length,
                    showing: displayCourses.length,
                    total: displayCourses.length 
                });
                setActiveCourses(displayCourses);

                // 4. Calculate stats
                const inProgressCount = validCourses.filter(c => c.isStarted && c.progress < 100).length;
                const completedCount = validCourses.filter(c => c.progress === 100).length;

                // 5. Generate Recent Activity from user progress and course data
                const activities = [];
                
                // Add activities based on course progress
                startedCourses.forEach(course => {
                    if (course.progress > 0) {
                        activities.push({
                            id: `course-${course.id}`,
                            action: 'Started Course',
                            target: course.title,
                            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
                            type: 'course',
                            icon: 'BookOpen'
                        });
                    }
                    
                    if (course.progress >= 25 && course.progress < 50) {
                        activities.push({
                            id: `progress-${course.id}`,
                            action: 'Making Progress',
                            target: `${course.title} - ${course.progress}% complete`,
                            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random within last 3 days
                            type: 'progress',
                            icon: 'Trophy'
                        });
                    }
                    
                    if (course.progress >= 50 && course.progress < 100) {
                        activities.push({
                            id: `milestone-${course.id}`,
                            action: 'Halfway There',
                            target: course.title,
                            timestamp: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000), // Random within last 2 days
                            type: 'milestone',
                            icon: 'Flame'
                        });
                    }
                    
                    if (course.progress === 100) {
                        activities.push({
                            id: `completed-${course.id}`,
                            action: 'Completed Course',
                            target: course.title,
                            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random within last day
                            type: 'completion',
                            icon: 'Trophy'
                        });
                    }
                });
                
                // Add general learning activity
                if (startedCourses.length > 0) {
                    activities.push({
                        id: 'learning-streak',
                        action: 'Learning Streak',
                        target: `${userData.streak || 1} days in a row`,
                        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                        type: 'streak',
                        icon: 'Flame'
                    });
                }
                
                // Add recommendations activity if user has recommendations
                if (topRecommendations.length > 0) {
                    activities.push({
                        id: 'recommendations',
                        action: 'New Recommendations',
                        target: `${topRecommendations.length} courses suggested for you`,
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                        type: 'recommendation',
                        icon: 'Zap'
                    });
                }
                
                // Sort by timestamp (most recent first) and take latest 5
                const sortedActivities = activities
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 5);

                setRecentActivity(sortedActivities);

                setStats({
                    coursesInProgress: inProgressCount,
                    hoursSpent: userData.totalHours || 0,
                    certificates: completedCount,
                    streak: userData.streak || 0
                });

            } catch (error) {
                console.error("Dashboard: Error fetching data:", error);
                // Set fallback empty state
                setActiveCourses([]);
                setStats({
                    coursesInProgress: 0,
                    hoursSpent: 0,
                    certificates: 0,
                    streak: 0
                });
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
        const time = timestamp instanceof Date ? timestamp : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
        // Navigate directly to course with last known position
        window.location.href = `/courses/${courseId}`;
    };

    const handleSaveNote = async (courseId) => {
        try {
            const noteRef = doc(db, 'userNotes', `${user.uid}_${courseId}`);
            await setDoc(noteRef, {
                note: noteText,
                courseId,
                userId: user.uid,
                updatedAt: new Date()
            });
            
            setCourseNotes(prev => ({ ...prev, [courseId]: noteText }));
            setEditingNote(null);
            setNoteText('');
        } catch (error) {
            console.error('Error saving note:', error);
        }
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
        try {
            const noteRef = doc(db, 'userNotes', `${user.uid}_${courseId}`);
            await deleteDoc(noteRef);
            
            setCourseNotes(prev => {
                const newNotes = { ...prev };
                delete newNotes[courseId];
                return newNotes;
            });
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleSetReminder = async (courseId) => {
        try {
            const reminderRef = doc(db, 'studyReminders', `${user.uid}_${courseId}`);
            await setDoc(reminderRef, {
                courseId,
                userId: user.uid,
                reminderTime,
                isActive: true,
                createdAt: new Date()
            });
            
            setStudyReminders(prev => [...prev, { courseId, reminderTime, isActive: true }]);
            setShowReminderModal(false);
            setReminderTime('09:00');
        } catch (error) {
            console.error('Error setting reminder:', error);
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Load existing notes and reminders
    useEffect(() => {
        const loadNotesAndReminders = async () => {
            if (!user) return;
            
            try {
                // Load notes
                const notesQuery = query(
                    collection(db, 'userNotes'),
                    where('userId', '==', user.uid)
                );
                const notesSnap = await getDocs(notesQuery);
                const notes = {};
                notesSnap.forEach(doc => {
                    const data = doc.data();
                    notes[data.courseId] = data.note;
                });
                setCourseNotes(notes);

                // Load reminders
                const remindersQuery = query(
                    collection(db, 'studyReminders'),
                    where('userId', '==', user.uid),
                    where('isActive', '==', true)
                );
                const remindersSnap = await getDocs(remindersQuery);
                const reminders = [];
                remindersSnap.forEach(doc => {
                    reminders.push(doc.data());
                });
                setStudyReminders(reminders);
            } catch (error) {
                console.error('Error loading notes and reminders:', error);
            }
        };

        loadNotesAndReminders();
    }, [user]);

    // Social & Community Functions
    const handleShareAchievement = (achievement) => {
        setShareAchievement(achievement);
        setShowShareModal(true);
    };

    const handleConnectWithBuddy = (buddyId) => {
        // Logic to connect with study buddy
        console.log('Connecting with buddy:', buddyId);
    };

    const handleJoinDiscussion = (threadId) => {
        // Navigate to discussion thread
        window.location.href = `/discussion/${threadId}`;
    };

    const generateMockSocialData = () => {
        // Mock leaderboard data
        const mockLeaderboard = [
            { id: '1', name: 'Sarah Chen', avatar: 'SC', progress: 85, courses: 12, streak: 15 },
            { id: '2', name: 'Mike Johnson', avatar: 'MJ', progress: 78, courses: 9, streak: 8 },
            { id: user?.uid, name: 'You', avatar: 'ME', progress: 65, courses: 6, streak: 5, isCurrentUser: true },
            { id: '3', name: 'Emma Davis', avatar: 'ED', progress: 62, courses: 7, streak: 12 },
            { id: '4', name: 'Alex Kim', avatar: 'AK', progress: 58, courses: 5, streak: 3 }
        ];
        setLeaderboard(mockLeaderboard.sort((a, b) => b.progress - a.progress));

        // Mock study buddies based on similar courses
        const mockStudyBuddies = [
            { id: '1', name: 'Sarah Chen', avatar: 'SC', mutualCourses: 3, online: true, lastActive: '2 min ago' },
            { id: '2', name: 'Mike Johnson', avatar: 'MJ', mutualCourses: 2, online: false, lastActive: '1 hour ago' },
            { id: '3', name: 'Emma Davis', avatar: 'ED', mutualCourses: 4, online: true, lastActive: 'Just now' }
        ];
        setStudyBuddies(mockStudyBuddies);

        // Mock achievements
        const mockAchievements = [
            { id: '1', title: 'Fast Learner', description: 'Complete 5 courses in one month', icon: 'Trophy', earned: true, date: new Date() },
            { id: '2', title: 'Consistent Student', description: '7-day learning streak', icon: 'Flame', earned: true, date: new Date() },
            { id: '3', title: 'Course Master', description: 'Complete first course with 100%', icon: 'Award', earned: false, progress: 85 }
        ];
        setAchievements(mockAchievements);

        // Mock discussion threads
        const mockDiscussions = [
            { 
                id: '1', 
                title: 'Best practices for React hooks?', 
                course: 'React Advanced Patterns',
                author: 'Sarah Chen',
                replies: 12,
                lastActivity: '2 hours ago',
                tags: ['react', 'hooks', 'best-practices']
            },
            {
                id: '2',
                title: 'Help with async/await in JavaScript',
                course: 'JavaScript Fundamentals',
                author: 'Mike Johnson',
                replies: 8,
                lastActivity: '1 hour ago', 
                tags: ['javascript', 'async', 'help']
            },
            {
                id: '3',
                title: 'Database design tips for beginners',
                course: 'SQL Basics',
                author: 'Emma Davis',
                replies: 15,
                lastActivity: '30 min ago',
                tags: ['sql', 'database', 'algo']
            }
        ];
        setDiscussionThreads(mockDiscussions);
    };

   useEffect(() => {
        if (user) {
            generateMockSocialData();
            generateDailyTip();
        }
    }, [user]);

    // Daily Tips Function
    const generateDailyTip = () => {
        const tips = [
            { category: 'Focus', tip: 'Take a 5-minute break every 25 minutes to maintain concentration', icon: 'Target' },
            { category: 'Learning', tip: 'Practice coding for at least 30 minutes daily to build muscle memory', icon: 'Lightbulb' },
            { category: 'Progress', tip: 'Review previous lessons before starting new ones for better retention', icon: 'Trophy' },
            { category: 'Productivity', tip: 'Study difficult topics when your energy levels are highest', icon: 'Flame' },
            { category: 'Memory', tip: 'Teach what you learn to someone else to solidify your understanding', icon: 'Users' },
            { category: 'Habits', tip: 'Create a dedicated study space to signal your brain it\'s time to learn', icon: 'Home' },
            { category: 'Goals', tip: 'Break large topics into smaller, manageable chunks', icon: 'Target' },
            { category: 'Review', tip: 'Spend 10 minutes reviewing yesterday\'s material before starting new lessons', icon: 'Clock' }
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setDailyTip(randomTip);
    };

    // Course Bookmarks Functions
    const handleBookmarkLesson = (courseId, lessonTitle, lessonId) => {
        setBookmarkLesson({ courseId, lessonTitle, lessonId });
        setShowBookmarkModal(true);
    };

    const saveBookmark = async () => {
        try {
            const bookmarkRef = doc(db, 'userBookmarks', `${user.uid}_${bookmarkLesson.courseId}_${bookmarkLesson.lessonId}`);
            await setDoc(bookmarkRef, {
                ...bookmarkLesson,
                userId: user.uid,
                createdAt: new Date()
            });
            
            setCourseBookmarks(prev => ({
                ...prev,
                [bookmarkLesson.courseId]: [...(prev[bookmarkLesson.courseId] || []), bookmarkLesson]
            }));
            setShowBookmarkModal(false);
            setBookmarkLesson(null);
        } catch (error) {
            console.error('Error saving bookmark:', error);
        }
    };

    const removeBookmark = async (courseId, lessonId) => {
        try {
            const bookmarkRef = doc(db, 'userBookmarks', `${user.uid}_${courseId}_${lessonId}`);
            await deleteDoc(bookmarkRef);
            
            setCourseBookmarks(prev => ({
                ...prev,
                [courseId]: prev[courseId].filter(lesson => lesson.lessonId !== lessonId)
            }));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    // Load bookmarks
    useEffect(() => {
        const loadBookmarks = async () => {
            if (!user) return;
            
            try {
                const bookmarksQuery = query(
                    collection(db, 'userBookmarks'),
                    where('userId', '==', user.uid)
                );
                const bookmarksSnap = await getDocs(bookmarksQuery);
                const bookmarks = {};
                bookmarksSnap.forEach(doc => {
                    const data = doc.data();
                    if (!bookmarks[data.courseId]) {
                        bookmarks[data.courseId] = [];
                    }
                    bookmarks[data.courseId].push(data);
                });
                setCourseBookmarks(bookmarks);
            } catch (error) {
                console.error('Error loading bookmarks:', error);
            }
        };

        loadBookmarks();
    }, [user]);

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
                            </motion.div>

                            {/* Daily Tip */}
                            {dailyTip && (
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
                            )}

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
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Study Reminder Modal */}
            {showReminderModal && (
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
            )}

            {/* Bookmark Modal */}
            {showBookmarkModal && (
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
            )}
        </div>
    );
};

export default Dashboard;
