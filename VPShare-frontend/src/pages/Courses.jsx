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
import LearningSpaceSidebar from '../components/layout/LearningSpaceSidebar';
import { isEnrolledInLiveClasses } from '../services/enrollmentService';
import '../styles/Courses.css';
import '../styles/LearningSpaceLayout.css';
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
  const [isEnrolled, setIsEnrolled] = useState(false);
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

      // Check if user is enrolled in Live Classes
      try {
        const enrolled = await isEnrolledInLiveClasses(user.uid);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Failed to check enrollment:', err);
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
    <>
      <SEO
        title="Programming Courses - Learn JavaScript, React, Python | CodeTapasya"
        description="Explore our comprehensive programming courses. Learn JavaScript, React, Python, Node.js, and more with hands-on projects, interactive coding playground, and expert guidance."
        keywords="programming courses, JavaScript course, React tutorial, Python programming, Node.js course, web development courses, online coding bootcamp, learn programming India"
        url="https://codetapasya.com/courses"
        image="https://codetapasya.com/og-courses.jpg"
        structuredData={structuredData}
      />

      {/* Learning Space Sidebar */}
      <LearningSpaceSidebar isEnrolledInLiveClasses={isEnrolled} />
      
      <div className="modern-page learning-space-content">
        <div className="modern-container">
          {/* Hero Section */}
          <motion.section
            className="modern-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="modern-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="modern-heading-xl">Explore Our Courses</h1>
                <p className="modern-text" style={{ marginBottom: '2rem' }}>
                  Master web development with beginner-friendly, job-ready courses.
                </p>
                <motion.div variants={hoverVariants} whileHover="hover">
                  <button onClick={scrollToCourses} className="modern-btn modern-btn-primary modern-btn-lg">
                    Start Learning
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* Show subscription banner for non-subscribers */}
          <SubscriptionBanner />

          {/* Filter Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <div className="modern-card">
              <h2 className="modern-heading-md" style={{ marginBottom: '1.5rem' }}>Filter Courses</h2>
              <div className="modern-flex" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                {categories.map(category => (
                  <motion.button
                    key={category}
                    className={`modern-btn ${filter === category ? 'modern-btn-primary' : 'modern-btn-secondary'} modern-btn-sm`}
                    onClick={() => setFilter(category)}
                    variants={hoverVariants}
                    whileHover="hover"
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Courses Section */}
          <motion.section
            className="modern-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            id="courses"
          >
            <h2 className="modern-heading-lg" style={{ marginBottom: '2rem' }}>{filter} Courses</h2>

            {loading && (
              <div className="modern-card modern-flex-center" style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="modern-flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
                  <div className="modern-skeleton" style={{ width: '200px', height: '24px' }}></div>
                  <div className="modern-skeleton" style={{ width: '150px', height: '16px' }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="modern-card" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                <p className="modern-text" style={{ color: 'var(--error)', marginBottom: '2rem' }}>{error}</p>
                <button
                  onClick={() => navigate('/')}
                  className="modern-btn modern-btn-secondary"
                  aria-label="Back to Home"
                >
                  Back to Home
                </button>
              </div>
            )}

            <motion.div
              className="modern-grid modern-grid-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <motion.div 
                      key={course.id || `fallback-${index}`} 
                      className="modern-card modern-slide-up" 
                      variants={cardVariants} 
                      initial="initial" 
                      animate="animate" 
                      exit="exit" 
                      whileHover="hover"
                      role="article"
                      aria-labelledby={`course-title-${course.id}`}
                      tabIndex="0"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }}
                    >
                      {/* Category Badge */}
                      <div className="modern-flex-between" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                        <span className={`modern-badge modern-badge-primary`}>
                          {course.category}
                        </span>
                        {!hasSubscription && (
                          <span className="modern-badge modern-badge-warning" style={{ fontSize: '0.75rem' }}>
                            Limited Access
                          </span>
                        )}
                      </div>

                      {/* Course Thumbnail */}
                      {course.thumbnail && (
                        <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            style={{ 
                              width: '100%', 
                              height: '180px', 
                              objectFit: 'cover',
                              transition: 'transform var(--transition-normal)'
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Course Content */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 id={`course-title-${course.id}`} className="modern-heading-sm" style={{ marginBottom: '0.75rem' }}>
                          {course.title}
                        </h3>
                        <p className="modern-text-sm" style={{ marginBottom: '1rem', flex: 1 }}>
                          {course.description}
                        </p>

                        {/* Course Meta Info */}
                        <div className="modern-flex" style={{ gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <span className="modern-badge modern-badge-primary" style={{ fontSize: '0.75rem' }}>
                            {course.level}
                          </span>
                          <span className="modern-text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {course.totalModules} modules
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {course.progress > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            {course.progress === 100 ? (
                              <div className="modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                                <span className="modern-badge modern-badge-success">✅ Completed</span>
                              </div>
                            ) : (
                              <div>
                                <div className="modern-flex-between" style={{ marginBottom: '0.5rem' }}>
                                  <span className="modern-text-sm">Progress</span>
                                  <span className="modern-text-sm">{course.progress}%</span>
                                </div>
                                <div className="modern-progress">
                                  <motion.div
                                    className="modern-progress-bar"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                                  ></motion.div>
                                </div>
                                <p className="modern-text-sm" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                                  {course.completedModules}/{course.totalModules} modules completed
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Course Action Button */}
                        <div>
                          <Link
                            to={course.link}
                            className={`modern-btn ${course.progress === 100 ? 'modern-btn-secondary' : 'modern-btn-primary'}`}
                            style={{ width: '100%', justifyContent: 'center' }}
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
                      </div>
                    </motion.div>
                  ))
                ) : (
                  !loading && !error && (
                    <motion.div
                      className="modern-card modern-flex-center"
                      style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div>
                        <h3 className="modern-heading-sm" style={{ marginBottom: '1rem' }}>No courses found</h3>
                        <p className="modern-text">No courses found in this category. Try selecting a different filter.</p>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </>
  );
}

export default Courses;