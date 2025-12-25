import React, { useState, useEffect } from 'react';
import { List, Trash2, Plus, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChaptersModule = ({ classId, useLiveClassHook, isAdmin, onJumpToTime }) => {
    const { getChapters, addChapter, deleteChapter } = useLiveClassHook;
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        loadChapters();
    }, [classId]);

    const loadChapters = async () => {
        try {
            const data = await getChapters(classId);
            setChapters(data.sort((a, b) => a.startTime - b.startTime));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = async (e) => {
        e.preventDefault();
        try {
            const start = parseTimeInternal(startTime);
            const end = parseTimeInternal(endTime);

            await addChapter(classId, {
                title,
                startTime: start,
                endTime: end
            });

            setTitle('');
            setStartTime('');
            setEndTime('');
            setShowForm(false);
            loadChapters();
        } catch (error) {
            console.error('Failed to add chapter', error);
        }
    };

    const handleDelete = async (chapterId, start) => {
        if (!window.confirm('Delete this chapter?')) return;
        try {
            await deleteChapter(classId, chapterId, start);
            setChapters(prev => prev.filter(c => c.id !== chapterId));
        } catch (error) {
            console.error('Failed to delete chapter', error);
        }
    };

    const formatTimeInternal = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const parseTimeInternal = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) return (parts[0] * 60) + parts[1];
        if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        return Number(timeStr) * 60;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header / Admin Actions */}
            {isAdmin && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Manage Chapters</span>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Chapter'}
                    </Button>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleAddChapter} className="space-y-3">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Chapter Title"
                            required
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="Start (MM:SS)"
                                required
                            />
                            <Input
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="End (MM:SS)"
                                required
                            />
                        </div>
                        <Button type="submit" size="sm" className="w-full">Save Chapter</Button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <p className="text-center text-gray-500 text-sm">Loading chapters...</p>
                ) : chapters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <List className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No chapters defined</p>
                    </div>
                ) : (
                    chapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            onClick={() => onJumpToTime && onJumpToTime(chapter.startTime)}
                            className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 cursor-pointer transition-all"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                {formatTimeInternal(chapter.startTime)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">{chapter.title}</h4>
                                <p className="text-xs text-gray-500">{formatTimeInternal(chapter.startTime)} - {formatTimeInternal(chapter.endTime)}</p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(chapter.id, chapter.startTime); }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChaptersModule;
