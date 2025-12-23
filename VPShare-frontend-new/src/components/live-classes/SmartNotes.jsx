import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, FileText, Check } from 'lucide-react';
import { Card } from '../ui/Card';

const SmartNotes = ({ classId, useLiveClassHook }) => {
    const { getNote, saveNote } = useLiveClassHook;
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
    const [loadingNote, setLoadingNote] = useState(true);
    const [error, setError] = useState('');

    const fetchNote = useCallback(async () => {
        try {
            setError('');
            const data = await getNote(classId);
            if (data.content) {
                setContent(data.content);
            }
        } catch (err) {
            console.error('Failed to fetch note:', err);
            setError('Failed to load your notes');
        } finally {
            setLoadingNote(false);
        }
    }, [classId, getNote]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    // Debounced auto-save
    // Debounced auto-save
    const debouncedSave = React.useMemo(
        () => debounce(async (text, currentClassId) => {
            if (!text.trim()) return;

            setSaveStatus('saving');
            setError('');
            try {
                // Use captured variable or pass as arg?
                // Passed currentClassId to ensure freshness if desired,
                // but simpler to depend on [classId] so effect recreates if classId changes.
                await saveNote(currentClassId, text);
                setLastSaved(new Date());
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (err) {
                console.error('Failed to save note:', err);
                setSaveStatus('idle');
                setError('Failed to auto-save. Your changes may not be saved.');
            }
        }, 2000),
        [classId, saveNote] // Re-create debounce if classId or saveNote changes
    );

    const handleChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        debouncedSave(newContent, classId);
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diff = Math.floor((now - lastSaved) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return lastSaved.toLocaleTimeString();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Smart Notes
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                        {saveStatus === 'saving' && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                            </motion.span>
                        )}
                        {saveStatus === 'saved' && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-1 text-green-600 dark:text-green-400"
                            >
                                <Check className="w-3 h-3" />
                                Saved
                            </motion.span>
                        )}
                        {lastSaved && saveStatus === 'idle' && (
                            <span className="text-gray-500 dark:text-gray-400">
                                {formatLastSaved()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex-1 p-4">
                {loadingNote ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={handleChange}
                        placeholder="Take notes during the class... (Markdown supported)&#10;&#10;💡 Tip: Your notes auto-save every 2 seconds"
                        className="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm"
                        style={{ minHeight: '400px' }}
                    />
                )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>💡 <strong>Tip:</strong> Your notes auto-save every 2 seconds</p>
                    <p className="mt-1">You can use Markdown formatting (**, *, `, etc.)</p>
                </div>
            </div>
        </div>
    );
};

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default SmartNotes;
