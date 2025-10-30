import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';
import SubscriptionPrompt from '../components/SubscriptionPrompt';
import ContentRenderer from '../components/ContentRenderer'; // NEW IMPORT
import CodeBlock from '../components/CodeBlock'; // NEW IMPORT
import NoteBox from '../components/NoteBox'; // NEW IMPORT
import { useSubscription } from '../contexts/SubscriptionContext';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// Load base languages first
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
// Load extended languages that depend on base languages
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import {
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  CircularProgress,
  LinearProgress,
  Breadcrumbs,
  Link,
  Drawer,
  Box,
  Button,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Alert,
  Zoom,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Badge,
  Avatar,
  Container,
  Grid
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookIcon from '@mui/icons-material/Book';
import CodeIcon from '@mui/icons-material/Code';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagIcon from '@mui/icons-material/Flag';
import ComputerIcon from '@mui/icons-material/Computer';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import CelebrationIcon from '@mui/icons-material/Celebration';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import LaunchIcon from '@mui/icons-material/Launch';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import '../styles/CourseDetail.css';
import CourseCompletionModal from '../components/CourseCompletionModal';

// Configure axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

// Helper to strip DynamoDB prefixes
const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

// Enhanced Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      staggerChildren: 0.1
    } 
  },
};

const sidebarVariants = {
  hidden: { width: 0, opacity: 0, x: -50 },
  visible: { 
    width: 'var(--sidebar-width)', 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: 'easeOut',
      type: "spring",
      stiffness: 300,
      damping: 30
    } 
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { 
      duration: 0.7, 
      ease: "easeOut",
      delay: 0.2
    } 
  },
};

const moduleItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.1,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 1.02,
    x: 5,
    transition: { duration: 0.2 }
  }
};

const progressVariants = {
  hidden: { width: 0 },
  visible: (progress) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.5
    }
  })
};

