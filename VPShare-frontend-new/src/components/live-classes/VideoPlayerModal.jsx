import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
    if (!isOpen) return null;

    const getEmbedUrl = (url) => {
        if (!url) return '';

        // Handle YouTube
        // Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
        }

        // Handle Vimeo
        const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        }

        // Return original URL if no match (browser might block x-frame-options if normal page)
        return url;
    };

    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-5xl bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-800 backdrop-blur">
                        <h3 className="text-white font-medium truncate pr-4 text-lg">
                            {title || 'Playing Video'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Player Container - 16:9 Aspect Ratio */}
                    <div className="relative pt-[56.25%] bg-black">
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={title}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                <p>Invalid Video URL</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VideoPlayerModal;
