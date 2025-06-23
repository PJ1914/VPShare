import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios';
import {
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  FormatQuote as QuoteIcon,
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
    const fetchData = async () => {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser({ name: 'Learner' });
        setCourses([]);
        setUserCourseProgress({});
        setRecentActivities([]);
        setProgress({ frontend: 0, backend: 0, databases: 0 }); // Reset progress if not logged in
        setLoading(false);
        return;
      }
      setUser({ name: currentUser.displayName || 'Learner' });
      try {
        // Parallel fetch of courses and user progress
        const apiUrl = import.meta.env.VITE_COURSES_API_URL;
        const db = getFirestore();
        const progressQuery = query(
          collection(db, 'userProgress'),
          where('__name__', '>=', `${currentUser.uid}_`),
          where('__name__', '<', `${currentUser.uid}_\uf8ff`)
        );
        const tokenPromise = currentUser.getIdToken();
        const [coursesRes, querySnapshot] = await Promise.all([
          tokenPromise.then(token =>
            axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
          ),
          getDocs(progressQuery)
        ]);
        const rawCourses = Array.isArray(coursesRes.data)
          ? coursesRes.data
          : coursesRes.data.Items || coursesRes.data.courses || [];
        setCourses(rawCourses);

        // Process progress and recent activities
        const progressMap = {};
        const activities = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.courseId && Array.isArray(data.completedSections)) {
            progressMap[data.courseId] = data;
            // Determine course title
            let courseTitle = data.courseTitle;
            if (!courseTitle) {
              const found = rawCourses.find(c => c.module_id === data.courseId || c.id === data.courseId);
              courseTitle = found ? found.title : data.courseId;
            }
            const count = data.completedSections.length;
            const action =
              count === 0
                ? `Started the course "${courseTitle}"`
                : count === 1
                ? `Completed 1 section in "${courseTitle}"`
                : `Completed ${count} sections in "${courseTitle}"`;
            activities.push({ id: docSnap.id, action, timestamp: 'Recently' });
          }
        });
        setUserCourseProgress(progressMap);
        setRecentActivities(activities);

        // 3. Calculate per-category progress
        const categoryTotals = { frontend: 0, backend: 0, databases: 0 };
        const categoryCounts = { frontend: 0, backend: 0, databases: 0 };
        rawCourses.forEach((course) => {
          const category = mapCourseToCategory(course.module_id, course.title);
          if (!category) return;
          const progress = progressMap[course.module_id];
          const totalSections = course.sections ? course.sections.length : 10;
          const completed = progress ? progress.completedSections.length : 0;
          const percent = totalSections > 0 ? Math.round((completed / totalSections) * 100) : 0;
          categoryTotals[category] += percent;
          categoryCounts[category] += 1;
        });
        const frontend = categoryCounts.frontend ? Math.round(categoryTotals.frontend / categoryCounts.frontend) : 0;
        const backend = categoryCounts.backend ? Math.round(categoryTotals.backend / categoryCounts.backend) : 0;
        const databases = categoryCounts.databases ? Math.round(categoryTotals.databases / categoryCounts.databases) : 0;
        setProgress({ frontend, backend, databases });
      } catch (err) {
        setCourses([]);
        setUserCourseProgress({});
        setRecentActivities([]);
        setProgress({ frontend: 0, backend: 0, databases: 0 }); // Reset progress on error
        // Optionally log error or show a message
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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
  }
  const motivationalQuote = motivationalQuotes[quoteIndex];

  const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;

  if (loading) {
    return (
      <div className="dashboard-container"><main className="dashboard-main"></main></div>
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
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1>Welcome Back, {user.name}!</h1>
            <p>Your journey to mastering web development continues here.</p>
          </motion.div>
        </motion.section>

        {/* Overall Progress Widget */}
        <motion.section
          className="overall-progress-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <motion.div
            className="overall-progress-widget"
            variants={hoverVariants}
            whileHover="hover"
          >
            <TrendingUpIcon className="overall-progress-icon" />
            <div className="overall-progress-text">
              <h3>Overall Progress</h3>
              <p>{overallProgress}% Complete</p>
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
          <div className="progress-container">
            <motion.div
              className="progress-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Frontend</h3>
              <p>{progress.frontend}% Complete</p>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.frontend}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button className="progress-link" onClick={() => handleCategoryNavigate('Frontend')}>
                  Continue Learning
                </button>
              </motion.div>
            </motion.div>
            <motion.div
              className="progress-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Backend</h3>
              <p>{progress.backend}% Complete</p>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.backend}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button className="progress-link" onClick={() => handleCategoryNavigate('Backend')}>
                  Continue Learning
                </button>
              </motion.div>
            </motion.div>
            <motion.div
              className="progress-card"
              variants={hoverVariants}
              whileHover="hover"
            >
              <h3>Databases</h3>
              <p>{progress.databases}% Complete</p>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.databases}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                ></motion.div>
              </div>
              <motion.div variants={hoverVariants} whileHover="hover">
                <button className="progress-link" onClick={() => handleCategoryNavigate('Databases')}>
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
          <h2>Your Course Progress</h2>
          <div className="progress-container">
            {Object.keys(userCourseProgress).length === 0 && <p>You haven't started any courses yet.</p>}
            {courses.map((course) => {
              const progress = userCourseProgress[course.module_id];
              if (!progress || !Array.isArray(progress.completedSections) || progress.completedSections.length === 0) return null;
              const totalSections = course.sections ? course.sections.length : 10; // fallback if sections not present
              const completed = progress.completedSections.length;
              const percent = totalSections > 0 ? Math.round((completed / totalSections) * 100) : 0;
              return (
                <motion.div
                  key={course.module_id}
                  className="progress-card"
                  variants={hoverVariants}
                  whileHover="hover"
                >
                  <h3>{course.title || 'Untitled Course'}</h3>
                  <p>{percent}% Complete</p>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    ></motion.div>
                  </div>
                  <motion.div variants={hoverVariants} whileHover="hover">
                    <Link to={`/courses/${course.module_id}`} className="progress-link">
                      {percent > 0 ? 'Continue Course' : 'Start Course'}
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
          <h2>Recent Activity</h2>
          <div className="recent-activity-container">
            {recentActivities.map((activity) => (
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
            ))}
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
        </motion.section>

        {/* Quick Links */}
        <motion.section
          className="quick-links"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Quick Links</h2>
          <div className="quick-links-container">
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/Courses" className="quick-link-card">
                <span className="quick-link-icon"><LibraryBooksIcon /></span>
                <span className="quick-link-text">Browse All Courses</span>
              </Link>
            </motion.div>
            {/* New: Go to Courses API link */}
            {coursesApiUrl && (
              <motion.div variants={hoverVariants} whileHover="hover">
                <a
                  href={coursesApiUrl}
                  className="quick-link-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Go to Courses API"
                >
                  <span className="quick-link-icon"><LibraryBooksIcon /></span>
                  <span className="quick-link-text">Go to Courses API</span>
                </a>
              </motion.div>
            )}
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/profile" className="quick-link-card">
                <span className="quick-link-icon"><PersonIcon /></span>
                <span className="quick-link-text">Update Profile</span>
              </Link>
            </motion.div>
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/support" className="quick-link-card">
                <span className="quick-link-icon"><SupportIcon /></span>
                <span className="quick-link-text">Get Support</span>
              </Link>
            </motion.div>
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="/playground" className="quick-link-card">
                <span className="quick-link-icon"><CodeIcon /></span>
                <span className="quick-link-text">Code Playground</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default Dashboard;