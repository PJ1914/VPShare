import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import TiptapEditor from '../components/editor/TiptapEditor';
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Clock, Lock, CheckCircle, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                // setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await courseService.getCourseById(courseId);
                setCourse(data);

                // If no lessonId provided, redirect to first lesson
                if (!lessonId) {
                    if (data?.syllabus?.length > 0) {
                        navigate(`/courses/${courseId}/learn/${data.syllabus[0].id}`, { replace: true });
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Failed to load course", err);
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, lessonId, navigate]);

    useEffect(() => {
        const fetchLessonContent = async () => {
            if (!lessonId) return;
            setLoading(true);
            try {
                const data = await courseService.getLessonById(lessonId);
                setLesson(data);
            } catch (err) {
                console.error("Failed to load lesson", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessonContent();
    }, [lessonId]);

    const handleNextLesson = () => {
        if (!course || !lessonId) return;
        const currentIndex = course.syllabus.findIndex(item => item.id === lessonId);
        if (currentIndex < course.syllabus.length - 1) {
            const nextLessonId = course.syllabus[currentIndex + 1].id;
            navigate(`/courses/${courseId}/learn/${nextLessonId}`);
        }
    };

    const handlePrevLesson = () => {
        if (!course || !lessonId) return;
        const currentIndex = course.syllabus.findIndex(item => item.id === lessonId);
        if (currentIndex > 0) {
            const prevLessonId = course.syllabus[currentIndex - 1].id;
            navigate(`/courses/${courseId}/learn/${prevLessonId}`);
        }
    };

    if (!course) return <div className="p-8 text-center text-gray-500">Loading course...</div>;

    const currentIndex = course.syllabus?.findIndex(l => l.id === lessonId) || 0;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === (course.syllabus?.length || 0) - 1;

    // Determine Lock Status
    const currentSyllabusItem = course.syllabus?.find(item => item.id === lessonId);
    // Locked if: User NOT premium AND (Course is Premium OR Lesson is NOT free)
    const isLocked = (!user?.isPremium) && (course.isPremium || (currentSyllabusItem && !currentSyllabusItem.isFree));

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-950 overflow-hidden">

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <div
                    className={`absolute inset-y-0 left-0 z-30 w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <Link to="/courses" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                <ChevronLeft className="w-4 h-4" />
                                Back to courses
                            </Link>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">{course.title}</h2>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.syllabus?.length || 0} Lessons</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration || '2h 15m'}</span>
                                {course.isPremium && <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> Premium</span>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {course.syllabus?.map((item, index) => {
                                const isItemLocked = (!user?.isPremium) && (course.isPremium || !item.isFree);

                                return (
                                    <Link
                                        key={item.id}
                                        to={`/courses/${courseId}/learn/${item.id}`}
                                        className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-colors ${item.id === lessonId
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs border ${item.id === lessonId ? 'border-blue-500 text-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-500'
                                            }`}>
                                            {isItemLocked ? <Lock className="w-3 h-3 text-gray-400" /> : (index + 1)}
                                        </span>
                                        <div className="flex-1">
                                            <p className="line-clamp-2">{item.title}</p>
                                            {isItemLocked && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-500">
                                                    <Lock className="w-3 h-3" /> Premium
                                                </div>
                                            )}
                                        </div>
                                        {item.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'
                        }`}
                >
                    {/* Mobile Menu Toggle (Only when sidebar is closed) */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="absolute top-4 left-4 z-20 p-2 rounded-md bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 shadow-sm"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 p-6 lg:p-12">
                        <div className="max-w-4xl mx-auto">
                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                                </div>
                            ) : !lesson ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No lesson selected</p>
                                </div>
                            ) : isLocked ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="bg-amber-100 dark:bg-amber-900/20 p-6 rounded-full mb-6">
                                        <Lock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        Premium Content
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
                                        This lesson is part of our premium curriculum. Upgrade your plan to unlock full access to all courses and features.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => navigate('/payment/monthly')}
                                            className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25"
                                            size="lg"
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Unlock Full Access
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate('/courses')}
                                        >
                                            Browse Free Courses
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{lesson?.title}</h1>

                                    {lesson?.videoUrl && (
                                        <div className="mb-8 aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                                            <iframe
                                                src={lesson.videoUrl}
                                                className="w-full h-full"
                                                title={lesson.title}
                                                allowFullScreen
                                            />
                                        </div>
                                    )}

                                    <div className="prose dark:prose-invert max-w-none">
                                        <TiptapEditor
                                            key={lesson?.id}
                                            content={lesson?.content || lesson?.draft_content}
                                            editable={false}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrevLesson}
                                disabled={isFirst}
                                className={`flex items-center gap-2 ${isFirst ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>

                            <div className="text-sm text-gray-500 hidden sm:block">
                                {currentIndex + 1} of {course.syllabus?.length}
                            </div>

                            <Button
                                onClick={handleNextLesson}
                                disabled={isLast}
                                className={`flex items-center gap-2 ${isLast ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
