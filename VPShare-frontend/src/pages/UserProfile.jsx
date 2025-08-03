import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Typography, Button, Avatar, TextField, IconButton, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Box, Chip,
  LinearProgress, Tooltip, Snackbar, Alert, Switch, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon, Share as ShareIcon, Refresh as RefreshIcon,
  School as SchoolIcon, Code as CodeIcon, Timer as TimerIcon,
  LocalFireDepartment as LocalFireDepartmentIcon, EmojiEvents as EmojiEventsIcon,
  BarChart as BarChartIcon, GitHub as GitHubIcon, LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon, Link as LinkIcon, Settings as SettingsIcon,
  FileDownload as FileDownloadIcon, CheckCircle as CheckCircleIcon,
  WorkspacePremium as WorkspacePremiumIcon, MilitaryTech as MilitaryTechIcon,
  Whatshot as StreakIcon, TrendingUp as TrendingUpIcon, CalendarToday as ActivityIcon
} from '@mui/icons-material';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { useSubscription } from '../contexts/SubscriptionContext';
import './UserProfile.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Utility functions
const calculateStreaks = (activityDates) => {
  if (!activityDates.length) return { currentStreak: 0, longestStreak: 0 };
  
  const sortedDates = activityDates.map(d => new Date(d)).sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Check for current streak
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const mostRecentDate = sortedDates[0];
  
  if (mostRecentDate.getTime() === today.getTime() || mostRecentDate.getTime() === yesterday.getTime()) {
    let checkDate = new Date(today);
    for (const date of sortedDates) {
      if (date.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = (sortedDates[i - 1] - sortedDates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
};

const getStreakCalendarData = (activityDates, dailyMinutes, days = 365) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendar = [];
  const activitySet = new Set(activityDates);
  
  // Calculate start date to align with Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  
  // Adjust to start from Sunday
  const startDayOfWeek = startDate.getDay();
  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setDate(startDate.getDate() - startDayOfWeek);
  
  // Calculate total cells needed (must be multiple of 7)
  const totalDays = days + startDayOfWeek;
  const totalWeeks = Math.ceil(totalDays / 7);
  const totalCells = totalWeeks * 7;

  // Generate month labels
  const monthLabels = [];
  const monthMap = new Map();
  
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(adjustedStartDate);
    d.setDate(adjustedStartDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const minutes = dailyMinutes[dateStr] || 0;
    
    // Only count activity if date is within our target range
    const isInRange = d >= startDate && d <= today;
    const isActive = isInRange && activitySet.has(dateStr);
    
    let level = 0;
    if (isInRange && minutes > 0) {
      if (minutes >= 60) level = 4;
      else if (minutes >= 30) level = 3;
      else if (minutes >= 10) level = 2;
      else if (minutes >= 1) level = 1;
    }

    // Track months for labels
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const weekIndex = Math.floor(i / 7);
    if (!monthMap.has(monthKey) && i < 7) {
      monthMap.set(monthKey, weekIndex);
      monthLabels.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        week: weekIndex
      });
    }

    calendar.push({ 
      date: dateStr, 
      active: isActive, 
      level, 
      minutes,
      isInRange,
      dayOfWeek: d.getDay(),
      weekOfYear: weekIndex
    });
  }

  return { calendar, monthLabels, totalWeeks };
};

const formatMinutes = (mins) => {
  if (!mins || mins < 1) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
};

const formatLargeNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const StatCard = ({ label, value, icon, trend, color = 'default' }) => (
  <motion.div 
    className={`stat-card stat-card-${color}`} 
    variants={cardVariants}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {trend && <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>}
    </div>
  </motion.div>
);

const BadgeCard = ({ badge }) => (
  <Tooltip title={badge.desc} arrow placement="top">
    <motion.div 
      className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'} rarity-${badge.rarity}`} 
      variants={cardVariants}
      whileHover={badge.unlocked ? { scale: 1.05, y: -3 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className="badge-icon">
        {badge.icon}
      </div>
      <div className="badge-content">
        <div className="badge-label">{badge.label}</div>
        <div className="badge-category">{badge.category}</div>
        {badge.unlocked && (
          <motion.div 
            className="badge-unlocked"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircleIcon fontSize="small" />
            Unlocked!
          </motion.div>
        )}
      </div>
    </motion.div>
  </Tooltip>
);

// Streak Calendar Component  
const StreakCalendar = ({ calendar, monthLabels, totalWeeks, selectedRange, onRangeChange }) => (
  <div className="streak-calendar-container">
    <div className="calendar-header">
      <div className="calendar-title">
        <ActivityIcon />
        <span>Activity Calendar</span>
      </div>
      <div className="calendar-controls">
        <Button 
          size="small" 
          variant={selectedRange === 365 ? "contained" : "outlined"}
          onClick={() => onRangeChange(365)}
        >
          1 Year
        </Button>
        <Button 
          size="small" 
          variant={selectedRange === 90 ? "contained" : "outlined"}
          onClick={() => onRangeChange(90)}
        >
          3 Months
        </Button>
      </div>
    </div>
    
    <div className="calendar-grid">
      {/* Day labels */}
      <div className="day-labels">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}
      </div>
      
      {/* Month labels */}
      <div className="month-labels">
        {monthLabels.map((month, index) => (
          <div 
            key={index} 
            className="month-label"
            style={{ gridColumn: `${month.week + 1} / span 1` }}
          >
            {month.month}
          </div>
        ))}
      </div>
      
      {/* Calendar cells */}
      <div className="calendar-cells">
        {calendar.map((day, index) => (
          <Tooltip 
            key={index}
            title={
              day.isInRange 
                ? `${day.date}: ${day.minutes} minutes${day.active ? ' (Active)' : ''}`
                : 'Outside range'
            }
            arrow
          >
            <motion.div
              className={`calendar-cell level-${day.level} ${day.active ? 'active' : ''}`}
              whileHover={{ 
                scale: 1.2, 
                zIndex: 10,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
              }}
              transition={{ duration: 0.1 }}
            />
          </Tooltip>
        ))}
      </div>
    </div>
    
    <div className="calendar-legend">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map(level => (
        <div key={level} className={`legend-cell level-${level}`} />
      ))}
      <span>More</span>
    </div>
  </div>
);

// Main UserProfile Component
export default function UserProfile() {
  // State management
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', twitter: '' });
  const [previewURL, setPreviewURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ courses: 0, codeLines: 0, projects: 0, contributions: 0 });
  const [activityDates, setActivityDates] = useState([]);
  const [streakStats, setStreakStats] = useState({ currentStreak: 0, longestStreak: 0 });
  const [engagement, setEngagement] = useState({ 
    totalMinutes: 0, 
    dailyMinutes: {}, 
    courseProgress: {},
    weeklyAverage: 0,
    monthlyTotal: 0
  });
  const [showFileInput, setShowFileInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(365);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { hasSubscription, plan, expiresAt, loading: subscriptionLoading } = useSubscription();

  // Authentication effect
  useEffect(() => {
    window.scrollTo(0, 0);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPreviewURL(currentUser.photoURL || '');
        setLoading(false);
      } else {
        setLoading(false);
        if (window.location.pathname !== '/login') navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch comprehensive user stats
  const fetchStats = useCallback(async () => {
    if (!user) return;
    setError('');

    try {
      // Fetch user stats from userStats collection
      const statsDocRef = doc(db, 'userStats', user.uid);
      const statsDoc = await getDoc(statsDocRef);
      const statsData = statsDoc.exists() ? statsDoc.data() : {};
      
      // Fetch user profile data
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      setBio(userData.bio || '');
      setSocialLinks({
        github: userData.socialLinks?.github || '',
        linkedin: userData.socialLinks?.linkedin || '',
        twitter: userData.socialLinks?.twitter || '',
      });
      setProfileVisibility(userData.profileVisibility || 'public');

      // Fetch engagement data
      const engagementDoc = await getDoc(doc(db, 'userEngagement', user.uid));
      const engagementData = engagementDoc.exists() ? engagementDoc.data() : {};
      const totalMinutes = engagementData.totalMinutes || 0;
      const dailyMinutes = engagementData.dailyMinutes || {};

      // Calculate additional engagement metrics
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      let weeklyTotal = 0;
      let monthlyTotal = 0;
      
      Object.entries(dailyMinutes).forEach(([dateStr, minutes]) => {
        const date = new Date(dateStr);
        if (date >= weekAgo) weeklyTotal += minutes;
        if (date >= monthAgo) monthlyTotal += minutes;
      });

      const weeklyAverage = Math.round(weeklyTotal / 7);

      setEngagement({
        totalMinutes,
        dailyMinutes,
        courseProgress: engagementData.courseProgress || {},
        weeklyAverage,
        monthlyTotal
      });

      // Fetch comprehensive user progress data
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('__name__', '>=', `${user.uid}_`),
        where('__name__', '<', `${user.uid}_\uf8ff`)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      let coursesCompleted = 0;
      let totalCodeLines = 0;
      let allActivityDates = new Set();

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        const completedSections = data.completedSections || [];
        const totalSections = data.totalSections || 1;
        const quizSubmitted = data.quizSubmitted || false;
        
        // Count as completed if all sections + quiz done
        if (completedSections.length >= totalSections && quizSubmitted) {
          coursesCompleted++;
        }
        
        // Add activity dates
        if (data.lastAccessed?.seconds) {
          const dateStr = new Date(data.lastAccessed.seconds * 1000).toISOString().split('T')[0];
          allActivityDates.add(dateStr);
        }
        
        // Estimate code lines (rough calculation)
        totalCodeLines += completedSections.length * 50; // ~50 lines per section
      });

      // Add daily activity dates from engagement
      Object.keys(dailyMinutes).forEach(dateStr => {
        if (dailyMinutes[dateStr] > 0) {
          allActivityDates.add(dateStr);
        }
      });

      const activityDatesArray = Array.from(allActivityDates);
      setActivityDates(activityDatesArray);
      
      // Calculate streaks
      const streakData = calculateStreaks(activityDatesArray);
      setStreakStats(streakData);

      // Set comprehensive stats
      setStats({
        courses: coursesCompleted,
        codeLines: totalCodeLines,
        projects: statsData.projects || 0,
        contributions: activityDatesArray.length
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load profile data. Please try again.');
    }
  }, [user]);

  // Fetch stats when user changes
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [fetchStats]);

  // Badge system with progress tracking
  const badgeList = useMemo(
    () => [
      { 
        id: 1, 
        label: 'First Steps', 
        desc: 'Started your coding journey! Welcome to CodeTapasya!', 
        icon: <SchoolIcon />, 
        unlocked: stats.courses >= 1,
        category: 'Learning',
        rarity: 'common',
        progress: Math.min(100, (stats.courses / 1) * 100)
      },
      { 
        id: 2, 
        label: 'Course Explorer', 
        desc: 'Completed 3 courses! You\'re building momentum!', 
        icon: <EmojiEventsIcon />, 
        unlocked: stats.courses >= 3,
        category: 'Learning',
        rarity: 'uncommon',
        progress: Math.min(100, (stats.courses / 3) * 100)
      },
      { 
        id: 3, 
        label: 'Knowledge Seeker', 
        desc: 'Completed 5 courses! You\'re becoming quite knowledgeable!', 
        icon: <TrendingUpIcon />, 
        unlocked: stats.courses >= 5,
        category: 'Learning',
        rarity: 'rare',
        progress: Math.min(100, (stats.courses / 5) * 100)
      },
      { 
        id: 4, 
        label: 'Master Learner', 
        desc: 'Completed 10 courses! You\'re a true learning champion!', 
        icon: <WorkspacePremiumIcon />, 
        unlocked: stats.courses >= 10,
        category: 'Learning',
        rarity: 'epic',
        progress: Math.min(100, (stats.courses / 10) * 100)
      },
      { 
        id: 5, 
        label: 'Code Novice', 
        desc: 'Wrote your first 1000 lines of code! Every expert was once a beginner!', 
        icon: <CodeIcon />, 
        unlocked: stats.codeLines >= 1000,
        category: 'Coding',
        rarity: 'common',
        progress: Math.min(100, (stats.codeLines / 1000) * 100)
      },
      { 
        id: 6, 
        label: 'Code Warrior', 
        desc: 'Wrote 5000 lines of code! You\'re getting serious about this!', 
        icon: <MilitaryTechIcon />, 
        unlocked: stats.codeLines >= 5000,
        category: 'Coding',
        rarity: 'rare',
        progress: Math.min(100, (stats.codeLines / 5000) * 100)
      },
      { 
        id: 7, 
        label: 'Streak Starter', 
        desc: '3-day learning streak! Consistency is the key to mastery!', 
        icon: <StreakIcon />, 
        unlocked: streakStats.currentStreak >= 3,
        category: 'Consistency',
        rarity: 'common',
        progress: Math.min(100, (streakStats.currentStreak / 3) * 100)
      },
      { 
        id: 8, 
        label: 'Streak Master', 
        desc: '7-day streak! You\'re building an incredible habit!', 
        icon: <LocalFireDepartmentIcon />, 
        unlocked: streakStats.currentStreak >= 7,
        category: 'Consistency',
        rarity: 'uncommon',
        progress: Math.min(100, (streakStats.currentStreak / 7) * 100)
      },
      { 
        id: 9, 
        label: 'Dedication Legend', 
        desc: '30-day streak! You\'re unstoppable!', 
        icon: <EmojiEventsIcon />, 
        unlocked: streakStats.currentStreak >= 30,
        category: 'Consistency',
        rarity: 'legendary',
        progress: Math.min(100, (streakStats.currentStreak / 30) * 100)
      },
      { 
        id: 10, 
        label: 'Time Devotee', 
        desc: 'Spent 20+ hours learning! Time is your most valuable investment!', 
        icon: <TimerIcon />, 
        unlocked: engagement.totalMinutes >= 1200,
        category: 'Dedication',
        rarity: 'uncommon',
        progress: Math.min(100, (engagement.totalMinutes / 1200) * 100)
      },
    ],
    [stats.courses, stats.codeLines, streakStats.currentStreak, engagement.totalMinutes]
  );

  const unlockedBadges = badgeList.filter(b => b.unlocked);
  const nextBadge = badgeList.find(b => !b.unlocked);

  // Utility functions
  const getStreakStatus = () => {
    if (streakStats.currentStreak === 0) return { text: 'Start your streak!', color: '#6b7280' };
    if (streakStats.currentStreak < 3) return { text: 'Building momentum', color: '#f59e0b' };
    if (streakStats.currentStreak < 7) return { text: 'Getting consistent!', color: '#10b981' };
    if (streakStats.currentStreak < 30) return { text: 'On fire!', color: '#ef4444' };
    return { text: 'Legendary streak!', color: '#8b5cf6' };
  };

  const handleRefreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    setSuccess('Profile stats refreshed successfully!');
    setSnackbarOpen(true);
  };

  const handleShareProfile = async () => {
    const shareData = {
      title: `${displayName || 'User'}'s CodeTapasya Profile`,
      text: `Check out my coding progress: ${stats.courses} courses completed, ${streakStats.currentStreak} day streak!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setSuccess('Profile link copied to clipboard!');
        setSnackbarOpen(true);
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  const toggleProfileVisibility = () => {
    setProfileVisibility(prev => prev === 'public' ? 'private' : 'public');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image (JPEG, PNG, GIF, or WebP).');
      return;
    }
    
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB.');
      return;
    }
    
    setNewPhoto(file);
    setPreviewURL(URL.createObjectURL(file));
    setError('');
  };

  const handleUpdate = async () => {
    if (!user || uploading) return;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      let photoURL = user.photoURL;
      
      // Upload new photo if selected
      if (newPhoto) {
        const photoRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}`);
        const snapshot = await uploadBytes(photoRef, newPhoto);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // Update Firebase Auth profile
      await updateProfile(user, { 
        displayName: displayName || user.displayName, 
        photoURL 
      });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        bio,
        socialLinks,
        profileVisibility,
        lastUpdated: new Date()
      });

      setSuccess('Profile updated successfully!');
      setSnackbarOpen(true);
      setNewPhoto(null);
      setPreviewURL(photoURL);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setNewPhoto(null);
    setPreviewURL(user?.photoURL || '');
    setDisplayName(user?.displayName || '');
    setBio('');
    setSocialLinks({ github: '', linkedin: '', twitter: '' });
    setError('');
    setSuccess('');
    setShowFileInput(false);
    setIsEditing(false);
  };

  const handleExportProfile = () => {
    const profileData = {
      displayName: user?.displayName || '',
      email: user?.email || '',
      bio,
      socialLinks,
      stats,
      streakStats,
      engagement,
      badges: unlockedBadges.map(b => ({ 
        name: b.label, 
        category: b.category, 
        rarity: b.rarity 
      })),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.displayName || 'user'}_codetapasya_profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate calendar data
  const calendarData = useMemo(() => 
    getStreakCalendarData(activityDates, engagement.dailyMinutes, selectedTimeRange),
    [activityDates, engagement.dailyMinutes, selectedTimeRange]
  );

  // Loading state
  if (loading) {
    return (
      <div className="modern-profile-container">
        <div className="loading-container">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshIcon style={{ fontSize: 48, color: '#6366f1' }} />
          </motion.div>
          <Typography variant="h6" sx={{ mt: 2, color: '#6b7280' }}>
            Loading your awesome profile...
          </Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="modern-profile-container">
        <div className="loading-container">
          <Typography variant="h5" color="error">
            Please log in to view your profile
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')} 
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-profile-container">
      <motion.div 
        className="modern-profile-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header Section */}
        <motion.div className="profile-header-section" variants={staggerVariants}>
          <div className="profile-header-background">
            <div className="profile-gradient-overlay"></div>
          </div>
          
          <div className="profile-header-content">
            <motion.div className="profile-avatar-section" variants={cardVariants}>
              <div className="profile-avatar-container">
                <Avatar
                  src={previewURL || user.photoURL}
                  alt={displayName || user.displayName || 'User'}
                  className="profile-avatar"
                  sx={{ width: 120, height: 120 }}
                />
                {isEditing && (
                  <motion.div 
                    className="avatar-edit-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <IconButton
                      onClick={() => setShowFileInput(true)}
                      className="avatar-edit-button"
                      size="large"
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </motion.div>
                )}
              </div>
              
              <div className="profile-basic-info">
                {isEditing ? (
                  <TextField
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    variant="outlined"
                    size="medium"
                    className="profile-name-input"
                    sx={{ mb: 1 }}
                  />
                ) : (
                  <Typography variant="h4" className="profile-name">
                    {displayName || user.displayName || 'Anonymous User'}
                  </Typography>
                )}
                
                <Typography variant="body1" className="profile-email">
                  {user.email}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    multiline
                    rows={3}
                    variant="outlined"
                    className="profile-bio-input"
                    sx={{ mt: 2, width: '100%' }}
                  />
                ) : (
                  bio && (
                    <Typography variant="body2" className="profile-bio">
                      {bio}
                    </Typography>
                  )
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div className="profile-actions" variants={cardVariants}>
              {isEditing ? (
                <div className="profile-edit-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} /> : <SaveIcon />}
                    className="action-button primary"
                  >
                    {uploading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={uploading}
                    startIcon={<CancelIcon />}
                    className="action-button secondary"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="profile-view-actions">
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    startIcon={<EditIcon />}
                    className="action-button primary"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleShareProfile}
                    startIcon={<ShareIcon />}
                    className="action-button secondary"
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRefreshStats}
                    disabled={refreshing}
                    startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                    className="action-button secondary"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats Overview */}
        <motion.div className="profile-stats-overview" variants={staggerVariants}>
          <motion.div className="stats-grid" variants={containerVariants}>
            <StatCard
              label="Courses Completed"
              value={stats.courses}
              icon={<SchoolIcon />}
              color="primary"
            />
            <StatCard
              label="Lines of Code"
              value={formatLargeNumber(stats.codeLines)}
              icon={<CodeIcon />}
              color="secondary"
            />
            <StatCard
              label="Current Streak"
              value={`${streakStats.currentStreak} days`}
              icon={<LocalFireDepartmentIcon />}
              color="accent"
            />
            <StatCard
              label="Total Learning Time"
              value={formatMinutes(engagement.totalMinutes)}
              icon={<TimerIcon />}
              color="success"
            />
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div className="profile-main-content" variants={containerVariants}>
          <div className="profile-content-grid">
            
            {/* Left Column - Activity & Streaks */}
            <motion.div className="profile-left-column" variants={staggerVariants}>
              
              {/* Streak Calendar */}
              <motion.div className="profile-section streak-section" variants={cardVariants}>
                <div className="section-header">
                  <Typography variant="h6" className="section-title">
                    <LocalFireDepartmentIcon className="section-icon" />
                    Activity & Streaks
                  </Typography>
                  <div className="streak-status">
                    <Chip
                      label={getStreakStatus().text}
                      sx={{ 
                        bgcolor: getStreakStatus().color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                </div>
                
                <div className="streak-stats-row">
                  <div className="streak-stat">
                    <Typography variant="h3" className="streak-number current">
                      {streakStats.currentStreak}
                    </Typography>
                    <Typography variant="body2" className="streak-label">
                      Current Streak
                    </Typography>
                  </div>
                  <div className="streak-stat">
                    <Typography variant="h3" className="streak-number longest">
                      {streakStats.longestStreak}
                    </Typography>
                    <Typography variant="body2" className="streak-label">
                      Longest Streak
                    </Typography>
                  </div>
                </div>

                <StreakCalendar
                  calendar={calendarData.calendar}
                  monthLabels={calendarData.monthLabels}
                  totalWeeks={calendarData.totalWeeks}
                  selectedRange={selectedTimeRange}
                  onRangeChange={setSelectedTimeRange}
                />
              </motion.div>

              {/* Learning Insights */}
              <motion.div className="profile-section insights-section" variants={cardVariants}>
                <div className="section-header">
                  <Typography variant="h6" className="section-title">
                    <BarChartIcon className="section-icon" />
                    Learning Insights
                  </Typography>
                </div>
                
                <div className="insights-grid">
                  <div className="insight-item">
                    <div className="insight-value">{formatMinutes(engagement.weeklyAverage)}</div>
                    <div className="insight-label">Daily Average (7 days)</div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-value">{formatMinutes(engagement.monthlyTotal)}</div>
                    <div className="insight-label">Monthly Total</div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-value">{stats.contributions}</div>
                    <div className="insight-label">Active Days</div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-value">{stats.projects}</div>
                    <div className="insight-label">Projects</div>
                  </div>
                </div>
              </motion.div>

              {/* Social Links (Edit Mode) */}
              {isEditing && (
                <motion.div className="profile-section social-section" variants={cardVariants}>
                  <div className="section-header">
                    <Typography variant="h6" className="section-title">
                      <LinkIcon className="section-icon" />
                      Social Links
                    </Typography>
                  </div>
                  
                  <div className="social-inputs">
                    <TextField
                      label="GitHub Username"
                      value={socialLinks.github}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      placeholder="your-github-username"
                      InputProps={{
                        startAdornment: <GitHubIcon sx={{ mr: 1, color: 'action.disabled' }} />
                      }}
                    />
                    <TextField
                      label="LinkedIn Profile"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      placeholder="your-linkedin-profile"
                      InputProps={{
                        startAdornment: <LinkedInIcon sx={{ mr: 1, color: 'action.disabled' }} />
                      }}
                    />
                    <TextField
                      label="Twitter Handle"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="your-twitter-handle"
                      InputProps={{
                        startAdornment: <TwitterIcon sx={{ mr: 1, color: 'action.disabled' }} />
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Achievements & Progress */}
            <motion.div className="profile-right-column" variants={staggerVariants}>
              
              {/* Achievement Badges */}
              <motion.div className="profile-section badges-section" variants={cardVariants}>
                <div className="section-header">
                  <Typography variant="h6" className="section-title">
                    <EmojiEventsIcon className="section-icon" />
                    Achievements ({unlockedBadges.length}/{badgeList.length})
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleExportProfile}
                    startIcon={<FileDownloadIcon />}
                    className="export-button"
                  >
                    Export
                  </Button>
                </div>
                
                <div className="badges-grid">
                  {badgeList.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>

                {nextBadge && (
                  <div className="next-badge-section">
                    <Typography variant="body2" className="next-badge-title">
                      Next Achievement:
                    </Typography>
                    <div className="next-badge-card">
                      <div className="next-badge-info">
                        <div className="next-badge-icon">
                          {nextBadge.icon}
                        </div>
                        <div className="next-badge-content">
                          <div className="next-badge-label">{nextBadge.label}</div>
                          <div className="next-badge-desc">{nextBadge.desc}</div>
                        </div>
                      </div>
                      <div className="next-badge-progress">
                        <LinearProgress 
                          variant="determinate" 
                          value={nextBadge.progress} 
                          className="progress-bar"
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                            }
                          }}
                        />
                        <Typography variant="caption" className="progress-text">
                          {Math.round(nextBadge.progress)}% Complete
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Social Links Display */}
              {!isEditing && (socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
                <motion.div className="profile-section social-links-section" variants={cardVariants}>
                  <div className="section-header">
                    <Typography variant="h6" className="section-title">
                      <LinkIcon className="section-icon" />
                      Connect With Me
                    </Typography>
                  </div>
                  
                  <div className="social-links-display">
                    {socialLinks.github && (
                      <Button
                        variant="outlined"
                        startIcon={<GitHubIcon />}
                        href={`https://github.com/${socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-button github"
                      >
                        GitHub
                      </Button>
                    )}
                    {socialLinks.linkedin && (
                      <Button
                        variant="outlined"
                        startIcon={<LinkedInIcon />}
                        href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-button linkedin"
                      >
                        LinkedIn
                      </Button>
                    )}
                    {socialLinks.twitter && (
                      <Button
                        variant="outlined"
                        startIcon={<TwitterIcon />}
                        href={`https://twitter.com/${socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-button twitter"
                      >
                        Twitter
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Profile Settings */}
              {isEditing && (
                <motion.div className="profile-section settings-section" variants={cardVariants}>
                  <div className="section-header">
                    <Typography variant="h6" className="section-title">
                      <SettingsIcon className="section-icon" />
                      Profile Settings
                    </Typography>
                  </div>
                  
                  <div className="settings-content">
                    <div className="setting-item">
                      <div className="setting-info">
                        <Typography variant="body1" className="setting-label">
                          Profile Visibility
                        </Typography>
                        <Typography variant="body2" className="setting-desc">
                          Control who can see your profile information
                        </Typography>
                      </div>
                      <Switch
                        checked={profileVisibility === 'public'}
                        onChange={toggleProfileVisibility}
                        color="primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* File Input Dialog */}
      <Dialog open={showFileInput} onClose={() => setShowFileInput(false)}>
        <DialogTitle>Change Profile Photo</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="photo-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCameraIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose Photo
            </Button>
          </label>
          {newPhoto && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Avatar
                src={previewURL}
                alt="Preview"
                sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Preview of new photo
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileInput(false)}>Cancel</Button>
          {newPhoto && (
            <Button onClick={() => setShowFileInput(false)} variant="contained">
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? 'error' : 'success'}
          variant="filled"
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Error/Success Messages */}
      {error && (
        <motion.div 
          className="message-container error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          className="message-container success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </motion.div>
      )}
    </div>
  );
}
