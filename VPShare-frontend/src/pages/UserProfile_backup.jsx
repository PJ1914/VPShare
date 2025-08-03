import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';

// Material-UI Icons
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TimerIcon from '@mui/icons-material/Timer';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import DiamondIcon from '@mui/icons-material/Diamond';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InsightsIcon from '@mui/icons-material/Insights';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import StreakIcon from '@mui/icons-material/Whatshot';
import ActivityIcon from '@mui/icons-material/Timeline';

// Material-UI Components
import { 
  Tooltip, 
  Chip, 
  IconButton, 
  Snackbar, 
  Alert, 
  Card, 
  CardContent, 
  CardHeader,
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  LinearProgress,
  Divider,
  Paper
} from '@mui/material';

import '../styles/UserProfile.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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

// Utility Functions
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const getTodayDateString = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
};

const calculateStreaks = (activityDates) => {
  if (!activityDates.length) return { currentStreak: 0, longestStreak: 0 };
  
  const sorted = [...new Set(activityDates)].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let prevDate = null;

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    if (prevDate) {
      const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else if (diff > 1) streak = 1;
    } else {
      streak = 1;
    }
    longestStreak = Math.max(longestStreak, streak);
    prevDate = date;
  }

  // Calculate current streak from today backwards
  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (activityDates.includes(todayStr) || activityDates.includes(yesterdayStr)) {
    let streakCount = 0;
    const checkDate = new Date();
    
    while (streakCount < sorted.length) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.includes(dateStr)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    currentStreak = streakCount;
  }

  return { currentStreak, longestStreak };
};

const getStreakCalendarData = (activityDates, dailyMinutes, days = 365) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendar = [];
  const activitySet = new Set(activityDates);
  
  // Calculate start date (days ago from today)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  
  // Adjust to start from Sunday for proper calendar alignment
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
      if (minutes >= 120) level = 4;      // 2+ hours
      else if (minutes >= 60) level = 3;  // 1+ hours
      else if (minutes >= 30) level = 2;  // 30+ minutes
      else if (minutes >= 10) level = 1;  // 10+ minutes
    }

    // Track months for labels
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const weekIndex = Math.floor(i / 7);
    if (!monthMap.has(monthKey) && d.getDate() <= 7) {
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
      weekOfYear: weekIndex,
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear()
    });
  }

  return { calendar, monthLabels, totalWeeks };
};

