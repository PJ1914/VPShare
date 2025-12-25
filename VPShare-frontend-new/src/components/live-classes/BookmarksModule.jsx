import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Clock, Plus } from 'lucide-react'; // Using standard lucide icons
import Button from '../ui/Button';
import Input from '../ui/Input';


const BookmarksModule = ({ classId, useLiveClassHook, getCurrentTime, onJumpToTime }) => {
    const { getBookmarks, addBookmark, deleteBookmark } = useLiveClassHook;
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [manualTime, setManualTime] = useState(''); // For manual entry if needed

    useEffect(() => {
        loadBookmarks();
    }, [classId]);

    const loadBookmarks = async () => {
        try {
            const data = await getBookmarks(classId);
            // Sort by timestamp
            setBookmarks(data.sort((a, b) => a.timestamp - b.timestamp));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBookmark = async (e) => {
        e.preventDefault();

        // Use manual time if provided, otherwise getCurrentTime callback
        let timestamp = 0;
        if (manualTime) {
            timestamp = parseTimeInternal(manualTime);
        } else if (getCurrentTime) {
            timestamp = Math.floor(getCurrentTime());
        }

        try {
            await addBookmark(classId, timestamp, note);
            setNote('');
            setManualTime('');
            loadBookmarks();
        } catch (error) {
            console.error('Failed to add bookmark', error);
        }
    };

    const handleDelete = async (bookmarkId, timestamp) => {
        try {
            await deleteBookmark(classId, bookmarkId, timestamp);
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        } catch (error) {
            console.error('Failed to delete bookmark', error);
        }
    };

    // Helper to format/parse time locally if utils missing
    const formatTimeInternal = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const parseTimeInternal = (timeStr) => {
        if (!timeStr.includes(':')) return Number(timeStr) * 60; // assume min if no colon? or just sec
        const [mins, secs] = timeStr.split(':').map(Number);
        return (mins * 60) + (secs || 0);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-gray-500 text-sm">Loading bookmarks...</p>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No bookmarks yet</p>
                    </div>
                ) : (
                    bookmarks.map((b) => (
                        <div key={b.id} className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <button
                                onClick={() => onJumpToTime && onJumpToTime(b.timestamp)}
                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono text-sm font-medium hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded cursor-pointer"
                            >
                                <Clock className="w-3 h-3" />
                                {formatTimeInternal(b.timestamp)}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{b.note}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(b.id, b.timestamp)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Form */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <form onSubmit={handleAddBookmark} className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            placeholder="00:00"
                            className="w-20 font-mono text-center"
                            title="Timestamp (MM:SS)"
                        />
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1"
                            required
                        />
                    </div>
                    <Button type="submit" size="sm" className="w-full flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Bookmark
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default BookmarksModule;
