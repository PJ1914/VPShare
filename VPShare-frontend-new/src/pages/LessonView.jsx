import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import TiptapEditor from '../components/editor/TiptapEditor';
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Clock, Lock, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

    if (!course) return <div className="p-8 text-center">Loading course...</div>;

    const currentIndex = course.syllabus?.findIndex(l => l.id === lessonId) || 0;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === (course.syllabus?.length || 0) - 1;

    return (
        <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <div 
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0`}
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
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {course.syllabus?.map((item, index) => (
                            <Link
                                key={item.id}
                                to={`/courses/${courseId}/learn/${item.id}`}
                                className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-colors ${
                                    item.id === lessonId 
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs border ${
                                    item.id === lessonId ? 'border-blue-500 text-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-500'
                                }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="line-clamp-2">{item.title}</p>
                                    {!item.isFree && !course.isPremium && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                            <Lock className="w-3 h-3" /> Locked
                                        </div>
                                    )}
                                </div>
                                {item.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full lg:w-auto">
                {/* Navbar for Mobile */}
                <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 flex items-center bg-white dark:bg-gray-900">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-3 font-semibold truncate">{lesson?.title || 'Loading...'}</span>
                </div>

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
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{lesson?.title}</h1>
                                
                                {lesson?.videoUrl && (
                                    <div className="mb-8 aspect-video rounded-xl overflow-hidden bg-black">
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
    );
};

export default LessonView;
