import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Video, Play, Plus, Trophy, Award, CheckCircle2, AlertCircle, X, FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Skeleton, LiveClassesSkeleton } from '../components/ui/Skeleton';
import { useLiveClassStore } from '../store';
import LiveClassCard from '../components/live-classes/LiveClassCard';
import SeriesCard from '../components/live-classes/SeriesCard';
import PlaylistPlayer from '../components/live-classes/PlaylistPlayer';
import { useLiveClass } from '../hooks/useLiveClass';
import axios from 'axios';

const LiveClasses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { fetchClasses, getLeaderboard } = useLiveClass();

    // Admin state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        category: '', // Grouping field
        startTime: '',
        durationMinutes: 60,
        meetingLink: '',
        recordingLink: ''
    });
    const [selectedSeries, setSelectedSeries] = useState(null);

    const liveClasses = useLiveClassStore(state => state.liveClasses);
    const leaderboard = useLiveClassStore(state => state.leaderboard);
    const loading = useLiveClassStore(state => state.loading);

    const [activeTab, setActiveTab] = useState('upcoming');


    const [isAdmin, setIsAdmin] = useState(false);

    // Create stable axios instance
    const api = useMemo(() => {
        return axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        });
    }, []);

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

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                setIsAdmin(tokenResult.claims.admin === true);
            }
        };
        checkAdmin();
    }, [user]);

    const loadData = async () => {
        try {
            await Promise.all([
                fetchClasses().catch(e => console.error("Error fetching classes:", e)),
                getLeaderboard().catch(e => console.error("Error fetching leaderboard:", e))
            ]);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    // Filter Logic
    const now = new Date();

    // 1. Upcoming Classes (Ungrouped) - Includes future classes OR past classes not yet marked completed/recorded
    const upcoming = liveClasses
        .filter(c => {
            const endTime = new Date(new Date(c.startTime).getTime() + (c.durationMinutes || 60) * 60000);
            return (endTime > now || (c.status !== 'completed' && !c.recordingLink)) && c.status !== 'completed';
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // 2. Recorded Classes (Grouped by Category/Series)
    const recordedRaw = liveClasses
        .filter(c => {
            const endTime = new Date(new Date(c.startTime).getTime() + (c.durationMinutes || 60) * 60000);
            return endTime < now || c.status === 'completed' || c.recordingLink;
        });

    // Grouping Logic
    const groupedSeries = useMemo(() => {
        const groups = {};
        recordedRaw.forEach(cls => {
            // Priority: 'category' field -> inferred from title prefix -> "Uncategorized"
            let groupName = cls.category || 'General Recordings';

            // Try to infer specific series if category is missing
            if (!cls.category) {
                if (cls.title.includes('Python')) groupName = 'Python Mastery';
                else if (cls.title.includes('React')) groupName = 'React JS';
                else if (cls.title.includes('Git')) groupName = 'Git & GitHub';
                else if (cls.title.includes('AWS')) groupName = 'Cloud Computing (AWS)';
            }

            if (!groups[groupName]) {
                groups[groupName] = { name: groupName, videos: [] };
            }
            groups[groupName].videos.push(cls);
        });

        return Object.values(groups).sort((a, b) => b.videos.length - a.videos.length);
    }, [recordedRaw]);

    // Admin Actions
    const openCreateModal = () => {
        setEditingClass(null);
        setError('');
        setSuccess('');
        setFormData({
            title: '',
            category: '',
            startTime: '',
            durationMinutes: 60,
            meetingLink: '',
            recordingLink: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (classData) => {
        setEditingClass(classData);
        setError('');
        setSuccess('');
        setFormData({
            title: classData.title || '',
            category: classData.category || '',
            startTime: new Date(classData.startTime).toISOString().slice(0, 16),
            durationMinutes: classData.durationMinutes || 60,
            meetingLink: classData.meetingLink || '',
            recordingLink: classData.recordingLink || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!api) return;

        setError('');
        setSuccess('');

        try {
            const payload = {
                title: formData.title,
                category: formData.category, // Added category
                startTime: new Date(formData.startTime).toISOString(),
                durationMinutes: Number(formData.durationMinutes),
                meetingLink: formData.meetingLink,
                recordingLink: formData.recordingLink || null,
                status: formData.recordingLink ? 'completed' : 'scheduled'
            };

            if (editingClass) {
                await api.put(
                    `/live-classes/${editingClass.id}?startTime=${encodeURIComponent(editingClass.startTime)}`,
                    payload
                );
                setSuccess('Class updated successfully!');
            } else {
                await api.post('/live-classes', payload);
                setSuccess('Class scheduled successfully!');
            }

            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving class:', error);
            setError(error.response?.data?.error || 'Failed to save class');
        }
    };

    const handleDelete = async (classData) => {
        if (!api || !window.confirm(`Delete "${classData.title}"?`)) return;
        try {
            await api.delete(`/live-classes/${classData.id}?startTime=${encodeURIComponent(classData.startTime)}`);
            setSuccess('Class deleted successfully!');
            loadData();
        } catch (error) {
            console.error('Error deleting class:', error);
            setError('Failed to delete class');
        }
    };

    const handleEnterClassroom = (classId) => navigate(`/courses/live-classes/${classId}`);

    if (loading && liveClasses.length === 0) {
        return <LiveClassesSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Playlist Player Overlay */}
                <PlaylistPlayer
                    series={selectedSeries}
                    onClose={() => setSelectedSeries(null)}
                    onReviewNotes={handleEnterClassroom}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Live Classes & Webinars
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join interactive sessions and watch recordings
                        </p>
                    </div>
                    {isAdmin && (
                        <Button onClick={openCreateModal} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="w-5 h-5" />
                            Schedule Class
                        </Button>
                    )}
                </div>

                {/* ... Notifications ... */}

                {/* Tabs */}
                <div className="mb-8 flex gap-2 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${activeTab === 'upcoming'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Video className="w-4 h-4" />
                        Upcoming ({upcoming.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('recorded')}
                        className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${activeTab === 'recorded'
                            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Play className="w-4 h-4" />
                        Recorded Library
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${activeTab === 'leaderboard'
                            ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'upcoming' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.length === 0 ? (
                            <Card className="col-span-full p-12 text-center">
                                <Video className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming classes</p>
                            </Card>
                        ) : (
                            upcoming.map((cls) => (
                                <LiveClassCard
                                    key={cls.id}
                                    classData={cls}
                                    isAdmin={isAdmin}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    onEnterClassroom={handleEnterClassroom}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'recorded' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedSeries.length === 0 ? (
                            <Card className="col-span-full p-12 text-center">
                                <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No recordings library yet</p>
                            </Card>
                        ) : (
                            groupedSeries.map((series) => (
                                <SeriesCard
                                    key={series.name}
                                    series={series}
                                    onClick={setSelectedSeries}
                                    isAdmin={isAdmin}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Leaderboard Tab Content omitted for brevity but preserved in real DOM */}
                {activeTab === 'leaderboard' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <span>Global Standings</span>
                            </h2>
                            <p className="text-gray-400">Compete with peers and earn XP by attending live sessions.</p>
                        </div>

                        {leaderboard.length === 0 ? (
                            <Card className="p-12 text-center bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                                <div className="relative inline-block mb-6">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                                    <Trophy className="w-24 h-24 text-blue-500 relative z-10 mx-auto" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Leaderboard is Empty</h3>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Be the first to claim your spot! Mark your attendance in upcoming classes to start earning XP.
                                </p>
                                <Button
                                    onClick={() => setActiveTab('upcoming')}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-900/20"
                                >
                                    Join a Class
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Podium for Top 3 */}
                                {leaderboard.length >= 3 && (
                                    <div className="flex items-end justify-center gap-4 mb-12 sm:gap-6">
                                        {/* 2nd Place */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-300 bg-gray-800 overflow-hidden relative mb-2 shadow-lg">
                                                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-500 bg-gray-900">
                                                    {(leaderboard[1].userName || 'User').charAt(0)}
                                                </div>
                                            </div>
                                            <div className="bg-gray-800 border border-gray-700 rounded-t-lg w-20 sm:w-24 h-24 flex flex-col items-center justify-center relative">
                                                <span className="text-2xl font-bold text-gray-400">2</span>
                                                <span className="text-xs text-blue-400 font-bold mt-1">{leaderboard[1].totalXP} XP</span>
                                            </div>
                                            <p className="mt-2 font-medium text-gray-300 text-sm max-w-[100px] truncate">{leaderboard[1].userName || 'User'}</p>
                                        </div>

                                        {/* 1st Place */}
                                        <div className="flex flex-col items-center -mt-8 relative z-10">
                                            <div className="absolute -top-12 text-4xl">👑</div>
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-500 bg-gray-800 overflow-hidden relative mb-2 shadow-xl shadow-yellow-500/20">
                                                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-yellow-500 bg-gray-900">
                                                    {(leaderboard[0].userName || 'User').charAt(0)}
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 border-t border-yellow-400 rounded-t-lg w-24 sm:w-32 h-32 flex flex-col items-center justify-center relative shadow-lg">
                                                <span className="text-4xl font-bold text-white">1</span>
                                                <span className="text-sm text-yellow-200 font-bold mt-2">{leaderboard[0].totalXP} XP</span>
                                            </div>
                                            <p className="mt-2 font-bold text-yellow-500 text-base max-w-[120px] truncate">{leaderboard[0].userName || 'User'}</p>
                                        </div>

                                        {/* 3rd Place */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-700 bg-gray-800 overflow-hidden relative mb-2 shadow-lg">
                                                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-orange-700 bg-gray-900">
                                                    {(leaderboard[2].userName || 'User').charAt(0)}
                                                </div>
                                            </div>
                                            <div className="bg-gray-800 border border-gray-700 rounded-t-lg w-20 sm:w-24 h-20 flex flex-col items-center justify-center relative">
                                                <span className="text-2xl font-bold text-orange-700">3</span>
                                                <span className="text-xs text-blue-400 font-bold mt-1">{leaderboard[2].totalXP} XP</span>
                                            </div>
                                            <p className="mt-2 font-medium text-gray-300 text-sm max-w-[100px] truncate">{leaderboard[2].userName || 'User'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* List for All (or remaining) */}
                                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                                    {leaderboard.map((entry, index) => {
                                        // Robust ID comparison and fallback
                                        const currentUserId = user?.uid ? String(user.uid) : null;
                                        const entryUserId = entry.userId ? String(entry.userId) : null;
                                        const isCurrentUser = currentUserId && entryUserId && currentUserId === entryUserId;

                                        // Determine display name
                                        let displayName = entry.userName || entry.username;
                                        if (!displayName) {
                                            if (isCurrentUser) {
                                                displayName = user.displayName || user.email?.split('@')[0] || 'You';
                                            } else {
                                                displayName = `Student ${entryUserId?.slice(0, 4) || '???'}`;
                                            }
                                        }

                                        const initial = displayName.charAt(0).toUpperCase();

                                        return (
                                            <div
                                                key={entry.userId || index}
                                                className={`flex items-center gap-4 p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors ${isCurrentUser ? 'bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                    }`}
                                            >
                                                <div className={`w-8 font-bold text-center ${index === 0 ? 'text-yellow-500' :
                                                    index === 1 ? 'text-gray-400' :
                                                        index === 2 ? 'text-orange-700' : 'text-gray-600'
                                                    }`}>
                                                    #{index + 1}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold border border-gray-700">
                                                    {initial}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-gray-200'}`}>
                                                        {displayName} {isCurrentUser && '(You)'}
                                                    </h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-blue-500">{entry.totalXP}</div>
                                                    <div className="text-xs text-gray-500">XP Points</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 z-10">
                            <div className="p-6">
                                <div className="flex justify-between mb-6">
                                    <h2 className="text-2xl font-bold">{editingClass ? 'Edit Class' : 'Schedule Class'}</h2>
                                    <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
                                </div>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Class Title</label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Intro to Python"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Series Name / Category</label>
                                        <Input
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Python Mastery, AWS Cloud"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">This groups recordings into a folder.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date & Time</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Duration (min)</label>
                                            <Input
                                                type="number"
                                                value={formData.durationMinutes}
                                                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Meeting Link</label>
                                        <Input
                                            value={formData.meetingLink}
                                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {editingClass && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Recording Link</label>
                                            <Input
                                                value={formData.recordingLink}
                                                onChange={(e) => setFormData({ ...formData, recordingLink: e.target.value })}
                                                placeholder="YouTube/Vimeo URL"
                                            />
                                        </div>
                                    )}
                                    <div className="pt-4 flex gap-3">
                                        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Save Class</Button>
                                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveClasses;
