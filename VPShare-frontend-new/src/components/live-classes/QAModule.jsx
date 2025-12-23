import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageCircle, User, Sparkles, HelpCircle, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';

const QAModule = ({ classId, useLiveClassHook }) => {
    const { getQuestions, askQuestion } = useLiveClassHook;
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fetchingQuestions, setFetchingQuestions] = useState(true);
    const scrollRef = useRef(null);

    const fetchQuestions = React.useCallback(async (silent = false) => {
        try {
            if (!silent) setError('');
            const data = await getQuestions(classId);
            setQuestions(data);
        } catch (err) {
            console.error('Failed to fetch questions:', err);
            // Don't show error regarding fetch fail on polling as it might be transient
            if (!silent) setError('Failed to load questions. Please check connection.');
        } finally {
            setFetchingQuestions(false);
        }
    }, [getQuestions, classId]);

    // Initial fetch and polling
    useEffect(() => {
        fetchQuestions();
        const interval = setInterval(() => {
            // Only poll if we're not currently submitting to avoid weird UI jumps
            if (!submitting) fetchQuestions(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchQuestions, submitting]);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [questions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            await askQuestion(classId, newQuestion);
            setNewQuestion('');
            await fetchQuestions(); // Refresh list immediately
        } catch (err) {
            console.error('Failed to post question:', err);
            setError('Failed to post your question. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-950/50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        Live Q&A
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Ask questions in real-time
                    </p>
                </div>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400">
                    {questions.length}
                </div>
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pt-4 overflow-hidden"
                    >
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
                ref={scrollRef}
            >
                {fetchingQuestions && questions.length === 0 ? (
                    <div className="space-y-4 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-tl-none" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : questions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-in fade-in fill-mode-forwards duration-500">
                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-gray-900">
                            <Sparkles className="w-10 h-10 text-blue-500/80" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Start the discussion!
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
                            Ask a doubt and get help from instructors & the community.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {questions.map((q) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                layout
                                className="group"
                            >
                                <div className="flex gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
                                            {q.userName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {q.userName || 'Anonymous'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatTimestamp(q.timestamp)}
                                            </span>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-200 text-sm leading-relaxed relative group-hover:shadow-md transition-shadow">
                                            {q.text}
                                        </div>

                                        {/* Instructor Answer */}
                                        {q.answer && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-2 ml-2 flex gap-3"
                                            >
                                                <div className="w-0.5 min-h-[20px] bg-gray-200 dark:bg-gray-700 rounded-full" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded text-[10px] font-bold text-yellow-700 dark:text-yellow-500 flex items-center gap-1 border border-yellow-200 dark:border-yellow-900/50">
                                                            <GraduationCap className="w-3 h-3" />
                                                            INSTRUCTOR
                                                        </div>
                                                    </div>
                                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl rounded-tl-none border border-blue-100 dark:border-blue-900/30 text-sm text-gray-800 dark:text-gray-200">
                                                        {q.answer}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
                <form onSubmit={handleSubmit} className="relative flex items-center group focus-within:ring-2 focus-within:ring-blue-500/20 rounded-2xl transition-all">
                    <input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type your question..."
                        disabled={submitting}
                        className="w-full pl-5 pr-14 py-3.5 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-0 placeholder:text-gray-400 text-gray-900 dark:text-white transition-colors hover:bg-gray-200/50 dark:hover:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-950 shadow-inner"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Button
                            type="submit"
                            disabled={submitting || !newQuestion.trim()} // Should be disabled if empty
                            className={`p-0 rounded-xl h-10 w-10 flex items-center justify-center transition-all duration-300 ${newQuestion.trim()
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 rotate-0'
                                : 'bg-transparent text-gray-400 scale-90 -rotate-12 cursor-not-allowed hover:bg-transparent'
                                }`}
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 ml-0.5 fill-current" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QAModule;