const formatMinutes = (mins) => {
  if (!mins || mins < 1) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

const formatLargeNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Component for individual stat cards
const StatCard = ({ label, value, icon, trend, color = 'primary', subtitle }) => (
  <motion.div 
    className={`modern-stat-card stat-${color}`}
    variants={cardVariants}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  </motion.div>
);

// Component for achievement badges
const BadgeCard = ({ badge, index }) => (
  <Tooltip title={badge.desc} arrow placement="top">
    <motion.div 
      className={`achievement-badge ${badge.unlocked ? 'unlocked' : 'locked'} rarity-${badge.rarity}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      whileHover={badge.unlocked ? { scale: 1.05, y: -3 } : { scale: 1.02 }}
    >
      <div className="badge-icon">
        {badge.icon}
      </div>
      <div className="badge-content">
        <div className="badge-name">{badge.label}</div>
        <div className="badge-category">{badge.category}</div>
        {badge.unlocked && (
          <motion.div 
            className="badge-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircleIcon fontSize="small" />
            Unlocked
          </motion.div>
        )}
        {!badge.unlocked && (
          <div className="badge-progress">
            <LinearProgress 
              variant="determinate" 
              value={badge.progress || 0} 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: badge.rarity === 'legendary' ? '#ffd700' : 
                                 badge.rarity === 'epic' ? '#a855f7' : 
                                 badge.rarity === 'rare' ? '#3b82f6' : '#10b981'
                }
              }}
            />
          </div>
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
        icon: <MenuBookIcon />, 
        unlocked: stats.courses >= 3,
        category: 'Learning',
        rarity: 'uncommon',
        progress: Math.min(100, (stats.courses / 3) * 100)
      },
      { 
        id: 3, 
        label: 'Knowledge Seeker', 
        desc: 'Completed 5 courses! You\'re becoming quite knowledgeable!', 
        icon: <TrophyIcon />, 
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
      const courseProgress = engagementData.userProgress || engagementData.courseProgress || {};
      const dailyCourseReadMinutes = engagementData.dailyCourseReadMinutes || {};

      if (!isMounted) return;

      // Fetch courses to calculate actual completion
      let coursesCompleted = 0;
      try {
        const coursesApiUrl = import.meta.env.VITE_COURSES_API_URL;
        if (!coursesApiUrl) {
          console.error('VITE_COURSES_API_URL not configured');
          throw new Error('Server configuration error');
        }

        let authToken;
        try {
          authToken = await user.getIdToken();
        } catch (tokenError) {
          console.error('Error getting auth token:', tokenError);
          throw new Error('Authentication error');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const coursesRes = await axios.get(coursesApiUrl, { headers, timeout: 30000 });
        
        if (!isMounted) return;
        
        const courses = Array.isArray(coursesRes.data) ? 
          coursesRes.data 
          : coursesRes.data.Items || coursesRes.data.courses || [];

        console.log('Fetched courses:', courses.length);

        // Fetch user progress for each course using same pattern as Dashboard
        await Promise.all(
          courses.map(async (course) => {
            if (!isMounted) return;
            
            const courseId = course.module_id || course.id;
            if (!courseId) return;
            
            try {
              const docId = `${user.uid}_${courseId}`;
              const progressRef = doc(db, 'userProgress', docId);
              const progressSnap = await getDoc(progressRef);
              
              if (!isMounted) return;
              
              if (progressSnap.exists()) {
                const data = progressSnap.data();
                
                // Calculate if course is completed (same logic as Dashboard)
                const baseSections = course.sections ? course.sections.length : 
                  (course.totalSections || 6);
                const totalSections = baseSections + 1; // +1 for quiz
                
                const completedSections = Array.isArray(data.completedSections) ? 
                  data.completedSections.length : 0;
                
                const quizComplete = data.quizSubmitted && 
                  data.quizAnswers && 
                  Object.keys(data.quizAnswers).length > 0;
                
                const totalCompleted = completedSections + (quizComplete ? 1 : 0);
                const courseCompletionPercent = totalSections > 0 ? 
                  Math.min(100, (totalCompleted / totalSections) * 100) : 0;
                
                // Count as completed if 100%
                if (courseCompletionPercent >= 100) {
                  coursesCompleted++;
                }
              }
            } catch (error) {
              console.error(`Error fetching progress for course ${courseId}:`, error);
            }
          })
        );
      } catch (error) {
        console.error('Error fetching courses:', error);
      }

      if (!isMounted) return;

      // Set stats with real data
      setStats({
        courses: coursesCompleted,
        codeLines: statsData.codeLines || 0,
      });

      setEngagement({ totalMinutes, dailyMinutes, courseProgress });

      // Calculate activity dates
      const allDates = new Set([...Object.keys(dailyMinutes), ...Object.keys(dailyCourseReadMinutes)]);
      const activityDates = Array.from(allDates).filter(
        (date) => (dailyMinutes[date] || 0) > 0 || (dailyCourseReadMinutes[date] || 0) > 0
      );
      setActivityDates(activityDates);
      setStreakStats(calculateStreaks(activityDates));
    } catch (e) {
      if (isMounted) {
        setError('Failed to fetch user data: ' + e.message);
        console.error('UserProfile: Firestore fetch error:', e);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let cleanup = null;
    
    const loadStats = async () => {
      cleanup = await fetchStats();
    };
    
    loadStats();
    
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [fetchStats]);
  const badgeList = useMemo(
    () => [
      { 
        id: 1, 
        label: 'First Course', 
        desc: 'Completed your first course! Welcome to your coding journey!', 
        icon: <SchoolIcon />, 
        unlocked: stats.courses >= 1,
        category: 'learning',
        rarity: 'common'
      },
      { 
        id: 2, 
        label: 'Course Explorer', 
        desc: 'Completed 5 courses! You\'re building a solid foundation!', 
        icon: <MenuBookIcon />, 
        unlocked: stats.courses >= 5,
        category: 'learning',
        rarity: 'uncommon'
      },
      { 
        id: 3, 
        label: 'Course Master', 
        desc: 'Completed 10 courses! You\'re becoming a true learner!', 
        icon: <WorkspacePremiumIcon />, 
        unlocked: stats.courses >= 10,
        category: 'learning',
        rarity: 'rare'
      },
      { 
        id: 4, 
        label: 'Code Novice', 
        desc: 'Wrote 500 lines of code! Every expert was once a beginner!', 
        icon: <CodeIcon />, 
        unlocked: stats.codeLines >= 500,
        category: 'coding',
        rarity: 'common'
      },
      { 
        id: 5, 
        label: 'Code Warrior', 
        desc: 'Wrote 1000 lines of code! You\'re getting the hang of this!', 
        icon: <CodeIcon />, 
        unlocked: stats.codeLines >= 1000,
        category: 'coding',
        rarity: 'uncommon'
      },
      { 
        id: 6, 
        label: 'Code Ninja', 
        desc: 'Wrote 5000 lines of code! Your skills are impressive!', 
        icon: <MilitaryTechIcon />, 
        unlocked: stats.codeLines >= 5000,
        category: 'coding',
        rarity: 'rare'
      },
      { 
        id: 7, 
        label: 'Streak Starter', 
        desc: '3-day streak! Consistency is key to success!', 
        icon: <TrendingUpIcon />, 
        unlocked: streakStats.currentStreak >= 3,
        category: 'streak',
        rarity: 'common'
      },
      { 
        id: 8, 
        label: 'Streak Keeper', 
        desc: '7-day streak! You\'re building a great habit!', 
        icon: <LocalFireDepartmentIcon />, 
        unlocked: streakStats.currentStreak >= 7,
        category: 'streak',
        rarity: 'uncommon'
      },
      { 
        id: 9, 
        label: 'Streak Legend', 
        desc: '30-day streak! You\'re a true dedication master!', 
        icon: <EmojiEventsIcon />, 
        unlocked: streakStats.currentStreak >= 30,
        category: 'streak',
        rarity: 'legendary'
      },
      { 
        id: 10, 
        label: 'Time Devotee', 
        desc: 'Spent 10+ hours learning! Time well invested!', 
        icon: <TimerIcon />, 
        unlocked: engagement.totalMinutes >= 600,
        category: 'time',
        rarity: 'uncommon'
      },
    ],
    [stats.courses, stats.codeLines, streakStats.currentStreak, engagement.totalMinutes]
  );
  const nextBadge = badgeList.find((b) => !b.unlocked);
  const progressToNext = useMemo(() => {
    if (!nextBadge) return 100;
    switch (nextBadge.id) {
      case 1: return Math.min(100, (stats.courses / 1) * 100);
      case 2: return Math.min(100, (stats.courses / 5) * 100);
      case 3: return Math.min(100, (stats.courses / 10) * 100);
      case 4: return Math.min(100, (stats.codeLines / 500) * 100);
      case 5: return Math.min(100, (stats.codeLines / 1000) * 100);
      case 6: return Math.min(100, (stats.codeLines / 5000) * 100);
      case 7: return Math.min(100, (streakStats.currentStreak / 3) * 100);
      case 8: return Math.min(100, (streakStats.currentStreak / 7) * 100);
      case 9: return Math.min(100, (streakStats.currentStreak / 30) * 100);
      case 10: return Math.min(100, (engagement.totalMinutes / 600) * 100);
      default: return 0;
    }
  }, [nextBadge, stats.courses, stats.codeLines, streakStats.currentStreak, engagement.totalMinutes]);

  // New utility functions
  const getStreakStatus = () => {
    if (streakStats.currentStreak === 0) return { text: 'Start your streak!', color: '#6b7280' };
    if (streakStats.currentStreak < 7) return { text: 'Building momentum!', color: '#f59e0b' };
    if (streakStats.currentStreak < 30) return { text: 'Great consistency!', color: '#10b981' };
    return { text: 'Legendary streak!', color: '#8b5cf6' };
  };

  const handleRefreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    setSnackbarOpen(true);
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName || 'Coder'}'s CodeTapasya Profile`,
          text: `Check out my coding progress: ${stats.courses} courses completed, ${streakStats.currentStreak} day streak!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      const shareText = `Check out my CodeTapasya profile! ${stats.courses} courses completed, ${streakStats.currentStreak} day streak! ${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      setSuccess('Profile link copied to clipboard!');
    }
  };

  const toggleProfileVisibility = () => {
    setProfileVisibility(prev => prev === 'public' ? 'private' : 'public');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) return setError('Please upload an image (JPEG, PNG, or GIF).');
    if (file.size > maxSize) return setError('Image size must be less than 5MB.');
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
      if (newPhoto) {
        const fileRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(fileRef, newPhoto);
        photoURL = await getDownloadURL(fileRef);
      }

      await updateProfile(user, { displayName: displayName || user.displayName, photoURL });
      await updateDoc(doc(db, 'users', user.uid), {
        bio,
        socialLinks: { github: socialLinks.github, linkedin: socialLinks.linkedin, twitter: socialLinks.twitter },
      });

      setSuccess('Profile updated successfully!');
      setNewPhoto(null);
      setPreviewURL(photoURL);
    } catch (e) {
      setError('Error updating profile: ' + e.message);
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
  };

  const handleExportProfile = () => {
    const profileData = {
      displayName: user.displayName,
      email: user.email,
      stats,
      streakStats,
      engagement,
      badges: badgeList.filter((b) => b.unlocked).map((b) => b.label),
    };    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.displayName || 'user'}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user === null) return (
    <div className="modern-page">
      <div className="modern-container">
        <div className="modern-card modern-flex-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="modern-flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshIcon fontSize="large" />
            </motion.div>
            <p className="modern-text">Loading your awesome profile...</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-page">
      <div className="modern-container">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="modern-grid modern-grid-4" style={{ gap: '2rem', gridTemplateColumns: '300px 1fr' }}>
            {/* Profile Sidebar */}
            <div className="modern-card" style={{ height: 'fit-content' }}>
              <div className="modern-card-header">
                <div style={{ position: 'relative', alignSelf: 'center' }}>
                  <img
                    src={previewURL || `data:image/svg+xml;base64,${btoa(`
                      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
                          </linearGradient>
                        </defs>
                        <rect width="150" height="150" fill="url(#gradient)"/>
                        <circle cx="75" cy="60" r="25" fill="white" opacity="0.8"/>
                        <path d="M35 110 Q75 85 115 110 L115 150 L35 150 Z" fill="white" opacity="0.8"/>
                        <text x="75" y="140" text-anchor="middle" fill="white" font-size="12" opacity="0.6">Profile</text>
                      </svg>
                    `)}`}
                    alt="Profile avatar"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--border-light)'
                    }}
                    onError={() => setPreviewURL(`data:image/svg+xml;base64,${btoa(`
                      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                        <rect width="150" height="150" fill="#e2e8f0"/>
                        <text x="75" y="80" text-anchor="middle" fill="#64748b" font-size="16">No Image</text>
                      </svg>
                    `)}`)}
                  />
                  <motion.button
                    className="modern-btn modern-btn-primary"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      minWidth: 'unset',
                      padding: '0.5rem'
                    }}
                    aria-label="Edit profile photo"
                    onClick={() => setShowFileInput(true)}
                    disabled={uploading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </motion.button>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <h2 className="modern-heading-md modern-flex" style={{ alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <PersonIcon />
                    {displayName || 'Coder'}
                  </h2>
                  <p className="modern-text-sm modern-flex" style={{ alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <EmailIcon fontSize="small" />
                    {user.email}
                  </p>
                  {bio && (
                    <motion.div 
                      className="modern-text-sm"
                      style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {bio}
                    </motion.div>
                  )}
                  
                  <div style={{ marginTop: '1rem' }}>
                    <Chip 
                      icon={profileVisibility === 'public' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      label={profileVisibility === 'public' ? 'Public Profile' : 'Private Profile'}
                      onClick={toggleProfileVisibility}
                      variant={profileVisibility === 'public' ? 'filled' : 'outlined'}
                      color={profileVisibility === 'public' ? 'success' : 'default'}
                      size="small"
                    />
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="modern-flex" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  {socialLinks.github && (
                    <Tooltip title="GitHub Profile" arrow>
                      <IconButton 
                        component="a"
                        href={socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        size="small"
                        className="modern-btn modern-btn-ghost"
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {socialLinks.linkedin && (
                    <Tooltip title="LinkedIn Profile" arrow>
                      <IconButton 
                        component="a"
                        href={socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        size="small"
                        className="modern-btn modern-btn-ghost"
                      >
                        <LinkedInIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {socialLinks.twitter && (
                    <Tooltip title="Twitter Profile" arrow>
                      <IconButton 
                        component="a"
                        href={socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        size="small"
                        className="modern-btn modern-btn-ghost"
                      >
                        <TwitterIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Share Profile" arrow>
                    <IconButton 
                      onClick={handleShareProfile}
                      size="small"
                      className="modern-btn modern-btn-ghost"
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>

              {/* Edit Profile Section */}
              <motion.div layout style={{ marginTop: '1rem' }}>
                <div className="modern-flex-center">
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    className="modern-btn modern-btn-secondary modern-btn-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EditIcon fontSize="small" />
                    {isEditing ? 'Close Editor' : 'Edit Profile'}
                  </motion.button>
                </div>
                
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ marginTop: '1rem' }}
                    >
                      <div className="modern-flex-col">
                        <div>
                          <label className="modern-text-sm" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                            <PersonIcon fontSize="small" style={{ marginRight: '0.5rem' }} />
                            Display Name
                          </label>
                          <input
                            id="display-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="modern-input"
                            disabled={uploading}
                            aria-required="true"
                          />
                        </div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="bio" className="profile-label">
                      <MenuBookIcon fontSize="small" />
                      Bio ({160 - bio.length} characters left)
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="profile-input profile-textarea"
                      disabled={uploading}
                      maxLength={160}
                      rows={3}
                    />
                  </div>
                  
                  <div className="social-inputs">
                    <div className="input-group">
                      <label htmlFor="github" className="profile-label">
                        <GitHubIcon fontSize="small" />
                        GitHub
                      </label>
                      <input
                        id="github"
                        type="url"
                        value={socialLinks.github}
                        onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="profile-input"
                        disabled={uploading}
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="linkedin" className="profile-label">
                        <LinkedInIcon fontSize="small" />
                        LinkedIn
                      </label>
                      <input
                        id="linkedin"
                        type="url"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="profile-input"
                        disabled={uploading}
                      />
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="twitter" className="profile-label">
                        <TwitterIcon fontSize="small" />
                        Twitter
                      </label>
                      <input
                        id="twitter"
                        type="url"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                        placeholder="https://twitter.com/username"
                        className="profile-input"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  
                  {showFileInput && (
                    <motion.div 
                      className="input-group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <label htmlFor="profile-photo" className="profile-label">
                        <PhotoCameraIcon fontSize="small" />
                        Profile Photo
                      </label>
                      <input
                        id="profile-photo"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="profile-input file-input"
                        disabled={uploading}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>          <div className="profile-github-actions">
            <div className="action-buttons-row">
              <motion.button
                onClick={handleUpdate}
                disabled={uploading || !isEditing}
                className={`action-button update-button ${!isEditing ? 'disabled' : ''}`}
                aria-label="Update profile"
                variants={buttonVariants}
                whileHover={!uploading && isEditing ? "hover" : {}}
                whileTap={!uploading && isEditing ? { scale: 0.95 } : {}}
              >
                <CheckCircleIcon fontSize="small" />
                {uploading ? 'Updating...' : 'Save Changes'}
              </motion.button>
              
              {(newPhoto || displayName !== (user.displayName || '') || bio || socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
                <motion.button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="action-button cancel-button"
                  aria-label="Cancel changes"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  <CancelIcon fontSize="small" />
                  Cancel
                </motion.button>
              )}
            </div>
            
            <div className="action-buttons-row">
              <motion.button
                onClick={handleExportProfile}
                className="action-button export-button"
                aria-label="Export profile"
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <DownloadIcon fontSize="small" />
                Export
              </motion.button>
              
              <motion.button
                onClick={handleRefreshStats}
                disabled={refreshing}
                className="action-button refresh-button"
                aria-label="Refresh stats"
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshIcon fontSize="small" />
                </motion.div>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="modern-flex-col" style={{ gap: '2rem' }}>
              {/* Profile Overview Header */}
              <div className="modern-card">
                <div className="modern-card-header">
                  <h1 className="modern-heading-lg modern-flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <WorkspacePremiumIcon />
                    Profile Overview
                  </h1>
                  <div className="modern-badge modern-badge-success">
                    <span style={{ color: getStreakStatus().color }}>
                      {getStreakStatus().text}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <motion.div className="modern-grid modern-grid-5" style={{ gap: '1.5rem' }} variants={cardVariants}>
                <StatCard 
                  label="Courses Completed" 
                  value={stats.courses} 
                  icon={<SchoolIcon />}
                  color="primary"
                />
                <StatCard 
                  label="Current Streak" 
                  value={`${streakStats.currentStreak} days`} 
                  icon={<LocalFireDepartmentIcon />}
                  color="streak"
                />
                <StatCard 
                  label="Longest Streak" 
                  value={`${streakStats.longestStreak} days`} 
                  icon={<TrendingUpIcon />}
                  color="success"
                />
                <StatCard 
                  label="Lines of Code" 
                  value={stats.codeLines.toLocaleString()} 
                  icon={<CodeIcon />}
                  color="code"
                />
                <StatCard 
                  label="Time Invested" 
                  value={formatMinutes(engagement.totalMinutes)} 
                  icon={<TimerIcon />}
                  color="time"
                />
              </motion.div>

              {/* Subscription Status Card */}
              <motion.div className="modern-card" variants={cardVariants}>
                <div className="modern-card-header">
                  <div className="modern-flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
                    <WorkspacePremiumIcon className={hasSubscription ? 'text-premium' : 'text-secondary'} />
                    <div>
                      <h3 className="modern-heading-sm">
                        {subscriptionLoading ? 'Loading...' : (hasSubscription ? 'Premium Member' : 'Free Plan')}
                      </h3>
                      {!subscriptionLoading && (
                        <div className="modern-flex" style={{ alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          {hasSubscription ? (
                            <>
                              <Chip 
                                icon={<DiamondIcon />}
                                label={plan ? plan.toUpperCase() : 'PREMIUM'}
                                color="primary"
                                size="small"
                                className="modern-badge modern-badge-premium"
                              />
                              {expiresAt && (
                                <span className="modern-text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  Expires: {expiresAt.toLocaleDateString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <Chip 
                              label="FREE"
                              size="small"
                              className="modern-badge modern-badge-secondary"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}