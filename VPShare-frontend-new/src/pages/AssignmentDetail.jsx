import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Clock, Calendar, Award, Code2, FileText,
    CheckCircle2, Send, Sparkles, Trophy, AlertTriangle, Terminal,
    Check, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import axios from 'axios';
import useAssignmentStore from '../store/useAssignmentStore';

const AssignmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create axios instance
    const api = useMemo(() => {
        return axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        });
    }, []);

    // Add auth token to requests
    useEffect(() => {
        const interceptor = api.interceptors.request.use(async (config) => {
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return () => api.interceptors.request.eject(interceptor);
    }, [user, api]);

    const getDueDate = (data) => {
        if (!data) return null;
        const date = data.dueDate || data.deadline || data.end_date || data.endDate;
        if (!date) return null;
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return null;
            return dateObj;
        } catch (e) {
            return null;
        }
    };

    // Fetch assignment details
    useEffect(() => {
        const fetchAssignment = async () => {
            if (!user || !id) return;

            setLoading(true);
            try {
                const res = await api.get(`/assignments/${id}`);
                const found = res.data;

                if (found) {
                    setAssignment(found);

                    // Display saved answers if available
                    if (found.progress?.answers && found.progress.answers.length > 0) {
                        const submittedAnswers = {};
                        found.progress.answers.forEach(ans => {
                            submittedAnswers[ans.questionId] = ans.answer;
                        });
                        setAnswers(submittedAnswers);
                    }
                } else {
                    setError('Assignment not found');
                }
            } catch (error) {
                console.error("Error fetching assignment:", error);
                setError('Failed to load assignment');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [user, id]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assignment) return;

        const validAnswers = Object.entries(answers)
            .filter(([qId, val]) => val !== undefined && val !== null && val !== '')
            .map(([qId, val]) => {
                const question = assignment.questions?.find(q => (q.id || q._id) === qId);

                if (question?.type === 'mcq') {
                    return {
                        questionId: qId,
                        answer: Number(val)
                    };
                } else {
                    return {
                        questionId: qId,
                        answer: val
                    };
                }
            });

        const payload = {
            answers: validAnswers,
            notes: submissionNotes || ''
        };

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const assignmentId = assignment.id || assignment._id;
            const response = await api.post(`/assignments/${assignmentId}/submit`, payload);

            const gradingResult = response.data;

            const updatedAssignmentData = {
                status: 'submitted',
                progress: {
                    ...assignment.progress, // Use assignment.progress safely? assignment is in scope
                    totalScore: gradingResult.totalScore,
                    gradedAnswers: gradingResult.gradedAnswers,
                    submittedAt: new Date().toISOString()
                }
            };

            setAssignment(prev => ({
                ...prev,
                ...updatedAssignmentData
            }));

            // Sync with global store
            useAssignmentStore.getState().updateAssignment(assignmentId, updatedAssignmentData);

            // Icon added in UI instead of emoji in text
            setSuccess(`Assignment submitted successfully! You scored ${gradingResult.totalScore}/${totalPoints} points`);

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Submission failed:", error);

            if (error.response?.status === 500 && error.response?.data?.error?.includes("Maximum attempts")) {
                setError('Submission Rejected: You have exceeded the maximum number of attempts.');
            } else {
                const errorMessage = error.response?.data?.error
                    || error.response?.data?.message
                    || error.message
                    || 'Failed to submit assignment';
                setError(`Submission Error: ${errorMessage}`);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-blue-500/20"></div>
                    <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assignment Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
                    <Button onClick={() => navigate('/courses/assignments')} className="w-full justify-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Assignments
                    </Button>
                </div>
            </div>
        );
    }

    const totalPoints = assignment?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || assignment?.totalPoints || 0;
    const isSubmitted = assignment?.status === 'submitted'
        || assignment?.status === 'graded'
        || assignment?.progress?.status === 'Submitted'
        || assignment?.progress?.status === 'Graded'
        || (assignment?.progress?.answers && assignment.progress.answers.length > 0);

    const dueDateObj = getDueDate(assignment);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/courses/assignments')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-medium hidden sm:block">Back to Assignments</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate(`/courses/assignments/${id}/leaderboard`)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="hidden sm:inline">Leaderboard</span>
                        </Button>
                        {isSubmitted && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-bold">Submitted</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Assignment Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-6 sm:p-8 text-white overflow-hidden shadow-2xl shadow-gray-200 dark:shadow-black/50"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="flex-1 space-y-3">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-blue-200 uppercase tracking-wide">
                                {assignment?.course || 'Assignment'}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                                {assignment?.title}
                            </h1>
                            <p className="text-gray-300 text-base leading-relaxed max-w-3xl">
                                {assignment?.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-gray-300">
                                {dueDateObj && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        <span>Due: {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    <span>{assignment?.questions?.length || 0} Questions</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[100px]">
                            <Award className="w-8 h-8 text-yellow-400 mb-1" />
                            <span className="text-2xl font-bold">{totalPoints}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Points</span>
                        </div>
                    </div>

                    {assignment?.instructions && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-white">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Instructions
                            </h3>
                            <div className="prose prose-invert max-w-none text-gray-300 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                <p className="whitespace-pre-wrap leading-relaxed">{assignment?.instructions}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Success/Error Feedback */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm flex items-start gap-4"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-green-900 dark:text-green-100">Excellent Work!</h3>
                                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                            </div>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3 animate-shake"
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Score Card Display */}
                {isSubmitted && assignment?.progress?.totalScore !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden border border-gray-100 dark:border-gray-800 p-6"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <Trophy className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Total Score</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                            {assignment.progress.totalScore}
                                        </h2>
                                        <span className="text-base text-gray-500 font-medium">/ {totalPoints}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-sm">
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className={assignment.progress.totalScore >= totalPoints * 0.7 ? "text-green-600 dark:text-green-400" : "text-gray-600"}>
                                        Performance
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                        {Math.round((assignment.progress.totalScore / totalPoints) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(assignment.progress.totalScore / totalPoints) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className={`h-full rounded-full ${assignment.progress.totalScore >= totalPoints * 0.7
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                                            : 'bg-gradient-to-r from-orange-400 to-red-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Questions Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {assignment?.questions?.map((question, index) => {
                        const gradedAnswer = assignment?.progress?.answers?.find(
                            ga => ga.questionId === question.id
                        );
                        const isCorrect = gradedAnswer?.isCorrect || false;
                        const pointsAwarded = gradedAnswer?.pointsAwarded || 0;
                        const isQuestionCorrect = isSubmitted && pointsAwarded === question.points;
                        const hasPartialCredit = isSubmitted && pointsAwarded > 0 && pointsAwarded < question.points;

                        return (
                            <motion.div
                                key={question.id || `q-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border transition-all ${isSubmitted
                                    ? isQuestionCorrect
                                        ? 'border-green-100 dark:border-green-900/30'
                                        : hasPartialCredit
                                            ? 'border-yellow-100 dark:border-yellow-900/30'
                                            : 'border-red-100 dark:border-red-900/30'
                                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                                    }`}
                            >
                                {/* Question Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg text-base font-bold shadow-sm ${isSubmitted
                                        ? isQuestionCorrect
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                        {isSubmitted ? (
                                            isQuestionCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                                                {question.text}
                                            </h3>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-bold whitespace-nowrap">
                                                    {question.points} pts
                                                </span>
                                                {isSubmitted && (
                                                    <span className={`text-[10px] font-bold ${isQuestionCorrect ? 'text-green-600' : 'text-red-500'
                                                        }`}>
                                                        {pointsAwarded} awarded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="pl-0 sm:pl-14 space-y-3">

                                    {/* MCQ Type */}
                                    {question.type === 'mcq' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {question.options?.map((option, optIndex) => {
                                                const submittedAnswerIndex = isSubmitted && gradedAnswer ? Number(gradedAnswer.answer) : null;
                                                const isSelected = isSubmitted
                                                    ? submittedAnswerIndex === optIndex
                                                    : answers[question.id] === optIndex;

                                                const isCorrectOption = isSubmitted
                                                    ? (gradedAnswer?.isCorrect && isSelected) || (question.correctOptionIndex === optIndex)
                                                    : (question.correctOptionIndex === optIndex);

                                                return (
                                                    <label
                                                        key={optIndex}
                                                        className={`relative flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-500 shadow-sm'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                            } ${isSubmitted && isSelected && !isQuestionCorrect ? '!border-red-500 !bg-red-50 dark:!bg-red-900/10' : ''
                                                            } ${isSubmitted && isCorrectOption && !isSelected ? '!border-green-500 !bg-green-50 dark:!bg-green-900/10 ring-1 ring-green-500/20' : ''
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            checked={isSelected}
                                                            onChange={() => handleAnswerChange(question.id, optIndex)}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3.5"
                                                            disabled={isSubmitted}
                                                        />
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {option}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Text Type */}
                                    {question.type === 'text' && (
                                        <textarea
                                            value={answers[question.id] || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            placeholder="Type your answer here..."
                                            rows={5}
                                            disabled={isSubmitted}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none shadow-inner text-sm"
                                        />
                                    )}

                                    {/* Code Type */}
                                    {question.type === 'code' && (
                                        <div className="space-y-3">
                                            {/* Code Toolbar */}
                                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                                    <Terminal className="w-3.5 h-3.5" />
                                                    {question.language || 'javascript'}
                                                </div>
                                                {!isSubmitted && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => {
                                                            localStorage.setItem('playgroundCode', answers[question.id] || question.starterCode || '');
                                                            localStorage.setItem('playgroundLanguage', question.language || 'javascript');
                                                            localStorage.setItem('returnToAssignment', assignment.id || assignment._id);
                                                            localStorage.setItem('codeQuestionId', question.id);
                                                            navigate('/playground');
                                                        }}
                                                        className="h-7 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-none px-3"
                                                    >
                                                        <Code2 className="w-3 h-3 mr-1.5" /> Open Playground
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Code Editor Area */}
                                            <div className="relative">
                                                <textarea
                                                    value={answers[question.id] || question.starterCode || ''}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    placeholder="// Write your code here..."
                                                    rows={12}
                                                    disabled={isSubmitted}
                                                    className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed rounded-b-xl outline-none resize-none shadow-inner"
                                                    spellCheck="false"
                                                />
                                            </div>

                                            {/* Execution Results */}
                                            {isSubmitted && gradedAnswer?.executionResults && (
                                                <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
                                                    <h4 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                                        <Terminal className="w-3 h-3" /> Test Results
                                                    </h4>
                                                    <div className="space-y-1.5">
                                                        {gradedAnswer.executionResults.map((result, idx) => (
                                                            <div key={idx} className="flex items-start gap-3 p-2 rounded bg-gray-800/50">
                                                                <span className={result.passed ? "text-green-400" : "text-red-400"}>
                                                                    {result.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                                </span>
                                                                <div className="flex-1 overflow-hidden">
                                                                    <div className="text-xs text-gray-300 font-mono">Test Case {idx + 1}</div>
                                                                    {result.output && (
                                                                        <div className="text-[10px] text-green-400/80 font-mono mt-0.5 opacity-80">{result.output}</div>
                                                                    )}
                                                                    {result.error && (
                                                                        <div className="text-[10px] text-red-400/80 font-mono mt-0.5">{result.error}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Submission Notes & Buttons */}
                    {!isSubmitted && (
                        <div className="pt-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 mb-6"
                            >
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    placeholder="Add any notes or comments about your submission..."
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-sm"
                                />
                            </motion.div>

                            <div className="flex justify-end gap-4 sticky bottom-6 z-30">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 px-8 py-3 rounded-xl text-base font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Assignment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AssignmentDetail;
