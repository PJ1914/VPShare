import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import {
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  FormatQuote as QuoteIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  AutoGraph as AutoGraphIcon,
  EmojiEvents as EmojiEventsIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  BookmarkBorder as BookmarkIcon,
  PlayCircleOutline as PlayIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  GitHub as GitHubIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  AssignmentTurnedIn as CompletedIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  Web as WebIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import '../styles/Dashboard.css';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Animation variants for cards and links
const hoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

// Helper to check if a string is a UUID
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Map courseId and courseTitle to category
const mapCourseToCategory = (courseId, courseTitle = '') => {
  let source = courseId;
  if (isUUID(courseId) && courseTitle) {
    source = courseTitle;
  }
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('html')) {
    return 'frontend';
  } else if (lowerSource.includes('css')) {
    return 'frontend';
  } else if (lowerSource.includes('javascript')) {
    return 'frontend';
  } else if (lowerSource.includes('react')) {
    return 'frontend';
  } else if (lowerSource.includes('node')) {
    return 'backend';
  } else if (lowerSource.includes('express')) {
    return 'backend';
  } else if (lowerSource.includes('api')) {
    return 'backend';
  } else if (lowerSource.includes('sql')) {
    return 'databases';
  } else if (lowerSource.includes('database')) {
    return 'databases';
  } else if (lowerSource.includes('mongodb')) {
    return 'databases';
  }
  return null;
};

