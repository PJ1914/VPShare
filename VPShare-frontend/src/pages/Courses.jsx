import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Courses.css';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Animation variants for buttons and cards
const hoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

// Animation variants for course cards during filter transition
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

function Courses() {
  const [filter, setFilter] = useState('All');

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sample course data (replace with API call from src/services/)
  const courses = [
    // Existing Courses
    {
      id: 1,
      category: 'Frontend',
      title: 'HTML & CSS Fundamentals',
      description: 'Learn to build and style web pages with HTML and CSS.',
      level: 'Beginner',
      link: '/courses/html-css',
    },
    {
      id: 2,
      category: 'Frontend',
      title: 'JavaScript Essentials',
      description: 'Master JavaScript to add interactivity to your websites.',
      level: 'Beginner',
      link: '/courses/javascript',
    },
    {
      id: 3,
      category: 'Frontend',
      title: 'React for Beginners',
      description: 'Build dynamic user interfaces with React.',
      level: 'Intermediate',
      link: '/courses/react',
    },
    {
      id: 4,
      category: 'Backend',
      title: 'Node.js and Express',
      description: 'Create server-side applications with Node.js and Express.',
      level: 'Beginner',
      link: '/courses/node-js',
    },
    {
      id: 5,
      category: 'Backend',
      title: 'RESTful APIs',
      description: 'Design and build RESTful APIs for web applications.',
      level: 'Intermediate',
      link: '/courses/rest-apis',
    },
    {
      id: 6,
      category: 'Databases',
      title: 'SQL Basics',
      description: 'Learn to query and manage databases with SQL.',
      level: 'Beginner',
      link: '/courses/sql',
    },
    {
      id: 7,
      category: 'Databases',
      title: 'MongoDB for Beginners',
      description: 'Explore NoSQL databases with MongoDB.',
      level: 'Beginner',
      link: '/courses/mongodb',
    },
    // Version Control
    {
      id: 8,
      category: 'Version Control',
      title: 'Git Essentials',
      description: 'Learn the basics of version control with Git.',
      level: 'Beginner',
      link: '/courses/git',
    },
    {
      id: 9,
      category: 'Version Control',
      title: 'GitHub for Collaboration',
      description: 'Master GitHub for team collaboration and project management.',
      level: 'Beginner',
      link: '/courses/github',
    },
    // Project Management
    {
      id: 10,
      category: 'Project Management',
      title: 'Jira for Agile Teams',
      description: 'Learn to manage projects and workflows using Jira.',
      level: 'Beginner',
      link: '/courses/jira',
    },
    // Programming Languages
    {
      id: 11,
      category: 'Programming Languages',
      title: 'Python for Beginners',
      description: 'Start your programming journey with Python.',
      level: 'Beginner',
      link: '/courses/python',
    },
    {
      id: 12,
      category: 'Programming Languages',
      title: 'Java Fundamentals',
      description: 'Learn the basics of Java for building robust applications.',
      level: 'Beginner',
      link: '/courses/java',
    },
    {
      id: 13,
      category: 'Programming Languages',
      title: 'TypeScript Basics',
      description: 'Enhance your JavaScript skills with TypeScript.',
      level: 'Intermediate',
      link: '/courses/typescript',
    },
    // Additional Courses
    {
      id: 14,
      category: 'Frontend',
      title: 'Advanced CSS and Sass',
      description: 'Take your styling skills to the next level with CSS and Sass.',
      level: 'Intermediate',
      link: '/courses/advanced-css',
    },
    {
      id: 15,
      category: 'Backend',
      title: 'Authentication with JWT',
      description: 'Implement secure authentication using JSON Web Tokens.',
      level: 'Intermediate',
      link: '/courses/jwt-auth',
    },
    {
      id: 16,
      category: 'Databases',
      title: 'Advanced SQL Queries',
      description: 'Master complex SQL queries for data analysis.',
      level: 'Intermediate',
      link: '/courses/advanced-sql',
    },
  ];

  // Filter courses based on category
  const filteredCourses = filter === 'All' ? courses : courses.filter(course => course.category === filter);

  return (
    <div className="courses-container">
      <main className="courses-main">
        {/* Hero Section */}
        <motion.section
          className="courses-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1>Explore Our Courses</h1>
            <p>Master web development with our beginner-friendly courses in Frontend, Backend, Databases, and more.</p>
            <motion.div variants={hoverVariants} whileHover="hover">
              <Link to="#courses" className="hero-cta">Start Learning</Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Filter Bar */}
        <motion.section
          className="filter-bar"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>Filter Courses</h2>
          <div className="filter-buttons">
            {['All', 'Frontend', 'Backend', 'Databases', 'Version Control', 'Project Management', 'Programming Languages'].map(category => (
              <motion.button
                key={category}
                className={`filter-button ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
                variants={hoverVariants}
                whileHover="hover"
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Course List */}
        <motion.section
          className="course-list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h2>{filter} Courses</h2>
          <div className="course-grid">
            <AnimatePresence mode="wait">
              {filteredCourses.map(course => (
                <motion.div
                  key={course.id}
                  className="course-card"
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={hoverVariants.hover}
                >
                  <span className={`course-category ${course.category.toLowerCase().replace(' ', '-')}`}>{course.category}</span>
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <p className="course-level">Level: {course.level}</p>
                  <motion.div variants={hoverVariants} whileHover="hover">
                    <Link to={course.link} className="course-link">Start Course</Link>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default Courses;