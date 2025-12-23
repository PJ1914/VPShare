import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Edit2, Trash2, ExternalLink, Upload } from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

const LiveClassCard = ({ classData, isAdmin, onEdit, onDelete, onEnterClassroom }) => {
    const getGradientFromTitle = (title) => {
        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue1 = hash % 360;
        const hue2 = (hash * 2) % 360;
        return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 50%))`;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTimeUntil = (startTime) => {
        const now = new Date();
        const diff = new Date(startTime) - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diff < 0) return 'Started';
        if (diff < 10 * 60 * 1000) return 'Live Now'; // 10 min buffer
        if (hours < 1) return `In ${minutes} min`;
        if (hours < 24) return `In ${hours}h ${minutes}m`;
        return `In ${Math.floor(hours / 24)} days`;
    };

    const badge = getTimeUntil(classData.startTime);
    const isLiveNow = badge === 'Live Now';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <Card
                className="overflow-hidden hover:shadow-xl transition-shadow border-blue-100 dark:border-blue-900/30 cursor-pointer"
                onClick={() => onEnterClassroom(classData.id)}
            >
                {/* Gradient Header */}
                <div
                    className="h-32 relative"
                    style={{ background: getGradientFromTitle(classData.title) }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-6">
                    {/* Badge & Admin Controls */}
                    <div className="flex items-center justify-between mb-4">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isLiveNow
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 animate-pulse'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                }`}
                        >
                            {isLiveNow && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                            {badge}
                        </span>

                        {isAdmin && (
                            <div
                                className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur rounded-lg p-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => onEdit(classData)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    title="Edit Class"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={() => onDelete(classData)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                    title="Delete Class"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">
                        {classData.title}
                    </h3>

                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {formatDateTime(classData.startTime)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {classData.durationMinutes || 60} minutes
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => onEnterClassroom(classData.id)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20"
                        >
                            <Video className="w-4 h-4" />
                            {isLiveNow ? 'Join Live Class' : 'Enter Classroom'}
                        </Button>

                        {classData.meetingLink && (
                            <a
                                href={classData.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    Join via Zoom/Meet
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </a>
                        )}

                        {isAdmin && (
                            <Button
                                onClick={() => onEdit(classData)}
                                variant="ghost"
                                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 rounded-none group"
                            >
                                <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                Upload Recording (Early)
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default LiveClassCard;
