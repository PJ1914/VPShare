import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth } from 'firebase/auth';
import '../styles/Courses.css';

// Configure axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

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

// Helper to check if a string is a UUID
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const mapModuleIdToCategory = (moduleId, title = '') => {
  let source = moduleId;
  if (isUUID(moduleId) && title) {
    source = title;
  }
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('html')) {
    return 'Frontend';
  } else if (lowerSource.includes('css')) {
    return 'Frontend';
  } else if (lowerSource.includes('javascript')) {
    return 'Frontend';
  } else if (lowerSource.includes('react')) {
    return 'Frontend';
  } else if (lowerSource.includes('node')) {
    return 'Backend';
  } else if (lowerSource.includes('express')) {
    return 'Backend';
  } else if (lowerSource.includes('api')) {
    return 'Backend';
  } else if (lowerSource.includes('sql')) {
    return 'Databases';
  } else if (lowerSource.includes('database')) {
    return 'Databases';
  } else if (lowerSource.includes('mongodb')) {
    return 'Databases';
  } else if (lowerSource.includes('git')) {
    return 'Version Control';
  } else if (lowerSource.includes('github')) {
    return 'Version Control';
  } else if (lowerSource.includes('agile')) {
    return 'Project Management';
  } else if (lowerSource.includes('scrum')) {
    return 'Project Management';
  } else if (lowerSource.includes('project')) {
    return 'Project Management';
  } else if (lowerSource.includes('python')) {
    return 'Programming Languages';
  } else if (lowerSource.includes('java')) {
    return 'Programming Languages';
  } else if (lowerSource.includes('cpp')) {
    return 'Programming Languages';
  }
  return 'Misc';
};

function Courses() {
  const [filter, setFilter] = useState('All');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Enhanced category mapping: use title if module_id is not descriptive
  const mapCourseToCategory = (course) => {
    const moduleId = course.module_id || '';
    const title = (course.title || '').toLowerCase();
    const lowerModuleId = moduleId.toLowerCase();
    // First, try module_id as before
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
    // If module_id is not descriptive, use title
    if (title.includes('html') || title.includes('css') || title.includes('javascript') || title.includes('react')) {
      return 'Frontend';
    } else if (title.includes('node') || title.includes('express') || title.includes('api')) {
      return 'Backend';
    } else if (title.includes('sql') || title.includes('database') || title.includes('mongodb')) {
      return 'Databases';
    } else if (title.includes('git') || title.includes('github')) {
      return 'Version Control';
    } else if (title.includes('agile') || title.includes('scrum') || title.includes('project')) {
      return 'Project Management';
    } else if (title.includes('python') || title.includes('java') || title.includes('cpp')) {
      return 'Programming Languages';
    }
    return 'Misc';
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn("Courses: No authenticated user found.");
        setError("Please log in to view courses.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      let authToken;
      try {
        authToken = await user.getIdToken();
        console.log("Courses: Firebase ID Token obtained successfully.");
      } catch (tokenError) {
        console.error("Courses: Failed to get Firebase ID token:", tokenError.message);
        setError("Authentication error. Please log out and log in again.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      const apiUrl = import.meta.env.VITE_COURSES_API_URL;
      console.log("Courses: Using API URL:", apiUrl);

      if (!apiUrl) {
        console.warn("Courses: VITE_COURSES_API_URL is not set.");
        setError("Server configuration error. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const response = await axios.get(apiUrl, { headers, timeout: 30000 });
        console.log("Courses: API response:", response.data);

        const rawData = Array.isArray(response.data)
          ? response.data
          : response.data.Items || response.data.courses || [];

        if (!rawData.length) {
          console.warn("Courses: No courses returned from API");
          setError("No courses available. Check back later or contact support.");
          setCourses([]);
          setLoading(false);
          return;
        }

        const userProgress = {
          'html_css_basics': 25,
          'node_js_intro': 10,
        };

        const enrichedCourses = rawData
          .map(course => {
            const courseId = course.module_id;
            if (!courseId) {
              console.warn("Courses: Skipping course with missing module_id:", course);
              return null;
            }
            // Use title for category if module_id is a UUID
            const category = mapModuleIdToCategory(courseId, course.title);
            if (category === 'Misc') return null; // Filter out Misc courses
            return {
              id: courseId,
              title: course.title || 'Untitled Course',
              description: course.description || 'No description provided.',
              category: category,
              level: course.level || 'Beginner',
              link: `/courses/${courseId}`,
              progress: userProgress[courseId] || 0,
            };
          })
          .filter(course => course !== null);

        setCourses(enrichedCourses);
      } catch (err) {
        console.error("Courses: Error fetching courses:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("Courses: Server Response:", err.response.data, "Status:", err.response.status);
            switch (err.response.status) {
              case 400:
                setError("Invalid request. Please contact support.");
                break;
              case 403:
                setError("Access denied. Please log in again.");
                navigate('/login', { replace: true });
                break;
              case 404:
                setError("Courses not found. Please contact support.");
                break;
              case 500:
                setError("Server error. Please try again later or contact support.");
                break;
              default:
                setError(`Server error (Code: ${err.response.status}). Please try again.`);
            }
          } else if (err.request) {
            console.error("Courses: No response received:", err.request);
            setError("Network error: Unable to connect to the server.");
          } else {
            console.error("Courses: Request setup error:", err.message);
            setError(`Unexpected error: ${err.message}.`);
          }
        } else {
          setError(`Unexpected error: ${err.message}.`);
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
    ? courses.filter(course => course.category !== 'Misc')
    : courses.filter(course => course.category === filter);

  const categories = [
    'All',
    'Frontend',
    'Backend',
    'Databases',
    'Version Control',
    'Project Management',
    'Programming Languages',
    // 'Misc', // Removed Misc from filter bar
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

        <motion.section
          className="course-list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          id="courses"
        >
          <h2>{filter} Courses</h2>

          {loading && (
            <div className="loading-container">
              <p className="loading-text">Loading courses...</p>
              <div className="spinner" role="status" aria-label="Loading"></div>
            </div>
          )}
          {error && (
            <div className="error-container">
              <p className="error-text">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="error-back-button"
                aria-label="Back to Home"
              >
                Back to Home
              </button>
            </div>
          )}

          <motion.div
            className="course-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="sync">
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
                      <Link to={course.link} className="course-link" aria-label={`Go to ${course.title}`}>
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