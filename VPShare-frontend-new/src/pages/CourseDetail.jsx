import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    ChevronLeft, ChevronRight, Menu, X, CheckCircle,
    PlayCircle, BookOpen, Code, FileText, Video,
    AlertCircle, Info, Lightbulb, Star, Share2,
    Download, MoreVertical, Check, Clock, Lock,
    Layout, Home, Search, HelpCircle, Bug, RefreshCw, Loader2, Globe,
    Monitor, Sparkles, TrendingUp, Copy, Check as CheckIcon, Flame, AlertTriangle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { courseService } from '../services/courseService';

// Configure axios-retry
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

// Helper to strip DynamoDB prefixes
const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

const CourseDetail = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // Core State
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentModule, setCurrentModule] = useState(null);
    const [currentContent, setCurrentContent] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [userProgress, setUserProgress] = useState({});
    const [expandedModules, setExpandedModules] = useState({});

    // Interactive State
    const [showCelebration, setShowCelebration] = useState(false);
    const [readingTime, setReadingTime] = useState(0);
    const [copiedCode, setCopiedCode] = useState(null);
    const [confettiElements, setConfettiElements] = useState([]);
    const contentRef = useRef(null);

    // Debug State
    const [debugInfo, setDebugInfo] = useState({ logs: [], apiUrl: '' });
    const [showDebug, setShowDebug] = useState(false);

    const addLog = (msg, data = null) => {
        console.log(`[CourseDetail] ${msg}`, data);
        setDebugInfo(prev => ({
            ...prev,
            logs: [...prev.logs, { time: new Date().toISOString(), msg, data: data ? JSON.stringify(data, null, 2) : null }]
        }));
    };

    // Toggle module expansion
    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const getAuthHeaders = async () => {
        try {
            if (!user) throw new Error('Not authenticated');
            const token = await user.getIdToken(true);
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    };

    const makeAuthenticatedRequest = async (url, options = {}, retries = 2) => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(url, { headers, ...options });
            return response;
        } catch (error) {
            console.error(`API request failed for ${url}:`, error);
            if (error.response?.status === 403) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return makeAuthenticatedRequest(url, options, retries - 1);
                } else {
                    throw new Error('Authentication failed. Please log in again.');
                }
            }
            throw error;
        }
    };

    // Calculate reading time
    const calculateReadingTime = (text) => {
        if (!text) return 1;
        const wordsPerMinute = 200;
        const wordCount = text.split(' ').length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    // Copy to clipboard
    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Fetch course data
    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId || authLoading || !user) return;

            try {
                setLoading(true);
                addLog("Starting fetchCourseData from Firebase", { courseId });

                // 1. Fetch Course Details from Firebase
                const courseData = await courseService.getCourseById(courseId);

                if (!courseData) {
                    throw new Error("Course not found");
                }

                addLog("Course data fetched", courseData);

                setCourse({
                    id: courseId,
                    title: courseData.title || "Untitled Course",
                    description: courseData.description || "",
                    thumbnail: courseData.thumbnailUrl || courseData.thumbnail,
                    isPremium: courseData.isPremium ?? false,
                    syllabus: courseData.syllabus || []
                });

                // 2. Convert syllabus to modules format
                // In Firebase, courses have a "syllabus" array with lessons
                const syllabusItems = courseData.syllabus || [];
                
                if (syllabusItems.length > 0) {
                    // Fetch lesson details for each syllabus item
                    const lessonsPromises = syllabusItems.map(async (item) => {
                        try {
                            const lessonDoc = await getDoc(doc(db, 'lessons', item.id));
                            if (lessonDoc.exists()) {
                                return { id: lessonDoc.id, ...lessonDoc.data(), ...item };
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch lesson ${item.id}:`, err);
                        }
                        return { id: item.id, title: item.title, type: item.type || 'text' };
                    });

                    const lessons = await Promise.all(lessonsPromises);
                    addLog("Lessons fetched", lessons);

                    // Group lessons into a single module (since Firebase courses don't have modules)
                    const mainModule = {
                        id: 'main-module',
                        title: courseData.title || 'Course Content',
                        contents: lessons.map((lesson, index) => ({
                            id: lesson.id,
                            title: lesson.title,
                            type: lesson.type || 'text',
                            order: index + 1,
                            isFree: lesson.isFree ?? false,
                            draft_content: lesson.draft_content,
                            published_content: lesson.published_content
                        }))
                    };

                    setModules([mainModule]);
                    setExpandedModules({ 'main-module': true });
                    setCurrentModule(mainModule);
                }

                // 3. Fetch User Progress
                if (user) {
                    const progressRef = doc(db, 'userProgress', `${user.uid}_${courseId}`);
                    const progressSnap = await getDoc(progressRef);
                    if (progressSnap.exists()) {
                        setUserProgress(progressSnap.data());
                    }
                }

            } catch (error) {
                console.error("Error fetching course:", error);
                addLog("CRITICAL ERROR in fetchCourseData", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, user, authLoading]);

    // Fetch contents when currentModule changes
    useEffect(() => {
        const fetchContents = async () => {
            if (!currentModule) return;

            // Contents are already loaded from Firebase in the main fetch
            // This is kept for compatibility but doesn't need to do anything
            if (currentModule.contents && currentModule.contents.length > 0) {
                // Auto-select first content if none selected
                if (!currentContent && currentModule.contents.length > 0) {
                    setCurrentContent(currentModule.contents[0]);
                }
                return;
            }

            // If somehow contents are missing, log it
            addLog("No contents in current module", currentModule);
        };

        fetchContents();
    }, [currentModule]);

    // Check lock status
    const isContentLocked = (content) => {
        if (!content || !course) return false;
        // If user is premium, everything is unlocked
        if (user?.isPremium) return false;
        // If course is premium, or content is explicitly NOT free
        return course.isPremium || !content.isFree;
    };

    const handleContentSelect = (module, content) => {
        // Navigate to the lesson view page instead of displaying inline
        // This allows proper rendering of TipTap content
        navigate(`/courses/${courseId}/learn/${content.id}`);
    };

    const navigateModule = (direction) => {
        if (!currentModule || modules.length === 0) return;

        const currentModuleIndex = modules.findIndex(m =>
            (m.id && currentModule.id && m.id === currentModule.id) ||
            (m.SK && currentModule.SK && m.SK === currentModule.SK)
        );

        if (currentModuleIndex === -1) return;

        if (direction === 'next' && currentModuleIndex < modules.length - 1) {
            const nextModule = modules[currentModuleIndex + 1];
            setCurrentModule(nextModule);
            setExpandedModules(prev => ({ ...prev, [nextModule.id || nextModule.SK]: true }));

            // Auto-select first content of the next module
            if (nextModule.contents && nextModule.contents.length > 0) {
                handleContentSelect(nextModule, nextModule.contents[0]);
            }
        } else if (direction === 'prev' && currentModuleIndex > 0) {
            const prevModule = modules[currentModuleIndex - 1];
            setCurrentModule(prevModule);
            setExpandedModules(prev => ({ ...prev, [prevModule.id || prevModule.SK]: true }));

            // Auto-select first content of the previous module
            if (prevModule.contents && prevModule.contents.length > 0) {
                handleContentSelect(prevModule, prevModule.contents[0]);
            }
        }
    };

    const markAsComplete = async () => {
        if (!currentContent || !user) return;
        const newCompleted = [...(userProgress.completedSections || []), currentContent.id];
        const uniqueCompleted = [...new Set(newCompleted)];

        const updatedProgress = {
            ...userProgress,
            completedSections: uniqueCompleted,
            lastVisited: new Date().toISOString(),
            lastVisitedContentId: currentContent.id
        };
        setUserProgress(updatedProgress);

        // Celebration effect
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);

        try {
            await setDoc(doc(db, 'userProgress', `${user.uid}_${courseId}`), updatedProgress, { merge: true });
        } catch (err) { console.error(err); }
    };

    const isCompleted = (id) => userProgress.completedSections?.includes(id);

    // Parse content into structured blocks if contentBlocks is missing
    const parseContentIntoBlocks = (htmlContent) => {
        if (!htmlContent) return [];

        const blocks = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const elements = Array.from(tempDiv.children);

        if (elements.length === 0) {
            // Handle plain text splitting by double newline
            const paragraphs = htmlContent.split('\n\n').filter(p => p.trim());
            paragraphs.forEach(p => {
                blocks.push({ type: 'text', content: p.trim() });
            });
        } else {
            elements.forEach(element => {
                const tagName = element.tagName.toLowerCase();

                if (tagName.match(/^h[1-6]$/)) {
                    const level = parseInt(tagName.charAt(1));
                    const prefix = '#'.repeat(level);
                    blocks.push({
                        type: 'text',
                        content: `${prefix} ${element.textContent}`
                    });
                } else if (tagName === 'pre' || tagName === 'code') {
                    blocks.push({
                        type: 'code',
                        language: 'javascript', // Default, could be improved with detection
                        content: element.textContent || ''
                    });
                } else if (tagName === 'img') {
                    blocks.push({
                        type: 'image',
                        url: element.getAttribute('src'),
                        alt: element.getAttribute('alt'),
                        caption: element.getAttribute('title')
                    });
                } else if (tagName === 'ul' || tagName === 'ol') {
                    // Convert HTML lists to Markdown lists
                    let listContent = '';
                    Array.from(element.children).forEach(li => {
                        const prefix = tagName === 'ul' ? '- ' : '1. ';
                        listContent += `${prefix}${li.textContent}\n`;
                    });
                    blocks.push({
                        type: 'text',
                        content: listContent
                    });
                } else if (tagName === 'blockquote') {
                    blocks.push({
                        type: 'note',
                        noteType: 'info',
                        content: element.textContent
                    });
                } else {
                    // Default to text/markdown, preserving inner HTML for formatting
                    // Clean up some common HTML noise if needed
                    let content = element.innerHTML;
                    // Simple conversion of bold/italic to markdown if possible, or just keep HTML
                    // For now, we'll wrap it in a text block which uses ReactMarkdown
                    // ReactMarkdown handles HTML if configured, but we want to be safe
                    blocks.push({
                        type: 'text',
                        content: element.textContent // Fallback to text content to avoid broken HTML
                    });
                }
            });
        }

        // Filter out empty blocks
        return blocks.filter(b => b.content || b.url);
    };

    const progressPercentage = useMemo(() => {
        const totalContents = modules.reduce((acc, m) => acc + (m.contents?.length || 0), 0);
        if (totalContents === 0) return 0;

        // Only count completed sections that actually exist in the current modules
        // This prevents > 100% progress if content was removed but progress remains
        const allContentIds = new Set(modules.flatMap(m => m.contents?.map(c => c.id) || []));
        const validCompletedCount = (userProgress.completedSections || [])
            .filter(id => allContentIds.has(id))
            .length;

        return Math.round((validCompletedCount / totalContents) * 100);
    }, [modules, userProgress]);

    // --- Content Rendering Logic ---

    const renderContentBlock = (block, index) => {
        switch (block.type) {
            case 'text':
                return (
                    <div key={index} className="mb-6">
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-8" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-6" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-5" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-4" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                                a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />,
                                code: ({ node, inline, className, children, ...props }) => {
                                    return inline ? (
                                        <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {block.content}
                        </ReactMarkdown>
                    </div>
                );

            case 'code':
                return (
                    <div key={index} className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-mono text-gray-500 uppercase">{block.language || 'code'}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(block.content, `block-${index}`)}
                                className="h-8 text-xs"
                            >
                                {copiedCode === `block-${index}` ? <CheckIcon className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                {copiedCode === `block-${index}` ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <div className="bg-gray-950 p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-gray-300">
                                <code>{block.content}</code>
                            </pre>
                        </div>
                    </div>
                );

            case 'html':
                return (
                    <div key={index} className="my-8">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            <Monitor className="w-4 h-4" />
                            Live Preview
                        </div>
                        {block.preview !== false && (
                            <div
                                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-900/50"
                                dangerouslySetInnerHTML={{ __html: block.content }}
                            />
                        )}
                        <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto border border-gray-800">
                            <pre className="text-sm font-mono text-gray-300">
                                <code>{block.content}</code>
                            </pre>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div key={index} className="my-8 text-center">
                        <img
                            src={block.url}
                            alt={block.alt || 'Content image'}
                            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        />
                        {block.caption && (
                            <p className="mt-2 text-sm text-gray-500 italic">{block.caption}</p>
                        )}
                    </div>
                );

            case 'video':
                return (
                    <div key={index} className="my-8">
                        {block.title && <h4 className="text-lg font-semibold mb-2 flex items-center gap-2"><Video className="w-4 h-4" />{block.title}</h4>}
                        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg relative">
                            <iframe
                                src={block.url}
                                title={block.title || 'Video'}
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen
                            />
                        </div>
                        {block.description && <p className="mt-2 text-sm text-gray-500">{block.description}</p>}
                    </div>
                );

            case 'note':
                const noteStyles = {
                    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: <Info className="w-5 h-5 text-blue-500" /> },
                    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
                    tip: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: <Lightbulb className="w-5 h-5 text-green-500" /> },
                    important: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: <Flame className="w-5 h-5 text-red-500" /> }
                };
                const style = noteStyles[block.noteType] || noteStyles.info;
                return (
                    <div key={index} className={`my-6 p-4 rounded-lg border ${style.bg} ${style.border} flex gap-3`}>
                        <div className="shrink-0 mt-0.5">{style.icon}</div>
                        <div className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed font-medium">
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                    </div>
                );

            case 'quiz':
                return (
                    <div key={index} className="my-8 p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                        <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" /> Quick Check
                        </h4>
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-4">{block.question}</p>
                        <div className="space-y-2">
                            {block.options?.map((option, i) => (
                                <div key={i} className={`p-3 rounded-lg border transition-colors ${option === block.correctAnswer
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}>
                                    <span className={`text-sm ${option === block.correctAnswer ? 'font-semibold text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {option}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {block.explanation && (
                            <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800/30 text-sm text-indigo-800 dark:text-indigo-300">
                                <strong>Explanation:</strong> {block.explanation}
                            </div>
                        )}
                    </div>
                );

            case 'divider':
                return <hr key={index} className="my-8 border-gray-200 dark:border-gray-800" />;

            default:
                return null;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return <div className="p-8 text-center text-gray-500">Please log in to view this course.</div>;
    if (!course) return <div className="p-8 text-center text-gray-500">Course not found.</div>;

    const currentLocked = isContentLocked(currentContent);

    return (
        <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden font-sans relative">
            {/* Celebration Confetti */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10" />
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center"
                    >
                        <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Completed!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Great job keeping up the momentum.</p>
                    </motion.div>
                </div>
            )}

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-40 w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl lg:relative lg:shadow-none"
                    >
                        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                    {course.title.charAt(0)}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">{course.title}</span>
                                    {course.isPremium && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Premium Course</span>}
                                </div>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-200 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                                <span>Course Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-500 h-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {modules.map((module, idx) => {
                                const isExpanded = expandedModules[module.id || module.SK];
                                const isActiveModule = currentModule?.id === module.id || currentModule?.SK === module.SK;

                                return (
                                    <div key={module.id || idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <button
                                            onClick={() => {
                                                toggleModule(module.id || module.SK);
                                                setCurrentModule(module);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left",
                                                isActiveModule && "bg-gray-50 dark:bg-gray-800/50"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Module {idx + 1}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{module.title}</span>
                                            </div>
                                            <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isExpanded && "rotate-90")} />
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white dark:bg-gray-900"
                                                >
                                                    <div className="py-1">
                                                        {module.contents?.map((content, cIdx) => {
                                                            const isActive = currentContent?.id === content.id;
                                                            const completed = isCompleted(content.id);
                                                            const locked = isContentLocked(content);

                                                            return (
                                                                <button
                                                                    key={content.id || cIdx}
                                                                    onClick={() => handleContentSelect(module, content)}
                                                                    className={cn(
                                                                        "w-full flex items-center pl-4 pr-4 py-3 text-sm transition-all border-l-4",
                                                                        isActive
                                                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
                                                                            : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                                    )}
                                                                >
                                                                    <div className={cn("mr-3", completed ? "text-green-500" : "text-gray-400")}>
                                                                        {/* Lock Icon Logic */}
                                                                        {locked ? (
                                                                            <Lock className="w-4 h-4 text-gray-400" />
                                                                        ) : (
                                                                            completed ? <CheckCircle className="w-4 h-4" /> : (
                                                                                isActive ? <div className="w-4 h-4 rounded-full border-2 border-current" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 text-left truncate flex items-center justify-between">
                                                                        <span>{content.title}</span>
                                                                        {locked && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">PRO</span>}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                        {(!module.contents || module.contents.length === 0) && (
                                                            <div className="px-8 py-3 text-xs text-gray-400 italic flex items-center justify-between">
                                                                <span>{contentLoading ? "Loading contents..." : contentError ? "Failed to load" : "No content available"}</span>
                                                                {contentLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
                <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-gray-900 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 mr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                            <Menu className="w-5 h-5" />
                        </button>
                        <nav className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <button onClick={() => navigate('/courses')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Courses</button>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="truncate max-w-[150px]">{course.title}</span>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{currentContent?.title}</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>Exit Course</Button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto" ref={contentRef}>
                    <div className="max-w-4xl mx-auto px-4 py-8 lg:px-12 lg:py-12">
                        {currentContent && currentLocked ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-amber-100 dark:bg-amber-900/20 p-6 rounded-full mb-6 relative">
                                    <Lock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-sm">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Unlock Detailed Lesson
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                                    Ensure you have the full picture. This premium lesson contains advanced concepts and examples.
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => navigate('/payment/monthly')}
                                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25 pl-6 pr-8"
                                        size="lg"
                                    >
                                        <Shield className="w-4 h-4 mr-2" />
                                        Unlock Full Access
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/courses')}
                                    >
                                        Browse Other Courses
                                    </Button>
                                </div>
                            </div>
                        ) : currentContent ? (
                            <motion.div
                                key={currentContent.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4 border-b border-gray-100 dark:border-gray-800 pb-8">
                                    <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{currentModule?.title}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                        {currentContent.title}
                                    </h1>
                                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>{readingTime} min read</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={cn("w-2 h-2 rounded-full mr-2", isCompleted(currentContent.id) ? "bg-green-500" : "bg-yellow-500")} />
                                            <span>{isCompleted(currentContent.id) ? "Completed" : "In Progress"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-h-[400px]">
                                    {(currentContent.contentBlocks && currentContent.contentBlocks.length > 0) ? (
                                        <div className="space-y-2">
                                            {currentContent.contentBlocks.map((block, index) => renderContentBlock(block, index))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Fallback to dynamic parsing if contentBlocks is missing */}
                                            {parseContentIntoBlocks(currentContent.html || currentContent.content).map((block, index) => renderContentBlock(block, index))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-12 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateModule('prev')}
                                        className="group"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                        Previous
                                    </Button>

                                    {!isCompleted(currentContent.id) && (
                                        <Button onClick={markAsComplete} className="bg-green-600 hover:bg-green-700 text-white border-transparent">
                                            Mark Complete
                                            <Check className="w-4 h-4 ml-2" />
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        onClick={() => navigateModule('next')}
                                        className="group"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center pt-4">
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            if (!isCompleted(currentContent.id)) {
                                                markAsComplete();
                                            }
                                            navigateModule('next');
                                        }}
                                        className="group"
                                    >
                                        {isCompleted(currentContent.id) ? 'Next' : 'Next Lesson'}
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                                    <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to {course?.title}</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                                    {modules.length > 0 && modules[0]?.contents?.length > 0
                                        ? "Ready to start your learning journey? Click below to begin with the first lesson."
                                        : "Select a lesson from the sidebar to start your learning journey."}
                                </p>
                                {modules.length > 0 && modules[0]?.contents?.length > 0 ? (
                                    <div className="flex gap-4">
                                        <Button 
                                            onClick={() => {
                                                const firstLesson = modules[0].contents[0];
                                                navigate(`/courses/${courseId}/learn/${firstLesson.id}`);
                                            }}
                                            size="lg"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <PlayCircle className="w-5 h-5 mr-2" />
                                            Start Learning
                                        </Button>
                                        <Button 
                                            onClick={() => setSidebarOpen(true)} 
                                            variant="outline"
                                            size="lg"
                                            className="lg:hidden"
                                        >
                                            View Lessons
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                        Open Course Menu
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseDetail;
