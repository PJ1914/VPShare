import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDoc, doc } from 'firebase/firestore';
import SEO from '../components/SEO';
import SubscriptionBanner from '../components/SubscriptionBanner';
import { useSubscription } from '../contexts/SubscriptionContext';
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

// Category mapping for courses
const CATEGORY_MAP = {
  html: 'Frontend', css: 'Frontend', javascript: 'Frontend', react: 'Frontend',
  node: 'Backend', express: 'Backend', api: 'Backend',
  sql: 'Databases', database: 'Databases', mongodb: 'Databases',
  git: 'Version Control', github: 'Version Control',
  agile: 'Project Management', scrum: 'Project Management', project: 'Project Management',
  python: 'Programming Languages', java: 'Programming Languages', 'c++': 'Programming Languages', c: 'Programming Languages'
};

const mapCourseToCategory = (courseId, title = '') => {
  const source = title ? title.toLowerCase() : courseId.toLowerCase();
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (source.includes(key)) return category;
  }
  return 'Misc';
};

// Helper to strip DynamoDB prefixes (e.g., "COURSE#html" -> "html")
const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

function Courses() {
  const location = useLocation();
  const { hasSubscription, loading: subscriptionLoading } = useSubscription();
  const [filter, setFilter] = useState(() => {
    return location.state && location.state.filter ? location.state.filter : 'All';
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const token = await user.getIdToken(true);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchCoursesData = async () => {
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

      try {
        const headers = await getAuthHeaders();
        const apiUrl = import.meta.env.VITE_COURSES_API_URL;

        // Fetch courses from new LMS API
        const coursesResponse = await axios.get(`${apiUrl}/courses`, { headers });
        const rawCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data.Items || [];

        if (!rawCourses.length) {
          setError("No courses available. Check back later or contact support.");
          setCourses([]);
          setLoading(false);
          return;
        }

        // Fetch modules for each course to get module count
        const coursesWithModules = await Promise.all(
          rawCourses.map(async (course) => {
            try {
              const courseId = stripPrefix(course.SK); // Remove COURSE# prefix
              const modulesResponse = await axios.get(`${apiUrl}/courses/${courseId}/modules`, { headers });
              const modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : modulesResponse.data.Items || [];
              
              const category = mapCourseToCategory(courseId, course.title);
              
              // Fetch user progress from Firestore
              const db = getFirestore();
              const progressDocId = `${user.uid}_${courseId}`;
              const progressDocRef = doc(db, 'userProgress', progressDocId);
              const progressSnap = await getDoc(progressDocRef);
              
              let progress = 0;
              let completedModules = 0;
              
              if (progressSnap.exists()) {
                const progressData = progressSnap.data();
                completedModules = progressData.completedSections?.length || 0;
                progress = modules.length > 0 ? Math.min(100, Math.round((completedModules / modules.length) * 100)) : 0;
              }

              return {
                id: courseId,
                title: course.title || 'Untitled Course',
                description: course.description || 'No description provided.',
                thumbnail: course.thumbnail || '',
                category,
                level: 'Beginner', // Could be added to course data later
                link: `/courses/${courseId}`,
                progress,
                totalModules: modules.length,
                completedModules,
                order: course.order || 1
              };
            } catch (moduleError) {
              console.error(`Failed to fetch modules for course ${course.SK}:`, moduleError);
              return null;
            }
          })
        );

        const validCourses = coursesWithModules
          .filter(Boolean)
          .filter(course => course.category !== 'Misc')
          .sort((a, b) => a.order - b.order);

        setCourses(validCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError("Failed to load courses. Please try again later.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
    window.scrollTo(0, 0);
  }, [navigate]);

  // Update filter effect with proper deps
  useEffect(() => {
    const newFilter = location.state?.filter;
    if (newFilter && newFilter !== filter) {
      setFilter(newFilter);
    }
  }, [location.state, filter]);

  // Helper for CTA text
  const getCourseCTA = (progress) => {
    if (progress === 100) return 'View Course';
    if (progress > 0) return 'Continue Course';
    return 'Start Course';
  };

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
  ];

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Programming Courses",
    "description": "Comprehensive programming courses covering JavaScript, React, Python, Node.js, and more",
    "url": "https://codetapasya.com/courses",
    "numberOfItems": courses.length,
    "itemListElement": courses.map((course, index) => ({
      "@type": "Course",
      "position": index + 1,
      "name": course.title,
      "description": course.description,
      "url": `https://codetapasya.com${course.link}`,
      "courseCode": course.id,
      "educationalLevel": course.level,
      "provider": {
        "@type": "Organization",
        "name": "CodeTapasya",
        "url": "https://codetapasya.com"
      },
      "teaches": course.category,
      "timeRequired": "P4W",
      "offers": {
        "@type": "Offer",
        "category": "Educational",
        "priceCurrency": "INR",
        "price": "99"
      }
    }))
  };

  return (
    <div className="courses-container">
      <SEO
        title="Programming Courses - Learn JavaScript, React, Python | CodeTapasya"
        description="Explore our comprehensive programming courses. Learn JavaScript, React, Python, Node.js, and more with hands-on projects, interactive coding playground, and expert guidance."
        keywords="programming courses, JavaScript course, React tutorial, Python programming, Node.js course, web development courses, online coding bootcamp, learn programming India"
        url="https://codetapasya.com/courses"
        image="https://codetapasya.com/og-courses.jpg"
        structuredData={structuredData}
      />
      
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

        {/* Show subscription banner for non-subscribers */}
        <SubscriptionBanner />

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
              <div className="spinner" role="status" aria-label="Loading">
                <span className="sr-only">Loading...</span>
              </div>
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
            <AnimatePresence>              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <motion.div 
                    key={course.id || `fallback-${index}`} 
                    className="course-card" 
                    variants={cardVariants} 
                    initial="initial" 
                    animate="animate" 
                    exit="exit" 
                    whileHover="hover"
                    role="article"
                    aria-labelledby={`course-title-${course.id}`}
                    tabIndex="0"
                  >                    <span className={`course-category ${course.category.toLowerCase().replace(/\s/g, '-')}`}>
                      {course.category}
                    </span>
                    {!hasSubscription && (
                      <span className="subscription-indicator">
                        Limited Access
                      </span>
                    )}
                    {course.thumbnail && (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="course-thumbnail"
                        loading="lazy"
                      />
                    )}
                    <h3 id={`course-title-${course.id}`}>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <p className="course-level">Level: {course.level}</p>
                    <p className="course-modules">{course.totalModules} modules</p>
                    {course.progress > 0 && (
                      <div className="course-progress">
                        {course.progress === 100 ? (
                          <p className="course-completed">Course Completed!</p>
                        ) : (
                          <>
                            <p>{course.progress}% Complete ({course.completedModules}/{course.totalModules} modules)</p>
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
                    )}                    {/* Remove motion.div hover for the course-link button */}
                    <div>
                      <Link
                        to={course.link}
                        className="course-link"
                        aria-label={`Go to ${course.title}`}
                        state={{ continueModule: course.completedModules }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                          }
                        }}
                      >
                        {getCourseCTA(course.progress)}
                      </Link>
                    </div>
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