function Dashboard() {
  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({ frontend: 0, backend: 0, databases: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userCourseProgress, setUserCourseProgress] = useState({});
  const navigate = useNavigate();

  // Handler for category navigation
  const handleCategoryNavigate = (category) => {
    // Capitalize first letter for filter match
    const filter = category.charAt(0).toUpperCase() + category.slice(1);
    navigate('/courses', { state: { filter } });
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    const fetchData = async () => {
      if (!isMounted) return; // Don't proceed if component unmounted
      
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        if (isMounted) {
          setUser({ name: 'Learner', uid: null });
          setCourses([]);
          setUserCourseProgress({});
          setRecentActivities([]);
          setProgress({ frontend: 0, backend: 0, databases: 0 });
          setLoading(false);
        }
        return;
      }
      
      if (isMounted) {
        setUser({ name: currentUser.displayName || 'Learner', uid: currentUser.uid });
      }
      
      try {
        // Fetch courses and user progress using the same pattern as CourseDetail.jsx
        // This ensures consistency between the detailed progress tracking and dashboard display
        const apiUrl = import.meta.env.VITE_COURSES_API_URL;
        const db = getFirestore();
        
        // Query userProgress collection for current user
        // Use the same pattern as CourseDetail.jsx: fetch progress for each course individually
        
        const tokenPromise = currentUser.getIdToken();
        const coursesRes = await tokenPromise.then(token =>
          axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
        );
        
        if (!isMounted) return; // Check again after async operation
        
        const rawCourses = Array.isArray(coursesRes.data)
          ? coursesRes.data
          : coursesRes.data.Items || coursesRes.data.courses || [];
        setCourses(rawCourses);

        // Fetch user progress for each course using the same pattern as CourseDetail.jsx
        const progressMap = {};
        const activities = [];
        
        await Promise.all(
          rawCourses.map(async (course) => {
            if (!isMounted) return; // Check if still mounted
            
            const courseId = course.module_id || course.id;
            if (!courseId) return;
            
            try {
              // Use the same document ID pattern as CourseDetail.jsx
              const docId = `${currentUser.uid}_${courseId}`;
              const progressRef = doc(db, 'userProgress', docId);
              const progressSnap = await getDoc(progressRef);
              
              if (!isMounted) return; // Check again after async operation
              
              if (progressSnap.exists()) {
                const data = progressSnap.data();
                progressMap[courseId] = data;
                
                // Find course title
                const courseTitle = course.title || course.name || courseId;
                
                // Calculate completed sections count
                const completedCount = data.completedSections ? 
                  (Array.isArray(data.completedSections) ? data.completedSections.length : 0) : 0;
                const currentSection = data.currentSectionIndex || 0;
                
                // Create activity entry
                if (completedCount > 0) {
                  const action = completedCount === 1
                    ? `Completed 1 section in "${courseTitle}"`
                    : `Completed ${completedCount} sections in "${courseTitle}"`;
                  activities.push({ 
                    id: docId, 
                    action, 
                    timestamp: 'Recently',
                    courseId: courseId,
                    completedCount,
                    currentSection
                  });
                } else if (currentSection >= 0 || data.currentSectionIndex !== undefined) {
                  activities.push({ 
                    id: docId, 
                    action: `Started the course "${courseTitle}" (Section ${currentSection + 1})`, 
                    timestamp: 'Recently',
                    courseId: courseId,
                    completedCount,
                    currentSection
                  });
                }
              }
            } catch (error) {
              console.error(`❌ Dashboard: Error fetching progress for course ${courseId}:`, error);
            }
          })
        );
        
        if (!isMounted) return; // Final check before setting state
        
        setUserCourseProgress(progressMap);
        setRecentActivities(activities);

        // Calculate category-based progress
        const categoryProgress = { frontend: 0, backend: 0, databases: 0 };
        const categoryCourseCounts = { frontend: 0, backend: 0, databases: 0 };
        const categoryCompletionTotals = { frontend: 0, backend: 0, databases: 0 };
        
        rawCourses.forEach((course) => {
          const category = mapCourseToCategory(course.module_id || course.id, course.title);
          
          if (!category || !categoryProgress.hasOwnProperty(category)) return;
          
          categoryCourseCounts[category]++;
          
          const courseId = course.module_id || course.id;
          const userProgress = progressMap[courseId];
          if (userProgress && userProgress.completedSections) {
            // Calculate total sections: use toc length from sections + 1 for quiz (same as CourseDetail.jsx)
            // Since we don't have toc here, use sections.length or a reasonable fallback
            const baseSections = course.sections ? course.sections.length : 
              (course.totalSections || 6); // Default to 6 sections per course
            const totalSections = baseSections + 1; // +1 for quiz (same as CourseDetail.jsx)
            
            const completedSections = Array.isArray(userProgress.completedSections) ? 
              userProgress.completedSections.length : 0;
            
            // Check if quiz is completed (same logic as CourseDetail.jsx)
            const quizComplete = userProgress.quizSubmitted && 
              userProgress.quizAnswers && 
              Object.keys(userProgress.quizAnswers).length > 0;
            
            const totalCompleted = completedSections + (quizComplete ? 1 : 0);
            
            // Calculate percentage
            if (totalSections > 0) {
              const courseCompletionPercent = Math.min(100, (totalCompleted / totalSections) * 100);
              categoryCompletionTotals[category] += courseCompletionPercent;
            }
          }
        });
        
        // Calculate average progress per category
        const finalProgress = {};
        Object.keys(categoryProgress).forEach(category => {
          if (categoryCourseCounts[category] > 0) {
            finalProgress[category] = Math.round(
              categoryCompletionTotals[category] / categoryCourseCounts[category]
            );
          } else {
            finalProgress[category] = 0;
          }
        });
        
        if (isMounted) {
          setProgress(finalProgress);
        }
        
      } catch (err) {
        console.error('❌ Dashboard: Error fetching dashboard data:', err);
        if (isMounted) {
          setCourses([]);
          setUserCourseProgress({});
          setRecentActivities([]);
          setProgress({ frontend: 0, backend: 0, databases: 0 });
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Calculate overall progress (only average categories with at least one course)
  const categoryProgress = [progress.frontend, progress.backend, progress.databases];
  const categoryCounts = [progress.frontend, progress.backend, progress.databases].filter(p => p > 0).length;
  const overallProgress = categoryCounts > 0
    ? Math.round(categoryProgress.filter(p => p > 0).reduce((a, b) => a + b, 0) / categoryCounts)
    : 0;

  // Motivational quotes by team members
  const motivationalQuotes = [
    {
      text: "The only way to learn to code is to write code. Keep building, keep learning!",
      author: "Pranay Jumbarthi",
    },
    {
      text: "Every bug you fix is a step closer to mastery. Embrace the errors!",
      author: "Vishnu Tej G",
    },
    {
      text: "Consistency beats intensity. Code a little every day.",
      author: "Saandeep",
    },
    {
      text: "Great developers aren’t born—they’re built, one project at a time.",
      author: "Hemanth",
    },
  ];
  // Pick a quote based on user UID (so each user sees the same quote every time)
  let quoteIndex = 0;
  if (user && user.uid) {
    // Simple hash: sum char codes of UID, mod quotes length
    quoteIndex = user.uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % motivationalQuotes.length;
  } else {
    // Fallback: use current date to rotate quotes for non-logged-in users
    const today = new Date();
    quoteIndex = (today.getDate() + today.getMonth()) % motivationalQuotes.length;
  }
  const motivationalQuote = motivationalQuotes[quoteIndex];

  const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;
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

  // Instead, use latest courses as 'blogs'
  const latestCourses = courses.slice(0, 4); // Show 4 latest courses

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        {/* Welcome Section */}
        <motion.section
          className="welcome-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="welcome-content"
          >
            <div className="welcome-text">
              <h1>Welcome Back, {user.name}!</h1>
              <p>Your journey to mastering web development continues here.</p>
            </div>
            <div className="welcome-actions">
              <motion.button
                className="action-btn primary"
                variants={hoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/courses')}
              >
                <SchoolIcon />
                Browse Courses
              </motion.button>
              <motion.button
                className="action-btn secondary"
                variants={hoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
              >
                <RefreshIcon />
                Refresh Data
              </motion.button>
            </div>
          </motion.div>
        </motion.section>        {/* Enhanced Overall Progress Widget */}
        <motion.section
          className="overall-progress-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="progress-stats-grid">
            <motion.div
              className="stat-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="stat-icon">
                <TrendingUpIcon />
              </div>
              <div className="stat-content">
                <h3>{overallProgress}%</h3>
                <p>Overall Progress</p>
              </div>
            </motion.div>
            
            <motion.div
              className="stat-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="stat-icon">
                <LibraryBooksIcon />
              </div>
              <div className="stat-content">
                <h3>{courses.length}</h3>
                <p>Available Courses</p>
              </div>
            </motion.div>
            
            <motion.div
              className="stat-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="stat-icon">
                <CompletedIcon />
              </div>
              <div className="stat-content">
                <h3>{Object.keys(userCourseProgress).length}</h3>
                <p>Courses Started</p>
              </div>
            </motion.div>
            
            <motion.div
              className="stat-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="stat-icon">
                <EmojiEventsIcon />
              </div>
              <div className="stat-content">
                <h3>{recentActivities.length}</h3>
                <p>Recent Activities</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="overall-progress-widget"
            variants={hoverVariants}
            whileHover="hover"
          >
            <AutoGraphIcon className="overall-progress-icon" />
            <div className="overall-progress-text">
              <h3>Learning Journey</h3>
              <p>{overallProgress}% Complete Across All Categories</p>
            </div>
            <div className="overall-progress-bar">
              <motion.div
                className="overall-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              ></motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Learning Progress */}
        <motion.section
          className="progress-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Your Learning Progress</h2>
          <div className="progress-container">            <motion.div
              className="progress-card frontend"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="progress-card-header">
                <WebIcon className="category-icon" />
                <div className="progress-info">
                  <h3>Frontend</h3>
                  <p>{progress.frontend}% Complete</p>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.frontend}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button 
                  className="progress-link" 
                  onClick={() => handleCategoryNavigate('Frontend')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryNavigate('Frontend');
                    }
                  }}
                >
                  <PlayIcon />
                  Continue Learning
                </button>
              </motion.div>
            </motion.div>            <motion.div
              className="progress-card backend"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="progress-card-header">
                <ApiIcon className="category-icon" />
                <div className="progress-info">
                  <h3>Backend</h3>
                  <p>{progress.backend}% Complete</p>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.backend}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button 
                  className="progress-link" 
                  onClick={() => handleCategoryNavigate('Backend')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryNavigate('Backend');
                    }
                  }}
                >
                  <PlayIcon />
                  Continue Learning
                </button>
              </motion.div>
            </motion.div>            <motion.div
              className="progress-card databases"
              variants={hoverVariants}
              whileHover="hover"
            >
              <div className="progress-card-header">
                <StorageIcon className="category-icon" />
                <div className="progress-info">
                  <h3>Databases</h3>
                  <p>{progress.databases}% Complete</p>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.databases}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button 
                  className="progress-link" 
                  onClick={() => handleCategoryNavigate('Databases')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryNavigate('Databases');
                    }
                  }}
                >
                  <PlayIcon />
                  Continue Learning
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Real Course Progress Section */}
        <motion.section
          className="progress-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Your Course Progress</h2>          <div className="progress-container">
            {Object.keys(userCourseProgress).length === 0 ? (
              <div className="empty-state">
                <LibraryBooksIcon className="empty-icon" />
                <h3>No courses started yet</h3>
                <p>Start your learning journey by exploring our courses!</p>
                <Link to="/courses" className="empty-cta">Browse Courses</Link>
              </div>
            ) : null}
            {courses.map((course) => {
              const courseId = course.module_id || course.id;
              const progressData = userCourseProgress[courseId];
              
              // Only show courses that have been started
              if (!progressData) return null;
              
              // Calculate total sections: base sections + 1 for quiz (same as CourseDetail.jsx)
              const baseSections = course.sections ? course.sections.length : 
                (course.totalSections || 6); // Default to 6 sections per course
              const totalSections = baseSections + 1; // +1 for quiz
              
              const completedSections = progressData.completedSections ? 
                (Array.isArray(progressData.completedSections) ? progressData.completedSections.length : 0) : 0;
              const currentSection = progressData.currentSectionIndex || 0;
              
              // Check if quiz is completed (same logic as CourseDetail.jsx)
              const quizComplete = progressData.quizSubmitted && 
                progressData.quizAnswers && 
                Object.keys(progressData.quizAnswers).length > 0;
              
              const totalCompleted = completedSections + (quizComplete ? 1 : 0);
              
              // Calculate progress percentage (same as CourseDetail.jsx)
              const percent = totalSections > 0 ? 
                Math.min(100, Math.round((totalCompleted / totalSections) * 100)) : 0;
              
              // Determine status
              let statusText = '';
              if (percent === 100) {
                statusText = 'Course Completed! 🎉';
              } else if (completedSections > 0) {
                statusText = `${percent}% Complete (${completedSections}/${baseSections} sections${quizComplete ? ' + quiz' : ''}) • Currently on Section ${currentSection + 1}`;
              } else {
                statusText = `Started • Currently on Section ${currentSection + 1}`;
              }
              
              return (
                <motion.div
                  key={courseId}
                  className="progress-card"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <h3>{course.title || 'Untitled Course'}</h3>
                  <p>{statusText}</p>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    ></motion.div>
                  </div>
                  <motion.div variants={hoverVariants} whileHover="hover">
                    <Link to={`/courses/${courseId}`} className="progress-link">
                      {percent === 100 ? 'Review Course' : 
                       completedSections > 0 ? 'Continue Course' : 'Start Course'}
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Blog Section */}
        <motion.section
          className="blog-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Latest Courses</h2>
          <div className="blog-container">
            {latestCourses.map((course) => (
              <motion.div
                key={course.id || course.module_id}
                className="blog-card"
                variants={hoverVariants}
                whileHover="hover"
              >
                <span className={`blog-category ${course.category ? course.category.toLowerCase().replace(/\s/g, '-') : ''}`}>{course.category || 'Course'}</span>
                <h3>{course.title || 'Untitled Course'}</h3>
                <p>{course.description || 'No description provided.'}</p>
                <motion.div variants={hoverVariants} whileHover="hover">
                  <Link to={`/courses/${course.id || course.module_id}`} className="blog-link">View Course</Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Activity Section */}
        <motion.section
          className="recent-activity-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Recent Activity</h2>          <div className="recent-activity-container">
            {recentActivities.length === 0 ? (
              <div className="empty-state">
                <HistoryIcon className="empty-icon" />
                <h3>No recent activity</h3>
                <p>Start learning to see your progress here!</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="activity-card"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <HistoryIcon className="activity-icon" />
                  <div className="activity-details">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-timestamp">{activity.timestamp}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Motivational Quote Section */}
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
              <p>{motivationalQuote.text}</p>
              <footer>— {motivationalQuote.author}</footer>
            </blockquote>
          </motion.div>
        </motion.section>        {/* Enhanced Quick Links */}
        <motion.section
          className="quick-links"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Quick Actions</h2>
          <div className="quick-links-container">
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/Courses" className="quick-link-card primary">
                <span className="quick-link-icon"><LibraryBooksIcon /></span>
                <span className="quick-link-text">Browse Courses</span>
                <span className="quick-link-desc">Explore all available courses</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/playground" className="quick-link-card secondary">
                <span className="quick-link-icon"><CodeIcon /></span>
                <span className="quick-link-text">Code Playground</span>
                <span className="quick-link-desc">Test your code instantly</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/assignments" className="quick-link-card success">
                <span className="quick-link-icon"><AssignmentIcon /></span>
                <span className="quick-link-text">Assignments</span>
                <span className="quick-link-desc">View and submit assignments</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/quizzes" className="quick-link-card warning">
                <span className="quick-link-icon"><QuizIcon /></span>
                <span className="quick-link-text">Quizzes</span>
                <span className="quick-link-desc">Test your knowledge</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/projects" className="quick-link-card info">
                <span className="quick-link-icon"><GitHubIcon /></span>
                <span className="quick-link-text">Projects</span>
                <span className="quick-link-desc">Showcase your work</span>
              </Link>
            </motion.div>
            
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/profile" className="quick-link-card purple">
                <span className="quick-link-icon"><PersonIcon /></span>
                <span className="quick-link-text">Profile</span>
                <span className="quick-link-desc">Update your profile</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default Dashboard;