import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, AlertCircle, X, Calendar,
    Users, IndianRupee, FileSpreadsheet, Loader2,
    CheckCircle, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import {
    getEventRegistrations,
    exportRegistrationsToCSV,
    downloadCSV
} from '../services/eventService';

const AdminEventRegistrations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [isAdmin, setIsAdmin] = useState(false);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [exporting, setExporting] = useState(false);

    // Check admin status
    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setIsAdmin(
                        tokenResult.claims.role === 'admin' ||
                        tokenResult.claims.admin === true
                    );
                } catch (err) {
                    console.error('Error checking admin status:', err);
                    setIsAdmin(false);
                }
            }
        };
        checkAdmin();
    }, [user]);

    // Fetch registrations
    useEffect(() => {
        if (!user || !isAdmin) return;

        const fetchRegistrations = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getEventRegistrations();
                setRegistrations(data);
            } catch (err) {
                console.error('Error fetching registrations:', err);
                setError(err.message || 'Failed to load registrations');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, [user, isAdmin]);

    // Filtered + sorted data
    const filteredRegistrations = useMemo(() => {
        let result = registrations;

        // Filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((reg) => {
                switch (searchField) {
                    case 'name':
                        return reg.fullName?.toLowerCase().includes(term);
                    case 'email':
                        return reg.email?.toLowerCase().includes(term);
                    case 'rollNumber':
                        return reg.rollNumber?.toLowerCase().includes(term);
                    case 'college':
                        return reg.collegeName?.toLowerCase().includes(term);
                    default:
                        return (
                            reg.fullName?.toLowerCase().includes(term) ||
                            reg.email?.toLowerCase().includes(term) ||
                            reg.rollNumber?.toLowerCase().includes(term) ||
                            reg.collegeName?.toLowerCase().includes(term) ||
                            reg.phone?.includes(term)
                        );
                }
            });
        }

        // Sort
        result = [...result].sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'createdAt') {
                aVal = aVal instanceof Date ? aVal : new Date(aVal);
                bVal = bVal instanceof Date ? bVal : new Date(bVal);
            }
            if (sortField === 'amountPaid') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            }

            if (typeof aVal === 'string') {
                return sortDir === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return result;
    }, [registrations, searchTerm, searchField, sortField, sortDir]);

    // Stats
    const stats = useMemo(() => {
        const total = registrations.length;
        const totalRevenue = registrations.reduce(
            (sum, reg) => sum + (Number(reg.amountPaid) || 0),
            0
        );
        const courseBreakdown = registrations.reduce((acc, reg) => {
            const course = reg.courseSelected || 'Unknown';
            acc[course] = (acc[course] || 0) + 1;
            return acc;
        }, {});
        return { total, totalRevenue, courseBreakdown };
    }, [registrations]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const csv = exportRegistrationsToCSV(filteredRegistrations);
            const now = new Date().toISOString().slice(0, 10);
            downloadCSV(csv, `event_registrations_${now}.csv`);
        } catch (err) {
            setError('Failed to export CSV');
        }
        setExporting(false);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === 'asc' ? (
            <ChevronUp className="w-3 h-3 inline ml-1" />
        ) : (
            <ChevronDown className="w-3 h-3 inline ml-1" />
        );
    };

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
                            You do not have permission to access this page.
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
                    <button
                        onClick={() => navigate('/admin/assignments')}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 cursor-pointer transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin Panel
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Event Registrations
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage all event course registrations
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
                            <button
                                onClick={() => setError('')}
                                className="ml-auto cursor-pointer"
                            >
                                <X className="w-5 h-5 text-red-500" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Registrations
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₹{stats.totalRevenue.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Courses Breakdown
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(stats.courseBreakdown).map(([course, count]) => (
                                        <span
                                            key={course}
                                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                                        >
                                            {course}: {count}
                                        </span>
                                    ))}
                                    {Object.keys(stats.courseBreakdown).length === 0 && (
                                        <span className="text-sm text-gray-400">No data</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search registrations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="all">All Fields</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="rollNumber">Roll Number</option>
                            <option value="college">College</option>
                        </select>
                    </div>
                    <Button
                        onClick={handleExportCSV}
                        variant="secondary"
                        disabled={exporting || filteredRegistrations.length === 0}
                        className="flex items-center gap-2"
                    >
                        {exporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                        )}
                        Export CSV
                    </Button>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Showing {filteredRegistrations.length} of {registrations.length} registrations
                </p>

                {/* Table */}
                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16" />
                        ))}
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm
                                    ? 'No registrations match your search'
                                    : 'No event registrations yet'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                        {[
                                            { key: 'fullName', label: 'Name' },
                                            { key: 'rollNumber', label: 'Roll No' },
                                            { key: 'collegeName', label: 'College' },
                                            { key: 'email', label: 'Email' },
                                            { key: 'phone', label: 'Phone' },
                                            { key: 'courseSelected', label: 'Course' },
                                            { key: 'amountPaid', label: 'Amount' },
                                            { key: 'createdAt', label: 'Date' }
                                        ].map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none whitespace-nowrap"
                                            >
                                                {col.label}
                                                <SortIcon field={col.key} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistrations.map((reg, index) => (
                                        <motion.tr
                                            key={reg.id || index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {reg.fullName}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {reg.rollNumber}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={reg.collegeName}>
                                                {reg.collegeName}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {reg.email}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {reg.phone}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                    {reg.courseSelected}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    ₹{Number(reg.amountPaid).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {reg.createdAt instanceof Date
                                                    ? reg.createdAt.toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : new Date(reg.createdAt).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }
                                                    )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminEventRegistrations;
