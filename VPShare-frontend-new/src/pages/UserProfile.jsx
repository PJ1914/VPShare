
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonProfile } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import {
    User, Mail, MapPin, Link as LinkIcon, Github, Linkedin, Twitter,
    Camera, Edit2, Save, X, Award, BookOpen, Code, Zap,
    Calendar, Clock, TrendingUp, Share2, Settings, Loader2
} from 'lucide-react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const calculateStreaks = (dates) => {
    if (!dates || dates.length === 0) {
        return 0;
    }

    const uniqueDates = [...new Set(dates.map(d => new Date(d).setHours(0, 0, 0, 0)))];
    uniqueDates.sort((a, b) => b - a); // Sort descending

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);

    // If the most recent date is not today or yesterday, streak is 0
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    let currentDate = uniqueDates[0];

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const diff = (currentDate - prevDate) / 86400000; // Difference in days

        if (diff === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break; // Gap in streak
        }
    }
    return streak;
};

const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        location: '',
        website: '',
        social: { github: '', linkedin: '', twitter: '' }
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [stats, setStats] = useState({
        coursesCompleted: 0,
        totalCodeLines: 0,
        currentStreak: 0,
        totalLearningMinutes: 0
    });
    const [activityData, setActivityData] = useState([]);

    // Pagination Logic
    const [badgePage, setBadgePage] = useState(1);
    const badgesPerPage = 4; // Show 4 per page to demonstrate pagination

    const BADGES = [
        { name: 'First Steps', desc: 'Completed your first lesson', icon: '🚀', unlocked: true },
        { name: 'Code Warrior', desc: 'Wrote 1000 lines of code', icon: '⚔️', unlocked: true },
        { name: 'Bug Hunter', desc: 'Fixed 50 bugs', icon: '🐛', unlocked: false },
        { name: 'Night Owl', desc: 'Coded after midnight', icon: '🦉', unlocked: true },
        { name: 'Socialite', desc: 'Shared your profile', icon: '🌟', unlocked: false },
    ];

    const totalBadgePages = Math.ceil(BADGES.length / badgesPerPage);
    const currentBadges = BADGES.slice(
        (badgePage - 1) * badgesPerPage,
        badgePage * badgesPerPage
    );

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            // 1. Fetch User Profile
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfileData({
                    displayName: user.displayName || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    website: data.website || '',
                    social: data.social || { github: '', linkedin: '', twitter: '' }
                });
            } else {
                setProfileData(prev => ({ ...prev, displayName: user.displayName || '' }));
            }

            // 2. Fetch Engagement (Time & Activity)
            const engagementDocRef = doc(db, 'userEngagement', user.uid);
            const engagementDoc = await getDoc(engagementDocRef);
            const engagementData = engagementDoc.exists() ? engagementDoc.data() : {};
            const dailyMinutes = engagementData.dailyMinutes || {};
            const totalMinutes = engagementData.totalMinutes || 0;

            // 3. Fetch Progress (Courses & Code Lines)
            const progressQuery = query(
                collection(db, 'userProgress'),
                where('__name__', '>=', `${user.uid}_`),
                where('__name__', '<', `${user.uid}_\uf8ff`)
            );
            const progressSnap = await getDocs(progressQuery);

            let coursesCompleted = 0;
            let totalCodeLines = 0;
            const activityDates = new Set();

            // Add dates from dailyMinutes
            Object.keys(dailyMinutes).forEach(date => activityDates.add(date));

            progressSnap.forEach(doc => {
                const data = doc.data();
                if (data.completedSections && data.totalSections && data.completedSections.length >= data.totalSections) {
                    coursesCompleted++;
                }
                if (data.completedSections) {
                    totalCodeLines += data.completedSections.length * 50;
                }
                if (data.lastAccessed) {
                    const date = data.lastAccessed.toDate().toISOString().split('T')[0];
                    activityDates.add(date);
                }
            });

            // Calculate Streak
            const currentStreak = calculateStreaks(Array.from(activityDates));

            setStats({
                coursesCompleted,
                totalCodeLines,
                currentStreak,
                totalLearningMinutes: totalMinutes
            });

            // Prepare Activity Graph Data (Last 365 days)
            const today = new Date();
            const graphData = [];
            // We need 52 weeks * 7 days = 364 days to fill the grid perfectly
            for (let i = 363; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                let count = 0;
                const minutes = dailyMinutes[dateStr] || 0;

                if (minutes > 60) count = 4;
                else if (minutes > 30) count = 3;
                else if (minutes > 15) count = 2;
                else if (minutes > 0 || activityDates.has(dateStr)) count = 1;

                graphData.push({ date: dateStr, count });
            }
            setActivityData(graphData);

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);

            // Upload to Firebase Storage
            const storageRef = ref(storage, `profile/${user.uid}/avatar`);
            setSaving(true);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Update Profile
            await updateProfile(user, { photoURL: url });
            setSaving(false);
        } catch (error) {
            console.error("Error uploading image:", error);
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile(user, { displayName: profileData.displayName });

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                bio: profileData.bio,
                location: profileData.location,
                website: profileData.website,
                social: profileData.social
            }); // Note: setDoc with merge: true might be safer if doc doesn't exist

            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
                <div className="relative h-64 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                <SkeletonProfile />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
            {/* Header / Hero Section */}
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col md:flex-row items-start gap-8"
                >
                    {/* Profile Card */}
                    <motion.div variants={itemVariants} className="w-full md:w-80 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-gray-800">
                                <div className="relative mb-4 group">
                                    <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-gray-800 shadow-lg">
                                        <img
                                            src={previewImage || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                            <Camera className="w-4 h-4" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.displayName}
                                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                        className="text-xl font-bold text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 w-full mb-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Display Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profileData.displayName || 'User'}</h2>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                                {isEditing ? (
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                        {profileData.bio || "No bio yet. Click edit to add one!"}
                                    </p>
                                )}

                                <div className="flex gap-2 w-full">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 py-2 px-4 rounded-lg transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none px-1"
                                            placeholder="Location"
                                        />
                                    ) : (
                                        <span>{profileData.location || 'Earth, Milky Way'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <LinkIcon className="w-4 h-4" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.website}
                                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none px-1"
                                            placeholder="Website URL"
                                        />
                                    ) : (
                                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 truncate">
                                            {profileData.website || 'No website'}
                                        </a>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Social</h3>
                                    <div className="flex gap-4">
                                        {['github', 'linkedin', 'twitter'].map((platform) => (
                                            isEditing ? (
                                                <div key={platform} className="flex items-center gap-2 mb-2">
                                                    {platform === 'github' && <Github className="w-4 h-4" />}
                                                    {platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                                                    {platform === 'twitter' && <Twitter className="w-4 h-4" />}
                                                    <input
                                                        type="text"
                                                        value={profileData.social[platform]}
                                                        onChange={(e) => setProfileData({
                                                            ...profileData,
                                                            social: { ...profileData.social, [platform]: e.target.value }
                                                        })}
                                                        className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                                                        placeholder={`${platform} username`}
                                                    />
                                                </div>
                                            ) : (
                                                profileData.social[platform] && (
                                                    <a
                                                        key={platform}
                                                        href={`https://${platform}.com/${profileData.social[platform]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                                                    >
                                                        {platform === 'github' && <Github className="w-5 h-5" />}
                                                        {platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                                                        {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                                                    </a>
                                                )
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Stats Grid */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Courses', value: stats.coursesCompleted, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'Lines of Code', value: stats.totalCodeLines, icon: Code, color: 'text-green-500', bg: 'bg-green-500/10' },
                                { label: 'Day Streak', value: stats.currentStreak, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                                { label: 'Learning Hours', value: Math.round(stats.totalLearningMinutes / 60), icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            ].map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Activity Graph */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    Activity
                                </h3>
                                <select className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 outline-none">
                                    <option>Last Year</option>
                                    <option>Last 3 Months</option>
                                </select>
                            </div>

                            <div className="flex gap-1 overflow-x-auto pb-2">
                                {Array.from({ length: 52 }).map((_, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const dataIndex = weekIndex * 7 + dayIndex;
                                            const dayData = activityData[dataIndex] || { count: 0, date: '' };
                                            const colors = [
                                                'bg-gray-100 dark:bg-gray-800',
                                                'bg-green-200 dark:bg-green-900/40',
                                                'bg-green-300 dark:bg-green-800/60',
                                                'bg-green-400 dark:bg-green-600',
                                                'bg-green-500 dark:bg-green-500'
                                            ];
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`w-3 h-3 rounded-sm ${colors[dayData.count]}`}
                                                    title={`${dayData.date}: Level ${dayData.count}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </motion.div>

                        {/* Badges Section */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Badges & Achievements
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {currentBadges.map((badge, index) => (
                                    <div
                                        key={index}
                                        className={`group relative p-4 rounded-xl border ${badge.unlocked ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60'} flex flex-col items-center text-center transition-all hover:scale-105`}
                                    >
                                        <div className="text-3xl mb-2 filter drop-shadow-sm">{badge.icon}</div>
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{badge.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{badge.desc}</div>
                                        {!badge.unlocked && (
                                            <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">Locked</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={badgePage}
                                totalPages={totalBadgePages}
                                onPageChange={setBadgePage}
                                className="mt-6"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
