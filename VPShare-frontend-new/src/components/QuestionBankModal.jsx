import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Code2, FileText, CheckCircle2, Plus, Filter } from 'lucide-react';
import Button from './ui/Button';
import axios from 'axios';

const QuestionBankModal = ({ isOpen, onClose, onSelectQuestion, user }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, mcq, text, code
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Create axios instance
    const api = React.useMemo(() => axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    }), []);

    api.interceptors.request.use(async (config) => {
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        const fetchQuestionBank = async () => {
            setLoading(true);
            try {
                const res = await api.get('/assignments/questions/bank');
                setQuestions(res.data || []);
            } catch (error) {
                console.error("Error fetching question bank:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchQuestionBank();
        }
    }, [isOpen, api]);

    const handleSelectQuestion = (question) => {
        const isSelected = selectedQuestions.find(q => q.id === question.id);
        if (isSelected) {
            setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
        } else {
            setSelectedQuestions(prev => [...prev, question]);
        }
    };

    const handleImport = () => {
        selectedQuestions.forEach(q => onSelectQuestion(q));
        onClose();
        setSelectedQuestions([]);
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || q.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'code': return <Code2 className="w-4 h-4" />;
            case 'text': return <FileText className="w-4 h-4" />;
            default: return <CheckCircle2 className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'code': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
            case 'text': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
            default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Question Bank
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Select questions to import into your assignment
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                            {['all', 'mcq', 'text', 'code'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterType === type
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {type.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No questions found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredQuestions.map(question => {
                                    const isSelected = selectedQuestions.find(q => q.id === question.id);
                                    return (
                                        <motion.div
                                            key={question.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            onClick={() => handleSelectQuestion(question)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getTypeColor(question.type)}`}>
                                                            {getTypeIcon(question.type)}
                                                            {question.type.toUpperCase()}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {question.points} pts
                                                        </span>
                                                        {question.language && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                • {question.language}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {question.text}
                                                    </p>
                                                    {question.testCases && question.testCases.length > 0 && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {question.testCases.length} test case(s)
                                                        </p>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedQuestions.length} question(s) selected
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={onClose} variant="outline">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={selectedQuestions.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Import {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuestionBankModal;
