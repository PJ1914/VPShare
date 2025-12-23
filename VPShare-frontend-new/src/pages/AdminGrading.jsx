import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, User, CheckCircle, XCircle, Code2, FileText,
    Save, Edit2, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import axios from 'axios';

const AdminGrading = () => {
    const { assignmentId, studentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [grades, setGrades] = useState({});
    const [feedback, setFeedback] = useState({});

    // Create axios instance
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    });

    api.interceptors.request.use(async (config) => {
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!user || !assignmentId || !studentId) return;

            setLoading(true);
            try {
                const res = await api.get(`/assignments/${assignmentId}/submissions/${studentId}`);
                setSubmission(res.data);
                
                // Initialize grades and feedback from existing data
                const initialGrades = {};
                const initialFeedback = {};
                res.data.answers?.forEach(answer => {
                    initialGrades[answer.questionId] = answer.pointsAwarded || 0;
                    initialFeedback[answer.questionId] = answer.feedback || '';
                });
                setGrades(initialGrades);
                setFeedback(initialFeedback);
            } catch (error) {
                console.error("Error fetching submission:", error);
                setError('Failed to load submission');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [user, assignmentId, studentId]);

    const handleGradeChange = (questionId, value) => {
        setGrades(prev => ({
            ...prev,
            [questionId]: parseInt(value) || 0
        }));
    };

    const handleFeedbackChange = (questionId, value) => {
        setFeedback(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmitGrades = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const gradeData = Object.entries(grades).map(([questionId, pointsAwarded]) => ({
                questionId,
                pointsAwarded,
                feedback: feedback[questionId] || ''
            }));

            await api.post(`/assignments/${assignmentId}/submissions/${studentId}/grade`, {
                grades: gradeData
            });

            setSuccess('Grades saved successfully!');
            setTimeout(() => {
                navigate(`/admin`);
            }, 2000);
        } catch (error) {
            console.error("Error saving grades:", error);
            setError(error.response?.data?.message || 'Failed to save grades');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading submission...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Admin</span>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Student Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Student Submission
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                ID: {studentId.substring(0, 10)}...
                            </p>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                submission?.status === 'Graded'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                                {submission?.status || 'Pending'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
                        {success}
                    </div>
                )}

                {/* Answers */}
                <div className="space-y-6">
                    {submission?.answers?.map((answer, index) => {
                        const question = submission.questions?.find(q => q.id === answer.questionId);
                        if (!question) return null;

                        return (
                            <motion.div
                                key={answer.questionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {question.type === 'code' && <Code2 className="w-5 h-5 text-purple-500" />}
                                            {question.type === 'text' && <FileText className="w-5 h-5 text-blue-500" />}
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                Question {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {question.text}
                                        </h3>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Max: {question.points} pts
                                    </span>
                                </div>

                                {/* Student Answer */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Student Answer:
                                    </label>
                                    {question.type === 'code' ? (
                                        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono">
                                            {answer.answer || '(No answer provided)'}
                                        </pre>
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                                            {answer.answer || '(No answer provided)'}
                                        </div>
                                    )}
                                </div>

                                {/* Grading Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Points Awarded
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={question.points}
                                            value={grades[answer.questionId] || 0}
                                            onChange={(e) => handleGradeChange(answer.questionId, e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-2 h-10">
                                            {grades[answer.questionId] === question.points ? (
                                                <span className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Full Credit
                                                </span>
                                            ) : grades[answer.questionId] > 0 ? (
                                                <span className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-semibold">
                                                    <Edit2 className="w-4 h-4" />
                                                    Partial Credit
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold">
                                                    <XCircle className="w-4 h-4" />
                                                    No Credit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Feedback (Optional)
                                    </label>
                                    <textarea
                                        value={feedback[answer.questionId] || ''}
                                        onChange={(e) => handleFeedbackChange(answer.questionId, e.target.value)}
                                        placeholder="Provide feedback to the student..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex justify-end gap-4"
                >
                    <Button
                        onClick={() => navigate('/admin')}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitGrades}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Grades
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminGrading;
