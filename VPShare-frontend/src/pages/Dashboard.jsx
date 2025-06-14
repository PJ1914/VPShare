import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

function Dashboard() {
  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Placeholder for user data (replace with AuthContext or API call)
  const user = { name: 'Learner' };

  // Sample progress data (replace with API call)
  const progress = {
    frontend: 50,
    backend: 30,
    databases: 20,
  };

  // Calculate overall progress
  const overallProgress = Math.round(
    (progress.frontend + progress.backend + progress.databases) / 3
  );

  // Sample blog data (replace with API call from services/)
  const blogs = [
    {
      id: 1,
      category: 'Frontend',
      title: 'Getting Started with HTML & CSS',
      excerpt: 'Learn the basics of building web pages with HTML and styling with CSS.',
      link: '/blogs/html-css',
    },
    {
      id: 2,
      category: 'Backend',
      title: 'Introduction to Node.js',
      excerpt: 'Discover how to build server-side applications using Node.js and Express.',
      link: '/blogs/node-js',
    },
    {
      id: 3,
      category: 'Databases',
      title: 'SQL for Beginners',
      excerpt: 'Master the fundamentals of SQL to manage and query databases.',
      link: '/blogs/sql',
    },
    {
      id: 4,
      category: 'Frontend',
      title: 'React Basics',
      excerpt: 'Dive into React to create dynamic user interfaces.',
      link: '/blogs/react',
    },
  ];

  // Sample recent activity data (replace with API call)
  const recentActivities = [
    { id: 1, action: 'Completed HTML Basics Quiz', timestamp: '2 hours ago' },
    { id: 2, action: 'Started Node.js Course', timestamp: 'Yesterday' },
    { id: 3, action: 'Read Blog: SQL for Beginners', timestamp: '2 days ago' },
  ];

  // Sample motivational quote (can be fetched from an API like quotes.rest)
  const motivationalQuote = {
    text: "The only way to learn to code is to write code. Keep building, keep learning!",
    author: "Unknown",
  };

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
                <Link to="/courses/frontend" className="progress-link">Continue Learning</Link>
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
                <Link to="/courses/backend" className="progress-link">Continue Learning</Link>
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
                <Link to="/courses/databases" className="progress-link">Continue Learning</Link>
              </motion.div>
            </motion.div>
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
          <h2>Latest Blogs</h2>
          <div className="blog-container">
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                className="blog-card"
                variants={hoverVariants}
                whileHover="hover"
              >
                <span className={`blog-category ${blog.category.toLowerCase()}`}>{blog.category}</span>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <motion.div variants={hoverVariants} whileHover="hover">
                  <Link to={blog.link} className="blog-link">Read More</Link>
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