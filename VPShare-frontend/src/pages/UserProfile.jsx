import { useState, useEffect } from 'react';
import { auth, db, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import LinearProgress from '@mui/material/LinearProgress';
import '../styles/UserProfile.css';

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const buttonHoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function getTodayDateString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
}
function getPastNDates(n) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
function calculateStreaks(activityDates) {
  const sorted = [...activityDates].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let prevDate = null;
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    if (prevDate) {
      const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else if (diff === 0) {
        // same day, skip
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    if (streak > longestStreak) longestStreak = streak;
    prevDate = date;
  }
  // Calculate current streak
  const todayStr = getTodayDateString();
  if (activityDates.includes(todayStr)) {
    let i = sorted.length - 1;
    let streakCount = 1;
    let prev = new Date(sorted[i]);
    for (i = sorted.length - 2; i >= 0; i--) {
      const curr = new Date(sorted[i]);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streakCount++;
        prev = curr;
      } else if (diff === 0) {
        // same day, skip
      } else {
        break;
      }
    }
    currentStreak = streakCount;
  } else {
    currentStreak = 0;
  }
  return { currentStreak, longestStreak };
}

// Helper for GitHub-style streak calendar
function getStreakCalendarData(activityDates, days = 56, dailyMinutes = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendar = [];
  const activitySet = new Set(activityDates);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const minutes = dailyMinutes[dateStr] || 0;
    // Level: 0 = none, 1 = 1-9 min, 2 = 10-29 min, 3 = 30-59 min, 4 = 60+ min
    let level = 0;
    if (minutes >= 60) level = 4;
    else if (minutes >= 30) level = 3;
    else if (minutes >= 10) level = 2;
    else if (minutes >= 1) level = 1;
    calendar.push({
      date: dateStr,
      active: activitySet.has(dateStr),
      level,
      minutes,
    });
  }
  return calendar;
}

