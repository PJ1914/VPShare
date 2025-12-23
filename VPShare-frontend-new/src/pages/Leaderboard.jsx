import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ArrowLeft, Crown, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import axios from 'axios';

const Leaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignmentTitle, setAssignmentTitle] = useState('');

    // Create axios instance
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

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user || !id) return;

            setLoading(true);
            try {
                const res = await api.get(`/assignments/${id}/leaderboard`);
                setLeaders(res.data || []);
                
                // Optionally fetch assignment title
                const assignmentRes = await api.get('/assignments');
                const assignment = (assignmentRes.data || []).find(a => (a.id || a._id) === id);
                if (assignment) {
                    setAssignmentTitle(assignment.title);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setError(error.response?.data?.message || 'Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user, id]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Medal className="w-6 h-6 text-orange-400" />;
            default: return <Award className="w-5 h-5 text-gray-400" />;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900';
            case 3: return 'bg-gradient-to-r from-orange-300 to-orange-400 text-gray-900';
            default: return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(`/courses/assignments/${id}`)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Assignment</span>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                            Leaderboard
                        </h1>
                    </div>
                    {assignmentTitle && (
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {assignmentTitle}
                        </p>
                    )}
                </motion.div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                    {leaders.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">No submissions yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {leaders.map((leader, index) => {
                                        const isCurrentUser = leader.userId === user?.uid;
                                        return (
                                            <motion.tr
                                                key={leader.userId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`${
                                                    isCurrentUser 
                                                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                } transition-colors`}
                                            >
                                                {/* Rank */}
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getRankBg(leader.rank)}`}>
                                                        {getRankIcon(leader.rank)}
                                                        <span className="font-bold text-lg">#{leader.rank}</span>
                                                    </div>
                                                </td>

                                                {/* Student */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                                            {leader.userId.substring(0, 8)}...
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Score */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {leader.score} pts
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        leader.status === 'Graded' 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                        {leader.status}
                                                    </span>
                                                </td>

                                                {/* Submitted */}
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {leader.submittedAt 
                                                        ? new Date(leader.submittedAt).toLocaleString()
                                                        : 'N/A'}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Leaderboard;
