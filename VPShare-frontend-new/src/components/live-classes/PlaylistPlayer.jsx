import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Clock, ChevronLeft, List, X, BookOpen, Layers, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import ClassroomSidebar from './ClassroomSidebar';
import { useLiveClass } from '../../hooks/useLiveClass';

const PlaylistPlayer = ({ series, onClose }) => {
    const sortedEpisodes = React.useMemo(() =>
        [...(series?.videos || [])].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
        [series]);
    const [currentVideo, setCurrentVideo] = useState(sortedEpisodes[0]);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarView, setSidebarView] = useState('episodes'); // 'episodes' | 'classroom'
    const liveClassHook = useLiveClass();

    useEffect(() => {
        if (series && sortedEpisodes.length > 0) {
            setCurrentVideo(sortedEpisodes[0]);
            setSidebarView('episodes');
        }
    }, [series, sortedEpisodes]);

    const getEmbedUrl = (url) => {
        if (!url) return '';
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        return url;
    };

    if (!series) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col md:flex-row h-screen"
        >
            {/* Main Video Area */}
            <div className={`flex-1 flex flex-col min-h-0 relative transition-all duration-300 ${isSidebarOpen ? 'md:mr-[350px]' : ''}`}>

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={onClose}
                        className="pointer-events-auto flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-black/40 hover:bg-black/60 backdrop-blur rounded-lg px-3 py-1.5 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Library
                    </button>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-black/40 hover:bg-black/60 rounded-lg text-white md:hidden"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {currentVideo?.recordingLink ? (
                        <iframe
                            src={getEmbedUrl(currentVideo.recordingLink)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentVideo.title}
                        />
                    ) : (
                        <div className="text-center p-8 text-gray-400">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Select an episode to start watching</p>
                        </div>
                    )}
                </div>

                {/* Info Bar */}
                <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6 shrink-0">
                    <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{currentVideo?.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(currentVideo?.startTime).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>{currentVideo?.durationMinutes || 60} min</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                setSidebarOpen(true);
                                setSidebarView('classroom');
                            }}
                            variant="outline"
                            className="border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Notes & Q&A
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="absolute md:fixed top-0 right-0 bottom-0 w-full md:w-[350px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20"
                    >
                        {/* Sidebar Tab Switcher */}
                        <div className="flex border-b border-gray-800 bg-gray-900 z-10">
                            <button
                                onClick={() => setSidebarView('episodes')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${sidebarView === 'episodes'
                                    ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span className="hidden sm:inline">Episodes</span>
                            </button>
                            <button
                                onClick={() => setSidebarView('classroom')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${sidebarView === 'classroom'
                                    ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Classroom</span>
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-12 border-l border-gray-800 text-gray-400 hover:text-white flex items-center justify-center md:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-hidden relative bg-gray-900">
                            {sidebarView === 'episodes' ? (
                                <div className="h-full overflow-y-auto p-2 space-y-1">
                                    <div className="px-2 py-3">
                                        <h3 className="font-bold text-white text-lg line-clamp-1">{series.name}</h3>
                                        <p className="text-xs text-gray-500">{sortedEpisodes.length} Episodes</p>
                                    </div>
                                    {sortedEpisodes.map((video, index) => {
                                        const isActive = currentVideo?.id === video.id;
                                        return (
                                            <button
                                                key={video.id}
                                                onClick={() => {
                                                    setCurrentVideo(video);
                                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                                }}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${isActive
                                                    ? 'bg-blue-600/10 border border-blue-600/20'
                                                    : 'hover:bg-gray-800 border border-transparent'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'
                                                    }`}>
                                                    {isActive ? <Play className="w-3 h-3 fill-current" /> : index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${isActive ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                        {video.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{video.durationMinutes}m</span>
                                                        {video.recordingLink && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <ClassroomSidebar
                                    classId={currentVideo.id}
                                    liveClassHook={liveClassHook}
                                    classData={currentVideo}
                                    className="h-full rounded-none border-none bg-transparent shadow-none"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Re-open Sidebar Button (Desktop) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-900/50 backdrop-blur rounded-lg text-white hover:bg-gray-900 border border-gray-700 shadow-lg hidden md:block"
                >
                    <List className="w-5 h-5" />
                </button>
            )}
        </motion.div>
    );
};

export default PlaylistPlayer;