// Helper for formatting time
function formatMinutes(mins) {
  if (!mins || mins < 1) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ courses: 0, codeLines: 0 });
  const [activityDates, setActivityDates] = useState([]);
  const [streakStats, setStreakStats] = useState({ currentStreak: 0, longestStreak: 0 });
  const [showFileInput, setShowFileInput] = useState(false);
  const [engagement, setEngagement] = useState({ totalMinutes: 0, dailyMinutes: {}, courseProgress: {} });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      if (currentUser) {
        console.log('User UID:', currentUser.uid);
        console.log('User displayName:', currentUser.displayName);
        console.log('User email:', currentUser.email);
        console.log('User photoURL:', currentUser.photoURL);
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPreviewURL(currentUser.photoURL || '');
      } else {
        console.warn('No authenticated user found.');
        setUser(null);
        setDisplayName('');
        setPreviewURL('');
        // Only navigate if not already on /login
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch stats, activity, and engagement from Firestore
  useEffect(() => {
    if (!user) return;
    setError("");
    setSuccess("");
    setStats({ courses: 0, codeLines: 0 });
    setActivityDates([]);
    setStreakStats({ currentStreak: 0, longestStreak: 0 });
    setEngagement({ totalMinutes: 0, dailyMinutes: {}, courseProgress: {} });
    const fetchStats = async () => {
      try {
        // Fetch user stats
        const statsDocRef = doc(db, 'userStats', user.uid);
        const statsDoc = await getDoc(statsDocRef);
        let courses = 0, codeLines = 0;
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          courses = data.coursesCompleted || 0;
          codeLines = data.codeLines || 0;
        }
        setStats({ courses, codeLines });
        // Fetch engagement
        const engagementDoc = await getDoc(doc(db, 'userEngagement', user.uid));
        let totalMinutes = 0, dailyMinutes = {}, courseProgress = {}, userProgress = {}, dailyCourseReadMinutes = {};
        if (engagementDoc.exists()) {
          const data = engagementDoc.data();
          totalMinutes = data.totalMinutes || 0;
          dailyMinutes = data.dailyMinutes || {};
          courseProgress = data.courseProgress || {};
          userProgress = data.userProgress || {};
          dailyCourseReadMinutes = data.dailyCourseReadMinutes || {};
        }
        // Prefer userProgress if it exists, else fallback to courseProgress
        const progressData = Object.keys(userProgress).length > 0 ? userProgress : courseProgress;
        setEngagement({ totalMinutes, dailyMinutes, courseProgress: progressData });
        // Integrate both coding and reading activity for streaks
        const allDates = new Set([
          ...Object.keys(dailyMinutes),
          ...Object.keys(dailyCourseReadMinutes)
        ]);
        const activityDates = Array.from(allDates).filter(date => {
          const code = dailyMinutes[date] || 0;
          const read = dailyCourseReadMinutes[date] || 0;
          return code > 0 || read > 0;
        });
        setActivityDates(activityDates);
        setStreakStats(calculateStreaks(activityDates));
      } catch (e) {
        setError('Failed to fetch user data. ' + (e && e.message ? e.message : ''));
        console.error('Firestore fetch error:', e);
      }
    };
    fetchStats();
  }, [user]);

  // Badge logic
  const badgeList = [
    {
      id: 1,
      label: 'First Course',
      desc: 'Completed your first course!',
      icon: <SchoolIcon color={stats.courses >= 1 ? 'primary' : 'disabled'} fontSize="large" />,
      unlocked: stats.courses >= 1,
    },
    {
      id: 2,
      label: '5 Courses',
      desc: 'Completed 5 courses!',
      icon: <SchoolIcon color={stats.courses >= 5 ? 'primary' : 'disabled'} fontSize="large" />,
      unlocked: stats.courses >= 5,
    },
    {
      id: 3,
      label: 'Code Novice',
      desc: 'Wrote 500 lines of code!',
      icon: <CodeIcon color={stats.codeLines >= 500 ? 'success' : 'disabled'} fontSize="large" />,
      unlocked: stats.codeLines >= 500,
    },
    {
      id: 4,
      label: 'Code Ninja',
      desc: 'Wrote 1000 lines of code!',
      icon: <CodeIcon color={stats.codeLines >= 1000 ? 'success' : 'disabled'} fontSize="large" />,
      unlocked: stats.codeLines >= 1000,
    },
    {
      id: 5,
      label: 'Streak Starter',
      desc: '3-day streak!',
      icon: <TrendingUpIcon color={streakStats.currentStreak >= 3 ? 'warning' : 'disabled'} fontSize="large" />,
      unlocked: streakStats.currentStreak >= 3,
    },
    {
      id: 6,
      label: 'Streak Master',
      desc: '7-day streak!',
      icon: <TrendingUpIcon color={streakStats.currentStreak >= 7 ? 'warning' : 'disabled'} fontSize="large" />,
      unlocked: streakStats.currentStreak >= 7,
    },
  ];
  const nextBadge = badgeList.find(b => !b.unlocked);
  const progressToNext = nextBadge ? Math.min(100, Math.round((stats.courses / 5) * 100)) : 100;

  // Profile image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        setError('Please upload an image (JPEG, PNG, or GIF).');
        return;
      }
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB.');
        return;
      }
      setNewPhoto(file);
      setPreviewURL(URL.createObjectURL(file));
      setError('');
    }
  };
  const handleUpload = async () => {
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
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL,
      });
      setSuccess('Profile updated successfully!');
      setNewPhoto(null);
      setPreviewURL(photoURL);
    } catch (error) {
      setError('Error updating profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  const handleCancel = () => {
    setNewPhoto(null);
    setPreviewURL(user.photoURL || '');
    setDisplayName(user.displayName || '');
    setError('');
    setSuccess('');
  };

  if (user === null) {
    return <div className="loading">Loading profile... (Check console for auth state)</div>;
  }

  return (
    <div className="profile-github-bg">
      <div className="profile-github-container">
        {/* Left Column: Avatar, Name, Edit */}
        <aside className="profile-github-sidebar">
          <div className="profile-github-avatar-wrap">
            <img
              src={previewURL || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-github-avatar"
              onError={e => { e.target.src = 'https://via.placeholder.com/150'; }}
            />
            <button
              className="edit-avatar-btn"
              aria-label="Edit profile photo"
              onClick={() => setShowFileInput(true)}
            >
              <EditIcon fontSize="small" />
            </button>
          </div>
          <h2 className="profile-github-name">{displayName || 'Coder'}</h2>
          <div className="profile-github-email">{user.email}</div>
          <div className="profile-github-actions">
            <motion.button
              onClick={handleUpload}
              disabled={uploading}
              className="update-button"
              aria-label="Update profile"
              variants={buttonHoverVariants}
              whileHover="hover"
              animate={uploading ? { x: [0, 5, 0], transition: { repeat: Infinity, duration: 0.5 } } : {}}
            >
              {uploading ? 'Updating...' : 'Update Profile'}
            </motion.button>
            {(newPhoto || displayName !== (user.displayName || '')) && (
              <motion.button
                onClick={handleCancel}
                disabled={uploading}
                className="cancel-button"
                aria-label="Cancel changes"
                variants={buttonHoverVariants}
                whileHover="hover"
              >
                Cancel
              </motion.button>
            )}
          </div>
          <div className="profile-github-edit-fields">
            <motion.label htmlFor="display-name" className="profile-label">Update Name</motion.label>
            <motion.input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="profile-input"
              disabled={uploading}
            />
            {(showFileInput || newPhoto) && (
              <>
                <motion.label htmlFor="profile-photo" className="profile-label">Update Photo</motion.label>
                <motion.input
                  id="profile-photo"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="profile-input"
                  disabled={uploading}
                />
              </>
            )}
          </div>
        </aside>
        {/* Right Column: Stats, Streaks, Badges, Activity */}
        <main className="profile-github-main">
          {/* Stats Row */}
          <div className="profile-github-stats-row">
            <div className="stat-card"><span className="stat-label">Courses</span><span className="stat-value">{stats.courses}</span></div>
            <div className="stat-card"><span className="stat-label">Current Streak</span><span className="stat-value">{streakStats.currentStreak}</span></div>
            <div className="stat-card"><span className="stat-label">Longest Streak</span><span className="stat-value">{streakStats.longestStreak}</span></div>
            <div className="stat-card"><span className="stat-label">Lines of Code</span><span className="stat-value">{stats.codeLines}</span></div>
            <div className="stat-card"><span className="stat-label">Time Spent</span><span className="stat-value">{formatMinutes(engagement.totalMinutes)}</span></div>
          </div>
          {/* Progress Bar to Next Badge */}
          {nextBadge && (
            <div className="profile-progress-bar">
              <div className="profile-progress-bar-label">
                <EmojiEventsIcon color="action" />
                <span>Progress to next badge: {nextBadge.label}</span>
              </div>
              <div className="profile-progress-bar-track">
                <div className="profile-progress-bar-fill" style={{ width: `${progressToNext}%` }}></div>
              </div>
            </div>
          )}
          {/* Streaks Card */}
          <div className="profile-github-card">
            <h3>Streaks</h3>
            <div className="streak-info">
              <LocalFireDepartmentIcon className="streak-icon" />
              <p>{streakStats.currentStreak} Day Streak</p>
              <span className="longest-streak">Longest: {streakStats.longestStreak} days</span>
            </div>
            {/* GitHub-style Streak Calendar */}
            <div className="streak-calendar" style={{gridTemplateColumns: 'repeat(7, 1fr)'}}>
              {getStreakCalendarData(activityDates, 56, engagement.dailyMinutes).map((cell, idx) => (
                <div
                  key={cell.date}
                  className={`calendar-cell${cell.active ? ' active' : ''}${cell.level ? ` level-${cell.level}` : ''}`}
                  title={cell.date + (cell.active ? ` - ${cell.minutes} min` : ' - No activity')}
                ></div>
              ))}
            </div>
            <div className="streak-calendar-legend">
              <span>Less</span>
              <span className="calendar-cell level-0"></span>
              <span className="calendar-cell level-1"></span>
              <span className="calendar-cell level-2"></span>
              <span className="calendar-cell level-3"></span>
              <span className="calendar-cell level-4"></span>
              <span>More</span>
            </div>
          </div>
          {/* Badges Card */}
          <div className="profile-github-card">
            <h3>Badges</h3>
            <div className="badges-grid">
              {badgeList.map(badge => (
                <div key={badge.id} className={`badge-card${badge.unlocked ? '' : ' locked'}`}>
                  {badge.icon}
                  <div className="badge-label">{badge.label}</div>
                  <div className="badge-desc">{badge.desc}</div>
                  {badge.unlocked && <div className="badge-unlocked">Unlocked!</div>}
                </div>
              ))}
            </div>
          </div>
          {/* Course Progress Bars */}
          {Object.keys(engagement.courseProgress).length > 0 && (
            <div className="profile-github-card">
              <h3>Course Progress</h3>
              {Object.entries(engagement.courseProgress).map(([courseId, percent]) => (
                <div key={courseId} style={{marginBottom:'1.2rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:500}}>{courseId}</span>
                    <span style={{fontSize:'0.95rem',color:'#666'}}>{percent}%</span>
                  </div>
                  <LinearProgress variant="determinate" value={percent} style={{height:8,borderRadius:4,marginTop:4}} />
                </div>
              ))}
            </div>
          )}
          {/* Motivation Card */}
          <div className="motivation-card profile-github-card">
            <TipsAndUpdatesIcon color="primary" fontSize="large" />
            <div>
              <div className="motivation-title">Tip for Beginners</div>
              <div className="motivation-text">Practice a little every day. Unlock more badges as you learn and code. Your journey has just begun!</div>
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                className="error-message"
                key="error"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                className="success-message"
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}