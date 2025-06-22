import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import ReactMarkdown from 'react-markdown';
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
  Tooltip,
  LinearProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookIcon from '@mui/icons-material/Book';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CodeIcon from '@mui/icons-material/Code';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';

import '../styles/CourseDetail.css';
import CourseCompletionModal from '../components/CourseCompletionModal';

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
      throw new Error('Invalid result.');
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
  visible: { width: 'var(--sidebar-width)', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const contentVariants = {
  hidden: { marginLeft: 0 },
  visible: { marginLeft: 'var(--sidebar-width)', transition: { duration: 0.3, ease: 'easeOut' } },
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
  // All hooks must be at the top and never inside any condition, loop, or nested function
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [contentHeight, setContentHeight] = useState('auto');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const sidebarRef = useRef(null);
  const contentAreaRef = useRef(null);
  const isDraggingSidebar = useRef(false);
  const isDraggingContent = useRef(false);
  const [userId, setUserId] = useState(null);

  // Set initial section index from navigation state (continueSection)
  useEffect(() => {
    if (location.state && typeof location.state.continueSection === 'number') {
      setCurrentSectionIndex(location.state.continueSection);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else {
      setCurrentSectionIndex(0);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  }, [id, location.state]);

  // Scroll to top on section change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSectionIndex]);

  // Replace hardcoded quizQuestions with dynamic or course-based questions if available
  let quizQuestions = [];
  if (course && course.quiz && Array.isArray(course.quiz)) {
    quizQuestions = course.quiz;
  } else if (course && course.title && typeof course.title === 'string' && course.title.toLowerCase().includes('html')) {
    quizQuestions = [
      { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Hyper Transfer Markup Language', 'High Text Markup Language', 'Hyperlink Text Markup Language'], correctAnswer: 'Hyper Text Markup Language' },
      { question: 'Which tag is used to create a hyperlink?', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: '<a>' },
    ];
  } else {
    quizQuestions = [
      { question: 'Which keyword declares a variable in JavaScript?', options: ['var', 'int', 'string', 'define'], correctAnswer: 'var' },
      { question: 'What is the output of console.log(typeof null)?', options: ['null', 'object', 'undefined', 'string'], correctAnswer: 'object' },
    ];
  }

  // Handle sidebar resize
  const startSidebarDrag = (e) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.addEventListener('mousemove', handleSidebarDrag);
    document.addEventListener('mouseup', stopSidebarDrag);
  };

  const handleSidebarDrag = (e) => {
    if (!isDraggingSidebar.current) return;
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 500;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    }
  };

  const stopSidebarDrag = () => {
    isDraggingSidebar.current = false;
    document.removeEventListener('mousemove', handleSidebarDrag);
    document.removeEventListener('mouseup', stopSidebarDrag);
  };

  // Handle content area resize
  const startContentDrag = (e) => {
    e.preventDefault();
    isDraggingContent.current = true;
    document.addEventListener('mousemove', handleContentDrag);
    document.addEventListener('mouseup', stopContentDrag);
  };

  const handleContentDrag = (e) => {
    if (!isDraggingContent.current) return;
    const newHeight = e.clientY - contentAreaRef.current.getBoundingClientRect().top;
    const minHeight = 400;
    const maxHeight = window.innerHeight * 0.8;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setContentHeight(newHeight);
    }
  };

  const stopContentDrag = () => {
    isDraggingContent.current = false;
    document.removeEventListener('mousemove', handleContentDrag);
    document.removeEventListener('mouseup', stopContentDrag);
  };

  // Keyboard support for resizing
  const handleKeyDownSidebar = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const step = 10;
      let newWidth = sidebarWidth;
      if (e.key === 'ArrowLeft') newWidth -= step;
      if (e.key === 'ArrowRight') newWidth += step;
      const minWidth = 200;
      const maxWidth = 500;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      }
    }
  };

  const handleKeyDownContent = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = 10;
      let newHeight = typeof contentHeight === 'number' ? contentHeight : 400;
      if (e.key === 'ArrowUp') newHeight -= step;
      if (e.key === 'ArrowDown') newHeight += step;
      const minHeight = 400;
      const maxHeight = window.innerHeight * 0.8;
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setContentHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!id || id.trim() === '') {
        setError('Invalid course ID. Please check the URL.');
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (user) setUserId(user.uid);

      if (!user) {
        setError('Please log in to access this course.');
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      let authToken;
      try {
        authToken = await user.getIdToken();
      } catch (tokenError) {
        setError('Authentication error. Please log out and log in again.');
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;
      if (!coursesApiUrl) {
        setError('Server configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const courseRes = await axios.get(coursesApiUrl, { headers, timeout: 30000 });
        const rawData = Array.isArray(courseRes.data)
          ? courseRes.data
          : courseRes.data.Items || courseRes.data.courses || [];

        if (!rawData.length) {
          setError('No courses available. Please try another course or contact support.');
          setLoading(false);
          return;
        }

        const courseData = rawData.find(item => item.module_id === id);
        if (!courseData) {
          setError(`Course with ID ${id} not found. Please verify the course ID or contact support.`);
          setLoading(false);
          return;
        }

        setCourse({
          module_id: courseData.module_id || id,
          title: courseData.title || 'Untitled Course',
          description: courseData.description || 'No description provided.',
          level: courseData.level || 'Beginner',
          order: courseData.order || '1',
        });

        const order = courseData.order || '1';
        const htmlRes = await axios.get(`${coursesApiUrl}?moduleId=${id}&order=${order}`, {
          headers,
          responseType: 'text',
          timeout: 15000,
        });

        if (!htmlRes.data || htmlRes.data.includes('Module not found') || htmlRes.data.includes('Error fetching')) {
          throw new Error('Failed to load course content: ' + (htmlRes.data || 'No response'));
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
          if (["h1", "h2", "h3"].includes(tagName) && el.textContent.trim()) {
            if (currentSection.content || currentSection.heading) {
              parsedSections.push({ ...currentSection });
            }
            // Use markdown heading syntax
            let hashes = tagName === "h1" ? "#" : tagName === "h2" ? "##" : "###";
            currentSection = { heading: `${hashes} ${el.textContent.trim()}`, content: '' };
            tocItems.push({ title: el.textContent.trim(), index: sectionIndex });
            sectionIndex++;
          } else if (el.textContent.trim()) {
            // Try to convert code/pre blocks to markdown, otherwise use textContent
            if (tagName === "pre" && el.querySelector('code')) {
              const code = el.querySelector('code').textContent;
              currentSection.content += `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
            } else if (tagName === "code") {
              currentSection.content += `\`${el.textContent}\``;
            } else if (tagName === "ul" || tagName === "ol") {
              // Convert lists to markdown
              const items = Array.from(el.children).map(li => `- ${li.textContent.trim()}`).join('\n');
              currentSection.content += `\n${items}\n`;
            } else {
              currentSection.content += `\n${el.textContent.trim()}\n`;
            }
          }
        });

        if (currentSection.content || currentSection.heading) {
          parsedSections.push({ ...currentSection });
        }

        if (parsedSections.length === 0) {
          throw new Error('No valid sections found in the document.');
        }

        setSections(parsedSections);
        setToc(tocItems);
        setFilteredToc(tocItems);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            switch (err.response.status) {
              case 400:
                setError('Invalid request. The course ID may be incorrect.');
                break;
              case 403:
                setError('Access denied. Please log in again.');
                navigate('/login', { replace: true });
                break;
              case 404:
                setError(`Course content for ID ${id} not found. Please verify the course ID.`);
                break;
              case 500:
                setError('Server error. Please try again later or contact support.');
                break;
              default:
                setError(`Server error (Code: ${err.response.status}). Please try again.`);
            }
          } else if (err.request) {
            setError('Network error: Unable to connect to the server.');
          } else {
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

  // Save user progress to Firestore (match security rules)
  const markSectionComplete = async (sectionIndex) => {
    if (!userId || !course) return;
    const db = getFirestore();
    const docId = `${userId}_${course.module_id}`;
    const progressRef = doc(db, 'userProgress', docId);
    // Read existing progress
    let progressData = {
      courseId: course.module_id,
      currentSectionIndex: sectionIndex,
      completedSections: [],
      quizAnswers: quizAnswers,
      quizSubmitted: quizSubmitted,
    };
    const progressSnap = await getDoc(progressRef);
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      progressData = {
        courseId: course.module_id,
        currentSectionIndex: sectionIndex,
        completedSections: Array.from(new Set([...(data.completedSections || []), sectionIndex])),
        quizAnswers: data.quizAnswers || quizAnswers,
        quizSubmitted: data.quizSubmitted || quizSubmitted,
      };
    } else {
      progressData.completedSections = [sectionIndex];
    }
    await setDoc(progressRef, progressData);
    setCompletedSections(new Set(progressData.completedSections));
  };

  // Save quiz progress to Firestore
  const saveQuizProgress = async (answers, submitted) => {
    if (!userId || !course) return;
    const db = getFirestore();
    const docId = `${userId}_${course.module_id}`;
    const progressRef = doc(db, 'userProgress', docId);
    const progressSnap = await getDoc(progressRef);
    let progressData = {
      courseId: course.module_id,
      completedSections: Array.from(completedSections),
      quizAnswers: answers,
      quizSubmitted: submitted,
    };
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      progressData = {
        ...data,
        quizAnswers: answers,
        quizSubmitted: submitted,
      };
    }
    await setDoc(progressRef, progressData);
  };

  // Load user progress from Firestore (match security rules)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !course) return;
      const db = getFirestore();
      const docId = `${userId}_${course.module_id}`;
      const progressRef = doc(db, 'userProgress', docId);
      const progressSnap = await getDoc(progressRef);
      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (Array.isArray(data.completedSections)) {
          setCompletedSections(new Set(data.completedSections));
        }
        if (data.quizAnswers) setQuizAnswers(data.quizAnswers);
        if (data.quizSubmitted) setQuizSubmitted(data.quizSubmitted);
      }
    };
    fetchProgress();
  }, [userId, course]);

  useEffect(() => {
    // Set sidebar open only on desktop by default
    const initialSidebarState = window.innerWidth > 1024;
    setIsSidebarOpen(initialSidebarState);
    setSidebarWidth(300);
    setContentHeight('auto');
    document.documentElement.style.setProperty('--sidebar-width', `300px`);

    const handleResizeAndInteractions = () => {
      setIsSidebarOpen(window.innerWidth > 1024);
      setSidebarWidth(300);
      setContentHeight('auto');
      document.documentElement.style.setProperty('--sidebar-width', `300px`);
    };

    // Close sidebar if user clicks anywhere outside the sidebar (on any device)
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResizeAndInteractions);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResizeAndInteractions);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredToc(
      searchTerm.trim() === ''
        ? toc
        : toc.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, toc]);

  // Helper to check if device is mobile or tablet
  const isMobileOrTablet = () => window.innerWidth <= 1024;

  const handleNext = () => {
    setCurrentSectionIndex((prev) => Math.min(prev + 1, sections.length - 1));
  };
  const handlePrevious = () => {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTocClick = (index) => {
    markSectionComplete(currentSectionIndex);
    setCurrentSectionIndex(index);
    setIsSidebarOpen(false);
    contentAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRunCode = (sectionIndex) => {
    const section = sections[sectionIndex];
    const parser = new DOMParser();
    const doc = parser.parseFromString(section.content, 'text/html');
    const codeElements = doc.querySelectorAll('pre code, code');

    if (codeElements.length > 0) {
      const code = codeElements[0].textContent.trim();
      const result = safeEval(code);
      setCodeOutputs(prev => ({
        ...prev,
        [sectionIndex]: {
          output: result,
          isError: typeof result === 'string' && result.includes('Error'),
        },
      }));
    } else {
      setCodeOutputs(prev => ({
        ...prev,
        [sectionIndex]: { output: 'No code to run.', isError: false },
      }));
    }
  };

  const handleQuizAnswer = (questionIndex, option) => {
    setQuizAnswers(prev => {
      const updated = { ...prev, [questionIndex]: option };
      saveQuizProgress(updated, quizSubmitted);
      return updated;
    });
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setQuizSubmitted(true);
    saveQuizProgress(quizAnswers, true);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleToc = () => setTocOpen(prev => !prev);

  // Progress calculation: include quiz as a section if present
  const totalSections = toc.length + 1; // +1 for quiz
  const quizComplete = quizSubmitted && Object.keys(quizAnswers).length === quizQuestions.length;
  const progress = totalSections > 0 ? ((completedSections.size + (quizComplete ? 1 : 0)) / totalSections) * 100 : 0;

  // Show modal when course is completed
  useEffect(() => {
    if (progress === 100) {
      setShowCompletionModal(true);
    }
  }, [progress]);

  if (loading) {
    return (
      <div className="course-detail loading-container" role="status" aria-live="polite">
        <div className="content-container">
          <Skeleton variant="rectangular" height={200} animation="wave" aria-hidden="true" />
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <CircularProgress color="inherit" aria-label="Loading course details" />
            <Typography variant="h6" style={{ marginTop: '1rem' }}>
              Loading course details...
            </Typography>
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
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/courses')}
            aria-label="Return to courses list"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail error-container" role="alert" aria-live="assertive">
        <Typography variant="h5" align="center" style={{ padding: '2rem' }}>
          Course not found for ID: {id}.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/courses')}
          aria-label="Return to courses list"
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="course-detail" role="main">
      <div className="content-container">
        <motion.div className="course-header" initial="hidden" animate="visible" variants={sectionVariants}>
          <div className="course-header-top">
            <Typography variant="h4" component="h1">{course.title}</Typography>
            <Tooltip title="Return to all courses">
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/courses')}
                className="back-to-courses-button"
                aria-label="Back to courses"
                startIcon={<HomeIcon />}
              >
                Back to Courses
              </Button>
            </Tooltip>
          </div>
          <Typography variant="body1">{course.description}</Typography>
          <Typography variant="caption">Level: {course.level}</Typography>
        </motion.div>
        <AppBar position="static" className="course-navbar" role="navigation">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="course-menu-button"
              aria-expanded={isSidebarOpen}
              aria-controls="course-sidebar"
            >
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb" className="course-breadcrumb">
              <Link
                color="inherit"
                onClick={() => navigate('/courses')}
                style={{ cursor: 'pointer' }}
                aria-label="Courses"
              >
                Courses
              </Link>
              <Typography color="textPrimary">{course.title}</Typography>
            </Breadcrumbs>
          </Toolbar>
        </AppBar>
        <div className="content-layout">
          {/* Sidebar overlay for mobile/tablet */}
          <div
            className={isSidebarOpen ? "sidebar-overlay active" : "sidebar-overlay"}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden={!isSidebarOpen}
            style={{ pointerEvents: isSidebarOpen ? 'auto' : 'none' }}
          />
          <motion.div
            id="course-sidebar"
            className={`course-sidebar${isSidebarOpen ? ' open' : ' closed'}`}
            ref={sidebarRef}
            initial="hidden"
            animate={isSidebarOpen ? 'visible' : 'hidden'}
            variants={sidebarVariants}
            role="complementary"
            aria-label="Course table of contents"
            aria-hidden={!isSidebarOpen}
            tabIndex={isSidebarOpen ? 0 : -1}
          >
            <div className="sidebar-header">
              <BookIcon className="sidebar-icon" aria-hidden="true" />
              <Typography variant="h6" component="h2">
                Table of Contents
              </Typography>
              <IconButton
                onClick={toggleToc}
                aria-label={tocOpen ? 'Collapse table of contents' : 'Expand table of contents'}
                aria-expanded={tocOpen}
                className="toc-toggle"
              >
                {tocOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </div>
            <div className="sidebar-progress">
              <TrendingUpIcon className="mr-2" aria-hidden="true" />
              <Typography variant="caption">Progress: {progress.toFixed(0)}%</Typography>
              <LinearProgress variant="determinate" value={progress} className="progress-bar" />
              {progress === 100 && (
                <Typography variant="body2" className="course-completed-banner" color="primary">
                  🎉 Course Completed!
                </Typography>
              )}
            </div>
            <TextField
              variant="outlined"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              className="sidebar-search"
              InputProps={{
                startAdornment: <SearchIcon className="mr-2" aria-hidden="true" />,
                'aria-label': 'Search table of contents',
              }}
              aria-controls="toc-list"
            />
            <Collapse in={tocOpen}>
              <List id="toc-list" component="nav" aria-label="Table of contents">
                {filteredToc.map((item, i) => (
                  <motion.div
                    key={item.index}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={tocItemVariants}
                  >
                    <ListItem
                      onClick={() => handleTocClick(item.index)}
                      selected={currentSectionIndex === item.index}
                      className="sidebar-item"
                      aria-current={currentSectionIndex === item.index ? 'true' : 'false'}
                      button={undefined}
                    >
                      <ListItemIcon>
                        {completedSections.has(item.index) ? (
                          <CheckCircleIcon aria-label="Section completed" />
                        ) : (
                          <FiberManualRecordIcon aria-label="Section not completed" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Collapse>
            <div
              className="sidebar-resize-handle"
              onMouseDown={startSidebarDrag}
              onKeyDown={handleKeyDownSidebar}
              role="separator"
              tabIndex={0}
              aria-label="Resize sidebar"
            />
          </motion.div>
          <motion.div
            ref={contentAreaRef}
            className="content-area"
            initial="hidden"
            animate={isSidebarOpen ? 'visible' : 'hidden'}
            variants={contentVariants}
            role="region"
            aria-label="Course content"
            style={{ minHeight: contentHeight }}
          >
            <Typography variant="h5" component="h2">
              Course Content
            </Typography>
            {sections.length > 0 && (
              <motion.div
                key={currentSectionIndex}
                className="content-block"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
              >
                <div className="section-header">
                  <ReactMarkdown>{sections[currentSectionIndex].heading}</ReactMarkdown>
                  {completedSections.has(currentSectionIndex) && (
                    <CheckCircleIcon className="section-completed" aria-label="Section completed" />
                  )}
                </div>
                {/* If googleDocId is present, embed Google Doc, else render markdown */}
                {sections[currentSectionIndex].googleDocId ? (
                  <div className="google-doc-embed" style={{ margin: '24px 0' }}>
                    <iframe
                      src={`https://docs.google.com/document/d/${sections[currentSectionIndex].googleDocId}/preview`}
                      width="100%"
                      height="700"
                      style={{ border: '1px solid #eee', borderRadius: 8 }}
                      allowFullScreen
                      title="Google Doc"
                    />
                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <a
                        href={`https://docs.google.com/document/d/${sections[currentSectionIndex].googleDocId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-doc-link"
                        style={{ fontSize: 14, color: '#1976d2', textDecoration: 'underline' }}
                      >
                        Open in Google Docs ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        return !inline ? (
                          <div className="code-block-wrapper">
                            <button
                              className="copy-code-btn"
                              type="button"
                              onClick={() => navigator.clipboard.writeText(children)}
                            >
                              Copy
                            </button>
                            <pre><code className={className} {...props}>{children}</code></pre>
                          </div>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {sections[currentSectionIndex].content}
                  </ReactMarkdown>
                )}
                {sections[currentSectionIndex].content.includes('<code>') && (
                  <Tooltip title="Execute the code snippet">
                    <span style={{ display: 'inline-block' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRunCode(currentSectionIndex)}
                        className="run-code-button"
                        aria-label={`Run code for section ${sections[currentSectionIndex].heading || 'current section'}`}
                        startIcon={<PlayArrowIcon />}
                      >
                        Run Code
                      </Button>
                    </span>
                  </Tooltip>
                )}
                {sections[currentSectionIndex].content.includes('<code>') && codeOutputs[currentSectionIndex] && (
                  <div className="code-output">
                    <Tooltip title="Hide code output">
                      <span style={{ display: 'inline-block' }}>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => setCodeOutputs(prev => ({ ...prev, [currentSectionIndex]: null }))}
                          className="collapse-button"
                          aria-label={codeOutputs[currentSectionIndex].isError ? 'Hide error output' : 'Hide code output'}
                          startIcon={codeOutputs[currentSectionIndex].isError ? <ErrorIcon /> : <CodeIcon />}
                        >
                          {codeOutputs[currentSectionIndex].isError ? 'Hide Error' : 'Hide Output'}
                        </Button>
                      </span>
                    </Tooltip>
                    <pre className={`output-content ${codeOutputs[currentSectionIndex].isError ? 'error' : ''}`}>
                      <code>{codeOutputs[currentSectionIndex].output}</code>
                    </pre>
                  </div>
                )}
                <div className="navigation-buttons">
                  <Tooltip title="Go to previous section">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handlePrevious}
                      disabled={currentSectionIndex === 0}
                      className="nav-button prev-button"
                      aria-label="Go to previous section"
                      startIcon={<NavigateBeforeIcon />}
                    >
                      Previous
                    </Button>
                  </Tooltip>
                  <Tooltip title="Go to next section">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={currentSectionIndex === sections.length - 1}
                      className="nav-button next-button"
                      aria-label="Go to next section"
                      endIcon={<NavigateNextIcon />}
                    >
                      Next
                    </Button>
                  </Tooltip>
                </div>
              </motion.div>
            )}
            {currentSectionIndex === sections.length - 1 && sections.length > 0 && (
              <div className="quiz-section" role="region" aria-label="Course quiz">
                <Typography variant="h6" component="h3">
                  Test Your Knowledge
                </Typography>
                <div role="form" aria-label="Quiz form" aria-live="polite">
                  {quizQuestions.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <Typography variant="body1">
                        <QuestionMarkIcon className="mr-2" aria-hidden="true" />
                        {q.question}
                      </Typography>
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
                    <Tooltip title="Submit your quiz answers">
                      <span style={{ display: 'inline-block' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleQuizSubmit}
                          className="submit-quiz-button"
                          disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                          aria-label="Submit quiz answers"
                        >
                          Submit Quiz
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                  {quizSubmitted && (
                    <Typography className="quiz-result" variant="body1" aria-live="assertive">
                      You scored {Object.values(quizAnswers).filter((ans, i) => ans === quizQuestions[i].correctAnswer).length} out of {quizQuestions.length}!
                    </Typography>
                  )}
                  {progress === 100 && (
                    <Typography className="course-completed-banner" variant="h6" color="primary" aria-live="polite">
                      🎉 Congratulations! You have completed this course.
                    </Typography>
                  )}
                </div>
              </div>
            )}
            <div
              className="content-resize-handle"
              onMouseDown={startContentDrag}
              onKeyDown={handleKeyDownContent}
              role="separator"
              tabIndex={0}
              aria-label="Resize content area"
            />
          </motion.div>
        </div>
      </div>
      {progress === 100 && (
        <CourseCompletionModal
          open={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onShare={() => {
            if (navigator.share) {
              navigator.share({
                title: 'I completed a course on CodeTapasya!',
                text: `I just completed the course "${course?.title}" on CodeTapasya! 🚀` ,
                url: window.location.href
              });
            } else {
              window.alert('Sharing is not supported on this device.');
            }
          }}
          onDownload={() => window.print()} // Placeholder for certificate download
          userName={getAuth().currentUser?.displayName || 'Coder'}
          courseName={course?.title || 'this course'}
        />
      )}
    </div>
  );
}

export default CourseDetail;
