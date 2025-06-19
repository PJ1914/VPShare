import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import {
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  TextField,
  Button,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TocIcon from '@mui/icons-material/Toc';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookIcon from '@mui/icons-material/Book';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import '../styles/CourseDetail.css';

// Configure axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

// Function to safely evaluate simple mathematical expressions
const safeEval = (code) => {
  try {
    const allowed = /^[0-9+\-*/.\s()]+$/;
    if (!allowed.test(code)) {
      throw new Error('Unsupported operation. Only basic math expressions are allowed.');
    }
    const fn = new Function('return ' + code);
    const result = fn();
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    return result;
  } catch (err) {
    return err.message;
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sidebarVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: 300, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const contentVariants = {
  hidden: { marginLeft: 0 },
  visible: { marginLeft: 300, transition: { duration: 0.3, ease: "easeOut" } },
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
  const [filteredToc, setFilteredToc] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [codeOutputs, setCodeOutputs] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [tocOpen, setTocOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('Ask me anything about your course!');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      console.log("CourseDetail: Course ID from useParams:", id);

      if (!id || id.trim() === '') {
        console.warn('CourseDetail: Invalid or empty Course ID.');
        setError('Invalid course ID. Please check the URL.');
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn("CourseDetail: No authenticated user found.");
        setError("Please log in to access this course.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      let authToken;
      try {
        authToken = await user.getIdToken();
        console.log("CourseDetail: Firebase ID Token obtained successfully.");
      } catch (tokenError) {
        console.error("CourseDetail: Failed to get Firebase ID token:", tokenError.message);
        setError("Authentication error. Please log out and log in again.");
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;
      console.log("CourseDetail: Using API URL:", coursesApiUrl);

      if (!coursesApiUrl) {
        console.warn("CourseDetail: VITE_COURSES_API_URL is not set.");
        setError("Server configuration error. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const courseRes = await axios.get(coursesApiUrl, { headers, timeout: 30000 });
        console.log("CourseDetail: Course metadata response:", courseRes.data);

        const rawData = Array.isArray(courseRes.data)
          ? courseRes.data
          : courseRes.data.Items || courseRes.data.courses || [];
        
        if (!rawData.length) {
          console.warn("CourseDetail: No courses returned from API");
          setError("No courses available. Please try another course or contact support.");
          setLoading(false);
          return;
        }

        const courseData = rawData.find(item => item.module_id === id);

        if (!courseData) {
          console.warn("CourseDetail: Course not found for module_id:", id);
          setError(`Course with ID ${id} not found. Please verify the course ID or contact support.`);
          setLoading(false);
          return;
        }

        setCourse({
          ...courseData,
          module_id: courseData.module_id || id,
          title: courseData.title || 'Untitled Course',
          description: courseData.description || 'No description provided.',
          level: courseData.level || 'Beginner',
        });

        const order = courseData.order || '1';
        console.log(`CourseDetail: Fetching HTML for moduleId=${id}, order=${order}`);
        const htmlRes = await axios.get(`${coursesApiUrl}?moduleId=${id}&order=${order}`, {
          headers,
          responseType: 'text',
          timeout: 15000,
        });

        if (!htmlRes.data || htmlRes.data.includes("Module not found") || htmlRes.data.includes("Error fetching")) {
          throw new Error("Failed to load course content: " + (htmlRes.data || "No response"));
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlRes.data, 'text/html');
        const body = doc.querySelector('body');
        const elements = body ? Array.from(body.children).filter(el => !['script', 'style'].includes(el.tagName.toLowerCase())) : [];

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
          } else if (el.textContent.trim()) {
            currentSection.content += el.outerHTML;
          }
        });

        if (currentSection.content || currentSection.heading) {
          parsedSections.push({ ...currentSection });
        }

        if (parsedSections.length === 0) {
          throw new Error("No valid sections found in the document.");
        }

        setSections(parsedSections);
        setToc(tocItems);
        setFilteredToc(tocItems);
      } catch (err) {
        console.error("CourseDetail: Fetch error:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("CourseDetail: Server Response:", err.response.data, "Status:", err.response.status);
            switch (err.response.status) {
              case 400:
                setError("Invalid request. The course ID may be incorrect.");
                break;
              case 403:
                setError("Access denied. Please log in again.");
                navigate('/login', { replace: true });
                break;
              case 404:
                setError(`Course content for ID ${id} not found. Please verify the course ID.`);
                break;
              case 500:
                setError("Server error. Please try again later or contact support.");
                break;
              default:
                setError(`Server error (Code: ${err.response.status}). Please try again.`);
            }
          } else if (err.request) {
            console.error("CourseDetail: No response:", err.request);
            setError("Network error: Unable to connect to the server.");
          } else {
            console.error("CourseDetail: Request error:", err.message);
            setError(`Unexpected error: ${err.message}.`);
          }
        } else {
          setError(`Error: ${err.message}. Please contact support.`);
        }
        setCourse(null);
        setSections([]);
        setToc([]);
        setFilteredToc([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredToc(toc);
    } else {
      setFilteredToc(toc.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }, [searchTerm, toc]);

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCompletedSections((prev) => new Set(prev).add(currentSectionIndex));
      setCurrentSectionIndex((prev) => prev + 1);
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    }
  };

  const handleTocClick = (index) => {
    setCompletedSections((prev) => new Set(prev).add(currentSectionIndex));
    setCurrentSectionIndex(index);
    if (window.innerWidth > 1024) {
      setIsSidebarOpen(true);
    }
  };

  const handleRunCode = (sectionIndex) => {
    const section = sections[sectionIndex];
    const parser = new DOMParser();
    const doc = parser.parseFromString(section.content, 'text/html');
    const codeElements = doc.querySelectorAll('pre code, code');

    if (codeElements.length > 0) {
      const code = codeElements[0].textContent.trim();
      const result = safeEval(code);
      setCodeOutputs((prev) => ({
        ...prev,
        [sectionIndex]: {
          output: result,
          isError: typeof result === 'string' && result.includes('Error'),
        },
      }));
    } else {
      setCodeOutputs((prev) => ({
        ...prev,
        [sectionIndex]: { output: 'No code to run.', isError: false },
      }));
    }
  };

  const handleQuizAnswer = (questionIndex, option) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setQuizSubmitted(true);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleToc = () => setTocOpen((prev) => !prev);
  const toggleAi = () => setAiOpen((prev) => !prev);

  const handleAiSend = () => {
    if (aiMessage.trim()) {
      setAiResponse(`AI: I'm here to help! You asked: "${aiMessage}". Let me know more about your question!`);
      setAiMessage('');
    }
  };

  const progress = toc.length > 0 ? (completedSections.size / toc.length) * 100 : 0;

  const quizQuestions = course?.title?.includes('HTML')
    ? [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Hyper Transfer Markup Language", "High Text Markup Language", "Hyperlink Text Markup Language"], correctAnswer: "Hyper Text Markup Language" },
        { question: "Which tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], correctAnswer: "<a>" },
      ]
    : [
        { question: "Which keyword declares a variable in JavaScript?", options: ["var", "int", "string", "define"], correctAnswer: "var" },
        { question: "What is the output of console.log(typeof null)?", options: ["null", "object", "undefined", "string"], correctAnswer: "object" },
      ];

  if (loading) {
    return (
      <div className="course-detail loading-container" role="alert" aria-live="polite">
        <div className="content-container">
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <CircularProgress color="inherit" aria-label="Loading course details" />
            <Typography variant="h6" style={{ marginTop: '1rem' }}>Loading course details...</Typography>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail error-container" role="alert" aria-live="assertive">
        <div className="content-container">
          <Typography variant="h5" color="error" align="center" style={{ padding: '2rem' }}>
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/courses')}
            aria-label="Back to courses"
            style={{ display: 'block', margin: '0 auto' }}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) return (
    <div className="course-detail error-container" role="alert" aria-live="assertive">
      <Typography variant="h5" align="center" style={{ padding: '2rem' }}>
        Course not found for ID: {id}.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/courses')}
        aria-label="Back to courses"
        style={{ display: 'block', margin: '0 auto' }}
      >
        Back to Courses
      </Button>
    </div>
  );

  return (
    <div className="course-detail" role="main">
      <div className="content-container">
        <motion.div className="course-header" initial="hidden" animate="visible" variants={sectionVariants}>
          <Typography variant="h4" aria-level="1">{course.title}</Typography>
          <Typography variant="body1">{course.description}</Typography>
          <Typography variant="caption">Level: {course.level}</Typography>
        </motion.div>
        <AppBar position="static" className="course-navbar" role="navigation">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className="course-menu-button"
              aria-expanded={isSidebarOpen}
              aria-controls="course-sidebar"
            >
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" className="course-navbar-title">Course Navigation</Typography>
          </Toolbar>
        </AppBar>
        <div className="content-layout">
          <motion.div
            id="course-sidebar"
            className="course-sidebar"
            initial="hidden"
            animate={isSidebarOpen ? "visible" : "hidden"}
            variants={sidebarVariants}
            role="complementary"
            aria-label="Course Table of Contents"
          >
            <div className="sidebar-header">
              <BookIcon className="sidebar-icon" />
              <Typography variant="h6">Table of Contents</Typography>
              <IconButton
                onClick={toggleToc}
                aria-label="Toggle Table of Contents"
                aria-expanded={tocOpen}
                className="toc-toggle"
              >
                {tocOpen ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            <div className="sidebar-progress">
              <Typography variant="caption">Progress: {progress.toFixed(0)}%</Typography>
            </div>
            <TextField
              variant="outlined"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              className="sidebar-search"
              inputProps={{ 'aria-label': 'Search table of contents' }}
              aria-controls="toc-list"
            />
            <Collapse in={tocOpen}>
              <List id="toc-list" role="listbox">
                {filteredToc.map((item, i) => (
                  <motion.div
                    key={item.index}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={tocItemVariants}
                  >
                    <ListItem
                      button
                      onClick={() => handleTocClick(item.index)}
                      selected={currentSectionIndex === item.index}
                      className="sidebar-item"
                      aria-label={`Go to section ${item.title}`}
                      role="option"
                      aria-selected={currentSectionIndex === item.index}
                    >
                      <ListItemIcon>
                        {completedSections.has(item.index) ? <CheckCircleIcon /> : <FiberManualRecordIcon />}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Collapse>
            <div className="sidebar-ai-section">
              <ListItem button onClick={toggleAi} className="sidebar-ai-toggle" aria-label="Toggle AI Assistant">
                <ListItemIcon>
                  <SmartToyIcon />
                </ListItemIcon>
                <ListItemText primary="AI Assistant" />
                {aiOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={aiOpen}>
                <div className="ai-content">
                  <Typography variant="body2" className="ai-response">{aiResponse}</Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Ask the AI..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    fullWidth
                    size="small"
                    className="ai-input"
                    inputProps={{ 'aria-label': 'Ask AI' }}
                    aria-label="AI message input"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAiSend}
                    className="ai-send-button"
                    disabled={!aiMessage.trim()}
                    aria-label="Send AI message"
                  >
                    Send
                  </Button>
                </div>
              </Collapse>
            </div>
          </motion.div>
          <motion.div
            ref={contentRef}
            className="content-area"
            initial="hidden"
            animate={isSidebarOpen ? "visible" : "hidden"}
            variants={contentVariants}
            role="region"
            aria-label="Course Content Area"
          >
            <Typography variant="h5" aria-level="2">Course Content</Typography>
            {sections.length > 0 && (
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
                    aria-label={`Run code for section ${sections[currentSectionIndex].heading}`}
                  >
                    <PlayArrowIcon className="mr-2" /> Run Code
                  </button>
                )}
                {codeOutputs[currentSectionIndex] && (
                  <div className="code-output">
                    <button
                      onClick={() => setCodeOutputs((prev) => ({ ...prev, [currentSectionIndex]: null }))}
                      className="collapse-button"
                      aria-label={codeOutputs[currentSectionIndex].isError ? 'Hide error' : 'Hide output'}
                    >
                      {codeOutputs[currentSectionIndex].isError ? 'Hide Error' : 'Hide Output'}
                    </button>
                    <pre className={`output-content ${codeOutputs[currentSectionIndex].isError ? 'error' : ''}`}>
                      <code>{codeOutputs[currentSectionIndex].output}</code>
                    </pre>
                  </div>
                )}
                <div className="navigation-buttons">
                  <button
                    onClick={handlePrevious}
                    disabled={currentSectionIndex === 0}
                    className="nav-button prev-button"
                    aria-label="Go to previous section"
                    aria-disabled={currentSectionIndex === 0}
                  >
                    <NavigateBeforeIcon className="mr-2" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentSectionIndex === sections.length - 1}
                    className="nav-button next-button"
                    aria-label="Go to next section"
                    aria-disabled={currentSectionIndex === sections.length - 1}
                  >
                    Next <NavigateNextIcon className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}
            {currentSectionIndex === sections.length - 1 && sections.length > 0 && (
              <div className="quiz-section" role="region" aria-label="Quiz Section">
                <Typography variant="h6" aria-level="2">Test Your Knowledge</Typography>
                <div role="form" aria-live="polite">
                  {quizQuestions.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <Typography variant="body1">{q.question}</Typography>
                      {q.options.map((option, optIndex) => (
                        <label key={optIndex} className="quiz-option">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={quizAnswers[index] === option}
                            onChange={() => handleQuizAnswer(index, option)}
                            disabled={quizSubmitted}
                            aria-label={`${option} for ${q.question}`}
                            role="radio"
                            aria-checked={quizAnswers[index] === option}
                          />
                          {option}
                          {quizSubmitted && (
                            <span className={option === q.correctAnswer ? 'correct' : quizAnswers[index] === option ? 'incorrect' : ''}>
                              {option === q.correctAnswer ? ' ✓' : quizAnswers[index] === option ? ' ✗' : ''}
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
                      aria-label="Submit quiz answers"
                      aria-disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    >
                      Submit Quiz
                    </button>
                  )}
                  {quizSubmitted && (
                    <Typography className="quiz-result" variant="body1" aria-live="assertive">
                      You scored {Object.values(quizAnswers).filter((ans, i) => ans === quizQuestions[i].correctAnswer).length} out of {quizQuestions.length}!
                    </Typography>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;