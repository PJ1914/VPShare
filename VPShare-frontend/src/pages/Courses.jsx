import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

import '../styles/Courses.css';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const hoverVariants = {
  hover: { scale: 1.05, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)', transition: { duration: 0.3 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

function Courses() {
  const [filter, setFilter] = useState('All');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to map module_id to category
  const mapModuleIdToCategory = (moduleId) => {
    const lowerModuleId = moduleId.toLowerCase();
    if (lowerModuleId.includes('html') || lowerModuleId.includes('css') || lowerModuleId.includes('javascript') || lowerModuleId.includes('react')) {
      return 'Frontend';
    } else if (lowerModuleId.includes('node') || lowerModuleId.includes('express') || lowerModuleId.includes('api')) {
      return 'Backend';
    } else if (lowerModuleId.includes('sql') || lowerModuleId.includes('database') || lowerModuleId.includes('mongodb')) {
      return 'Databases';
    } else if (lowerModuleId.includes('git') || lowerModuleId.includes('github')) {
      return 'Version Control';
    } else if (lowerModuleId.includes('agile') || lowerModuleId.includes('scrum') || lowerModuleId.includes('project')) {
      return 'Project Management';
    } else if (lowerModuleId.includes('python') || lowerModuleId.includes('java') || lowerModuleId.includes('cpp')) {
      return 'Programming Languages';
    }
    return 'Misc'; // Fallback for unmapped categories
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const auth = getAuth();
      const user = auth.currentUser;
      let authToken = null;

      if (!user) {
        setError("You are not logged in. Please log in to view courses.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      try {
        authToken = await user.getIdToken();
        console.log("Courses: Firebase ID Token obtained successfully.");
      } catch (tokenError) {
        console.error("Courses: Failed to get Firebase ID token:", tokenError);
        setError("Failed to authenticate your session. Please log in again.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      const apiUrl = import.meta.env.VITE_COURSES_API_URL
      console.log("Courses: Using API URL:", apiUrl);

      if (!import.meta.env.VITE_COURSES_API_URL) {
        console.warn("Courses: Environment variable VITE_COURSES_API_URL is not set. Using fallback URL.");
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const response = await axios.get(apiUrl, { headers });

        const rawData = Array.isArray(response.data)
          ? response.data
          : response.data.Items || response.data.courses || [];

        // Mock progress data (in a real app, fetch this from an API or Firebase)
        const userProgress = {
          'html_css_basics': 25,
          'node_js_intro': 10,
          // Add more as needed
        };

        const enrichedCourses = rawData
          .map(course => {
            const courseId = course.module_id;
            if (!courseId) {
              console.warn("Courses: Skipping course with missing module_id:", course);
              return null;
            }
            const category = mapModuleIdToCategory(courseId);
            return {
              id: courseId,
              title: course.title || 'Untitled Course',
              description: course.description || 'No description provided.',
              category: category,
              level: course.level || 'Beginner',
              link: `/courses/${courseId}`,
              progress: userProgress[courseId] || 0, // Add progress data
            };
          })
          .filter(course => course !== null);

        setCourses(enrichedCourses);
      } catch (err) {
        console.error("Courses: Error fetching courses:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("Courses: Server Response Error:", err.response.data);
            console.error("Courses: Status Code:", err.response.status);
            setError(`Failed to load courses: ${err.response.data?.message || err.response.statusText || 'Server Error'}`);
          } else if (err.request) {
            console.error("Courses: No response received (network issue):", err.request);
            setError("Network Error: Could not connect to the server.");
          } else {
            console.error("Courses: Request setup error:", err.message);
            setError(`An unexpected error occurred: ${err.message}`);
          }
        } else {
          setError(`An unexpected error occurred: ${err.message}`);
        }
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    window.scrollTo(0, 0);
  }, [navigate]);

  const filteredCourses = filter === 'All'
    ? courses
    : courses.filter(course => course.category === filter);

  const categories = [
    'All',
    'Frontend',
    'Backend',
    'Databases',
    'Version Control',
    'Project Management',
    'Programming Languages',
    'Misc',
  ];

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <p>Master web development with beginner-friendly, job-ready courses.</p>
            <motion.div variants={hoverVariants} whileHover="hover">
              <button onClick={scrollToCourses} className="hero-cta">
                Start Learning
              </button>
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
            {categories.map(category => (
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
          id="courses"
        >
          <h2>{filter} Courses</h2>

          {loading && <p className="loading-text">Loading courses...</p>}
          {error && <p className="error-text">{error}</p>}

          <motion.div
            className="course-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <motion.div
                    key={course.id}
                    className="course-card"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                  >
                    <span className={`course-category ${course.category.toLowerCase().replace(/\s/g, '-')}`}>
                      {course.category}
                    </span>
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <p className="course-level">Level: {course.level}</p>
                    {course.progress > 0 && (
                      <div className="course-progress">
                        <p>{course.progress}% Complete</p>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          ></motion.div>
                        </div>
                      </div>
                    )}
                    <motion.div variants={hoverVariants} whileHover="hover">
                      <Link to={course.link} className="course-link">
                        {course.progress > 0 ? 'Continue Course' : 'Start Course'}
                      </Link>
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                !loading && !error && (
                  <motion.p
                    className="no-courses-found"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    No courses found in this category.
                  </motion.p>
                )
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

export default Courses;