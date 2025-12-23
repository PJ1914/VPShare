import React from 'react';
import { motion } from 'framer-motion';
import { Book, PlayCircle, MoreVertical, LayoutGrid, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

const SeriesCard = ({ series, onClick, isAdmin }) => {
    // Generate a consistent gradient based on series name
    const getGradient = (name) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue1 = hash % 360;
        const hue2 = (hash * 2 + 180) % 360;
        return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 40%))`;
    };

    const latestVideo = series.videos.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="cursor-pointer group"
            onClick={() => onClick(series)}
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 h-full flex flex-col">
                {/* Folder Preview Area */}
                <div
                    className="h-40 relative p-6 flex flex-col justify-end"
                    style={{ background: getGradient(series.name) }}
                >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                            <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md line-clamp-2">
                        {series.name}
                    </h3>
                    <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        {series.videos.length} Episodes
                    </p>
                </div>

                {/* Info Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="space-y-3">
                        {latestVideo && (
                            <div className="flex items-start gap-3">
                                <div className="mt-1 min-w-[4px] h-[4px] rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                                        Latest Update
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                                        {latestVideo.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(latestVideo.startTime).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default SeriesCard;
