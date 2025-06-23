import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDoc, doc } from 'firebase/firestore';
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
  } else if (lowerSource.includes('c++')) {
    return 'Programming Languages';
  }else if (lowerSource.includes('c')){
    return 'Programming Languages';
  }
  return 'Misc';
};

function Courses() {
  const location = useLocation();
  const [filter, setFilter] = useState(() => {
    // Use filter from navigation state if present, else default to 'All'
    return location.state && location.state.filter ? location.state.filter : 'All';
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      setLoading(true);
      setError(null);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please log in to view courses.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      let authToken;
      try {
        authToken = await user.getIdToken();
      } catch (tokenError) {
        setError("Authentication error. Please log out and log in again.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      const apiUrl = import.meta.env.VITE_COURSES_API_URL;
      if (!apiUrl) {
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
        const rawData = Array.isArray(response.data)
          ? response.data
          : response.data.Items || response.data.courses || [];
        if (!rawData.length) {
          setError("No courses available. Check back later or contact support.");
          setCourses([]);
          setLoading(false);
          return;
        }

        // Fetch user progress for each course by ID
        const db = getFirestore();
        const progressMap = {};
        await Promise.all(
          rawData.map(async (course) => {
            const courseId = course.module_id;
            if (!courseId) return;
            const progressDocId = `${user.uid}_${courseId}`;
            const progressDocRef = doc(db, 'userProgress', progressDocId);
            const progressSnap = await getDoc(progressDocRef);
            if (progressSnap.exists()) {
              const data = progressSnap.data();
              if (data.courseId && Array.isArray(data.completedSections)) {
                progressMap[courseId] = data;
              }
            }
          })
        );

        // Merge progress into courses
        const enrichedCourses = rawData
          .map(course => {
            const courseId = course.module_id;
            if (!courseId) return null;
            const category = mapModuleIdToCategory(courseId, course.title);
            if (category === 'Misc') return null;
            // Calculate percent complete (include quiz as a section if present)
            const progress = progressMap[courseId];
            let totalSections = Array.isArray(course.sections) ? course.sections.length : 10; // fallback
            let completed = progress ? progress.completedSections.length : 0;
            let quizComplete = false;
            if (course.quiz) {
              totalSections += 1; // Count quiz as a section
              // Quiz is complete if quizSubmitted is true and all answers are present
              if (progress && progress.quizSubmitted && progress.quizAnswers && Object.keys(progress.quizAnswers).length === (course.quiz.questions ? course.quiz.questions.length : 2)) {
                quizComplete = true;
              }
            }
            if (quizComplete) {
              completed += 1;
            }
            // Cap percent at 100 when completed meets or exceeds total sections
            let percent = 0;
            if (totalSections > 0) {
              if (completed >= totalSections) {
                percent = 100;
              } else {
                percent = Math.round((completed / totalSections) * 100);
              }
            }
            // Determine next section index for continuation (0-based)
            const progressSectionIndex = completed < totalSections ? completed : totalSections - 1;
            return {
              id: courseId,
              title: course.title || 'Untitled Course',
              description: course.description || 'No description provided.',
              category: category,
              level: course.level || 'Beginner',
              link: `/courses/${courseId}`,
              progress: percent,
              progressSectionIndex,
            };
          })
          .filter(course => course !== null);

        setCourses(enrichedCourses);
      } catch (err) {
        setError("Unexpected error: " + (err.message || err));
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndProgress();
    window.scrollTo(0, 0);
  }, [navigate]);

  // Update filter if navigation state changes (e.g., user clicks category from Dashboard)
  useEffect(() => {
    if (location.state && location.state.filter && location.state.filter !== filter) {
      setFilter(location.state.filter);
    }
    // eslint-disable-next-line
  }, [location.state]);

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
                filteredCourses.map(course => {
                  // Determine the section to continue from (default 0)
                  const continueSection = course.progress && course.progress < 100 ? course.progressSectionIndex || 0 : 0;
                  return (
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
                          {course.progress === 100 ? (
                            <p className="course-completed">Course Completed!</p>
                          ) : (
                            <>
                              <p>{course.progress}% Complete</p>
                              <div className="progress-bar">
                                <motion.div
                                  className="progress-fill"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                ></motion.div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {/* Remove motion.div hover for the course-link button */}
                      <div>
                        <Link
                          to={course.link}
                          className="course-link"
                          aria-label={`Go to ${course.title}`}
                          state={{ continueSection: continueSection }}
                        >
                          {course.progress === 100 ? 'View Course' : course.progress > 0 ? 'Continue Course' : 'Start Course'}
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
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