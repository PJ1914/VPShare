import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import SEO from '../components/SEO';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNotification } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';
import cacheService from '../utils/cacheService';
import '../styles/Dashboard.css';
import {
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  FormatQuote as QuoteIcon,
  School as SchoolIcon,
  AutoGraph as AutoGraphIcon,
  EmojiEvents as EmojiEventsIcon,
  PlayCircleOutline as PlayIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  GitHub as GitHubIcon,
  Star as StarIcon,
  AssignmentTurnedIn as CompletedIcon,
  Web as WebIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Rocket as RocketIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const hoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesStarted: 0,
    coursesCompleted: 0,
    totalProgress: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  
  const navigate = useNavigate();
  const { hasSubscription } = useSubscription();
  const { showNotification } = useNotification();

  // Cache configuration - Firebase-based persistent caching
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const CACHE_KEYS = {
    courses: 'dashboard_courses',
    userProgress: 'dashboard_progress', 
    stats: 'dashboard_stats',
    activities: 'dashboard_activities'
  };

  // Load data from Firebase cache
  const loadFromCache = async () => {
    try {
      console.log('Loading dashboard data from cache...');
      
      const cacheOptions = { maxAge: CACHE_DURATION };
      
      const [cachedCourses, cachedProgress, cachedStats, cachedActivities] = await Promise.all([
        cacheService.getCache(CACHE_KEYS.courses, cacheOptions),
        cacheService.getCache(CACHE_KEYS.userProgress, cacheOptions),
        cacheService.getCache(CACHE_KEYS.stats, cacheOptions),
        cacheService.getCache(CACHE_KEYS.activities, cacheOptions)
      ]);

      let hasValidCache = false;

      if (cachedCourses?.data && Array.isArray(cachedCourses.data)) {
        setCourses(cachedCourses.data);
        hasValidCache = true;
        console.log('Courses loaded from cache');
      }

      if (cachedProgress?.data && typeof cachedProgress.data === 'object') {
        setUserProgress(cachedProgress.data);
        console.log('Progress loaded from cache');
      }

      if (cachedStats?.data && typeof cachedStats.data === 'object') {
        setStats(cachedStats.data);
        console.log('Stats loaded from cache');
      }

      if (cachedActivities?.data && Array.isArray(cachedActivities.data)) {
        setRecentActivities(cachedActivities.data);
        console.log('Activities loaded from cache');
      }

      return hasValidCache;
    } catch (error) {
      console.warn('Error loading from cache:', error);
      return false;
    }
  };

  // Save data to Firebase cache
  const saveToCache = async (coursesData, progressData, statsData, activitiesData) => {
    try {
      const cacheOptions = { 
        maxAge: CACHE_DURATION,
        metadata: { 
          cachedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };

      await Promise.all([
        cacheService.setCache(CACHE_KEYS.courses, coursesData, cacheOptions),
        cacheService.setCache(CACHE_KEYS.userProgress, progressData, cacheOptions),
        cacheService.setCache(CACHE_KEYS.stats, statsData, cacheOptions),
        cacheService.setCache(CACHE_KEYS.activities, activitiesData, cacheOptions)
      ]);

      console.log('Dashboard data cached successfully to Firebase');
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  };

  // Reset scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async (forceRefresh = false) => {
      try {
        setLoading(true);
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setUser({ name: 'Guest User', uid: null });
          setLoading(false);
          return;
        }

        setUser({ 
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User', 
          uid: currentUser.uid,
          email: currentUser.email
        });

        // Check cache first (unless forced refresh)
        if (!forceRefresh) {
          const cacheLoaded = await loadFromCache();
          if (cacheLoaded) {
            console.log('Dashboard data loaded from cache');
            setLoading(false);
            return;
          }
        }

        console.log('Fetching fresh dashboard data...');

        // Fetch courses using the same logic as Courses.jsx
        const apiUrl = import.meta.env.VITE_COURSES_API_URL;
        
        // Production logging - less verbose
        if (import.meta.env.DEV) {
          console.log('Dashboard - API URL:', apiUrl);
        }
        
        if (apiUrl) {
          try {
            const token = await currentUser.getIdToken(true);
            const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            };
            
            if (import.meta.env.DEV) {
              console.log('Dashboard - Fetching courses from API...');
            }
            
            // Add timeout for production
            const axiosConfig = {
              headers,
              timeout: import.meta.env.PROD ? 15000 : 10000 // 15s in prod, 10s in dev
            };
            
            // Fetch courses from new LMS API (same as Courses.jsx)
            const coursesResponse = await axios.get(`${apiUrl}/courses`, axiosConfig);
            
            if (import.meta.env.DEV) {
              console.log('Dashboard - Courses response:', coursesResponse.data);
            }
            
            const rawCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data.Items || [];
            
            if (import.meta.env.DEV) {
              console.log('Dashboard - Raw courses:', rawCourses.length, 'courses found');
            }
            
            if (!rawCourses.length) {
              if (import.meta.env.DEV) {
                console.warn('Dashboard - No courses found from API');
              }
              setCourses([]);
              setStats({ totalCourses: 0, coursesStarted: 0, coursesCompleted: 0, totalProgress: 0 });
              setLoading(false);
              return;
            }

            // Process courses with modules (simplified for dashboard)
            if (import.meta.env.DEV) {
              console.log('Dashboard - Processing courses...');
            }
            
            const coursesWithModules = await Promise.all(
              rawCourses.map(async (course) => {
                try {
                  const courseId = course.SK && course.SK.includes('#') ? course.SK.split('#')[1] : course.SK || course.id;
                  
                  if (import.meta.env.DEV) {
                    console.log(`Processing course: ${courseId}`, course);
                  }
                  
                  // Try to fetch modules for each course
                  let modules = [];
                  try {
                    const modulesResponse = await axios.get(`${apiUrl}/courses/${courseId}/modules`, axiosConfig);
                    modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : modulesResponse.data.Items || [];
                    
                    if (import.meta.env.DEV) {
                      console.log(`Modules for ${courseId}:`, modules.length);
                    }
                  } catch (moduleError) {
                    if (import.meta.env.DEV) {
                      console.warn(`Could not fetch modules for course ${courseId}:`, moduleError.message);
                    }
                    // Use a default module count if API fails
                    modules = Array(6).fill({}).map((_, i) => ({ id: `module-${i + 1}` }));
                  }
                  
                  return {
                    id: courseId,
                    module_id: courseId,
                    title: course.title || 'Untitled Course',
                    description: course.description || 'No description provided.',
                    sections: modules, // Use modules as sections for progress calculation
                    order: course.order || 1
                  };
                } catch (courseError) {
                  console.error(`Error processing course ${course.SK}:`, courseError);
                  return null;
                }
              })
            );

            const validCourses = coursesWithModules.filter(Boolean).sort((a, b) => a.order - b.order);
            
            if (import.meta.env.DEV) {
              console.log('Dashboard - Valid courses:', validCourses);
            }
            
            setCourses(validCourses);

            // Fetch user progress from Firestore
            const db = getFirestore();
            const progressData = {};
            const activities = [];
            let completedCount = 0;
            let totalProgressSum = 0;

            await Promise.all(validCourses.map(async (course) => {
              const courseId = course.id || course.module_id;
              if (!courseId) return;

              try {
                const progressDoc = doc(db, 'userProgress', `${currentUser.uid}_${courseId}`);
                const progressSnap = await getDoc(progressDoc);

                if (progressSnap.exists()) {
                  const data = progressSnap.data();
                  progressData[courseId] = data;

                  // Calculate progress (same logic as Courses.jsx)
                  const totalSections = (course.sections?.length || 6) + 1; // +1 for quiz
                  const completedSections = Array.isArray(data.completedSections) ? data.completedSections.length : 0;
                  const quizCompleted = data.quizSubmitted ? 1 : 0;
                  const progress = Math.min(100, Math.round(((completedSections + quizCompleted) / totalSections) * 100));
                  
                  totalProgressSum += progress;
                  
                  if (progress === 100) completedCount++;

                  // Add to activities
                  if (completedSections > 0 || data.currentSectionIndex >= 0) {
                    activities.push({
                      id: courseId,
                      title: course.title || 'Course',
                      action: progress === 100 ? 'Completed' : 'In Progress',
                      progress: progress,
                      timestamp: data.lastAccessed ? new Date(data.lastAccessed.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()
                    });
                  }
                }
              } catch (error) {
                console.error(`Error fetching progress for course ${courseId}:`, error);
              }
            }));

            setUserProgress(progressData);
            const sortedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
            setRecentActivities(sortedActivities);

            // Update stats
            const coursesStarted = Object.keys(progressData).length;
            const avgProgress = coursesStarted > 0 ? Math.round(totalProgressSum / coursesStarted) : 0;
            
            const finalStats = {
              totalCourses: validCourses.length,
              coursesStarted,
              coursesCompleted: completedCount,
              totalProgress: avgProgress
            };

            setStats(finalStats);

            // Save to cache
            await saveToCache(validCourses, progressData, finalStats, sortedActivities);

          } catch (error) {
            console.error('Error fetching courses:', error);
            // Set fallback static courses if API fails
            const fallbackCourses = [
              {
                id: 'html',
                title: 'HTML Fundamentals',
                description: 'Learn the building blocks of web development',
                sections: Array(8).fill({}),
                order: 1
              },
              {
                id: 'css',
                title: 'CSS Styling',
                description: 'Master styling and layout with CSS',
                sections: Array(10).fill({}),
                order: 2
              },
              {
                id: 'javascript',
                title: 'JavaScript Programming',
                description: 'Learn JavaScript fundamentals and advanced concepts',
                sections: Array(12).fill({}),
                order: 3
              },
              {
                id: 'react',
                title: 'React Development',
                description: 'Build modern web applications with React',
                sections: Array(15).fill({}),
                order: 4
              },
              {
                id: 'nodejs',
                title: 'Node.js Backend',
                description: 'Server-side development with Node.js',
                sections: Array(10).fill({}),
                order: 5
              },
              {
                id: 'database',
                title: 'Database Management',
                description: 'Learn SQL and database design',
                sections: Array(8).fill({}),
                order: 6
              }
            ];
            
            setCourses(fallbackCourses);
            const fallbackStats = {
              totalCourses: fallbackCourses.length,
              coursesStarted: 0,
              coursesCompleted: 0,
              totalProgress: 0
            };
            setStats(fallbackStats);

            // Save fallback data to cache
            await saveToCache(fallbackCourses, {}, fallbackStats, []);
          }
        } else {
          console.warn('VITE_COURSES_API_URL not configured');
          // Set fallback static courses if no API URL
          const fallbackCourses = [
            {
              id: 'html',
              title: 'HTML Fundamentals',
              description: 'Learn the building blocks of web development',
              sections: Array(8).fill({}),
              order: 1
            },
            {
              id: 'css',
              title: 'CSS Styling',
              description: 'Master styling and layout with CSS',
              sections: Array(10).fill({}),
              order: 2
            },
            {
              id: 'javascript',
              title: 'JavaScript Programming',
              description: 'Learn JavaScript fundamentals and advanced concepts',
              sections: Array(12).fill({}),
              order: 3
            },
            {
              id: 'react',
              title: 'React Development',
              description: 'Build modern web applications with React',
              sections: Array(15).fill({}),
              order: 4
            },
            {
              id: 'nodejs',
              title: 'Node.js Backend',
              description: 'Server-side development with Node.js',
              sections: Array(10).fill({}),
              order: 5
            },
            {
              id: 'database',
              title: 'Database Management',
              description: 'Learn SQL and database design',
              sections: Array(8).fill({}),
              order: 6
            }
          ];
          
          setCourses(fallbackCourses);
          const fallbackStats = {
            totalCourses: fallbackCourses.length,
            coursesStarted: 0,
            coursesCompleted: 0,
            totalProgress: 0
          };
          setStats(fallbackStats);

          // Save fallback data to cache
          await saveToCache(fallbackCourses, {}, fallbackStats, []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Make the function available for manual refresh if needed
    fetchDashboardData();
  }, []);

  // Show welcome notification
  useEffect(() => {
    if (user && user.uid) {
      const timer = setTimeout(() => {
        showNotification({
          type: 'success',
          title: `Welcome back, ${user.name}!`,
          message: 'Ready to continue your learning journey?',
          duration: 4000
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, showNotification]);

  // Clear cache when user changes (for different users)
  useEffect(() => {
    const currentUserId = user?.uid;
    
    // If user changes, we don't need to clear cache as Firebase cache is user-specific
    if (currentUserId) {
      console.log(`Cache is user-specific for user: ${currentUserId}`);
    }
  }, [user]);

  // Motivational quotes
  const motivationalQuotes = [
    {
      text: "The only way to learn to code is to write code. Keep building, keep learning!",
      author: "CodeTapasya Team",
    },
    {
      text: "Every bug you fix is a step closer to mastery. Embrace the challenges!",
      author: "CodeTapasya Team",
    },
    {
      text: "Consistency beats intensity. Code a little every day.",
      author: "CodeTapasya Team",
    },
    {
      text: "Great developers aren't born—they're built, one project at a time.",
      author: "CodeTapasya Team",
    },
  ];

  const todayQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  if (loading) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <div className="loading-skeleton">
            <div className="skeleton-welcome"></div>
            <div className="skeleton-progress"></div>
            <div className="skeleton-cards">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SEO 
        title="Dashboard - CodeTapasya"
        description="Your personal learning dashboard at CodeTapasya. Track your progress, access courses, and continue your programming journey."
        canonical="https://codetapasya.com/dashboard"
        noIndex={true}
      />
      
      <main className="dashboard-main">
        {/* Modern Hero Section */}
        <motion.section
          className="dashboard-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1>Welcome back, <span className="user-name">{user?.name || 'Learner'}</span>! 🚀</h1>
              <p>Ready to level up your coding skills today?</p>
            </motion.div>
            
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/courses" className="cta-btn primary">
                <SchoolIcon />
                Browse Courses
              </Link>
              <Link to="/hackathon" className="cta-btn hackathon">
                <RocketIcon />
                Join Hackathon
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="progress-circle">
              <svg className="progress-ring" width="140" height="140" viewBox="0 0 140 140">
                {/* Background circle */}
                <circle
                  className="progress-ring-circle"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                  r="60"
                  cx="70"
                  cy="70"
                />
                {/* Progress circle */}
                <circle
                  className="progress-ring-circle"
                  stroke="#2563eb"
                  strokeWidth="8"
                  fill="transparent"
                  r="60"
                  cx="70"
                  cy="70"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 60}`,
                    strokeDashoffset: `${2 * Math.PI * 60 * (1 - stats.totalProgress / 100)}`,
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {/* Inner decorative circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="45"
                  fill="none"
                  stroke="rgba(37, 99, 235, 0.1)"
                  strokeWidth="1"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-number">{stats.totalProgress}%</span>
                <span className="progress-label">Progress</span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          className="stats-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="stats-grid">
            <motion.div className="stat-card" variants={hoverVariants} whileHover="hover">
              <div className="stat-icon courses">
                <LibraryBooksIcon />
              </div>
              <div className="stat-content">
                <h3>{stats.totalCourses}</h3>
                <p>Available Courses</p>
              </div>
            </motion.div>
            
            <motion.div className="stat-card" variants={hoverVariants} whileHover="hover">
              <div className="stat-icon started">
                <PlayIcon />
              </div>
              <div className="stat-content">
                <h3>{stats.coursesStarted}</h3>
                <p>Courses Started</p>
              </div>
            </motion.div>
            
            <motion.div className="stat-card" variants={hoverVariants} whileHover="hover">
              <div className="stat-icon completed">
                <CompletedIcon />
              </div>
              <div className="stat-content">
                <h3>{stats.coursesCompleted}</h3>
                <p>Courses Completed</p>
              </div>
            </motion.div>
            
            <motion.div className="stat-card" variants={hoverVariants} whileHover="hover">
              <div className="stat-icon progress">
                <TrendingUpIcon />
              </div>
              <div className="stat-content">
                <h3>{stats.totalProgress}%</h3>
                <p>Average Progress</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Course Progress Section */}
        <motion.section
          className="course-progress-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Your Learning Journey</h2>
          
          {courses.length === 0 ? (
            <div className="empty-state">
              <LibraryBooksIcon className="empty-icon" />
              <h3>Start Your Learning Journey</h3>
              <p>No courses available or couldn't load courses. Please check your connection.</p>
              <Link to="/courses" className="empty-cta">Browse Courses</Link>
            </div>
          ) : (
            <div className="progress-grid">
              {courses.map((course) => {
                const courseId = course.module_id || course.id;
                const progressData = userProgress[courseId];
                
                // Calculate progress for all courses, not just started ones
                const totalSections = (course.sections?.length || 6) + 1;
                const completedSections = progressData && Array.isArray(progressData.completedSections) ? progressData.completedSections.length : 0;
                const quizCompleted = progressData && progressData.quizSubmitted ? 1 : 0;
                const progress = Math.min(100, Math.round(((completedSections + quizCompleted) / totalSections) * 100));
                
                return (
                  <motion.div
                    key={courseId}
                    className="course-progress-card"
                    variants={hoverVariants}
                    whileHover="hover"
                  >
                    <div className="course-header">
                      <div className="course-icon">
                        {course.title?.toLowerCase().includes('frontend') || course.title?.toLowerCase().includes('html') || course.title?.toLowerCase().includes('css') || course.title?.toLowerCase().includes('javascript') || course.title?.toLowerCase().includes('react') ? (
                          <WebIcon />
                        ) : course.title?.toLowerCase().includes('backend') || course.title?.toLowerCase().includes('node') || course.title?.toLowerCase().includes('api') ? (
                          <ApiIcon />
                        ) : course.title?.toLowerCase().includes('database') || course.title?.toLowerCase().includes('sql') || course.title?.toLowerCase().includes('mongodb') ? (
                          <StorageIcon />
                        ) : (
                          <CodeIcon />
                        )}
                      </div>
                      <h3>{course.title || 'Course'}</h3>
                    </div>
                    
                    <div className="course-progress-info">
                      <span className="progress-percentage">{progress}% Complete</span>
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    
                    <Link to={`/courses/${courseId}`} className="continue-btn">
                      <span>{progress === 0 ? 'Start Learning' : progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          className="quick-actions-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/courses" className="quick-action-card courses">
                <LibraryBooksIcon />
                <span>All Courses</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/playground" className="quick-action-card playground">
                <CodeIcon />
                <span>Code Playground</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/assignments" className="quick-action-card assignments">
                <AssignmentIcon />
                <span>Assignments</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/quizzes" className="quick-action-card quizzes">
                <QuizIcon />
                <span>Quizzes</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/projects" className="quick-action-card projects">
                <GitHubIcon />
                <span>Projects</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/hackathon" className="quick-action-card hackathon">
                <RocketIcon />
                <span>Hackathon</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          className="activity-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Recent Activity</h2>
          
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              <HistoryIcon className="empty-icon" />
              <h3>No Recent Activity</h3>
              <p>Start learning to see your progress here!</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="activity-item"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <div className="activity-icon">
                    {activity.action === 'Completed' ? <CompletedIcon /> : <PlayIcon />}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>{activity.action} • {activity.progress}% complete</p>
                    <span className="activity-date">{activity.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Motivational Quote */}
        <motion.section
          className="quote-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <motion.div
            className="quote-card"
            variants={hoverVariants}
            whileHover="hover"
          >
            <QuoteIcon className="quote-icon" />
            <blockquote>
              <p>"{todayQuote.text}"</p>
              <footer>— {todayQuote.author}</footer>
            </blockquote>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

export default Dashboard;
