import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TocIcon from '@mui/icons-material/Toc';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookIcon from '@mui/icons-material/Book';

import '../styles/CourseDetail.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.3, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
      damping: 15,
    } 
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const tocItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [toc, setToc] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [codeOutputs, setCodeOutputs] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      console.log("CourseDetail Debug: ID from useParams:", id, " (Type:", typeof id, ")");

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

      const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;
      console.log("CourseDetail: Using Courses API URL:", coursesApiUrl);

      if (!coursesApiUrl) {
        console.warn("CourseDetail: Environment variable VITE_COURSES_API_URL is not set.");
        setError("Configuration error: API URL is not set. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const courseRes = await axios.get(coursesApiUrl, { headers });
        console.log("CourseDetail: Course metadata response:", courseRes.data);

        const rawData = Array.isArray(courseRes.data)
          ? courseRes.data
          : courseRes.data.Items || courseRes.data.courses || [];

        const courseData = rawData.find(item => item.module_id === id);

        if (!courseData) {
          throw new Error("Course data not found in API response.");
        }

        setCourse({
          ...courseData,
          module_id: courseData.module_id || id,
        });

        const order = courseData.order || '1';
        console.log(`CourseDetail: Fetching HTML content for moduleId=${id}, order=${order}`);
        const htmlRes = await axios.get(`${coursesApiUrl}?moduleId=${id}&order=${order}`, {
          headers,
          responseType: 'text',
        });
        console.log("CourseDetail: HTML content response:", htmlRes.data);

        if (htmlRes.data.includes("Module not found") || htmlRes.data.includes("Error fetching document")) {
          throw new Error("Failed to load course content: " + htmlRes.data);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlRes.data, 'text/html');
        const body = doc.querySelector('body');
        const elements = body ? Array.from(body.children) : [];

        const parsedSections = [];
        const tocItems = [];
        let currentSection = { heading: '', content: '' };
        let sectionIndex = 0;

        elements.forEach((el) => {
          const tagName = el.tagName.toLowerCase();
          if (['h1', 'h2', 'h3'].includes(tagName) && el.textContent.trim()) {
            if (currentSection.content || currentSection.heading) {
              parsedSections.push({ ...currentSection });
            }
            currentSection = { heading: el.outerHTML, content: '' };
            tocItems.push({ title: el.textContent.trim(), index: sectionIndex });
            sectionIndex++;
          } else if (el.textContent.trim() && !['script', 'style'].includes(tagName)) {
            currentSection.content += el.outerHTML;
          }
        });

        if (currentSection.content || currentSection.heading) {
          parsedSections.push({ ...currentSection });
        }

        if (parsedSections.length === 0) {
          throw new Error("No valid content sections found in the document.");
        }

        setSections(parsedSections);
        setToc(tocItems);

      } catch (err) {
        console.error("CourseDetail: Error fetching course details or content:", err);

        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("CourseDetail: Server Response Error:", err.response.data);
            console.error("CourseDetail: Status Code:", err.response.status);
            console.error("CourseDetail: Headers:", err.response.headers);

            if (err.response.status === 400) {
              setError(`Bad Request: ${err.response.data || err.message}.`);
            } else if (err.response.status === 403) {
              setError("Access Denied: Your authentication token is invalid or unauthorized.");
            } else if (err.response.status === 404) {
              setError("Course content not found. The document may not exist or is not accessible.");
            } else {
              setError(`Server Error (${err.response.status}): ${err.response.data || err.message}`);
            }
          } else if (err.request) {
            console.error("CourseDetail: No response received (network issue):", err.request);
            if (err.message.includes('Network Error')) {
              setError("Unable to load course details due to a server access issue (CORS). Please try again later or contact support.");
            } else {
              setError("Network Error: Could not connect to the server. Please check your internet connection.");
            }
          } else {
            console.error("CourseDetail: Request setup error:", err.message);
            setError(`An unexpected error occurred: ${err.message}`);
          }
        } else {
          setError(`An unexpected error occurred: ${err.message}`);
        }
        setCourse(null);
        setSections([]);
        setToc([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCompletedSections((prev) => new Set(prev).add(currentSectionIndex));
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleTocClick = (index) => {
    setCompletedSections((prev) => new Set(prev).add(currentSectionIndex));
    setCurrentSectionIndex(index);
    setIsSidebarOpen(false);
  };

  const handleRunCode = (sectionIndex) => {
    const section = sections[sectionIndex];
    const parser = new DOMParser();
    const doc = parser.parseFromString(section.content, 'text/html');
    const codeElements = doc.querySelectorAll('pre code, code');

    if (codeElements.length > 0) {
      const code = codeElements[0].textContent.trim();
      try {
        const output = `<div>${code}</div>`;
        setCodeOutputs((prev) => ({ ...prev, [sectionIndex]: output }));
      } catch (err) {
        setCodeOutputs((prev) => ({ ...prev, [sectionIndex]: `<p style="color: red;">Error executing code: ${err.message}</p>` }));
      }
    } else {
      setCodeOutputs((prev) => ({ ...prev, [sectionIndex]: '<p>No executable code found.</p>' }));
    }
  };

  const handleQuizAnswer = (questionIndex, option) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <p className="loading">Loading course details...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!course) return <p className="info-message">Course not found for ID: {id}. Please check the URL.</p>;

  const quizQuestions = course.title.includes('HTML') ? [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "Hyper Transfer Markup Language",
        "High Text Markup Language",
        "Hyperlink Text Markup Language",
      ],
      correctAnswer: "Hyper Text Markup Language",
    },
    {
      question: "Which tag is used to create a hyperlink in HTML?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: "<a>",
    },
  ] : [
    {
      question: "Which keyword is used to declare a variable in Javascript?",
      options: ["var", "int", "string", "define"],
      correctAnswer: "var",
    },
    {
      question: "What is the output of console.log(typeof null)?",
      options: ["null", "object", "undefined", "string"],
      correctAnswer: "object",
    },
  ];

  return (
    <div className="course-detail">
      <button className="sidebar-toggle" onClick={toggleSidebar} title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
        <TocIcon />
      </button>

      {isSidebarOpen && (
        <motion.div
          className="sidebar-overlay"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={toggleSidebar}
        />
      )}

      <div className="container flex">
        {toc.length > 0 && (
          <motion.div
            className={`course-sidebar ${isSidebarOpen ? 'active' : ''}`}
            initial="hidden"
            animate={isSidebarOpen ? 'visible' : 'hidden'}
            variants={sidebarVariants}
          >
            <div className="course-sidebar-header">
              <BookIcon className="course-sidebar-header-icon" />
              <h3>Table of Contents</h3>
            </div>
            <div className="course-sidebar-progress">
              <p>{completedSections.size}/{sections.length} sections completed</p>
              <div className="course-sidebar-progress-bar-container">
                <div
                  className="course-sidebar-progress-bar"
                  style={{ width: `${((completedSections.size) / sections.length) * 100}%` }}
                />
              </div>
            </div>
            <ul>
              {toc.map((item, i) => (
                <motion.li
                  key={item.index}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={tocItemVariants}
                >
                  <button
                    onClick={() => handleTocClick(item.index)}
                    className={`course-sidebar-item ${currentSectionIndex === item.index ? 'active' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTocClick(item.index);
                      }
                    }}
                  >
                    <span className="course-sidebar-icon">
                      {completedSections.has(item.index) ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <FiberManualRecordIcon fontSize="small" />
                      )}
                    </span>
                    <span className="course-sidebar-title">{item.title}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="content-area">
          <motion.div
            className="course-header"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <h1>{course.title || 'Course Title'}</h1>
            <p>{course.description || 'No description provided.'}</p>
            <span className="course-meta">Level: {course.level || 'N/A'}</span>
          </motion.div>

          <h2>Course Content</h2>
          <div className="module-item">
            <h3>{course.title}</h3>
            <p>{course.description}</p>

            {sections.length > 0 && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                />
              </div>
            )}

            {sections.length > 0 && currentSectionIndex < sections.length ? (
              <div className="step-by-step-content">
                <motion.div
                  key={currentSectionIndex}
                  className="content-block"
                  initial="hidden"
                  animate="visible"
                  variants={sectionVariants}
                >
                  <div dangerouslySetInnerHTML={{ __html: sections[currentSectionIndex].heading }} />
                  <div dangerouslySetInnerHTML={{ __html: sections[currentSectionIndex].content }} />
                  {sections[currentSectionIndex].content.includes('<code>') && (
                    <button
                      onClick={() => handleRunCode(currentSectionIndex)}
                      className="run-code-button"
                    >
                      <PlayArrowIcon className="mr-2" /> Run Code
                    </button>
                  )}
                  {codeOutputs[currentSectionIndex] && (
                    <div
                      className="code-output"
                      dangerouslySetInnerHTML={{ __html: codeOutputs[currentSectionIndex] }}
                    />
                  )}
                </motion.div>

                <div className="navigation-buttons">
                  <button
                    onClick={handlePrevious}
                    disabled={currentSectionIndex === 0}
                    className="nav-button prev-button"
                  >
                    <NavigateBeforeIcon className="mr-2" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentSectionIndex === sections.length - 1}
                    className="nav-button next-button"
                  >
                    Next <NavigateNextIcon className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <p>No content available for this module.</p>
            )}

            {currentSectionIndex === sections.length - 1 && sections.length > 0 && (
              <div className="quiz-section">
                <h3>Test Your Knowledge</h3>
                {quizQuestions.map((q, index) => (
                  <div key={index} className="quiz-question">
                    <p>{q.question}</p>
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="quiz-option">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={quizAnswers[index] === option}
                          onChange={() => handleQuizAnswer(index, option)}
                          disabled={quizSubmitted}
                        />
                        {option}
                        {quizSubmitted && (
                          <span className={option === q.correctAnswer ? 'correct' : 'incorrect'}>
                            {option === q.correctAnswer ? ' ✓' : option === quizAnswers[index] ? ' ✗' : ''}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                ))}
                {!quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    className="submit-quiz-button"
                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                  >
                    Submit Quiz
                  </button>
                )}
                {quizSubmitted && (
                  <p className="quiz-result">
                    You scored {Object.values(quizAnswers).filter((ans, i) => ans === quizQuestions[i].correctAnswer).length} out of {quizQuestions.length}!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;