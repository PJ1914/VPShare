import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Calendar, CheckCircle, Clock, AlertCircle,
    Upload, Search, Filter, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const Assignments = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionLink, setSubmissionLink] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mock data for fallback
    const MOCK_ASSIGNMENTS = [
        {
            id: '1',
            title: 'Build a Responsive Portfolio',
            course: 'Web Development 101',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            status: 'pending',
            description: 'Create a personal portfolio website using HTML, CSS, and JavaScript. It must be responsive and include a contact form.',
            points: 100
        },
        {
            id: '2',
            title: 'React State Management',
            course: 'Advanced React',
            dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            status: 'submitted',
            description: 'Implement a shopping cart using React Context API. Handle adding, removing, and updating quantities.',
            points: 50
        },
        {
            id: '3',
            title: 'API Integration Task',
            course: 'Backend Mastery',
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            status: 'pending',
            description: 'Fetch data from a public API and display it in a card layout. Implement search and pagination.',
            points: 75
        }
    ];

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                // In a real app, fetch from Firestore
                // const q = query(collection(db, 'assignments'), where('userId', '==', user.uid));
                // const querySnapshot = await getDocs(q);
                // const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // setAssignments(data.length ? data : MOCK_ASSIGNMENTS);

                // Simulating network delay
                setTimeout(() => {
                    setAssignments(MOCK_ASSIGNMENTS);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error fetching assignments:", error);
                setLoading(false);
            }
        };

        if (user) {
            fetchAssignments();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionLink) return;

        setSubmitting(true);
        try {
            // Simulate submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update local state
            setAssignments(prev => prev.map(a =>
                a.id === selectedAssignment.id
                    ? { ...a, status: 'submitted' }
                    : a
            ));

            setSelectedAssignment(null);
            setSubmissionLink('');
            // Show success toast (omitted for brevity)
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || assignment.status === filter;
        return matchesSearch && matchesFilter;
    });

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
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Assignments
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track and submit your course assignments
                        </p>
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
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredAssignments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800"
                            >
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assignments found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search term</p>
                            </motion.div>
                        ) : (
                            filteredAssignments.map((assignment) => (
                                <motion.div
                                    key={assignment.id}
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
                                                        <span>{assignment.points} Points</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end md:border-l md:border-gray-100 md:dark:border-gray-800 md:pl-6">
                                                {assignment.status === 'pending' ? (
                                                    <Button onClick={() => setSelectedAssignment(assignment)}>
                                                        Submit Assignment
                                                        <ChevronRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                                                        View Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && (
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
                                    onClick={() => setSelectedAssignment(null)}
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

                                {selectedAssignment.status === 'pending' ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Submission Link (GitHub/Replit)
                                            </label>
                                            <div className="relative">
                                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="url"
                                                    required
                                                    placeholder="https://github.com/username/repo"
                                                    value={submissionLink}
                                                    onChange={(e) => setSubmissionLink(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setSelectedAssignment(null)}
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
        </div>
    );
};

export default Assignments;
