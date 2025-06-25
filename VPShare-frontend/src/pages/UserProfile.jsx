import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '../styles/UserProfile.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Helper to check if a string is a UUID
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const getTodayDateString = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
};

const calculateStreaks = (activityDates) => {
  const sorted = [...activityDates].sort();
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

  const todayStr = getTodayDateString();
  if (activityDates.includes(todayStr)) {
    let streakCount = 1;
    let prev = new Date(sorted[sorted.length - 1]);
    for (let i = sorted.length - 2; i >= 0; i--) {
      const curr = new Date(sorted[i]);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streakCount++;
        prev = curr;
      } else if (diff > 1) break;
    }
    currentStreak = streakCount;
  }

  return { currentStreak, longestStreak };
};

const getStreakCalendarData = (activityDates, dailyMinutes, days = 56) => {
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

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', twitter: '' });
  const [previewURL, setPreviewURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ courses: 0, codeLines: 0 });
  const [activityDates, setActivityDates] = useState([]);
  const [streakStats, setStreakStats] = useState({ currentStreak: 0, longestStreak: 0 });
  const [engagement, setEngagement] = useState({ totalMinutes: 0, dailyMinutes: {}, courseProgress: {} });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showFileInput, setShowFileInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(56); // days
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPreviewURL(currentUser.photoURL || '');
      } else {
        setUser(null);
        if (window.location.pathname !== '/login') navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setError('');
    setSuccess('');

    let isMounted = true; // Flag to prevent memory leaks

    try {
      // Fetch user stats from userStats collection
      const statsDocRef = doc(db, 'userStats', user.uid);
      const statsDoc = await getDoc(statsDocRef);
      const statsData = statsDoc.exists() ? statsDoc.data() : {};
      
      if (!isMounted) return;
      
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

      if (!isMounted) return;

      // Fetch engagement data
      const engagementDoc = await getDoc(doc(db, 'userEngagement', user.uid));
      const engagementData = engagementDoc.exists() ? engagementDoc.data() : {};
      const totalMinutes = engagementData.totalMinutes || 0;
      const dailyMinutes = engagementData.dailyMinutes || {};
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
    <div className="loading-container">
      <motion.div 
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <RefreshIcon fontSize="large" />
      </motion.div>
      <p>Loading your awesome profile...</p>
    </div>
  );

  return (
    <motion.div className={`profile-github-bg ${theme}`} variants={containerVariants} initial="hidden" animate="visible">
      <div className="profile-github-container">        <aside className="profile-github-sidebar">
          <div className="profile-header">
            <div className="profile-github-avatar-wrap">
              <img
                src={previewURL || 'https://via.placeholder.com/150'}
                alt="Profile avatar"
                className="profile-github-avatar"
                onError={() => setPreviewURL('https://via.placeholder.com/150')}
              />
              <motion.button
                className="edit-avatar-btn"
                aria-label="Edit profile photo"
                onClick={() => setShowFileInput(true)}
                disabled={uploading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <PhotoCameraIcon fontSize="small" />
              </motion.button>
            </div>
            
            <div className="profile-info">
              <h2 className="profile-github-name">
                <PersonIcon className="profile-name-icon" />
                {displayName || 'Coder'}
              </h2>
              <div className="profile-github-email">
                <EmailIcon fontSize="small" />
                {user.email}
              </div>
              {bio && (
                <motion.div 
                  className="profile-github-bio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {bio}
                </motion.div>
              )}
              
              <div className="profile-status">
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
            
            <div className="profile-github-social">
              {socialLinks.github && (
                <Tooltip title="GitHub Profile" arrow>
                  <IconButton 
                    component="a"
                    href={socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    size="small"
                    className="social-link github"
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
                    className="social-link linkedin"
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
                    className="social-link twitter"
                  >
                    <TwitterIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Share Profile" arrow>
                <IconButton 
                  onClick={handleShareProfile}
                  size="small"
                  className="social-link share"
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>          <motion.div 
            className={`profile-github-edit-fields ${isEditing ? 'editing' : ''}`}
            layout
          >
            <div className="edit-toggle">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-toggle-btn"
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
                  className="edit-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <label htmlFor="display-name" className="profile-label">
                      <PersonIcon fontSize="small" />
                      Display Name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="profile-input"
                      disabled={uploading}
                      aria-required="true"
                    />
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
              
              <motion.button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="action-button theme-button"
                aria-label="Toggle theme"
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'light' ? <Brightness4Icon fontSize="small" /> : <Brightness7Icon fontSize="small" />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </motion.button>
            </div>
          </div>
        </aside>        <main className="profile-github-main">
          <div className="main-header">
            <h1 className="profile-title">
              <WorkspacePremiumIcon className="title-icon" />
              Dashboard Overview
            </h1>
            <div className="streak-status">
              <span 
                className="streak-status-text"
                style={{ color: getStreakStatus().color }}
              >
                {getStreakStatus().text}
              </span>
            </div>
          </div>
          
          <motion.div className="profile-github-stats-row" variants={cardVariants}>
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
          </motion.div>          {nextBadge && (
            <motion.div className="profile-progress-section" variants={cardVariants}>
              <div className="progress-header">
                <div className="progress-info">
                  <StarIcon className="star-icon" />
                  <span className="progress-title">Next Achievement</span>
                  <Chip 
                    label={nextBadge.category} 
                    size="small" 
                    variant="outlined"
                    className={`category-chip ${nextBadge.category}`}
                  />
                </div>
                <div className="progress-target">
                  <span className="target-badge">{nextBadge.label}</span>
                </div>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <motion.div
                    className={`progress-bar-fill rarity-${nextBadge.rarity}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  >
                    {progressToNext >= 100 && (
                      <motion.div 
                        className="progress-bar-sparkle"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>
                <span className="progress-bar-percent">{Math.round(progressToNext)}%</span>
              </div>
              <div className="progress-description">
                {nextBadge.desc}
              </div>
            </motion.div>
          )}
          
          <motion.div className="profile-github-card streak-card" variants={cardVariants}>
            <div className="card-header">
              <h3>
                <CalendarTodayIcon className="card-icon" />
                Activity Overview
              </h3>
              <div className="time-range-selector">
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
                  className="time-range-select"
                >
                  <option value={28}>Last 4 weeks</option>
                  <option value={56}>Last 8 weeks</option>
                  <option value={84}>Last 12 weeks</option>
                </select>
              </div>
            </div>
            <div className="streak-info" data-streak={streakStats.currentStreak}>
              <div className="streak-main">
                <LocalFireDepartmentIcon className="streak-icon" />
                <div className="streak-numbers">
                  <span className="current-streak">{streakStats.currentStreak}</span>
                  <span className="streak-label">Day Streak</span>
                </div>
              </div>
              <div className="streak-secondary">
                <span className="longest-streak">
                  <TrendingUpIcon fontSize="small" />
                  Best: {streakStats.longestStreak} days
                </span>
              </div>
            </div>
            
            <div className="streak-calendar-section">
              <div className="streak-calendar-header">
                <h4>Activity Calendar</h4>
                <span className="activity-summary">
                  {activityDates.length} {activityDates.length === 1 ? 'day' : 'days'} of activity in the last {selectedTimeRange} days
                </span>
              </div>
              
              <div className="calendar-container">
                <div className="calendar-days-header">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <span key={index} className="day-label">{day}</span>
                  ))}
                </div>
                
                <div className={`streak-calendar ${theme}`}>
                  {(() => {
                    const calendarData = getStreakCalendarData(activityDates, engagement.dailyMinutes, selectedTimeRange);
                    return calendarData.calendar.map((cell, index) => (
                      <Tooltip
                        key={`${cell.date}-${index}`}
                        title={cell.isInRange ? `${new Date(cell.date).toLocaleDateString()}: ${cell.active ? `${cell.minutes} min activity` : 'No activity'}` : ''}
                        arrow
                        placement="top"
                      >
                        <motion.div 
                          className={`calendar-cell ${cell.active ? 'active' : ''} level-${cell.level} ${!cell.isInRange ? 'out-of-range' : ''}`}
                          whileHover={cell.isInRange ? { scale: 1.3 } : {}}
                          transition={{ duration: 0.1 }}
                        />
                      </Tooltip>
                    ));
                  })()}
                </div>
              </div>
              
              <div className="streak-calendar-legend">
                <span>Less</span>
                <div className="legend-cells">
                  {[0, 1, 2, 3, 4].map(level => (
                    <span key={level} className={`calendar-cell level-${level}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="profile-github-card" variants={cardVariants}>
            <h3>Badges</h3>
            <div className="badges-grid">
              {badgeList.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </motion.div>
          {Object.keys(engagement.courseProgress).length > 0 && (
            <motion.div className="profile-github-card" variants={cardVariants}>
              <h3>Course Progress</h3>
              {Object.entries(engagement.courseProgress).map(([courseId, percent]) => (
                <div key={courseId} className="course-progress">
                  <div className="course-progress-header">
                    <span>{courseId}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-track">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="progress-bar-percent">{percent}%</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          <motion.div className="motivation-card profile-github-card" variants={cardVariants}>
            <TipsAndUpdatesIcon />
            <div>
              <div className="motivation-title">Tip for Beginners</div>
              <div className="motivation-text">
                Practice daily to unlock more badges and keep your streak alive! Your coding journey is just beginning.
              </div>
            </div>
          </motion.div>
          <AnimatePresence>
            {error && (
              <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p className="success-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {success}
              </motion.p>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}