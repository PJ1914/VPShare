import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Save, X, FileText, BookOpen,
    Calendar, Clock, User, Search, Filter, AlertCircle, Sparkles, Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import QuestionBankModal from '../components/QuestionBankModal';
import { hackathonService } from '../services/hackathon.service';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const Admin = ({ defaultTab = 'assignments', hideTabs = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const activeTab = defaultTab;
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // AI Generation state
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);

    // Question Bank state
    const [showQuestionBank, setShowQuestionBank] = useState(false);

    // Assignment form state
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        course: '',
        description: '',
        points: 100,
        dueDate: '',
        instructions: '',
        resources: [],
        questions: [] // Array of question objects
    });

    // Course form state
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        instructor: '',
        duration: '',
        level: 'beginner',
        price: 0,
        category: '',
        thumbnail: ''
    });

    // Hackathon form state
    const [hackathonForm, setHackathonForm] = useState({
        title: '',
        tagline: '',
        description: '',
        hackathonStartDate: '',
        submissionDeadline: '',
        participantType: 'individual', // 'individual' | 'team'
        registrationStartDate: '',
        registrationEndDate: ''
    });

    // Create axios instance with base URL
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    });

    // Add auth token to requests
    api.interceptors.request.use(async (config) => {
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Check if user is admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setIsAdmin(tokenResult.claims.role === 'admin' || tokenResult.claims.admin === true);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setIsAdmin(false);
                }
            }
        };
        checkAdminStatus();
    }, [user]);

    // Fetch data based on active tab
    useEffect(() => {
        if (!user || !isAdmin) return;
        fetchData();
    }, [user, isAdmin, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'assignments') {
                const res = await api.get('/assignments');
                setAssignments(res.data || []);
            } else if (activeTab === 'courses') {
                const res = await api.get('/courses');
                setCourses(res.data || []);
            } else if (activeTab === 'hackathons') {
                const data = await hackathonService.getAllHackathons();
                setHackathons(Array.isArray(data) ? data : (data.items || []));
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab}:`, error);
            setError(error.message || `Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    // Assignment CRUD Operations
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            // Transform to match backend schema
            const payload = {
                title: assignmentForm.title,
                course: assignmentForm.course,
                description: assignmentForm.description,
                dueDate: assignmentForm.dueDate,
                points: assignmentForm.points,        // For controller validation
                totalPoints: assignmentForm.points,   // For service layer
                questions: assignmentForm.questions
            };
            const res = await api.post('/assignments', payload);
            setAssignments(prev => [res.data, ...prev]);
            setSuccess('Assignment created successfully!');
            closeModal();
        } catch (error) {
            console.error("Create assignment failed:", error);
            setError(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            // Transform to match backend schema
            const payload = {
                title: assignmentForm.title,
                course: assignmentForm.course,
                description: assignmentForm.description,
                dueDate: assignmentForm.dueDate,
                points: assignmentForm.points,        // For controller validation
                totalPoints: assignmentForm.points,   // For service layer
                questions: assignmentForm.questions
            };
            const res = await api.put(`/assignments/${selectedItem._id}`, payload);
            setAssignments(prev => prev.map(a =>
                a._id === selectedItem._id ? res.data : a
            ));
            setSuccess('Assignment updated successfully!');
            closeModal();
        } catch (error) {
            console.error("Update assignment failed:", error);
            setError(error.response?.data?.message || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!id) {
            setError('Cannot delete: Assignment ID is missing');
            return;
        }
        if (!confirm('Are you sure you want to delete this assignment?')) return;

        setError('');
        setSuccess('');
        try {
            await api.delete(`/assignments/${id}`);
            setAssignments(prev => prev.filter(a => (a._id || a.id) !== id));
            setSuccess('Assignment deleted successfully!');
        } catch (error) {
            console.error("Delete assignment failed:", error);
            setError(error.response?.data?.message || 'Failed to delete assignment');
        }
    };

    // Course CRUD Operations (placeholder for future)
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/courses', courseForm);
            setCourses(prev => [res.data, ...prev]);
            setSuccess('Course created successfully!');
            closeModal();
        } catch (error) {
            console.error("Create course failed:", error);
            setError(error.response?.data?.message || 'Failed to create course');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.put(`/courses/${selectedItem._id}`, courseForm);
            setCourses(prev => prev.map(c =>
                c._id === selectedItem._id ? res.data : c
            ));
            setSuccess('Course updated successfully!');
            closeModal();
        } catch (error) {
            console.error("Update course failed:", error);
            setError(error.response?.data?.message || 'Failed to update course');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!id) {
            setError('Cannot delete: Course ID is missing');
            return;
        }
        if (!confirm('Are you sure you want to delete this course?')) return;

        setError('');
        setSuccess('');
        try {
            await api.delete(`/courses/${id}`);
            setCourses(prev => prev.filter(c => (c._id || c.id) !== id));
            setSuccess('Course deleted successfully!');
        } catch (error) {
            console.error("Delete course failed:", error);
            setError(error.response?.data?.message || 'Failed to delete course');
        }
    };

    // Hackathon CRUD Operations
    const handleCreateHackathon = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const data = await hackathonService.createHackathon(hackathonForm);
            setHackathons(prev => [data, ...prev]);
            setSuccess('Hackathon created successfully!');
            closeModal();
        } catch (error) {
            console.error("Create hackathon failed:", error);
            setError(error.response?.data?.error || 'Failed to create hackathon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateHackathon = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const data = await hackathonService.updateHackathon(selectedItem.id || selectedItem._id, hackathonForm);
            setHackathons(prev => prev.map(h =>
                (h.id === (selectedItem.id || selectedItem._id) || h._id === (selectedItem.id || selectedItem._id)) ? data : h
            ));
            setSuccess('Hackathon updated successfully!');
            closeModal();
        } catch (error) {
            console.error("Update hackathon failed:", error);
            setError(error.response?.data?.error || 'Failed to update hackathon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHackathon = async (id) => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this hackathon?')) return;

        setError('');
        setSuccess('');
        try {
            await hackathonService.deleteHackathon(id);
            setHackathons(prev => prev.filter(h => (h.id || h._id) !== id));
            setSuccess('Hackathon deleted successfully!');
        } catch (error) {
            console.error("Delete hackathon failed:", error);
            setError(error.response?.data?.error || 'Failed to delete hackathon');
        }
    };

    // AI Generation Handler
    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) {
            setError('Please enter a prompt for AI generation');
            return;
        }

        setGeneratingAI(true);
        setError('');
        try {
            const res = await api.post('/assignments/generate', { prompt: aiPrompt });
            const generatedQuestions = res.data.questions || [];

            // Pre-fill the assignment form with generated questions
            setAssignmentForm(prev => ({
                ...prev,
                questions: [...prev.questions, ...generatedQuestions]
            }));

            setSuccess(`Generated ${generatedQuestions.length} questions with AI! 🎉`);
            setShowAIModal(false);
            setAiPrompt('');
        } catch (error) {
            console.error("AI generation failed:", error);
            setError(error.response?.data?.error || 'Failed to generate questions with AI');
        } finally {
            setGeneratingAI(false);
        }
    };

    // Question Bank handlers
    const handleImportFromBank = (question) => {
        setAssignmentForm(prev => ({
            ...prev,
            questions: [...prev.questions, { ...question, id: `q-${Date.now()}-${Math.random()}` }]
        }));
    };

    // Modal handlers
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedItem(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setSelectedItem(item);
        if (activeTab === 'assignments') {
            setAssignmentForm({
                title: item.title || '',
                course: item.course || '',
                description: item.description || '',
                points: item.totalPoints || item.points || 100, // Backend returns totalPoints
                dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
                instructions: item.instructions || '',
                resources: item.resources || [],
                questions: item.questions || []
            });
        } else if (activeTab === 'courses') {
            setCourseForm({
                title: item.title || '',
                description: item.description || '',
                instructor: item.instructor || '',
                duration: item.duration || '',
                level: item.level || 'beginner',
                price: item.price || 0,
                category: item.category || '',
                thumbnail: item.thumbnail || ''
            });
        } else if (activeTab === 'hackathons') {
            setHackathonForm({
                title: item.title || '',
                tagline: item.tagline || '',
                description: item.description || '',
                hackathonStartDate: item.hackathonStartDate ? new Date(item.hackathonStartDate).toISOString().slice(0, 16) : '',
                submissionDeadline: item.submissionDeadline ? new Date(item.submissionDeadline).toISOString().slice(0, 16) : '',
                participantType: item.participantType || 'individual',
                registrationStartDate: item.registrationStartDate ? new Date(item.registrationStartDate).toISOString().slice(0, 16) : '',
                registrationEndDate: item.registrationEndDate ? new Date(item.registrationEndDate).toISOString().slice(0, 16) : ''
            });
        }

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setError('');
        resetForm();
    };

    const resetForm = () => {
        setAssignmentForm({
            title: '',
            course: '',
            description: '',
            points: 100,
            dueDate: '',
            instructions: '',
            resources: [],
            questions: []
        });
        setCourseForm({
            title: '',
            description: '',
            instructor: '',
            duration: '',
            level: 'beginner',
            price: 0,
            category: '',
            thumbnail: ''
        });
        setHackathonForm({
            title: '',
            tagline: '',
            description: '',
            hackathonStartDate: '',
            submissionDeadline: '',
            participantType: 'individual',
            registrationStartDate: '',
            registrationEndDate: ''
        });
    };

    // Filter data based on search
    const filteredAssignments = assignments.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCourses = courses.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHackathons = hackathons.filter(h =>
        h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.tagline?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-6 h-6" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            You do not have permission to access the admin panel.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage assignments, courses, and more
                    </p>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                            <button onClick={() => setError('')} className="ml-auto cursor-pointer">
                                <X className="w-5 h-5 text-red-500" />
                            </button>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
                        >
                            <Calendar className="w-5 h-5 text-green-500" />
                            <p className="text-green-700 dark:text-green-400">{success}</p>
                            <button onClick={() => setSuccess('')} className="ml-auto cursor-pointer">
                                <X className="w-5 h-5 text-green-500" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                {!hideTabs && (
                    <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => navigate('/admin/assignments')}
                            className={`pb-3 px-4 font-medium transition-colors cursor-pointer ${activeTab === 'assignments'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <FileText className="w-5 h-5 inline mr-2" />
                            Assignments
                        </button>
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className={`pb-3 px-4 font-medium transition-colors cursor-pointer ${activeTab === 'courses'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <BookOpen className="w-5 h-5 inline mr-2" />
                            Courses
                        </button>
                        <button
                            onClick={() => navigate('/admin/hackathons')}
                            className={`pb-3 px-4 font-medium transition-colors cursor-pointer ${activeTab === 'hackathons'
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Trophy className="w-5 h-5 inline mr-2" />
                            Hackathons
                        </button>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={openCreateModal} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create {activeTab === 'assignments' ? 'Assignment' : activeTab === 'courses' ? 'Course' : 'Hackathon'}
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : activeTab === 'assignments' ? (
                    <AssignmentsList
                        assignments={filteredAssignments}
                        onEdit={openEditModal}
                        onDelete={handleDeleteAssignment}
                    />
                ) : activeTab === 'courses' ? (
                    <CoursesList
                        courses={filteredCourses}
                        onEdit={openEditModal}
                        onDelete={handleDeleteCourse}
                    />
                ) : (
                    <HackathonsList
                        hackathons={filteredHackathons}
                        onEdit={openEditModal}
                        onDelete={handleDeleteHackathon}
                    />
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="fixed inset-0 bg-black/50 z-40 cursor-pointer"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            >
                                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>
                                                {modalMode === 'create' ? 'Create' : 'Edit'}{' '}
                                                {activeTab === 'assignments' ? 'Assignment' : activeTab === 'courses' ? 'Course' : 'Hackathon'}
                                            </span>
                                            <button onClick={closeModal}>
                                                <X className="w-6 h-6" />
                                            </button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {activeTab === 'assignments' ? (
                                            <AssignmentForm
                                                formData={assignmentForm}
                                                setFormData={setAssignmentForm}
                                                onSubmit={modalMode === 'create' ? handleCreateAssignment : handleUpdateAssignment}
                                                submitting={submitting}
                                                error={error}
                                                onOpenAIModal={() => setShowAIModal(true)}
                                                onOpenQuestionBank={() => setShowQuestionBank(true)}
                                            />
                                        ) : activeTab === 'courses' ? (
                                            <CourseForm
                                                formData={courseForm}
                                                setFormData={setCourseForm}
                                                onSubmit={modalMode === 'create' ? handleCreateCourse : handleUpdateCourse}
                                                submitting={submitting}
                                                error={error}
                                            />
                                        ) : (
                                            <HackathonForm
                                                formData={hackathonForm}
                                                setFormData={setHackathonForm}
                                                onSubmit={modalMode === 'create' ? handleCreateHackathon : handleUpdateHackathon}
                                                submitting={submitting}
                                                error={error}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* AI Generation Modal */}
                <AnimatePresence>
                    {showAIModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAIModal(false)}
                                className="fixed inset-0 bg-black/50 z-40 cursor-pointer"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            >
                                <Card className="w-full max-w-2xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Sparkles className="w-6 h-6 text-purple-500" />
                                                Generate Questions with AI
                                            </span>
                                            <button onClick={() => setShowAIModal(false)}>
                                                <X className="w-6 h-6" />
                                            </button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Describe what questions you want to generate
                                                </label>
                                                <textarea
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    rows={5}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Example: Create 3 JavaScript questions about Promises and Async/Await. Include 1 MCQ, 1 text question, and 1 coding question."
                                                />
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    <strong>💡 Tips:</strong> Be specific about:
                                                </p>
                                                <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 ml-4 list-disc space-y-1">
                                                    <li>Number of questions</li>
                                                    <li>Question types (MCQ, text, coding)</li>
                                                    <li>Topic or subject area</li>
                                                    <li>Difficulty level</li>
                                                </ul>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={handleGenerateWithAI}
                                                    disabled={generatingAI || !aiPrompt.trim()}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    {generatingAI ? 'Generating...' : 'Generate Questions'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowAIModal(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Question Bank Modal */}
                <QuestionBankWrapper
                    showQuestionBank={showQuestionBank}
                    setShowQuestionBank={setShowQuestionBank}
                    onSelectQuestion={handleImportFromBank}
                    user={user}
                />
            </div>
        </div>
    );
};

// Assignments List Component
const AssignmentsList = ({ assignments, onEdit, onDelete }) => {
    if (assignments.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No assignments found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {assignments.map((assignment, index) => (
                <motion.div
                    key={assignment._id || assignment.id || `assignment-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {assignment.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <BookOpen className="w-4 h-4" />
                                            {assignment.course || 'No course'}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <FileText className="w-4 h-4" />
                                            {assignment.totalPoints || assignment.points || 0} points
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(assignment)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(assignment._id || assignment.id)}
                                        disabled={!assignment._id && !assignment.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

// Courses List Component
const CoursesList = ({ courses, onEdit, onDelete }) => {
    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No courses found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {courses.map((course, index) => (
                <motion.div
                    key={course._id || course.id || `course-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {course.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <User className="w-4 h-4" />
                                            {course.instructor || 'No instructor'}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {course.duration || 'No duration'}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                            {course.level || 'beginner'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(course)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(course._id || course.id)}
                                        disabled={!course._id && !course.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

// Assignment Form Component with Question Builder
const AssignmentForm = ({ formData, setFormData, onSubmit, submitting, error, onOpenAIModal, onOpenQuestionBank }) => {
    const [activeQuestionTab, setActiveQuestionTab] = useState('details'); // 'details' | 'questions'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Question management functions
    const addQuestion = (type) => {
        const newQuestion = {
            id: `q_${Date.now()}`,
            type, // 'mcq' | 'text' | 'code'
            text: '',
            points: 10,
            ...(type === 'mcq' && { options: ['', '', '', ''], correctOptionIndex: 0 }),
            ...(type === 'code' && { language: 'javascript', starterCode: '' })
        };
        setFormData(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQuestion]
        }));
    };

    const updateQuestion = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const updateMCQOption = (qIndex, optIndex, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === qIndex
                    ? { ...q, options: q.options.map((opt, oi) => oi === optIndex ? value : opt) }
                    : q
            )
        }));
    };

    const deleteQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const questions = formData.questions || [];

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveQuestionTab('details')}
                    className={`pb-2 px-4 font-medium transition-colors cursor-pointer ${activeQuestionTab === 'details'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    Assignment Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveQuestionTab('questions')}
                    className={`pb-2 px-4 font-medium transition-colors cursor-pointer ${activeQuestionTab === 'questions'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    Questions ({questions.length})
                </button>
            </div>


            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Details Tab */}
            {activeQuestionTab === 'details' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Assignment title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Course *</label>
                        <Input
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            required
                            placeholder="Course name or ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Brief description of the assignment"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Instructions</label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Detailed instructions for students"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Points *</label>
                            <Input
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Due Date *</label>
                            <Input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Tab */}
            {activeQuestionTab === 'questions' && (
                <div className="space-y-4">
                    {/* Add Question Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => addQuestion('mcq')}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add MCQ
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addQuestion('text')}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Text Question
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addQuestion('code')}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Coding Question
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenQuestionBank()}
                            className="flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Import from Bank
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onOpenAIModal()}
                            className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ml-auto"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate with AI
                        </Button>
                    </div>

                    {/* Questions List */}
                    {questions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">No questions added yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Click the buttons above to add questions</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {questions.map((q, index) => (
                                <div key={q.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white">Q{index + 1}</span>
                                            <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                {q.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => deleteQuestion(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Question Text */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium mb-1">Question Text *</label>
                                        <textarea
                                            value={q.text}
                                            onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                            placeholder="Enter your question here..."
                                            required
                                        />
                                    </div>

                                    {/* Points */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium mb-1">Points *</label>
                                        <Input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                                            min="1"
                                            className="w-24"
                                            required
                                        />
                                    </div>

                                    {/* MCQ Options */}
                                    {q.type === 'mcq' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium mb-2">Options</label>
                                            {q.options?.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={q.correctOptionIndex === optIndex}
                                                        onChange={() => updateQuestion(index, 'correctOptionIndex', optIndex)}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => updateMCQOption(index, optIndex, e.target.value)}
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        className="flex-1"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                            <p className="text-xs text-gray-500 mt-2">Select the correct answer by clicking the radio button</p>
                                        </div>
                                    )}

                                    {/* Code Question Settings */}
                                    {q.type === 'code' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Programming Language *</label>
                                                <select
                                                    value={q.language || 'javascript'}
                                                    onChange={(e) => updateQuestion(index, 'language', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="c">C</option>
                                                    <option value="go">Go</option>
                                                    <option value="rust">Rust</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Starter Code (Optional)</label>
                                                <textarea
                                                    value={q.starterCode || ''}
                                                    onChange={(e) => updateQuestion(index, 'starterCode', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-900 text-gray-100 font-mono text-sm"
                                                    placeholder="// Starter code for students..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                >
                    {submitting ? 'Saving...' : 'Save Assignment'}
                </Button>
            </div>
        </form>
    );
};

// Course Form Component
const CourseForm = ({ formData, setFormData, onSubmit, submitting, error }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
                    {error}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Course title"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Course description"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Instructor *</label>
                    <Input
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleChange}
                        required
                        placeholder="Instructor name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <Input
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 8 weeks"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Level *</label>
                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Programming, Design"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <Input
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                >
                    {submitting ? 'Saving...' : 'Save Course'}
                </Button>
            </div>
        </form>
    );
};

// Question Bank Modal Component
const QuestionBankWrapper = ({ showQuestionBank, setShowQuestionBank, onSelectQuestion, user }) => {
    return (
        <QuestionBankModal
            isOpen={showQuestionBank}
            onClose={() => setShowQuestionBank(false)}
            onSelectQuestion={onSelectQuestion}
            user={user}
        />
    );
};

// Hackathon List Component
const HackathonsList = ({ hackathons, onEdit, onDelete }) => {
    if (hackathons.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No hackathons found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {hackathons.map((hackathon, index) => (
                <motion.div
                    key={hackathon.id || hackathon._id || `hackathon-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {hackathon.title}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full uppercase ${hackathon.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                            hackathon.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {hackathon.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
                                        {hackathon.tagline}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(hackathon.hackathonStartDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <User className="w-4 h-4" />
                                            {hackathon.participantType === 'team' ? 'Team' : 'Individual'}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            DL: {new Date(hackathon.submissionDeadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(hackathon)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(hackathon.id || hackathon._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

// Hackathon Form Component
const HackathonForm = ({ formData, setFormData, onSubmit, submitting, error }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
                    {error}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Hackathon title"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <Input
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="Short, catchy tagline"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Full description"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Participant Type</label>
                    <select
                        name="participantType"
                        value={formData.participantType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="individual">Individual</option>
                        <option value="team">Team</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Hackathon Start *</label>
                    <Input
                        type="datetime-local"
                        name="hackathonStartDate"
                        value={formData.hackathonStartDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Submission Deadline *</label>
                    <Input
                        type="datetime-local"
                        name="submissionDeadline"
                        value={formData.submissionDeadline}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Registration Start *</label>
                    <Input
                        type="datetime-local"
                        name="registrationStartDate"
                        value={formData.registrationStartDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Registration End *</label>
                    <Input
                        type="datetime-local"
                        name="registrationEndDate"
                        value={formData.registrationEndDate}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                >
                    {submitting ? 'Saving...' : 'Save Hackathon'}
                </Button>
            </div>
        </form>
    );
};

export default Admin;
