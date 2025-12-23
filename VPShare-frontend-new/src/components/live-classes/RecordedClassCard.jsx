import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Play, Edit2, Trash2, Upload, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

const RecordedClassCard = ({ classData, isAdmin, onEdit, onDelete, onWatchRecording, onReviewNotes }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
        >
            <Card className="overflow-hidden hover:shadow-xl transition-all border-purple-100 dark:border-purple-900/30 bg-white dark:bg-gray-900">
                {/* Gradient Header - Grayscale overlay until hovered */}
                <div className="relative h-32 overflow-hidden">
                    <div
                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                        style={{ background: getGradientFromTitle(classData.title) }}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/50">
                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Badge & Admin Controls */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            <CheckCircle className="w-3 h-3" />
                            RECORDED
                        </span>

                        {isAdmin && (
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {classData.title}
                    </h3>

                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(classData.startTime)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {classData.durationMinutes || 60} minutes
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {classData.recordingLink ? (
                            <Button
                                onClick={() => onWatchRecording(classData)}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Watch Recording
                            </Button>
                        ) : isAdmin ? (
                            <Button
                                onClick={() => onEdit(classData)}
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 border-dashed border-2 border-purple-400 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-900/20"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Recording
                            </Button>
                        ) : (
                            <Button
                                disabled
                                variant="outline"
                                className="w-full opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                            >
                                Recording Processing...
                            </Button>
                        )}

                        <Button
                            onClick={() => onReviewNotes && onReviewNotes(classData.id)}
                            variant="ghost"
                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <FileText className="w-4 h-4" />
                            Review Notes & Resources
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default RecordedClassCard;
