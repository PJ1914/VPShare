import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

import '../styles/CourseDetail.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Debug log for ID
      console.log("CourseDetail Debug: ID from useParams:", id, " (Type:", typeof id, ")");

      // Validate ID
      if (!id || id === 'undefined' || typeof id !== 'string') {
        console.warn('CourseDetail: Invalid Course ID provided in URL. Aborting fetch operations.');
        setError('No valid course selected or invalid course ID provided in the URL.');
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      let authToken = null;

      if (!user) {
        console.warn("CourseDetail: No authenticated Firebase user found.");
        setError("You are not logged in. Please log in to view course content.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      try {
        authToken = await user.getIdToken();
        console.log("CourseDetail: Firebase ID Token obtained successfully.");
      } catch (tokenError) {
        console.error("CourseDetail: Failed to get Firebase ID token:", tokenError);
        setError("Failed to authenticate your session. Please log in again.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      // Get API URLs using Vite's environment variable syntax with fallbacks
      const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL
      const submodulesApiUrl = import.meta.env.VITE_SUBMODULES_API_URL 

      console.log("CourseDetail: Using Courses API URL:", coursesApiUrl);
      console.log("CourseDetail: Using Submodules API URL:", submodulesApiUrl);

      if (!import.meta.env.VITE_COURSES_API_URL) {
        console.warn("CourseDetail: Environment variable VITE_COURSES_API_URL is not set. Using fallback URL.");
      }
      if (!import.meta.env.VITE_SUBMODULES_API_URL) {
        console.warn("CourseDetail: Environment variable VITE_SUBMODULES_API_URL is not set. Using fallback URL.");
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        // Fetch course details and submodules
        const [courseRes, submodulesRes] = await Promise.all([
          // Fetch course details
          axios.get(`${coursesApiUrl}?moduleId=${id}`, { headers }),
          // Fetch all submodules (without moduleId query since API doesn't support it)
          axios.get(submodulesApiUrl, { headers }),
        ]);

        // Process course data
        const courseData = Array.isArray(courseRes.data)
          ? courseRes.data[0]
          : courseRes.data.Items?.[0] || courseRes.data.course || courseRes.data;

        if (!courseData) {
          throw new Error("Course data not found in API response.");
        }

        // Ensure course has module_id
        const courseWithId = {
          ...courseData,
          module_id: courseData.module_id || id,
        };
        setCourse(courseWithId);

        // Process submodules data
        const submodulesData = Array.isArray(submodulesRes.data)
          ? submodulesRes.data
          : submodulesRes.data.Items || submodulesRes.data.submodules || [];

        // Filter submodules by module_id
        const filteredSubmodules = submodulesData.filter(submodule => {
          const parentModuleId = submodule.module_id || submodule.parentModuleId;
          return parentModuleId === id;
        });

        setModules(filteredSubmodules.map(submodule => ({
          ...submodule,
          id: submodule.submodule_id || submodule.id || submodule._id,
        })));

      } catch (err) {
        console.error("CourseDetail: Error fetching course details or modules:", err);

        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("CourseDetail: Server Response Error:", err.response.data);
            console.error("CourseDetail: Status Code:", err.response.status);
            console.error("CourseDetail: Headers:", err.response.headers);

            if (err.response.status === 400) {
              setError(`Bad Request: ${err.response.data?.message || err.message}. This might be due to the submodule API not supporting the expected query parameters.`);
            } else if (err.response.status === 403) {
              setError("Access Denied: Your authentication token is invalid or unauthorized.");
            } else if (err.response.status === 404) {
              setError("Course or lessons not found for the given ID.");
            } else {
              setError(`Server Error (${err.response.status}): ${err.response.data?.message || err.message}`);
            }
          } else if (err.request) {
            console.error("CourseDetail: No response received (network issue):", err.request);
            setError("Network Error: Could not connect to the server. Please check your internet connection.");
          } else {
            console.error("CourseDetail: Request setup error:", err.message);
            setError(`An unexpected error occurred: ${err.message}`);
          }
        } else {
          setError(`An unexpected error occurred: ${err.message}`);
        }
        setCourse(null);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) return <p className="loading">Loading course details...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  if (!course) return <p className="info-message">Course not found for ID: {id}. Please check the URL.</p>;

  return (
    <div className="course-detail">
      <motion.div className="course-header" initial="hidden" animate="visible" variants={sectionVariants}>
        <h1>{course.title || 'Course Title'}</h1>
        <p>{course.description || 'No description provided.'}</p>
        <span className="course-meta">Level: {course.level || 'N/A'}</span>
      </motion.div>

      <motion.div className="modules-section" initial="hidden" animate="visible" variants={sectionVariants}>
        <h2>Lessons</h2>
        {modules.length === 0 ? (
          <p>No lessons available for this course. The submodule API might not support fetching lessons by module ID, or no lessons exist for this course.</p>
        ) : (
          <ul className="modules-list">
            {modules.map((lesson, index) => {
              const isValidVideoUrl = lesson.videoUrl && lesson.type === 'video' && lesson.videoUrl.startsWith('https://');
              return (
                <li key={lesson.id || `lesson-${index}`} className="module-item">
                  <h3>{lesson.title || `Lesson ${index + 1}`}</h3>
                  <p>{lesson.content || 'No content provided.'}</p>
                  {isValidVideoUrl ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={lesson.videoUrl}
                      title={lesson.title || `Lesson ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : lesson.type === 'video' && !lesson.videoUrl ? (
                    <p className="error">Video URL missing for this lesson.</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

export default CourseDetail;