function CourseDetail() {
  const { id: courseId } = useParams(); // Extract 'id' param and rename to courseId
  const navigate = useNavigate();
  const location = useLocation();
  const { hasSubscription } = useSubscription();
  
  // Enhanced State
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [contents, setContents] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // New interactive state
  const [showCelebration, setShowCelebration] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [confettiElements, setConfettiElements] = useState([]);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [progressAnimation, setProgressAnimation] = useState(false);

  // Enhanced UX state
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [showModuleCompleteDialog, setShowModuleCompleteDialog] = useState(false);
  const [completedModule, setCompletedModule] = useState(null);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [navigationAction, setNavigationAction] = useState(null);
  const [showProgressSnackbar, setShowProgressSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastVisitedContent, setLastVisitedContent] = useState(null);
  const [hasReturningUser, setHasReturningUser] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const contentRef = useRef(null);

  // Copy code functionality
  const [copiedCode, setCopiedCode] = useState(null);
  
  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Simple code rendering without syntax highlighting for better readability
  const renderCodeBlock = (code, language = 'javascript', index) => {
    // Clean the code
    const cleanCode = code.trim();
    
    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(cleanCode);
    
    return (
      <div className="simple-code-block-container" key={index}>
        <div className="code-block-header">
          <span className="code-language">{detectedLanguage}</span>
          <Button
            variant="outlined"
            size="small"
            onClick={() => copyToClipboard(cleanCode, index)}
            startIcon={copiedCode === index ? <CheckIcon /> : <ContentCopyIcon />}
            className={`copy-button ${copiedCode === index ? 'copied' : ''}`}
          >
            {copiedCode === index ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="simple-code-block">
          <code>{cleanCode}</code>
        </pre>
      </div>
    );
  };

  // Language detection for code blocks
  const detectLanguage = (code) => {
    if (!code || typeof code !== 'string') return 'javascript';
    
    const codeToCheck = code.toLowerCase().trim();
    
    // More specific patterns for better detection
    const patterns = [
      { regex: /<!doctype html|<html|<\/html>|<head|<body/i, lang: 'html' },
      { regex: /\{[^}]*:[^}]*\}/g, lang: 'css' }, // CSS properties
      { regex: /^\s*[\[\{][\s\S]*[\]\}]\s*$/m, lang: 'json' }, // JSON structure
      { regex: /\b(select|insert|update|delete|create table|drop table|alter table)\b/i, lang: 'sql' },
      { regex: /\b(def |print\(|import |from |if __name__|\.py\b)/i, lang: 'python' },
      { regex: /\b(public class|public static void|System\.out\.println|\.java\b)/i, lang: 'java' },
      { regex: /\b(#include|int main|std::|cout|cin|\.cpp\b|\.c\b)/i, lang: 'cpp' },
      { regex: /\b(import React|export default|useState|useEffect|\.jsx\b)/i, lang: 'jsx' },
      { regex: /\b(interface|type|enum|as |\.tsx\b|\.ts\b)/i, lang: 'typescript' },
      { regex: /\b(function|const|let|var|=>|console\.log|\.js\b)/i, lang: 'javascript' }
    ];
    
    // Check each pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(code)) {
        return pattern.lang;
      }
    }
    
    // Default fallback
    return 'javascript';
  };

  // Enhanced utility functions
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Get next module content
  const getNextModuleContent = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return null;
    
    const nextModuleIndex = currentModuleIndex + 1;
    if (nextModuleIndex >= modules.length) return null;
    
    const nextModule = modules[nextModuleIndex];
    const nextModuleContents = contents.filter(c => c.moduleId === nextModule.id);
    return nextModuleContents.length > 0 ? nextModuleContents[0] : null;
  };

  // Check if current module is completed
  const isCurrentModuleCompleted = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return false;
    
    const moduleContents = contents.filter(c => c.moduleId === currentModule.id);
    const completedCount = moduleContents.filter(c => isContentCompleted(c.id)).length;
    return completedCount === moduleContents.length;
  };

  // Get progress in current module
  const getCurrentModuleProgress = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return 0;
    return getModuleProgress(currentModule.id);
  };

  // Check if user is returning (has previous progress)
  const checkReturningUser = () => {
    return userProgress && userProgress.completedSections && userProgress.completedSections.length > 0;
  };

  // Find last visited content
  const findLastVisitedContent = () => {
    if (!userProgress.lastVisitedContentId) return null;
    return contents.find(c => c.id === userProgress.lastVisitedContentId);
  };

  // Save last visited content
  const saveLastVisited = async (contentId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const db = getFirestore();
      const progressDocId = `${user.uid}_${courseId}`;
      const progressDocRef = doc(db, 'userProgress', progressDocId);
      
      await setDoc(progressDocRef, {
        ...userProgress,
        lastVisitedContentId: contentId,
        lastVisited: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to save last visited:', error);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    // Create confetti elements
    const newConfetti = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2
    }));
    setConfettiElements(newConfetti);
    
    setTimeout(() => {
      setShowCelebration(false);
      setConfettiElements([]);
    }, 3000);
  };

  const getReadingProgress = () => {
    const elapsed = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
    return Math.min(elapsed / readingTime * 100, 100);
  };

  const addRippleEffect = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  // Modern learning platform content parser - like GeeksforGeeks/W3Schools
  const parseAndRenderContent = (html, sectionId) => {
    if (!html) return null;
    
    try {
      // Clean HTML and parse into learning sections
      let cleanedHtml = html
        .replace(/step-highlight-banner/gi, '')
        .replace(/step-number-badge/gi, '')
        .replace(/tech-term/gi, '')
        .replace(/>\s*"[^"]*">/gi, '')
        .replace(/"\s*>/gi, '');

      // Parse content into structured learning blocks
      const learningBlocks = parseContentIntoBlocks(cleanedHtml);
      
      return learningBlocks.map((block, index) => (
        <motion.div
          key={`${sectionId}-block-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="learning-block"
        >
          {renderLearningBlock(block, index)}
        </motion.div>
      ));

    } catch (error) {
      console.error('Error parsing content:', error);
      return [
        <div key="error-content" className="fallback-content">
          <div dangerouslySetInnerHTML={{ __html: formatHtmlContent(html) }} />
        </div>
      ];
    }
  };

  // Parse content into W3Schools-style structured learning blocks
  const parseContentIntoBlocks = (html) => {
    const blocks = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Split content into paragraphs and code blocks like W3Schools
    const elements = Array.from(tempDiv.children);
    
    if (elements.length === 0) {
      // Handle plain text content
      const paragraphs = html.split('\n\n').filter(p => p.trim());
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          blocks.push({
            type: 'paragraph',
            content: paragraph.trim(),
            index: index
          });
        }
      });
    } else {
      // Process structured HTML elements
      elements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName.match(/^h[1-6]$/)) {
          // Heading blocks with W3Schools styling
          blocks.push({
            type: 'heading',
            level: parseInt(tagName.charAt(1)),
            content: element.textContent.trim(),
            index: blocks.length
          });
        } else if (tagName === 'pre' || tagName === 'code') {
          // Code blocks with syntax highlighting
          const codeContent = element.textContent || element.innerText || '';
          blocks.push({
            type: 'code',
            content: codeContent.trim(),
            language: detectLanguage(codeContent),
            index: blocks.length
          });
        } else if (tagName === 'p') {
          // Paragraph blocks with proper spacing
          const content = element.innerHTML.trim();
          if (content) {
            blocks.push({
              type: 'paragraph',
              content: content,
              index: blocks.length
            });
          }
        } else if (tagName === 'ul' || tagName === 'ol') {
          // List blocks
          blocks.push({
            type: 'list',
            listType: tagName,
            content: element.innerHTML,
            index: blocks.length
          });
        } else if (tagName === 'blockquote') {
          // Quote blocks
          blocks.push({
            type: 'quote',
            content: element.innerHTML,
            index: blocks.length
          });
        } else {
          // Generic content blocks
          const content = element.innerHTML.trim();
          if (content) {
            blocks.push({
              type: 'content',
              content: content,
              index: blocks.length
            });
          }
        }
      });
    }
    
    return blocks.filter(block => 
      block.content && block.content.toString().trim().length > 0
    );
  };

  // Render individual learning block with W3Schools-inspired styling
  const renderLearningBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        return (
          <motion.div
            key={`heading-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-heading-block"
          >
            <Typography 
              variant={`h${Math.min(block.level + 1, 6)}`}
              component={`h${block.level}`}
              sx={{ 
                fontWeight: 700,
                color: '#2d3748',
                marginTop: index === 0 ? 0 : 4,
                marginBottom: 2,
                fontSize: block.level === 1 ? '2.5rem' : 
                          block.level === 2 ? '2rem' : 
                          block.level === 3 ? '1.5rem' : '1.25rem',
                borderBottom: block.level <= 2 ? '2px solid #e2e8f0' : 'none',
                paddingBottom: block.level <= 2 ? 1 : 0,
                lineHeight: 1.3
              }}
            >
              {block.content}
            </Typography>
          </motion.div>
        );

      case 'paragraph':
        return (
          <motion.div
            key={`paragraph-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-paragraph-block"
          >
            <div className="w3-paragraph-content">
              <div className="w3-paragraph-text">
                <ContentRenderer content={block.content} />
              </div>
            </div>
          </motion.div>
        );

      case 'code':
        return (
          <motion.div
            key={`code-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-code-block"
          >
            <div className="w3-code-example">
              {/* W3Schools-style code header */}
              <div className="w3-code-header">
                <div className="w3-code-title">
                  <CodeIcon sx={{ fontSize: 18, mr: 1 }} />
                  <span className="w3-code-label">{block.language.toUpperCase()} Example</span>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(block.content, `w3-code-${index}`)}
                  startIcon={copiedCode === `w3-code-${index}` ? <CheckIcon /> : <ContentCopyIcon />}
                  className="w3-copy-btn"
                >
                  {copiedCode === `w3-code-${index}` ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              {/* Code content with full width */}
              <div className="w3-code-content">
                <pre><code>{block.content}</code></pre>
                
                {/* Try it yourself button */}
                <Button
                  variant="contained"
                  size="small"
                  className="w3-try-btn"
                  onClick={() => {
                    console.log('Try it yourself:', block.content);
                    // Future: Open in playground
                  }}
                >
                  Try it yourself »
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 'list':
        return (
          <motion.div
            key={`list-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-list-block"
          >
            <Box sx={{ 
              marginBottom: 3,
              padding: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              border: '1px solid #e9ecef'
            }}>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: `<${block.listType} class="w3-list">${block.content}</${block.listType}>` 
                }}
                style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: '#2d3748'
                }}
              />
            </Box>
          </motion.div>
        );

      case 'quote':
        return (
          <motion.div
            key={`quote-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-quote-block"
          >
            <Box sx={{ 
              marginBottom: 3,
              padding: 3,
              backgroundColor: '#e3f2fd',
              borderLeft: '4px solid #2196F3',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: '#1565c0',
                  margin: 0
                }}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            </Box>
          </motion.div>
        );

      case 'content':
        return (
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w3-content-block"
          >
            <Box sx={{ 
              marginBottom: 3,
              padding: 2,
              backgroundColor: '#ffffff',
              borderRadius: 1,
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: '#2d3748'
              }}>
                <ContentRenderer content={block.content} />
              </div>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Render dynamic content blocks created in AdminPanel
  const renderContentBlocks = (contentBlocks) => {
    if (!contentBlocks || !Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      console.log('No content blocks to render:', contentBlocks);
      return null;
    }

    console.log('Rendering content blocks:', contentBlocks);

    // Sort content blocks by order
    const sortedBlocks = [...contentBlocks].sort((a, b) => {
      const orderA = parseInt(a.order) || 0;
      const orderB = parseInt(b.order) || 0;
      return orderA - orderB;
    });

    console.log('Sorted content blocks:', sortedBlocks);

    return sortedBlocks.map((block, index) => {
      const blockKey = `content-block-${block.id || index}`;
      console.log(`Rendering block ${index}:`, block);
      
      return (
        <motion.div
          key={blockKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + (index * 0.1) }}
          className={`content-block content-block-${block.type}`}
        >
          {renderContentBlock(block, index)}
        </motion.div>
      );
    });
  };

  // Render individual content block based on type
  const renderContentBlock = (block, index) => {
    console.log(`Rendering content block type: ${block.type}`, block);
    
    switch (block.type) {
      case 'text':
        return (
          <Box 
            className="content-text-integrated" 
            key={`dynamic-text-${index}`}
            sx={{ 
              marginBottom: { xs: 3, sm: 4 },
              '&:not(:last-child)': {
                marginBottom: { xs: 3.5, sm: 4.5 }
              }
            }}
          >
            <Typography 
              variant="body1" 
              component="div"
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.2rem' },
                lineHeight: { xs: 1.8, sm: 1.9 },
                color: '#1a202c',
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.01em',
                '& p': {
                  marginBottom: '1.5rem',
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  fontWeight: 400,
                  '&:last-child': {
                    marginBottom: 0
                  },
                  '&:first-of-type': {
                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                    fontWeight: 500,
                    color: '#0f172a',
                    lineHeight: 1.7
                  }
                },
                '& strong, & b': {
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.02em',
                  letterSpacing: '0.005em'
                },
                '& em, & i': {
                  fontStyle: 'italic',
                  color: '#374151',
                  fontWeight: 500
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontFamily: '"Inter", "SF Pro Display", sans-serif',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: '2rem',
                  marginBottom: '1rem',
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em'
                },
                '& h1': {
                  fontSize: { xs: '1.875rem', sm: '2.25rem' },
                  fontWeight: 800
                },
                '& h2': {
                  fontSize: { xs: '1.5rem', sm: '1.875rem' },
                  fontWeight: 700
                },
                '& h3': {
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 600
                },
                '& h4': {
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 600
                },
                '& ul, & ol': {
                  paddingLeft: '1.75rem',
                  marginBottom: '1.5rem',
                  '& li': {
                    marginBottom: '0.75rem',
                    lineHeight: 1.8,
                    fontSize: { xs: '1.1rem', sm: '1.15rem' },
                    color: '#374151',
                    '& strong': {
                      color: '#0f172a',
                      fontWeight: 700
                    }
                  }
                },
                '& ul': {
                  '& li': {
                    position: 'relative',
                    '&::marker': {
                      color: '#3b82f6',
                      fontSize: '1.2em'
                    }
                  }
                },
                '& ol': {
                  '& li': {
                    fontWeight: 500,
                    '&::marker': {
                      color: '#059669',
                      fontWeight: 700
                    }
                  }
                },
                '& blockquote': {
                  borderLeft: '4px solid #3b82f6',
                  paddingLeft: '1.5rem',
                  margin: '1.5rem 0',
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0 8px 8px 0',
                  fontStyle: 'italic',
                  fontSize: { xs: '1.1rem', sm: '1.15rem' },
                  color: '#475569',
                  fontWeight: 500,
                  '& p': {
                    marginBottom: '0.5rem',
                    '&:last-child': {
                      marginBottom: 0
                    }
                  }
                },
                '& code': {
                  backgroundColor: '#f1f5f9',
                  color: '#be185d',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontFamily: '"Fira Code", "SF Mono", Monaco, Menlo, monospace',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0'
                },
                '& a': {
                  color: '#2563eb',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(37, 99, 235, 0.3)',
                  textUnderlineOffset: '3px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#1d4ed8',
                    textDecorationColor: '#1d4ed8'
                  }
                }
              }}
            >
              <ContentRenderer content={block.content || ''} />
            </Typography>
          </Box>
        );

      case 'code':
        return (
          <Box 
            className="content-code-block-integrated" 
            key={`dynamic-code-${index}`}
            sx={{ 
              marginBottom: { xs: 4, sm: 5 },
              marginTop: { xs: 3, sm: 4 }
            }}
          >
            {block.title && (
              <Typography 
                variant="h5" 
                sx={{ 
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: 2.5,
                  lineHeight: 1.3,
                  fontFamily: '"Inter", "SF Pro Display", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {block.title}
              </Typography>
            )}
            {block.description && (
              <Typography 
                variant="body1" 
                sx={{ 
                  marginBottom: 3,
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                  lineHeight: 1.8,
                  color: '#374151',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 400,
                  '& strong, & b': {
                    fontWeight: 700,
                    color: '#0f172a'
                  }
                }}
              >
                {block.description}
              </Typography>
            )}
            <Box 
              className="w3-code-example-integrated"
              sx={{
                borderRadius: { xs: 1, sm: 2 },
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Box 
                className="w3-code-header"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f7fafc',
                  padding: { xs: '10px 14px', sm: '12px 18px' },
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#374151',
                    fontSize: { xs: '0.825rem', sm: '0.9rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: '"Inter", "SF Pro Display", sans-serif'
                  }}
                >
                  {block.language || 'Code'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(block.content || '', `block-${index}`)}
                  startIcon={copiedCode === `block-${index}` ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    fontSize: { xs: '0.775rem', sm: '0.825rem' },
                    padding: { xs: '6px 12px', sm: '7px 16px' },
                    minWidth: { xs: 'auto', sm: '95px' },
                    borderColor: '#cbd5e0',
                    color: '#374151',
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#a0aec0',
                      backgroundColor: '#f7fafc'
                    }
                  }}
                >
                  {copiedCode === `block-${index}` ? 'Copied!' : 'Copy'}
                </Button>
              </Box>
              <Box 
                className="w3-code-content"
                sx={{
                  backgroundColor: '#ffffff',
                  '& pre': {
                    margin: 0,
                    padding: { xs: '16px', sm: '20px' },
                    backgroundColor: 'transparent',
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    lineHeight: { xs: 1.5, sm: 1.6 },
                    overflow: 'auto',
                    fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
                    color: '#2d3748'
                  },
                  '& code': {
                    color: 'inherit',
                    backgroundColor: 'transparent',
                    padding: 0,
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                  }
                }}
              >
                <pre><code>{block.content || ''}</code></pre>
              </Box>
            </Box>
          </Box>
        );

      case 'html':
        return (
          <Box 
            className="content-html-block" 
            key={`dynamic-html-${index}`}
            sx={{ 
              marginBottom: { xs: 3, sm: 4 },
              marginTop: { xs: 2, sm: 3 }
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                padding: { xs: '0 8px', sm: '0 16px', md: '0' }
              }}
            >
              <ComputerIcon color="primary" />
              Live HTML Preview
            </Typography>
            {block.preview !== false && (
              <Box 
                className="html-preview"
                sx={{ 
                  border: '2px dashed #10b981', 
                  borderRadius: 2, 
                  p: { xs: 2, sm: 3 }, 
                  mb: 2,
                  backgroundColor: '#f9f9f9',
                  minHeight: '100px',
                  position: 'relative',
                  margin: { xs: '0 8px', sm: '0 16px', md: '0' }
                }}
                dangerouslySetInnerHTML={{ __html: block.content || '' }}
              />
            )}
            <Box 
              className="simple-code-block-container"
              sx={{
                margin: { xs: '0 8px', sm: '0 16px', md: '0' },
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Box 
                className="code-block-header"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  padding: { xs: '8px 12px', sm: '12px 16px' },
                  borderBottom: '1px solid #e9ecef'
                }}
              >
                <Typography 
                  variant="caption" 
                  className="code-language"
                  sx={{ 
                    fontWeight: 600,
                    color: '#495057',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }}
                >
                  HTML
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(block.content || '', `html-block-${index}`)}
                  startIcon={copiedCode === `html-block-${index}` ? <CheckIcon /> : <ContentCopyIcon />}
                  className={`copy-button ${copiedCode === `html-block-${index}` ? 'copied' : ''}`}
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    padding: { xs: '4px 8px', sm: '6px 12px' }
                  }}
                >
                  {copiedCode === `html-block-${index}` ? 'Copied!' : 'Copy'}
                </Button>
              </Box>
              <Box 
                className="simple-code-block"
                sx={{
                  backgroundColor: '#ffffff',
                  '& pre': {
                    margin: 0,
                    padding: { xs: '12px', sm: '16px' },
                    backgroundColor: 'transparent',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    lineHeight: { xs: 1.4, sm: 1.5 },
                    overflow: 'auto',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                  },
                  '& code': {
                    color: '#2d3748',
                    backgroundColor: 'transparent',
                    padding: 0,
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                  }
                }}
              >
                <pre><code>{block.content || ''}</code></pre>
              </Box>
            </Box>
          </Box>
        );

      case 'image':
        return (
          <Box 
            className="content-image-integrated" 
            key={`dynamic-image-${index}`}
            sx={{ 
              marginBottom: { xs: 4, sm: 5 },
              marginTop: { xs: 3, sm: 4 },
              textAlign: 'center'
            }}
          >
            {block.url && (
              <>
                <img
                  src={block.url}
                  alt={block.alt || 'Content image'}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
                {block.caption && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2, 
                      fontStyle: 'italic',
                      color: '#6b7280',
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      lineHeight: 1.5
                    }}
                  >
                    {block.caption}
                  </Typography>
                )}
              </>
            )}
          </Box>
        );

      case 'note':
        const noteIcons = {
          info: <InfoIcon />,
          warning: <WarningIcon />,
          tip: <LightbulbIcon />,
          important: <WhatshotIcon />
        };
        const noteColors = {
          info: 'info',
          warning: 'warning', 
          tip: 'success',
          important: 'error'
        };
        
        return (
          <Alert 
            severity={noteColors[block.noteType] || 'info'}
            icon={noteIcons[block.noteType] || <InfoIcon />}
            className="content-note-integrated"
            key={`dynamic-note-${index}`}
            sx={{ 
              mb: { xs: 3, sm: 4 },
              mt: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '& .MuiAlert-message': {
                fontSize: { xs: '1.05rem', sm: '1.125rem' },
                lineHeight: 1.7,
                fontFamily: '"Inter", "SF Pro Display", sans-serif',
                fontWeight: 500,
                color: '#374151',
                '& strong': {
                  fontWeight: 700,
                  color: '#111827'
                }
              },
              '& .MuiAlert-icon': {
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
                marginTop: '2px'
              },
              '& .MuiAlert-action': {
                marginTop: '1px'
              }
            }}
          >
            <Typography 
              variant="body1"
              sx={{
                fontSize: { xs: '1.05rem', sm: '1.125rem' },
                lineHeight: 1.7,
                fontFamily: '"Inter", "SF Pro Display", sans-serif',
                fontWeight: 500,
                '& strong, & b': {
                  fontWeight: 700,
                  color: '#111827'
                },
                '& em, & i': {
                  fontStyle: 'italic',
                  fontWeight: 500
                }
              }}
            >
              {block.content}
            </Typography>
          </Alert>
        );

      case 'video':
        return (
          <Box 
            className="content-video-block" 
            key={`dynamic-video-${index}`}
            sx={{ 
              marginBottom: { xs: 3, sm: 4 },
              marginTop: { xs: 2, sm: 3 },
              padding: { xs: '0 8px', sm: '0 16px', md: '0' }
            }}
          >
            {block.title && (
              <Typography 
                variant="h6" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <ImportantDevicesIcon color="primary" />
                {block.title}
              </Typography>
            )}
            {block.description && (
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' }
                }}
              >
                {block.description}
              </Typography>
            )}
            {block.url && (
              <Box 
                sx={{ 
                  position: 'relative', 
                  paddingBottom: '56.25%', 
                  height: 0, 
                  overflow: 'hidden',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <iframe
                  src={block.url}
                  title={block.title || 'Video content'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allowFullScreen
                />
              </Box>
            )}
          </Box>
        );

      case 'quiz':
        return (
          <Box 
            className="content-quiz-integrated" 
            key={`dynamic-quiz-${index}`}
            sx={{ 
              marginBottom: { xs: 4, sm: 5 },
              marginTop: { xs: 3, sm: 4 },
              padding: { xs: '20px', sm: '24px' },
              border: '2px solid #e3f2fd',
              borderRadius: 3,
              backgroundColor: '#f8fcff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 3,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                color: '#1e40af'
              }}
            >
              <AutoAwesomeIcon color="primary" />
              Quick Check
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                fontWeight: 500,
                fontSize: { xs: '1.05rem', sm: '1.125rem' },
                lineHeight: 1.6,
                color: '#1f2937'
              }}
            >
              {block.question}
            </Typography>
            {block.options && Array.isArray(block.options) && (
              <Box sx={{ mb: 3 }}>
                {block.options.map((option, optIndex) => (
                  <Box key={optIndex} sx={{ mb: 1.5 }}>
                    <Chip
                      label={option}
                      variant={option === block.correctAnswer ? "filled" : "outlined"}
                      color={option === block.correctAnswer ? "success" : "default"}
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        height: { xs: '32px', sm: '36px' },
                        fontWeight: 500,
                        '&.MuiChip-filled': {
                          backgroundColor: '#10b981',
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            {block.explanation && (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    lineHeight: 1.6
                  }
                }}
              >
                <Typography variant="body1">
                  <strong>Explanation:</strong> {block.explanation}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 'divider':
        const dividerHeight = parseInt(block.height) || 50;
        return (
          <Box 
            className="content-block-divider"
            key={`dynamic-divider-${index}`}
            sx={{ 
              height: { xs: `${Math.max(dividerHeight * 0.7, 30)}px`, sm: `${dividerHeight}px` },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: { xs: 2, sm: 3 },
              padding: { xs: '0 8px', sm: '0 16px', md: '0' }
            }}
          >
            {block.style === 'line' ? (
              <Divider sx={{ width: '100%' }} />
            ) : block.style === 'dots' ? (
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                {[1, 2, 3].map(dot => (
                  <Box
                    key={dot}
                    sx={{
                      width: { xs: 6, sm: 8 },
                      height: { xs: 6, sm: 8 },
                      borderRadius: '50%',
                      backgroundColor: 'primary.main'
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ height: { xs: `${Math.max(dividerHeight * 0.7, 30)}px`, sm: `${dividerHeight}px` } }} />
            )}
          </Box>
        );

      default:
        console.warn('Unknown content block type:', block.type, 'Block data:', block);
        return (
          <Card className="content-block-card unknown-block" elevation={1}>
            <CardContent>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Unknown content block type: {block.type}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Block data:
              </Typography>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto' 
              }}>
                {JSON.stringify(block, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  // Comprehensive content formatting for ALL LMS content types - like GeeksforGeeks/W3Schools
  const formatHtmlContent = (content) => {
    if (!content) return '';
    
    // Handle different content types
    if (typeof content === 'object') {
      // If it's a structured content object, stringify it safely
      try {
        content = JSON.stringify(content, null, 2);
      } catch {
        content = String(content);
      }
    }
    
    return <ContentRenderer content={String(content)} />;
  };

  // Enhanced content formatting for educational content - like GeeksforGeeks
  const formatEducationalContent = (html) => {
    if (!html) return '';
    
    let formatted = html;
    
    // Create highlighted info boxes with modern styling
    formatted = formatted.replace(
      /\*\*Note:\*\*(.*?)(?=\n\n|\n$|$)/gi,
      '<div class="edu-note-box note-type"><div class="note-icon">📝</div><div class="note-content"><strong>Note:</strong> $1</div></div>'
    );
    
    formatted = formatted.replace(
      /\*\*Tip:\*\*(.*?)(?=\n\n|\n$|$)/gi,
      '<div class="edu-note-box tip-type"><div class="note-icon">💡</div><div class="note-content"><strong>Pro Tip:</strong> $1</div></div>'
    );
    
    formatted = formatted.replace(
      /\*\*Warning:\*\*(.*?)(?=\n\n|\n$|$)/gi,
      '<div class="edu-note-box warning-type"><div class="note-icon">⚠️</div><div class="note-content"><strong>Warning:</strong> $1</div></div>'
    );
    
    formatted = formatted.replace(
      /\*\*Important:\*\*(.*?)(?=\n\n|\n$|$)/gi,
      '<div class="edu-note-box important-type"><div class="note-icon">⭐</div><div class="note-content"><strong>Important:</strong> $1</div></div>'
    );

    // Create step-by-step instructions
    formatted = formatted.replace(
      /(\d+)\.\s*([^.\n]+)/g,
      '<div class="step-instruction"><span class="step-number">$1</span><span class="step-text">$2</span></div>'
    );
    
    // Enhance code snippets with better highlighting
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="inline-code-snippet">$1</code>'
    );
    
    // Create definition boxes for technical terms
    formatted = formatted.replace(
      /\[DEF\](.*?)\[\/DEF\]/gi,
      '<div class="definition-box"><div class="def-icon">📖</div><div class="def-content">$1</div></div>'
    );
    
    // Enhance lists with better styling
    formatted = formatted.replace(
      /<ul>/g,
      '<ul class="edu-list">'
    );
    
    formatted = formatted.replace(
      /<ol>/g,
      '<ol class="edu-ordered-list">'
    );
    
    // Add example boxes
    formatted = formatted.replace(
      /\[EXAMPLE\](.*?)\[\/EXAMPLE\]/gi,
      '<div class="example-box"><div class="example-header"><span class="example-icon">🎯</span><strong>Example:</strong></div><div class="example-content">$1</div></div>'
    );
    
    // Create syntax highlighting for file names
    formatted = formatted.replace(
      /([a-zA-Z0-9_-]+\.(html|css|js|jsx|ts|tsx|py|java|cpp|php|json|xml|md|txt))/gi,
      '<span class="file-badge">📄 $1</span>'
    );
    
    // Enhanced bold and italic with better visual hierarchy
    formatted = formatted.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="text-bold">$1</strong>'
    );
    
    formatted = formatted.replace(
      /\*([^*]+)\*/g,
      '<em class="text-emphasis">$1</em>'
    );
    
    // Add keyboard shortcuts styling
    formatted = formatted.replace(
      /(Ctrl|Cmd|Alt|Shift)\s*\+\s*([A-Z0-9]+)/gi,
      '<kbd class="keyboard-combo">$1 + $2</kbd>'
    );
    
    // Create output/result boxes
    formatted = formatted.replace(
      /\[OUTPUT\](.*?)\[\/OUTPUT\]/gi,
      '<div class="output-box"><div class="output-header"><span class="output-icon">⚡</span><strong>Output:</strong></div><pre class="output-content">$1</pre></div>'
    );
    
    // Add comprehensive technology and subject badges for LMS
    formatted = formatted.replace(
      /\b(HTML|CSS|JavaScript|React|Node\.js|Python|Java|C\+\+|TypeScript|Vue\.js|Angular|PHP|Ruby|Go|Rust|Swift|Kotlin|C#|SQL|MongoDB|PostgreSQL|MySQL|Firebase|AWS|Azure|Docker|Kubernetes|Git|GitHub|Linux|Windows|macOS|Android|iOS|Flutter|React Native|Machine Learning|AI|Data Science|Blockchain|Cybersecurity|DevOps|Cloud Computing|Microservices|API|REST|GraphQL|JSON|XML|Bootstrap|Tailwind|Material-UI|Express|Django|Flask|Spring|Laravel|Rails|ASP\.NET)\b/g,
      '<span class="tech-badge">$1</span>'
    );

    // Add academic subject badges for educational content
    formatted = formatted.replace(
      /\b(Mathematics|Physics|Chemistry|Biology|Computer Science|Data Structures|Algorithms|Database|Networking|Operating Systems|Software Engineering|Web Development|Mobile Development|Game Development|UI\/UX Design|Digital Marketing|Business Analytics|Economics|Finance|Accounting|Management|Psychology|Statistics|Calculus|Algebra|Geometry|Trigonometry|Discrete Mathematics|Linear Algebra|Probability|Logic|Philosophy|History|English|Literature|Communications|Project Management|Quality Assurance|Testing|Security|Cryptography|Artificial Intelligence|Neural Networks|Deep Learning|Natural Language Processing|Computer Vision|Robotics|IoT|Big Data|Cloud Architecture|System Design|Software Architecture|Design Patterns|Agile|Scrum|Kanban)\b/g,
      '<span class="subject-badge">$1</span>'
    );

    // Add learning difficulty indicators
    formatted = formatted.replace(
      /\[(BEGINNER|INTERMEDIATE|ADVANCED|EXPERT)\]/gi,
      '<span class="difficulty-badge difficulty-$1">$1</span>'
    );

    // Add time estimates for learning modules
    formatted = formatted.replace(
      /\[TIME:\s*(\d+)\s*(min|hour|hours|day|days|week|weeks)\]/gi,
      '<span class="time-badge"><i class="time-icon">⏱️</i>$1 $2</span>'
    );

    // Add prerequisite indicators
    formatted = formatted.replace(
      /\[PREREQUISITE\](.*?)\[\/PREREQUISITE\]/gi,
      '<div class="prerequisite-box"><div class="prerequisite-header"><span class="prerequisite-icon">📚</span><strong>Prerequisites:</strong></div><div class="prerequisite-content">$1</div></div>'
    );

    // Add learning outcomes
    formatted = formatted.replace(
      /\[LEARNING_OUTCOME\](.*?)\[\/LEARNING_OUTCOME\]/gi,
      '<div class="outcome-box"><div class="outcome-header"><span class="outcome-icon">🎯</span><strong>Learning Outcome:</strong></div><div class="outcome-content">$1</div></div>'
    );

    // Add quiz indicators
    formatted = formatted.replace(
      /\[QUIZ\](.*?)\[\/QUIZ\]/gi,
      '<div class="quiz-indicator"><div class="quiz-header"><span class="quiz-icon">❓</span><strong>Quick Check:</strong></div><div class="quiz-content">$1</div></div>'
    );

    // Add assignment markers
    formatted = formatted.replace(
      /\[ASSIGNMENT\](.*?)\[\/ASSIGNMENT\]/gi,
      '<div class="assignment-box"><div class="assignment-header"><span class="assignment-icon">📝</span><strong>Assignment:</strong></div><div class="assignment-content">$1</div></div>'
    );

    // Add project indicators
    formatted = formatted.replace(
      /\[PROJECT\](.*?)\[\/PROJECT\]/gi,
      '<div class="project-box"><div class="project-header"><span class="project-icon">🚀</span><strong>Project:</strong></div><div class="project-content">$1</div></div>'
    );

    // Add resource links formatting
    formatted = formatted.replace(
      /\[RESOURCE\](.*?)\[\/RESOURCE\]/gi,
      '<div class="resource-box"><div class="resource-header"><span class="resource-icon">📖</span><strong>Additional Resource:</strong></div><div class="resource-content">$1</div></div>'
    );

    // Add interactive elements
    formatted = formatted.replace(
      /\[INTERACTIVE\](.*?)\[\/INTERACTIVE\]/gi,
      '<div class="interactive-box"><div class="interactive-header"><span class="interactive-icon">🎮</span><strong>Try It Out:</strong></div><div class="interactive-content">$1</div></div>'
    );

    // Add common mathematical expressions formatting
    formatted = formatted.replace(
      /\$\$(.*?)\$\$/g,
      '<div class="math-expression-block">$1</div>'
    );
    
    formatted = formatted.replace(
      /\$(.*?)\$/g,
      '<span class="math-expression-inline">$1</span>'
    );

    // Add code complexity indicators
    formatted = formatted.replace(
      /\[COMPLEXITY:\s*(O\([^)]+\))\]/gi,
      '<span class="complexity-badge">⚡ Complexity: $1</span>'
    );

    // Add memory usage indicators
    formatted = formatted.replace(
      /\[MEMORY:\s*([^]]+)\]/gi,
      '<span class="memory-badge">💾 Memory: $1</span>'
    );
    
    return formatted;
  };

  const getAuthHeaders = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Force token refresh to ensure it's valid
      const token = await user.getIdToken(true);
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  // Enhanced API call with retry logic for 403 errors
  const makeAuthenticatedRequest = async (url, options = {}, retries = 2) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(url, { headers, ...options });
      return response;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      
      // Handle 403 errors specifically
      if (error.response?.status === 403) {
        if (retries > 0) {
          console.log(`Retrying request to ${url} due to 403 error. Retries left: ${retries}`);
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAuthenticatedRequest(url, options, retries - 1);
        } else {
          // After all retries failed, redirect to login
          console.error('Authentication failed after retries. Redirecting to login.');
          const auth = getAuth();
          await auth.signOut();
          navigate('/login', { 
            state: { 
              message: 'Authentication expired. Please log in again.',
              returnUrl: window.location.pathname 
            } 
          });
          throw new Error('Authentication failed. Please log in again.');
        }
      }
      
      // Handle other errors
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection.');
      }
      
      throw error;
    }
  };

  // Test API connection and authentication
  const testApiConnection = async () => {
    try {
      const apiUrl = import.meta.env.VITE_COURSES_API_URL;
      if (!apiUrl) {
        console.error('VITE_COURSES_API_URL environment variable is not set');
        return false;
      }
      
      console.log('Testing API connection to:', apiUrl);
      const response = await makeAuthenticatedRequest(`${apiUrl}/courses`);
      console.log('API connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Course ID not provided');
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        navigate('/login', { 
          state: { 
            message: 'Please log in to access course content.',
            returnUrl: `/courses/${courseId}` 
          } 
        });
        return;
      }

      // Test API connection first
      const connectionTest = await testApiConnection();
      if (!connectionTest) {
        setError('Unable to connect to the courses API. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        const apiUrl = import.meta.env.VITE_COURSES_API_URL;

        if (!apiUrl) {
          throw new Error('Courses API URL not configured. Please check your environment variables.');
        }

        // Fetch course details with enhanced error handling
        console.log('Fetching courses from:', `${apiUrl}/courses`);
        const courseResponse = await makeAuthenticatedRequest(`${apiUrl}/courses`);
        const courses = Array.isArray(courseResponse.data) ? courseResponse.data : courseResponse.data.Items || [];
        const courseData = courses.find(c => stripPrefix(c.SK) === courseId);

        if (!courseData) {
          setError(`Course with ID "${courseId}" not found. Please check the URL or try again.`);
          setLoading(false);
          return;
        }

        setCourse({
          id: stripPrefix(courseData.SK),
          title: courseData.title,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          order: courseData.order
        });

        // Fetch modules for this course with enhanced error handling
        console.log('Fetching modules from:', `${apiUrl}/courses/${courseId}/modules`);
        const modulesResponse = await makeAuthenticatedRequest(`${apiUrl}/courses/${courseId}/modules`);
        const modulesData = Array.isArray(modulesResponse.data) ? modulesResponse.data : modulesResponse.data.Items || [];
        
        const processedModules = modulesData
          .map(module => ({
            id: stripPrefix(module.SK),
            courseId: stripPrefix(module.PK),
            title: module.title,
            description: module.description,
            order: module.order || 1
          }))
          .sort((a, b) => a.order - b.order);

        setModules(processedModules);

        // Fetch content for all modules with enhanced error handling
        const allContents = [];
        for (const module of processedModules) {
          try {
            console.log('Fetching content for module:', module.id);
            const contentResponse = await makeAuthenticatedRequest(`${apiUrl}/modules/${module.id}/content`);
            const contentData = Array.isArray(contentResponse.data) ? contentResponse.data : contentResponse.data.Items || [];
            
            console.log(`Content data for module ${module.id}:`, contentData);
            
            const moduleContents = contentData
              .map(content => {
                console.log('Processing content:', content);
                console.log('Content blocks from backend:', content.content_blocks);
                console.log('Explanation blocks from backend:', content.explanation_blocks);
                
                return {
                  id: stripPrefix(content.SK),
                  moduleId: stripPrefix(content.PK),
                  title: content.title,
                  html: content.html || '',
                  contentBlocks: content.content_blocks || [], // Add content blocks
                  docId: content.doc_id || '',
                  explanationBlocks: content.explanation_blocks || [],
                  order: content.order || 1
                };
              })
              .sort((a, b) => a.order - b.order);

            console.log('Processed module contents:', moduleContents);

            allContents.push(...moduleContents.map(content => ({
              ...content,
              moduleTitle: module.title,
              moduleOrder: module.order
            })));
          } catch (contentError) {
            console.error(`Failed to fetch content for module ${module.id}:`, contentError);
          }
        }

        setContents(allContents);

        // Load user progress
        await loadUserProgress(user.uid);

        // Set initial content based on progress or navigation state
        const continueModule = location.state?.continueModule || 0;
        if (allContents.length > 0) {
          let startIndex = 0;
          if (continueModule > 0 && continueModule < allContents.length) {
            startIndex = continueModule;
          }
          setCurrentContentIndex(startIndex);
          setCurrentContent(allContents[startIndex]);
          
          // Find and set current module index
          const currentModIdx = processedModules.findIndex(m => 
            m.id === allContents[startIndex]?.moduleId
          );
          if (currentModIdx !== -1) {
            setCurrentModuleIndex(currentModIdx);
            setExpandedModules(prev => ({ ...prev, [currentModIdx]: true }));
          }

          // Check if user is returning and show continue dialog
          setTimeout(() => {
            if (checkReturningUser() && !location.state?.continueModule) {
              const lastContent = findLastVisitedContent();
              if (lastContent && lastContent.id !== allContents[0].id) {
                setLastVisitedContent(lastContent);
                setHasReturningUser(true);
                setShowContinueDialog(true);
              }
            }
          }, 1000);
        }

      } catch (err) {
        console.error('Failed to fetch course data:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load course data';
        
        if (err.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.message.includes('not found')) {
          errorMessage = err.message;
        } else if (err.message.includes('Server error')) {
          errorMessage = 'Server is currently experiencing issues. Please try again later.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. Please check your subscription or log in again.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Our team has been notified. Please try again later.';
        } else if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate, location.state]);

  // Initialize Prism.js when component mounts
  useEffect(() => {
    // Ensure Prism.js is properly initialized
    if (typeof Prism !== 'undefined' && Prism.highlightAll) {
      try {
        Prism.highlightAll();
      } catch (error) {
        console.warn('Prism.js initialization warning:', error);
      }
    }
  }, []);

  const loadUserProgress = async (userId) => {
    try {
      const db = getFirestore();
      const progressDocId = `${userId}_${courseId}`;
      const progressDocRef = doc(db, 'userProgress', progressDocId);
      const progressSnap = await getDoc(progressDocRef);
      
      if (progressSnap.exists()) {
        const progressData = progressSnap.data();
        setUserProgress(progressData);
        
        // Set returning user flag if there's previous progress
        if (progressData.completedSections && progressData.completedSections.length > 0) {
          setHasReturningUser(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const saveProgress = async (contentId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const db = getFirestore();
      const progressDocId = `${user.uid}_${courseId}`;
      const progressDocRef = doc(db, 'userProgress', progressDocId);
      
      const completedContents = userProgress.completedSections || [];
      if (!completedContents.includes(contentId)) {
        const updatedProgress = {
          ...userProgress,
          courseId,
          completedSections: [...completedContents, contentId],
          lastAccessed: new Date().toISOString(),
          lastVisitedContentId: contentId
        };
        
        await setDoc(progressDocRef, updatedProgress, { merge: true });
        setUserProgress(updatedProgress);
        
        // Trigger celebration animation
        triggerCelebration();
        setProgressAnimation(true);
        setTimeout(() => setProgressAnimation(false), 1000);

        // Show progress message
        const progressPercentage = Math.round((updatedProgress.completedSections.length / contents.length) * 100);
        showSnackbar(`Progress saved! ${progressPercentage}% complete 🎯`);

        // Check if course is completed
        if (updatedProgress.completedSections.length === contents.length) {
          setTimeout(() => setShowCompletionModal(true), 1500);
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      showSnackbar('Failed to save progress. Please try again.');
    }
  };

  // Mark content as completed manually
  const markAsCompleted = async (contentId) => {
    await saveProgress(contentId);
  };

  const handleContentSelect = (content, contentIndex) => {
    // Show transitioning state for better UX
    setIsTransitioning(true);
    
    setCurrentContent(content);
    setCurrentContentIndex(contentIndex);
    
    // Calculate reading time for new content
    const contentText = content.html + (content.explanationBlocks || []).map(block => block.content).join(' ');
    setReadingTime(calculateReadingTime(contentText));
    
    // Find module index
    const moduleIndex = modules.findIndex(m => m.id === content.moduleId);
    if (moduleIndex !== -1) {
      setCurrentModuleIndex(moduleIndex);
    }
    
    setSidebarOpen(false);
    
    // Use enhanced scroll function for better user experience
    scrollToTopSmooth(100);
    
    // Remove transition state after content loads
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
    
    // Save last visited and mark as viewed with delay for better UX
    saveLastVisited(content.id);
    setTimeout(() => {
      saveProgress(content.id);
    }, 1500);
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      const newIndex = currentContentIndex - 1;
      const newContent = contents[newIndex];
      handleContentSelect(newContent, newIndex);
    }
  };

  const handleNext = () => {
    if (currentContentIndex < contents.length - 1) {
      const newIndex = currentContentIndex + 1;
      const newContent = contents[newIndex];
      
      // Check if moving to next module
      const currentModuleId = currentContent.moduleId;
      const nextModuleId = newContent.moduleId;
      
      if (currentModuleId !== nextModuleId) {
        // Moving to next module - show celebration if current module is complete
        if (isCurrentModuleCompleted()) {
          const currentModule = modules.find(m => m.id === currentModuleId);
          setCompletedModule(currentModule);
          setShowModuleCompleteDialog(true);
          setNavigationAction(() => () => {
            handleContentSelect(newContent, newIndex);
            // Extra scroll emphasis for new module
            setTimeout(() => {
              showSnackbar(`🎯 Started new module: "${newContent.moduleTitle}"`);
              // Additional smooth scroll after content loads
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }, 500);
          });
        } else {
          // Show navigation confirmation
          setNavigationAction(() => () => {
            handleContentSelect(newContent, newIndex);
            // Extra scroll emphasis for new module
            setTimeout(() => {
              showSnackbar(`📚 Moved to: "${newContent.moduleTitle}"`);
              // Additional smooth scroll after content loads
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }, 500);
          });
          setShowNavigationDialog(true);
        }
      } else {
        // Same module, navigate normally with standard scroll
        handleContentSelect(newContent, newIndex);
      }
    }
  };

  // Enhanced next module navigation
  const goToNextModule = () => {
    const nextModuleContent = getNextModuleContent();
    if (nextModuleContent) {
      const nextIndex = contents.findIndex(c => c.id === nextModuleContent.id);
      if (nextIndex !== -1) {
        handleContentSelect(nextModuleContent, nextIndex);
        
        // Enhanced feedback and scrolling for module transition
        setTimeout(() => {
          showSnackbar(`🎉 Started "${nextModuleContent.moduleTitle}" module!`);
          
          // Ensure we're at the very top for new module start
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          
          // Also scroll content area
          if (contentRef.current) {
            contentRef.current.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    }
  };

  // Continue from where user left off
  const continueFromLastVisited = () => {
    const lastContent = findLastVisitedContent();
    if (lastContent) {
      const contentIndex = contents.findIndex(c => c.id === lastContent.id);
      if (contentIndex !== -1) {
        handleContentSelect(lastContent, contentIndex);
        
        // Enhanced scroll and feedback for resume
        setTimeout(() => {
          showSnackbar('📖 Resumed from where you left off!');
          
          // Ensure smooth scroll to top for resumed content
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
    setShowContinueDialog(false);
  };

  // Start over from beginning
  const startFromBeginning = () => {
    if (contents.length > 0) {
      handleContentSelect(contents[0], 0);
      
      // Enhanced scroll and feedback for restart
      setTimeout(() => {
        showSnackbar('🔄 Starting from the beginning!');
        
        // Ensure we start at the very top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 300);
    }
    setShowContinueDialog(false);
  };

  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setShowProgressSnackbar(true);
  };

  // Enhanced scroll to top utility function
  const scrollToTopSmooth = (delay = 0) => {
    setTimeout(() => {
      // Multiple scroll targets for comprehensive coverage
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      const contentContainer = document.querySelector('.course-content-container');
      if (contentContainer) {
        contentContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      const mainContent = document.querySelector('.course-main-content');
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, delay);
  };

  const toggleModuleExpanded = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const isContentCompleted = (contentId) => {
    return userProgress.completedSections?.includes(contentId) || false;
  };

  const getModuleProgress = (moduleId) => {
    const moduleContents = contents.filter(c => c.moduleId === moduleId);
    const completedCount = moduleContents.filter(c => isContentCompleted(c.id)).length;
    return moduleContents.length > 0 ? (completedCount / moduleContents.length) * 100 : 0;
  };

  const renderContent = () => {
    if (!currentContent) return null;

    console.log('Rendering content:', currentContent);
    console.log('Content blocks:', currentContent.contentBlocks);
    console.log('Explanation blocks:', currentContent.explanationBlocks);

    const currentProgress = ((userProgress.completedSections?.length || 0) / contents.length) * 100;
    const isCurrentCompleted = isContentCompleted(currentContent.id);

    return (
      <div className="w3-schools-layout">
        {/* W3Schools-style Content Header */}
        <motion.div 
          className="w3-content-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Simple breadcrumb like W3Schools */}
          <Box className="w3-breadcrumb" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
              <span 
                onClick={() => navigate('/courses')}
                style={{ cursor: 'pointer', color: '#4CAF50', textDecoration: 'underline' }}
              >
                {course.title}
              </span>
              {' > '}
              <span style={{ color: '#666' }}>{currentContent.moduleTitle}</span>
              {' > '}
              <span style={{ color: '#333', fontWeight: 500 }}>{currentContent.title}</span>
            </Typography>
          </Box>

          {/* Clean title section */}
          <div className="w3-title-section">
            <Typography variant="h2" component="h1" sx={{
              fontWeight: 700,
              color: '#2d3748',
              marginBottom: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              lineHeight: 1.2
            }}>
              {currentContent.title}
              {isCurrentCompleted && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  style={{ marginLeft: 16 }}
                >
                  <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                </motion.span>
              )}
            </Typography>
            
            {/* Simple stats bar like W3Schools */}
            <Box className="w3-stats" sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              marginBottom: 3,
              paddingBottom: 2,
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Typography variant="body2" sx={{ 
                color: '#666', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <TimerIcon sx={{ fontSize: 16 }} />
                {readingTime || 5} min read
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#666', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <MenuBookIcon sx={{ fontSize: 16 }} />
                {currentContentIndex + 1} of {contents.length}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#4CAF50', 
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <TrendingUpIcon sx={{ fontSize: 16 }} />
                {Math.round(currentProgress)}% complete
              </Typography>

              {isCurrentCompleted && (
                <Typography variant="body2" sx={{ 
                  color: '#4CAF50', 
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  Completed
                </Typography>
              )}
            </Box>
          </div>
        </motion.div>

        {/* W3Schools-style Main Content - Full Width */}
        <motion.div 
          className="w3-main-content" 
          ref={contentRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Main learning content - Seamless flow like Khan Academy/Coursera */}
          <div className="w3-content-body">
            {/* Primary content */}
            <ContentRenderer content={currentContent.html} />
            
            {/* Dynamic Content Blocks - Integrated seamlessly */}
            {currentContent.contentBlocks && currentContent.contentBlocks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w3-content-blocks-integrated"
                sx={{ marginTop: 3 }}
              >
                {renderContentBlocks(currentContent.contentBlocks)}
              </motion.div>
            )}
          </div>
          
          {/* Legacy explanation blocks rendered with new ContentRenderer */}
          {currentContent.explanationBlocks && currentContent.explanationBlocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w3-explanation-blocks"
            >
              <Typography variant="h4" sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CodeIcon color="primary" />
                Code Examples & Explanations
              </Typography>
              
              {currentContent.explanationBlocks.map((block, index) => (
                <motion.div 
                  key={index} 
                  className="w3-explanation-block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                >
                  {block.type === 'code' ? (
                    <CodeBlock language={block.language || 'javascript'} code={block.content || ''} />
                  ) : block.type === 'quiz' ? (
                    <div className="quiz-indicator">
                      <div className="quiz-header">
                        <span className="quiz-icon">❓</span>
                        <strong>Quick Check:</strong>
                      </div>
                      <div className="quiz-content">
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                          {block.question}
                        </Typography>
                        {block.options && Array.isArray(block.options) && (
                          <Box sx={{ mb: 2 }}>
                            {block.options.map((option, optIndex) => (
                              <Box key={optIndex} sx={{ mb: 1 }}>
                                <Chip
                                  label={option}
                                  variant={option === block.correctAnswer ? "filled" : "outlined"}
                                  color={option === block.correctAnswer ? "success" : "default"}
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                        {block.explanation && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>Explanation:</strong> {block.explanation}
                            </Typography>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ) : (
                    <NoteBox type="note">
                      <ReactMarkdown>{block.content}</ReactMarkdown>
                    </NoteBox>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* W3Schools-style completion and navigation */}
          <motion.div
            className="w3-completion-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {/* Completion section */}
            <div className="w3-completion-card">
              {!isCurrentCompleted ? (
                <div className="w3-completion-prompt">
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Ready to continue?
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => markAsCompleted(currentContent.id)}
                    startIcon={<CheckCircleIcon />}
                    className="w3-complete-btn"
                  >
                    Mark as Complete
                  </Button>
                </div>
              ) : (
                <div className="w3-completed-state">
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#4CAF50' }}>
                    ✅ Completed!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Great job! You've completed this lesson.
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Enhanced Navigation buttons */}
            <div className="w3-navigation">
              <Button
                startIcon={<NavigateBeforeIcon />}
                onClick={(e) => {
                  addRippleEffect(e);
                  handlePrevious();
                }}
                disabled={currentContentIndex === 0}
                variant="outlined"
                size="large"
                className="w3-nav-btn w3-prev-btn"
              >
                « Previous
              </Button>

              {/* Smart Next Button */}
              {currentContentIndex < contents.length - 1 ? (
                (() => {
                  const nextContent = contents[currentContentIndex + 1];
                  const isNextModule = nextContent && nextContent.moduleId !== currentContent.moduleId;
                  const nextModule = isNextModule ? modules.find(m => m.id === nextContent.moduleId) : null;
                  
                  return (
                    <Button
                      endIcon={isNextModule ? <SkipNextIcon /> : <NavigateNextIcon />}
                      onClick={(e) => {
                        addRippleEffect(e);
                        handleNext();
                      }}
                      variant="contained"
                      size="large"
                      className={`w3-nav-btn w3-next-btn ${isNextModule ? 'next-module' : ''}`}
                    >
                      {isNextModule ? (
                        <>
                          <Box display="flex" flexDirection="column" alignItems="flex-end">
                            <Typography variant="button" fontSize="0.875rem">
                              Next Module
                            </Typography>
                            <Typography variant="caption" fontSize="0.75rem" sx={{ opacity: 0.8 }}>
                              {nextModule?.title}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        'Next Tutorial »'
                      )}
                    </Button>
                  );
                })()
              ) : (
                <Button
                  endIcon={<CelebrationIcon />}
                  onClick={(e) => {
                    addRippleEffect(e);
                    setShowCompletionModal(true);
                  }}
                  variant="contained"
                  size="large"
                  color="success"
                  className="w3-nav-btn w3-complete-course-btn"
                >
                  Course Complete! 🎉
                </Button>
              )}
            </div>

            {/* Progress indicator */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Progress: {currentContentIndex + 1} of {contents.length} lessons
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((currentContentIndex + 1) / contents.length) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #10b981, #34d399)'
                  }
                }}
              />
            </Box>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  const renderSidebar = () => {
    const overallProgress = ((userProgress.completedSections?.length || 0) / contents.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="sidebar-modules"
      >
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sidebar-progress-overview"
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUpIcon color="primary" />
            <Typography variant="body2" fontWeight="600">
              Overall Progress: {userProgress.completedSections?.length || 0} / {contents.length}
            </Typography>
          </Box>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <LinearProgress 
              variant="determinate" 
              value={overallProgress}
              className={progressAnimation ? 'progress-glow' : ''}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #10b981, #34d399)'
                }
              }}
            />
          </motion.div>
          
          <Typography variant="caption" color="textSecondary" mt={1}>
            {Math.round(overallProgress)}% Complete
          </Typography>
        </motion.div>

        {/* Modules List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="modules-container"
        >
          {modules.map((module, moduleIndex) => {
            const moduleContents = contents.filter(c => c.moduleId === module.id);
            const isExpanded = expandedModules[moduleIndex];
            const moduleProgress = getModuleProgress(module.id);
            
            return (
              <motion.div 
                key={module.id}
                variants={moduleItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={moduleIndex}
                className="sidebar-module-item"
              >
                {/* Module Header */}
                <div
                  className={`sidebar-module-header ${currentModuleIndex === moduleIndex ? 'active' : ''}`}
                  onClick={() => toggleModuleExpanded(moduleIndex)}
                  onMouseEnter={() => setHoveredModule(moduleIndex)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <motion.div
                      animate={hoveredModule === moduleIndex ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <BookIcon sx={{ color: '#1e40af' }} />
                    </motion.div>
                    
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight="600">
                          {module.title}
                        </Typography>
                        {moduleProgress === 100 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <CheckCircleIcon color="success" fontSize="small" />
                          </motion.div>
                        )}
                      </Box>
                      
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          {Math.round(moduleProgress)}% complete
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={moduleProgress}
                          sx={{ 
                            mt: 0.5,
                            height: 4, 
                            borderRadius: 2,
                            backgroundColor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              background: moduleProgress === 100 
                                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                : 'linear-gradient(90deg, #3b82f6, #1e40af)'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExpandMoreIcon sx={{ color: '#6b7280' }} />
                    </motion.div>
                  </Box>
                </div>

                {/* Module Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="sidebar-module-content"
                    >
                      {moduleContents.map((content, contentIndex) => {
                        const isCurrentContent = currentContent && currentContent.id === content.id;
                        const isCompleted = isContentCompleted(content.id);
                        const isLocked = !hasSubscription && contentIndex > 2;
                        
                        return (
                          <motion.div
                            key={content.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: contentIndex * 0.1 }}
                            className={`sidebar-content-item ${isCurrentContent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => !isLocked && handleContentSelect(content, contents.findIndex(c => c.id === content.id))}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box>
                                {isCompleted ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                  >
                                    <CheckCircleIcon color="success" fontSize="small" />
                                  </motion.div>
                                ) : isLocked ? (
                                  <motion.div
                                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                                    transition={{ 
                                      duration: 0.5,
                                      repeat: Infinity,
                                      repeatDelay: 3
                                    }}
                                  >
                                    <LockIcon color="disabled" fontSize="small" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <PlayArrowIcon 
                                      color={isCurrentContent ? "primary" : "action"} 
                                      fontSize="small" 
                                    />
                                  </motion.div>
                                )}
                              </Box>
                              
                              <Box flex={1}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={isCurrentContent ? 600 : 400}
                                  color={isLocked ? 'text.disabled' : 'text.primary'}
                                >
                                  {content.title}
                                </Typography>
                                
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  {isCurrentContent && (
                                    <Chip 
                                      label="Current" 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                  {isLocked && (
                                    <Chip 
                                      label="Premium" 
                                      size="small" 
                                      color="warning" 
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <CircularProgress />
        <Typography>Loading course...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail-error">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-content"
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 600 }}>
              Oops! Something went wrong
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              {error}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              onClick={() => {
                setError('');
                setLoading(true);
                // Trigger a re-fetch by changing a dependency
                window.location.reload();
              }} 
              variant="contained"
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/courses')} 
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2 }}
            >
              Back to Courses
            </Button>
          </Box>
          
          {error.includes('Authentication') && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Having authentication issues? Try logging out and back in.
              </Typography>
              <Button 
                onClick={async () => {
                  const auth = getAuth();
                  await auth.signOut();
                  navigate('/login');
                }}
                variant="text"
                sx={{ mt: 1 }}
              >
                Log Out
              </Button>
            </Box>
          )}
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <Typography>Course not found</Typography>
        <Button onClick={() => navigate('/courses')} variant="contained">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <SEO
        title={`${course.title} - CodeTapasya Course`}
        description={course.description}
        url={`https://codetapasya.com/courses/${courseId}`}
      />

      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <div className="celebration-overlay">
            {confettiElements.map((confetti) => (
              <motion.div
                key={confetti.id}
                className="confetti-piece"
                initial={{ 
                  opacity: 1, 
                  y: 0, 
                  x: `${confetti.left}vw`,
                  rotate: 0 
                }}
                animate={{ 
                  opacity: 0, 
                  y: "-100vh", 
                  rotate: 720 
                }}
                transition={{ 
                  duration: confetti.duration,
                  delay: confetti.delay,
                  ease: "easeOut"
                }}
                style={{
                  position: 'fixed',
                  top: '100vh',
                  width: '10px',
                  height: '10px',
                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][confetti.id % 5],
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Course Header with Breadcrumbs */}
      <div className="course-header-section">
        <div className="course-breadcrumbs-container">
          <Breadcrumbs className="course-breadcrumbs">
            <Link 
              component="button" 
              onClick={() => navigate('/courses')}
              className="breadcrumb-link"
            >
              <HomeIcon fontSize="small" />
              Courses
            </Link>
            <Typography color="textPrimary">{course.title}</Typography>
          </Breadcrumbs>
          
          <div className="course-header-actions">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={() => setSidebarOpen(true)}
                className="sidebar-toggle-btn"
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Modules
              </Button>
            </motion.div>
            
            <Chip
              icon={<TrendingUpIcon />}
              label={`${Math.round(((userProgress.completedSections?.length || 0) / contents.length) * 100)}% Complete`}
              className="progress-chip"
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="course-sidebar-drawer"
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <div className="sidebar-content-wrapper">
          <div className="sidebar-header">
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
              Course Modules
            </Typography>
            <IconButton 
              onClick={() => setSidebarOpen(false)}
              sx={{ 
                color: '#6b7280',
                '&:hover': { color: '#374151' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
          {renderSidebar()}
        </div>
      </Drawer>

      {/* Full-width Main Content */}
      <div className="course-content-container">
        <main className="course-main-content">
          {renderContent()}
        </main>
      </div>

      {!hasSubscription && (
        <SubscriptionPrompt />
      )}

      {/* Continue/Start Over Dialog */}
      <Dialog
        open={showContinueDialog}
        onClose={() => setShowContinueDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontSize: '1.25rem',
          fontWeight: 700
        }}>
          <SchoolIcon color="primary" />
          Welcome Back!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '1rem', lineHeight: 1.6 }}>
            We noticed you've made progress in this course. Would you like to continue from where you left off or start over?
          </DialogContentText>
          {lastVisitedContent && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              mb: 2
            }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Last visited:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastVisitedContent.moduleTitle} → {lastVisitedContent.title}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 3, gap: 2 }}>
          <Button
            onClick={startFromBeginning}
            variant="outlined"
            startIcon={<RestartAltIcon />}
            sx={{ borderRadius: 2 }}
          >
            Start Over
          </Button>
          <Button
            onClick={continueFromLastVisited}
            variant="contained"
            startIcon={<PlayCircleIcon />}
            sx={{ borderRadius: 2 }}
          >
            Continue Learning
          </Button>
        </DialogActions>
      </Dialog>

      {/* Module Completion Dialog */}
      <Dialog
        open={showModuleCompleteDialog}
        onClose={() => setShowModuleCompleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#10b981'
        }}>
          <CelebrationIcon />
          Module Complete! 🎉
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '1rem', lineHeight: 1.6 }}>
            Congratulations! You've completed the "{completedModule?.title}" module. 
            Ready to move on to the next module?
          </DialogContentText>
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f0fdf4', 
            borderRadius: 2, 
            border: '1px solid #10b981',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
              Module Progress: 100%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're making excellent progress! Keep it up! 🚀
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setShowModuleCompleteDialog(false);
              setSidebarOpen(true);
            }}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            View All Modules
          </Button>
          <Button
            onClick={() => {
              setShowModuleCompleteDialog(false);
              if (navigationAction) {
                navigationAction();
                setNavigationAction(null);
                // Ensure scroll to top for new module
                scrollToTopSmooth(500);
              }
            }}
            variant="contained"
            startIcon={<SkipNextIcon />}
            sx={{ borderRadius: 2 }}
          >
            Next Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation Confirmation Dialog */}
      <Dialog
        open={showNavigationDialog}
        onClose={() => setShowNavigationDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontSize: '1.25rem',
          fontWeight: 700
        }}>
          <InfoIcon color="info" />
          Moving to Next Module
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '1rem', lineHeight: 1.6 }}>
            You're about to move to the next module. The current module isn't fully completed yet. 
            You can always come back to finish it later.
          </DialogContentText>
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#fff3cd', 
            borderRadius: 2, 
            border: '1px solid #ffc107'
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" color="warning" />
              Current module progress: {Math.round(getCurrentModuleProgress())}%
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, gap: 2 }}>
          <Button
            onClick={() => setShowNavigationDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Stay Here
          </Button>
          <Button
            onClick={() => {
              setShowNavigationDialog(false);
              if (navigationAction) {
                navigationAction();
                setNavigationAction(null);
                // Ensure scroll to top when moving to new module
                scrollToTopSmooth(500);
              }
            }}
            variant="contained"
            startIcon={<NavigateNextIcon />}
            sx={{ borderRadius: 2 }}
          >
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Snackbar */}
      <Snackbar
        open={showProgressSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowProgressSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowProgressSnackbar(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <CourseCompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseTitle={course.title}
        onContinue={() => {
          setShowCompletionModal(false);
          navigate('/courses');
        }}
      />
    </div>
  );
}

export default CourseDetail;