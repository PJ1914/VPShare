import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Calendar, CheckCircle, Clock, AlertCircle,
    Upload, Search, Filter, ChevronRight, X, Plus, Edit2, Trash2, Shield, Code2, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import AnimatedCardStack from '../components/ui/AnimatedCardStack';
import axios from 'axios';
import useAssignmentStore from '../store/useAssignmentStore';

const Assignments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Zustand store
    const {
        assignments,
        loading,
        fetchAssignments,
        addAssignment,
        updateAssignment,
        deleteAssignment
    } = useAssignmentStore();

    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // State for admin actions
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminAction, setAdminAction] = useState(null); // 'create' | 'edit' | 'delete'
    const [submitting, setSubmitting] = useState(false);
    const [error, setLocalError] = useState(''); // Local error for modal actions

    // Form Data for Admin
    const [formData, setFormData] = useState({
        title: '',
        course: '',
        description: '',
        points: 100,
        dueDate: ''
    });

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
                if (user.email === 'admin@example.com' || user.claims?.admin) setIsAdmin(true);
            }
            return config;
        });
        return () => api.interceptors.request.eject(interceptor);
    }, [user, api]);

    // Fetch assignments
    useEffect(() => {
        if (!user) return;
        fetchAssignments(api).catch(err => console.error(err));
    }, [user, fetchAssignments, api]);

    // Admin: Create assignment
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setLocalError('');
        try {
            const res = await api.post('/assignments', formData);
            addAssignment(res.data);
            setShowAdminModal(false);
            resetForm();
        } catch (error) {
            console.error("Create failed:", error);
            setLocalError(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin: Update assignment
    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        setSubmitting(true);
        setLocalError('');
        try {
            const assignmentId = selectedAssignment.id || selectedAssignment._id;
            const res = await api.put(`/assignments/${assignmentId}`, formData);
            updateAssignment(assignmentId, res.data);
            setShowAdminModal(false);
            setSelectedAssignment(null);
            resetForm();
        } catch (error) {
            console.error("Update failed:", error);
            setLocalError(error.response?.data?.message || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin: Delete assignment
    const handleDeleteAssignment = async () => {
        if (!selectedAssignment) return;

        setSubmitting(true);
        setLocalError('');
        try {
            const assignmentId = selectedAssignment.id || selectedAssignment._id;
            await api.delete(`/assignments/${assignmentId}`);
            deleteAssignment(assignmentId);
            setShowAdminModal(false);
            setSelectedAssignment(null);
        } catch (error) {
            console.error("Delete failed:", error);
            setLocalError(error.response?.data?.message || 'Failed to delete assignment');
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
        setLocalError('');
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

    // Prepare items for Stack View (Pending Only)
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const stackItems = pendingAssignments.map(a => ({
        id: a.id || a._id,
        title: a.title,
        description: a.description,
        tag: a.course,
        footerText: `Due: ${new Date(a.dueDate).toLocaleDateString()}`
    }));


    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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
            case 'pending': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'submitted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'graded': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'overdue': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    if (loading && assignments.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-12 w-64 rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section - Matched to CourseList */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Assignments
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    {isAdmin && (
                        <Button
                            onClick={() => openAdminModal('create')}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 px-6 py-2.5 rounded-xl transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">Create Assignment</span>
                        </Button>
                    )}
                </div>

                {/* PRO STACK VIEW for Pending Assignments (Kept as is, but adjusted spacing) */}
                {!loading && stackItems.length > 0 && (
                    <div className="w-full flex flex-col items-center animate-in slide-in-from-top-4 duration-700 fade-in mb-8">
                        <AnimatedCardStack
                            items={stackItems}
                            onAction={(item) => navigate(`/courses/assignments/${item.id}`)}
                        />
                    </div>
                )}

                {/* Filters & Search Bar - Redesigned to match CourseList sizing */}
                <div className="sticky top-20 z-30 w-full transition-all duration-300 pointer-events-none">
                    <div className="pointer-events-auto relative group bg-white dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg shadow-gray-200/40 dark:shadow-black/40 border border-gray-200 dark:border-gray-800 p-1.5 flex items-center gap-2 max-w-7xl mx-auto">

                        {/* Search Input Area */}
                        <div className="flex-1 flex items-center relative h-12 px-2">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors ml-2" />
                            <input
                                type="text"
                                placeholder="Search assignments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full pl-3 pr-4 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-base font-medium rounded-xl"
                            />
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />

                        {/* Filter Dropdown (Custom, Interactive) */}
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="h-12 pl-4 pr-10 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 select-none min-w-[170px]"
                            >
                                <span className="capitalize">{filter === 'all' ? 'All Assignments' : filter}</span>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Filter className="w-4 h-4" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <>
                                        {/* Backdrop to close on click outside */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsFilterOpen(false)}
                                        />

                                        {/* Dropdown Menu */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-black/20 border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
                                        >
                                            <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2">Filter By Status</span>
                                            </div>
                                            {['all', 'pending', 'submitted', 'graded'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setFilter(option);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all flex items-center justify-between group mx-1 rounded-lg w-[calc(100%-8px)] ${filter === option
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                >
                                                    <span className="capitalize">{option === 'all' ? 'All Assignments' : option}</span>
                                                    {filter === option && (
                                                        <motion.div layoutId="check">
                                                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Filter (Native fallback) */}
                        <div className="sm:hidden pr-1 relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="h-10 pl-3 pr-8 appearance-none bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-200 text-sm font-medium border-none outline-none"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="graded">Graded</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <Filter className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignments Grid - Matched to CourseList Card Style */}
                <AnimatePresence mode="wait">
                    {filteredAssignments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
                        >
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No assignments found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentAssignments.map((assignment, index) => (
                                <motion.div
                                    key={assignment.id || assignment._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <div className="group h-full bg-white dark:bg-gray-900 rounded-xl border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">

                                        <div className="p-6 space-y-4">
                                            {/* Header Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                                                        <Code2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {assignment.course}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${getStatusColor(assignment.status)}`}>
                                                    {assignment.status}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {assignment.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {assignment.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mt-4">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <Award className="w-4 h-4" />
                                                    <span>{assignment.points || assignment.totalPoints || 0} pts</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6">
                                            {isAdmin ? (
                                                <div className="flex gap-2 w-full">
                                                    <Button
                                                        variant="ghost"
                                                        className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                        onClick={() => openAdminModal('edit', assignment)}
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="flex-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                                        onClick={() => openAdminModal('delete', assignment)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => navigate(`/courses/assignments/${assignment.id || assignment._id}`)}
                                                    className={`w-full group-hover:-translate-y-0.5 transition-transform ${assignment.status === 'pending'
                                                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black hover:shadow-lg'
                                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {assignment.status === 'pending' ? 'Start Assignment' : 'View Details'}
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                <div className="mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Admin Modal - Unchanged logic, just ensure styling consistency */}
            <AnimatePresence>
                {showAdminModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {adminAction === 'create' && 'New Assignment'}
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
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                                    </div>
                                )}

                                {adminAction === 'delete' ? (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <p className="text-gray-900 dark:text-white font-medium mb-1">
                                                Confirm Deletion
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Are you sure you want to delete <span className="font-bold">"{selectedAssignment?.title}"</span>? This action is irreversible.
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
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={adminAction === 'create' ? handleCreateAssignment : handleUpdateAssignment} className="space-y-5">
                                        <Input
                                            label="Assignment Title"
                                            type="text"
                                            required
                                            placeholder="Overview of React Hooks"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        <Input
                                            label="Course Name"
                                            type="text"
                                            required
                                            placeholder="Frontend Development"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        />
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                required
                                                placeholder="Enter detailed instructions..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <Input
                                                label="Total Points"
                                                type="number"
                                                required
                                                min="1"
                                                placeholder="100"
                                                value={formData.points}
                                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                label="Due Date"
                                                type="date"
                                                required
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
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
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {adminAction === 'create' ? 'Create' : 'Save Changes'}
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
