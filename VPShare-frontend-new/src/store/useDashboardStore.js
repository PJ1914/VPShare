import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure axios-retry locally for this store's usage if needed, 
// though typically it's global. We'll assume the global config in App or Dashboard holds, 
// but re-defining or using a shared instance is safer. 
// For now, we'll use the basic axios.

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

const useDashboardStore = create(
    devtools(
        persist(
            (set, get) => ({
                // Helper to get auth headers (needs to be passed or handled)
                // We'll require the user object or token to be passed to actions

                // State
                loading: false,
                initialLoadDone: false,

                stats: {
                    coursesInProgress: 0,
                    hoursSpent: 0,
                    certificates: 0,
                    streak: 0
                },

                activeCourses: [],
                recentActivity: [],
                leaderboard: [],
                studyBuddies: [],
                achievements: [],
                discussionThreads: [],

                // New Data from Backend
                upcomingClasses: [],
                pendingAssignments: [],

                // Interactive Data
                courseNotes: {},
                studyReminders: [],
                courseBookmarks: {},
                dailyTip: null,

                // Caching
                lastFetchTime: null,
                CACHE_DURATION: 10 * 60 * 1000, // 10 minutes cache

                // Actions
                setLoading: (loading) => set({ loading }),

                fetchDashboardData: async (user, forceRefresh = false) => {
                    if (!user) return;

                    const state = get();
                    const now = Date.now();

                    // 1. Smart Caching check
                    if (!forceRefresh && state.lastFetchTime && (now - state.lastFetchTime < state.CACHE_DURATION) && state.activeCourses.length > 0) {
                        console.log('📦 Using cached dashboard data');
                        set({ loading: false, initialLoadDone: true });
                        return;
                    }

                    // 2. Optimistic: Background refresh if data exists
                    if (state.activeCourses.length === 0) {
                        set({ loading: true });
                    }

                    try {
                        // console.time('🚀 Dashboard Fetch');
                        const token = await user.getIdToken();

                        // Setup Backend API Client (for Assignments, Live Classes, Courses)
                        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                        const api = axios.create({
                            baseURL: apiBaseUrl,
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        // 3. Parallel Fetches - Hybrid (Firebase + Backend)
                        const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', user.uid));

                        const [
                            userDocSnap,
                            // New: Leaderboard Users
                            usersDocsSnap,
                            notesSnap,
                            remindersSnap,
                            bookmarksSnap,
                            progressSnap,
                            // Backend Fetches (Fail gracefully to avoid blocking)
                            coursesRes,
                            assignmentsRes,
                            liveClassesRes
                        ] = await Promise.all([
                            // Firebase (Profile & Personal Config)
                            getDoc(doc(db, 'users', user.uid)),
                            // Leaderboard - Fetch top 10 users by XP
                            getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10))),
                            getDocs(query(collection(db, 'userNotes'), where('userId', '==', user.uid))),
                            getDocs(query(collection(db, 'studyReminders'), where('userId', '==', user.uid), where('isActive', '==', true))),
                            getDocs(query(collection(db, 'userBookmarks'), where('userId', '==', user.uid))),
                            getDocs(progressQuery),

                            // Backend (Content) - assignments/classes are "major stuff"
                            // Note: We use the api instance we created above
                            api.get('/courses').catch(() => ({ data: [] })),
                            api.get('/assignments').catch(() => ({ data: [] })),
                            api.get('/live-classes').catch(() => ({ data: [] }))
                        ]);

                        const userData = userDocSnap.exists() ? userDocSnap.data() : {};

                        // Process Firebase Data
                        const notes = {};
                        notesSnap.forEach(d => { notes[d.data().courseId] = d.data().note; });
                        const reminders = [];
                        remindersSnap.forEach(d => reminders.push(d.data()));
                        const bookmarks = {};
                        bookmarksSnap.forEach(d => {
                            const data = d.data();
                            if (!bookmarks[data.courseId]) bookmarks[data.courseId] = [];
                            bookmarks[data.courseId].push(data);
                        });

                        // Process Progress
                        const progressMap = {};
                        progressSnap.forEach(doc => {
                            const data = doc.data();
                            let cId = data.courseId;
                            if (!cId && doc.id.startsWith(user.uid + '_')) {
                                cId = doc.id.replace(user.uid + '_', '');
                            }
                            if (cId) progressMap[cId] = data;
                        });

                        // Process Backend Data: Assignments
                        const allAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
                        const pendingAssignments = allAssignments
                            .filter(a => a.status === 'pending')
                            .slice(0, 5); // Top 5 pending

                        // Process Backend Data: Live Classes
                        const allLiveClasses = Array.isArray(liveClassesRes.data) ? liveClassesRes.data : [];
                        const upcomingClasses = allLiveClasses
                            .filter(c => new Date(c.startTime) > new Date())
                            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                            .slice(0, 3); // Top 3 upcoming

                        // Process Backend Data: Courses
                        const rawCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.Items || []);
                        const processedCourses = rawCourses.slice(0, 10).map((course) => {
                            const courseId = stripPrefix(course.SK || course.id);
                            const pData = progressMap[courseId];
                            const totalLessons = course.modulesCount ? course.modulesCount * 3 : (course.totalLessons || 20);

                            let progress = 0;
                            let completedLessons = 0;
                            let isStarted = false;

                            if (pData) {
                                completedLessons = pData.completedSections?.length || 0;
                                progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                                isStarted = completedLessons > 0 || progress > 0;
                            }

                            return {
                                id: courseId,
                                title: course.title || 'Untitled Course',
                                description: course.description || 'No description provided.',
                                thumbnail: course.thumbnail || `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop`,
                                category: mapCourseToCategory(courseId, course.title),
                                progress: Math.min(100, progress),
                                totalLessons,
                                completedLessons,
                                isStarted,
                                lastLesson: isStarted ? 'Continue your journey' : 'Start your journey',
                                isRecommended: false
                            };
                        });

                        // Sorting & Recommendations
                        const startedCourses = processedCourses.filter(c => c.isStarted).sort((a, b) => b.progress - a.progress);
                        const unstartedCourses = processedCourses.filter(c => !c.isStarted);
                        const preferredCategories = userData.preferredCategories || [];
                        let recommendedCourses = unstartedCourses;
                        if (preferredCategories.length > 0) {
                            const filtered = unstartedCourses.filter(c => preferredCategories.includes(c.category));
                            if (filtered.length > 0) recommendedCourses = filtered;
                        }
                        if (recommendedCourses.length === 0 && unstartedCourses.length > 0) {
                            recommendedCourses = [...unstartedCourses].sort((a, b) => (b.totalLessons || 0) - (a.totalLessons || 0));
                        }
                        const topRecommendations = recommendedCourses.slice(0, 3).map(c => ({
                            ...c, isRecommended: true, isStarted: false, progress: 0, lastLesson: 'Start your journey'
                        }));
                        let displayCourses = [...startedCourses];
                        const remainingSlots = Math.max(0, 6 - startedCourses.length);
                        if (remainingSlots > 0 && topRecommendations.length > 0) {
                            displayCourses = [...displayCourses, ...topRecommendations.slice(0, remainingSlots)];
                        }

                        // Generate Activity (Mock based on real progress + Real Backend Data Integration)
                        const activities = [];
                        // 1. Course Progress Activities
                        startedCourses.forEach(course => {
                            if (course.progress > 0) {
                                activities.push({
                                    id: `act-${course.id}`,
                                    action: course.progress > 90 ? 'Completed' : 'Focused on',
                                    target: course.title,
                                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
                                    type: 'course',
                                    icon: course.progress > 90 ? 'Trophy' : 'BookOpen'
                                });
                            }
                        });
                        // 2. Assignment Activities (Real)
                        allAssignments.forEach(a => {
                            if (a.status === 'submitted' || a.status === 'graded') {
                                activities.push({
                                    id: `assign-${a.id}`,
                                    action: a.status === 'graded' ? 'Assignment Graded' : 'Submitted Assignment',
                                    target: a.title,
                                    timestamp: a.submittedAt || new Date().toISOString(),
                                    type: 'milestone',
                                    icon: 'CheckCircle'
                                });
                            }
                        });


                        if (userData.streak > 0) {
                            activities.push({
                                id: 'streak-act', action: 'Maintained Streak', target: `${userData.streak} Day Streak!`,
                                timestamp: new Date().toISOString(), type: 'streak', icon: 'Flame'
                            });
                        }
                        const finalActivity = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

                        // Process Real Social Data
                        const fetchedUsers = [];
                        usersDocsSnap.forEach(doc => {
                            fetchedUsers.push({ id: doc.id, ...doc.data() });
                        });

                        // Leaderboard: Top by XP
                        // Ensure current user is in if not in top 10 (optional, but good for UI)
                        // For now, simple top list mapping
                        const leaderboard = fetchedUsers.map(u => ({
                            id: u.id,
                            name: u.displayName || u.fullName || 'Anonymous User',
                            avatar: (u.displayName || u.fullName || 'U').charAt(0).toUpperCase(),
                            photoURL: u.photoURL,
                            progress: u.xp ? Math.min(100, Math.floor(u.xp / 100)) : 0, // Mock progress from XP
                            xp: u.xp || 0,
                            courses: u.enrolledCourses?.length || 0,
                            streak: u.streak || 0,
                            isCurrentUser: u.id === user.uid
                        })).sort((a, b) => b.xp - a.xp);

                        // Study Buddies: Pick random or specific users (excluding self)
                        const potentialBuddies = fetchedUsers.filter(u => u.id !== user.uid);
                        const studyBuddies = potentialBuddies.slice(0, 3).map(u => ({
                            id: u.id,
                            name: u.displayName || u.fullName || 'Study Buddy',
                            avatar: (u.displayName || u.fullName || 'S').charAt(0).toUpperCase(),
                            photoURL: u.photoURL,
                            mutualCourses: Math.floor(Math.random() * 3) + 1, // Mock logic for now
                            online: Math.random() > 0.5,
                            lastActive: 'Recently'
                        }));

                        const achievements = [
                            { id: '1', title: 'Fast Learner', description: 'Complete 5 courses', icon: 'Trophy', earned: true, date: new Date().toISOString() },
                            { id: '2', title: 'Consistent', description: '7-day streak', icon: 'Flame', earned: true, date: new Date().toISOString() }
                        ];

                        const discussionThreads = [
                            { id: '1', title: 'React Hooks Patterns', course: 'React Advanced', author: 'Sarah Chen', replies: 12, lastActivity: '2h ago' },
                            { id: '2', title: 'Async/Await Help', course: 'JS Fundamentals', author: 'Mike J.', replies: 8, lastActivity: '1h ago' }
                        ];

                        // Random Daily Tip
                        const tips = [
                            { category: 'Focus', tip: 'Use the Pomodoro technique: 25 min work, 5 min break.', icon: 'Clock' },
                            { category: 'Health', tip: 'Stay hydrated! Drink water every hour.', icon: 'Zap' },
                            { category: 'Code', tip: 'Console.log() is your friend, but debugger is your best friend.', icon: 'Code' },
                            { category: 'Review', tip: 'Review your notes 10 minutes after class to retain 4x more.', icon: 'BookOpen' }
                        ];
                        const randomTip = tips[Math.floor(Math.random() * tips.length)];

                        set({
                            activeCourses: displayCourses,
                            upcomingClasses, // New
                            pendingAssignments, // New
                            stats: {
                                coursesInProgress: startedCourses.length,
                                hoursSpent: userData.totalHours || 0,
                                certificates: userData.certificates?.length || 0,
                                streak: userData.streak || 0
                            },
                            recentActivity: finalActivity,
                            courseNotes: notes,
                            studyReminders: reminders,
                            courseBookmarks: bookmarks,
                            leaderboard,
                            studyBuddies,
                            achievements,
                            discussionThreads,
                            dailyTip: randomTip,
                            lastFetchTime: Date.now(),
                            initialLoadDone: true,
                            loading: false
                        });

                        // console.timeEnd('🚀 Dashboard Fetch');
                        console.log('✅ Dashboard data updated VERY fast');

                    } catch (error) {
                        console.error('Dashboard store fetch error:', error);
                        set({ loading: false });
                    }
                },

                // Interactive Actions (Optimistic)
                saveNote: async (user, courseId, noteText) => {
                    if (!user) return;
                    // Optimistic update
                    set(state => ({
                        courseNotes: { ...state.courseNotes, [courseId]: noteText }
                    }));
                    try {
                        await setDoc(doc(db, 'userNotes', `${user.uid}_${courseId}`), {
                            note: noteText, courseId, userId: user.uid, updatedAt: new Date()
                        });
                    } catch (e) {
                        console.error('Error saving note', e);
                        // Optional: Revert on error
                    }
                },

                deleteNote: async (user, courseId) => {
                    if (!user) return;
                    set(state => {
                        const newNotes = { ...state.courseNotes };
                        delete newNotes[courseId];
                        return { courseNotes: newNotes };
                    });
                    try {
                        await deleteDoc(doc(db, 'userNotes', `${user.uid}_${courseId}`));
                    } catch (e) { console.error('Error deleting note', e); }
                },

                saveBookmark: async (user, bookmark) => {
                    // Optimistic
                    const { courseId, lessonId } = bookmark;
                    set(state => {
                        const current = state.courseBookmarks[courseId] || [];
                        return {
                            courseBookmarks: {
                                ...state.courseBookmarks,
                                [courseId]: [...current, bookmark]
                            }
                        };
                    });
                    try {
                        await setDoc(doc(db, 'userBookmarks', `${user.uid}_${courseId}_${lessonId}`), {
                            ...bookmark, userId: user.uid, createdAt: new Date()
                        });
                    } catch (e) { console.error('Error saving bookmark', e); }
                },

                removeBookmark: async (user, courseId, lessonId) => {
                    set(state => ({
                        courseBookmarks: {
                            ...state.courseBookmarks,
                            [courseId]: state.courseBookmarks[courseId]?.filter(b => b.lessonId !== lessonId) || []
                        }
                    }));
                    try {
                        await deleteDoc(doc(db, 'userBookmarks', `${user.uid}_${courseId}_${lessonId}`));
                    } catch (e) { console.error('Error removing bookmark', e); }
                },

                addReminder: async (user, reminder) => {
                    set(state => ({
                        studyReminders: [...state.studyReminders, reminder]
                    }));
                    try {
                        await setDoc(doc(db, 'studyReminders', `${user.uid}_${reminder.courseId}`), {
                            ...reminder, userId: user.uid, createdAt: new Date()
                        });
                    } catch (e) { console.error('Error adding reminder', e); }
                },

                reset: () => set({
                    loading: false, initialLoadDone: false, stats: {}, activeCourses: [], recentActivity: [],
                    courseNotes: {}, studyReminders: [], courseBookmarks: {}, lastFetchTime: null
                })
            }),
            {
                name: 'dashboard-storage', // Key for localStorage
                partialize: (state) => ({
                    activeCourses: state.activeCourses,
                    stats: state.stats,
                    recentActivity: state.recentActivity,
                    courseNotes: state.courseNotes,
                    studyReminders: state.studyReminders,
                    courseBookmarks: state.courseBookmarks,
                    lastFetchTime: state.lastFetchTime,
                    dailyTip: state.dailyTip
                })
            }
        ),
        { name: 'DashboardStore' }
    )
);

export default useDashboardStore;
