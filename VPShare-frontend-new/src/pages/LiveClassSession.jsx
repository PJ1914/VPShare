import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Video, MessageCircle, FileText, Link as LinkIcon,
    ArrowLeft, Trophy, Loader2, Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ClassroomSidebar from '../components/live-classes/ClassroomSidebar';
import FeedbackModal from '../components/live-classes/FeedbackModal';
import { useLiveClass } from '../hooks/useLiveClass';
import confetti from 'canvas-confetti';

const LiveClassSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const liveClassHook = useLiveClass();
    const { markAttendance, submitFeedback } = liveClassHook;

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                setIsAdmin(tokenResult.claims.role === 'admin' || tokenResult.claims.admin === true);
            }
        };
        checkAdmin();
    }, [user]);

    // ... getEmbedUrl logic ...
    const getEmbedUrl = (url) => {
        if (!url) return '';
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`;
        }
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        return url;
    };

    useEffect(() => {
        loadClassData();
        const handleBeforeUnload = () => {
            if (!showFeedbackModal && classData) setShowFeedbackModal(true);
        };
        return () => { };
    }, [id]);

    const loadClassData = async () => {
        setLoading(true);
        try {
            const classes = await liveClassHook.fetchClasses();
            const currentClass = classes.find(c => c.id === id);
            setClassData(currentClass);
        } catch (err) {
            console.error('Failed to load class:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async () => {
        setMarkingAttendance(true);
        try {
            const result = await markAttendance(id);
            setAttendanceMarked(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#ec4899']
            });
        } catch (err) {
            if (err.response?.status === 400) setAttendanceMarked(true);
            console.error('Failed to mark attendance:', err);
        } finally {
            setMarkingAttendance(false);
        }
    };

    const handleFeedbackSubmit = async (rating, comment) => {
        try {
            await submitFeedback(id, rating, comment);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        }
    };

    const handleGoBack = () => {
        setShowFeedbackModal(true);
    };

    const handleFeedbackClose = () => {
        setShowFeedbackModal(false);
        navigate('/courses/live-classes');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="mb-4">Class not found</p>
                    <Button onClick={() => navigate('/courses/live-classes')}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Top Bar */}
            <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30 flex-none">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGoBack}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                                    {classData.title}
                                </h1>
                                <p className="text-sm text-gray-400">
                                    {new Date(classData.startTime).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {attendanceMarked ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-xl border border-green-900/50"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium hidden sm:inline">Attendance Marked</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Button
                                        onClick={handleMarkAttendance}
                                        disabled={markingAttendance}
                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg shadow-green-900/20"
                                    >
                                        {markingAttendance ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        <span className="hidden sm:inline">Mark Present</span>
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 max-w-[1920px] mx-auto w-full p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 h-full lg:h-[calc(100vh-140px)]">

                    {/* Video Player Area */}
                    <div className="flex flex-col bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800 relative z-0 min-h-[300px] lg:min-h-0">
                        {classData.recordingLink ? (
                            <iframe
                                src={getEmbedUrl(classData.recordingLink)}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Class Recording"
                            />
                        ) : classData.meetingLink ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30">
                                        <Video className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Live Session</h2>
                                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                        The session is hosted on Zoom/Meet. Click below to join.
                                    </p>
                                    <a
                                        href={classData.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg rounded-xl">
                                            Join Meeting
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <div className="text-center text-gray-500">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No video source available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interactive Sidebar - REFACTORED to use ClassroomSidebar */}
                    <ClassroomSidebar
                        classId={id}
                        liveClassHook={liveClassHook}
                        classData={classData}
                        className="h-[600px] lg:h-full lg:max-h-full" // Ensure it fills the grid cell
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={handleFeedbackClose}
                onSubmit={handleFeedbackSubmit}
            />
        </div>
    );
};

export default LiveClassSession;
