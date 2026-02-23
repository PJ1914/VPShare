import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Calendar, CheckCircle, Clock, AlertCircle,
    Upload, Search, Filter, ChevronRight, X, Plus, Edit2, Trash2, Shield, Code2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import PlaygroundEditor from '../components/PlaygroundEditor';
import axios from 'axios';
import useAssignmentStore from '../store/useAssignmentStore';

const Assignments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Zustand store
    const {
        assignments,
        loading,
        error,
        setAssignments,
        setLoading,
        setError,
        deleteAssignment
    } = useAssignmentStore();
    
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    
    // NEW: State for flexible answers
    const [answers, setAnswers] = useState({}); // { "q1": 0, "q2": "code here" }
    const [showPlayground, setShowPlayground] = useState(false);
    const [activeCodeQuestion, setActiveCodeQuestion] = useState(null);
    
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminAction, setAdminAction] = useState(null); // 'create' | 'edit' | 'delete'
    const [formData, setFormData] = useState({
        title: '',
        course: '',
        description: '',
        points: 100,
        dueDate: ''
    });

    // Fetch assignments
    useEffect(() => {
        if (!user) return;
        
        // Create axios instance with base URL
        const api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        });

        // Add auth token to requests
        api.interceptors.request.use(async (config) => {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        const fetchAssignments = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get('/assignments');
                setAssignments(res.data || []);
            } catch (error) {
                console.error("Error fetching assignments:", error);
                setError(error.response?.data?.message || 'Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [user]);

    // Load saved code from playground on return
    useEffect(() => {
        const checkForSavedCode = () => {
            const savedQuestions = Object.keys(localStorage).filter(key => key.startsWith('assignmentAnswer_'));
            savedQuestions.forEach(key => {
                const questionId = key.replace('assignmentAnswer_', '');
                const savedCode = localStorage.getItem(key);
                if (savedCode) {
                    setAnswers(prev => ({
                        ...prev,
                        [questionId]: savedCode
                    }));
                    localStorage.removeItem(key); // Clean up
                }
            });
        };

        checkForSavedCode();
    }, []);

    // Student: Submit assignment
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleOpenPlayground = (question) => {
        setActiveCodeQuestion(question);
        setShowPlayground(true);
    };

    const handleCodeSave = (code) => {
        if (activeCodeQuestion) {
            handleAnswerChange(activeCodeQuestion.id, code);
            setShowPlayground(false);
            setActiveCodeQuestion(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        // Convert answers object to array format
        const payload = {
            answers: Object.entries(answers).map(([qId, val]) => ({
                questionId: qId,
                answer: val
            })),
            notes: submissionNotes
        };

        setSubmitting(true);
        setError('');
        try {
            const assignmentId = selectedAssignment.id || selectedAssignment._id;
            await api.post(`/assignments/${assignmentId}/submit`, payload);

            // Update local state
            setAssignments(prev => prev.map(a =>
                (a.id || a._id) === assignmentId
                    ? { ...a, status: 'submitted' }
                    : a
            ));

            setSelectedAssignment(null);
            setAnswers({});
            setSubmissionNotes('');
        } catch (error) {
            console.error("Submission failed:", error);
            setError(error.response?.data?.message || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin: Create assignment
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post('/assignments', formData);
            setAssignments(prev => [res.data, ...prev]);
            setShowAdminModal(false);
            resetForm();
        } catch (error) {
            console.error("Create failed:", error);
            setError(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin: Update assignment
    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        
        setSubmitting(true);
        setError('');
        try {
            const assignmentId = selectedAssignment.id || selectedAssignment._id;
            const res = await api.put(`/assignments/${assignmentId}`, formData);
            setAssignments(prev => prev.map(a => 
                (a.id || a._id) === assignmentId ? res.data : a
            ));
            setShowAdminModal(false);
            setSelectedAssignment(null);
            resetForm();
        } catch (error) {
            console.error("Update failed:", error);
            setError(error.response?.data?.message || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin: Delete assignment
    const handleDeleteAssignment = async () => {
        if (!selectedAssignment) return;
        
        setSubmitting(true);
        setError('');
        try {
            const assignmentId = selectedAssignment.id || selectedAssignment._id;
            await api.delete(`/assignments/${assignmentId}`);
            setAssignments(prev => prev.filter(a => (a.id || a._id) !== assignmentId));
            setShowAdminModal(false);
            setSelectedAssignment(null);
        } catch (error) {
            console.error("Delete failed:", error);
            setError(error.response?.data?.message || 'Failed to delete assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            course: '',
            description: '',
            points: 100,
            dueDate: ''
        });
        setError('');
    };

    const openAdminModal = (action, assignment = null) => {
        setAdminAction(action);
        setShowAdminModal(true);
        if (action === 'edit' && assignment) {
            setSelectedAssignment(assignment);
            setFormData({
                title: assignment.title,
                course: assignment.course,
                description: assignment.description,
                points: assignment.points,
                dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''
            });
        } else if (action === 'delete' && assignment) {
            setSelectedAssignment(assignment);
        } else {
            resetForm();
        }
    };

    // Filter assignments
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
        const matchesFilter = filter === 'all' || assignment?.status === filter;
        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
    const currentAssignments = filteredAssignments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'submitted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            case 'graded': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Assignments
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track and submit your course assignments
                        </p>
                    </div>
                    {isAdmin && (
                        <Button 
                            onClick={() => openAdminModal('create')}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Assignment
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">All Assignments</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                    </select>
                </div>

                <AnimatePresence mode="wait">
                    {filteredAssignments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12"
                        >
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {currentAssignments.map((assignment) => (
                                <motion.div
                                    key={assignment.id || assignment._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    layout
                                >
                                    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <div className="p-6 flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                            {assignment.course}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {assignment.title}
                                                        </h3>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                                    {assignment.description}
                                                </p>

                                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>{assignment.points || assignment.totalPoints || 0} Points</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isAdmin ? (
                                                    <>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => openAdminModal('edit', assignment)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => openAdminModal('delete', assignment)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    assignment.status === 'pending' ? (
                                                        <Button onClick={() => navigate(`/courses/assignments/${assignment.id || assignment._id}`)}>
                                                            Start Assignment
                                                            <ChevronRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" onClick={() => navigate(`/courses/assignments/${assignment.id || assignment._id}`)}>
                                                            View Submission
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Student Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && !showAdminModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedAssignment.status === 'pending' ? 'Submit Assignment' : 'Assignment Details'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedAssignment(null);
                                        setSubmissionLink('');
                                        setSubmissionNotes('');
                                        setError('');
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Instructions</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {selectedAssignment.description}
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {selectedAssignment.status === 'pending' ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Render Questions Dynamically */}
                                        {selectedAssignment.questions && selectedAssignment.questions.length > 0 ? (
                                            selectedAssignment.questions.map((q, index) => (
                                                <div key={q.id || `q-${index}`} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                    <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white flex items-center justify-between">
                                                        <span>
                                                            {index + 1}. {q.text}
                                                        </span>
                                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                                            {q.points} pts
                                                        </span>
                                                    </h4>
                                                    
                                                    {/* MCQ TYPE */}
                                                    {q.type === 'mcq' && (
                                                        <div className="space-y-2 mt-4">
                                                            {q.options?.map((opt, optIndex) => (
                                                                <label 
                                                                    key={optIndex} 
                                                                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`question-${q.id}`}
                                                                        checked={answers[q.id] === optIndex}
                                                                        onChange={() => handleAnswerChange(q.id, optIndex)}
                                                                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-gray-900 dark:text-gray-100">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* TEXT TYPE */}
                                                    {q.type === 'text' && (
                                                        <textarea
                                                            value={answers[q.id] || ''}
                                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                            placeholder="Type your answer here..."
                                                            className="w-full p-4 mt-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                            rows={4}
                                                        />
                                                    )}

                                                    {/* CODE TYPE - Integrated with Playground */}
                                                    {q.type === 'code' && (
                                                        <div className="mt-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Code2 className="w-4 h-4 text-blue-500" />
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Language: {q.language || 'JavaScript'}
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        // Save current code to state, then navigate to playground
                                                                        localStorage.setItem('playgroundCode', answers[q.id] || '');
                                                                        localStorage.setItem('playgroundLanguage', q.language || 'javascript');
                                                                        localStorage.setItem('returnToAssignment', selectedAssignment.id || selectedAssignment._id);
                                                                        localStorage.setItem('codeQuestionId', q.id);
                                                                        navigate('/playground');
                                                                    }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Code2 className="w-4 h-4" />
                                                                    Open in Playground
                                                                </Button>
                                                            </div>
                                                            <div className="bg-gray-900 rounded-lg overflow-hidden">
                                                                <div className="text-gray-400 text-xs px-4 py-2 bg-gray-800 border-b border-gray-700">
                                                                    {q.language || 'javascript'}
                                                                </div>
                                                                <textarea
                                                                    value={answers[q.id] || ''}
                                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                    className="w-full bg-transparent text-gray-100 font-mono text-sm p-4 h-48 outline-none border-none resize-none"
                                                                    spellCheck="false"
                                                                    placeholder="// Write your code here or use the playground..."
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            // Fallback for old-style assignments without questions
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Submission Link (GitHub/Replit) *
                                                </label>
                                                <div className="relative">
                                                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="https://github.com/username/repo"
                                                        value={answers['submissionUrl'] || ''}
                                                        onChange={(e) => handleAnswerChange('submissionUrl', e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                placeholder="Any additional notes..."
                                                value={submissionNotes}
                                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedAssignment(null);
                                                    setAnswers({});
                                                    setSubmissionNotes('');
                                                    setError('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                isLoading={submitting}
                                            >
                                                Submit Work
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-medium text-green-900 dark:text-green-300">Assignment Submitted</p>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                Submitted on {new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Admin Create/Edit/Delete Modal */}
            <AnimatePresence>
                {showAdminModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-linear-to-r from-blue-600 to-purple-600">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-white" />
                                    <h3 className="text-xl font-bold text-white">
                                        {adminAction === 'create' && 'Create New Assignment'}
                                        {adminAction === 'edit' && 'Edit Assignment'}
                                        {adminAction === 'delete' && 'Delete Assignment'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAdminModal(false);
                                        setSelectedAssignment(null);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {adminAction === 'delete' ? (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <p className="text-gray-900 dark:text-white font-medium mb-2">
                                                Are you sure you want to delete this assignment?
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                "{selectedAssignment?.title}" - This action cannot be undone.
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowAdminModal(false);
                                                    setSelectedAssignment(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="danger"
                                                isLoading={submitting}
                                                onClick={handleDeleteAssignment}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Assignment
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={adminAction === 'create' ? handleCreateAssignment : handleUpdateAssignment} className="space-y-4">
                                        <Input
                                            label="Assignment Title *"
                                            type="text"
                                            required
                                            placeholder="e.g., Build a Todo App"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        <Input
                                            label="Course *"
                                            type="text"
                                            required
                                            placeholder="e.g., Frontend Mastery"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                required
                                                placeholder="Describe the assignment requirements..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Points *"
                                                type="number"
                                                required
                                                min="1"
                                                placeholder="100"
                                                value={formData.points}
                                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                label="Due Date *"
                                                type="date"
                                                required
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowAdminModal(false);
                                                    setSelectedAssignment(null);
                                                    resetForm();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                isLoading={submitting}
                                            >
                                                {adminAction === 'create' ? 'Create Assignment' : 'Update Assignment'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Assignments;
