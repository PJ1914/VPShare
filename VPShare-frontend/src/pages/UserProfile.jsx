import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import StarIcon from '@mui/icons-material/Star';
import Tooltip from '@mui/material/Tooltip';
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

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const minutes = dailyMinutes[dateStr] || 0;
    let level = 0;
    if (minutes >= 60) level = 4;
    else if (minutes >= 30) level = 3;
    else if (minutes >= 10) level = 2;
    else if (minutes >= 1) level = 1;

    calendar.push({ date: dateStr, active: activitySet.has(dateStr), level, minutes });
  }

  return calendar;
};

const formatMinutes = (mins) => {
  if (!mins || mins < 1) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
};

const StatCard = ({ label, value }) => (
  <motion.div className="stat-card" variants={cardVariants}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </motion.div>
);

const BadgeCard = ({ badge }) => (
  <Tooltip title={badge.desc} arrow>
    <motion.div className={`badge-card ${badge.unlocked ? '' : 'locked'}`} variants={cardVariants}>
      {badge.icon}
      <div className="badge-label">{badge.label}</div>
      {badge.unlocked && <div className="badge-unlocked">Unlocked!</div>}
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

    try {
      const statsDocRef = doc(db, 'userStats', user.uid);
      const statsDoc = await getDoc(statsDocRef);
      const statsData = statsDoc.exists() ? statsDoc.data() : {};
      setStats({
        courses: statsData.coursesCompleted || 0,
        codeLines: statsData.codeLines || 0,
      });

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      setBio(userData.bio || '');
      setSocialLinks({
        github: userData.socialLinks?.github || '',
        linkedin: userData.socialLinks?.linkedin || '',
        twitter: userData.socialLinks?.twitter || '',
      });

      const engagementDoc = await getDoc(doc(db, 'userEngagement', user.uid));
      const engagementData = engagementDoc.exists() ? engagementDoc.data() : {};
      const totalMinutes = engagementData.totalMinutes || 0;
      const dailyMinutes = engagementData.dailyMinutes || {};
      const courseProgress = engagementData.userProgress || engagementData.courseProgress || {};
      const dailyCourseReadMinutes = engagementData.dailyCourseReadMinutes || {};

      setEngagement({ totalMinutes, dailyMinutes, courseProgress });

      const allDates = new Set([...Object.keys(dailyMinutes), ...Object.keys(dailyCourseReadMinutes)]);
      const activityDates = Array.from(allDates).filter(
        (date) => (dailyMinutes[date] || 0) > 0 || (dailyCourseReadMinutes[date] || 0) > 0
      );
      setActivityDates(activityDates);
      setStreakStats(calculateStreaks(activityDates));
    } catch (e) {
      setError('Failed to fetch user data: ' + e.message);
      console.error('Firestore fetch error:', e);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const badgeList = useMemo(
    () => [
      { id: 1, label: 'First Course', desc: 'Completed your first course!', icon: <SchoolIcon />, unlocked: stats.courses >= 1 },
      { id: 2, label: '5 Courses', desc: 'Completed 5 courses!', icon: <SchoolIcon />, unlocked: stats.courses >= 5 },
      { id: 3, label: 'Code Novice', desc: 'Wrote 500 lines of code!', icon: <CodeIcon />, unlocked: stats.codeLines >= 500 },
      { id: 4, label: 'Code Ninja', desc: 'Wrote 1000 lines of code!', icon: <CodeIcon />, unlocked: stats.codeLines >= 1000 },
      { id: 5, label: 'Streak Starter', desc: '3-day streak!', icon: <TrendingUpIcon />, unlocked: streakStats.currentStreak >= 3 },
      { id: 6, label: 'Streak Master', desc: '7-day streak!', icon: <TrendingUpIcon />, unlocked: streakStats.currentStreak >= 7 },
    ],
    [stats.courses, stats.codeLines, streakStats.currentStreak]
  );

  const nextBadge = badgeList.find((b) => !b.unlocked);
  const progressToNext = useMemo(() => {
    if (!nextBadge) return 100;
    if (nextBadge.id <= 2) return Math.min(100, (stats.courses / (nextBadge.id === 1 ? 1 : 5)) * 100);
    if (nextBadge.id <= 4) return Math.min(100, (stats.codeLines / (nextBadge.id === 3 ? 500 : 1000)) * 100);
    return Math.min(100, (streakStats.currentStreak / (nextBadge.id === 5 ? 3 : 7)) * 100);
  }, [nextBadge, stats.courses, stats.codeLines, streakStats.currentStreak]);

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
    };
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.downloadection = `${user.displayName || 'user'}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user === null) return <div className="loading">Loading profile...</div>;

  return (
    <motion.div className={`profile-github-bg ${theme}`} variants={containerVariants} initial="hidden" animate="visible">
      <div className="profile-github-container">
        <aside className="profile-github-sidebar">
          <div className="profile-github-avatar-wrap">
            <img
              src={previewURL || 'https://via.placeholder.com/150'}
              alt="Profile avatar"
              className="profile-github-avatar"
              onError={() => setPreviewURL('https://via.placeholder.com/150')}
            />
            <button
              className="edit-avatar-btn"
              aria-label="Edit profile photo"
              onClick={() => setShowFileInput(true)}
              disabled={uploading}
            >
              <EditIcon fontSize="small" />
            </button>
          </div>
          <h2 className="profile-github-name">{displayName || 'Coder'}</h2>
          <div className="profile-github-email">{user.email}</div>
          {bio && <div className="profile-github-bio">{bio}</div>}
          <div className="profile-github-social">
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                <GitHubIcon />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                <LinkedInIcon />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter profile">
                <TwitterIcon />
              </a>
            )}
          </div>
          <div className="profile-github-edit-fields">
            <label htmlFor="display-name" className="profile-label">Name</label>
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
            <label htmlFor="bio" className="profile-label">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="profile-input"
              disabled={uploading}
              maxLength={160}
              rows={3}
            />
            <label htmlFor="github" className="profile-label">GitHub</label>
            <input
              id="github"
              type="url"
              value={socialLinks.github}
              onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
              placeholder="https://github.com/username"
              className="profile-input"
              disabled={uploading}
            />
            <label htmlFor="linkedin" className="profile-label">LinkedIn</label>
            <input
              id="linkedin"
              type="url"
              value={socialLinks.linkedin}
              onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="profile-input"
              disabled={uploading}
            />
            <label htmlFor="twitter" className="profile-label">Twitter</label>
            <input
              id="twitter"
              type="url"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              placeholder="https://twitter.com/username"
              className="profile-input"
              disabled={uploading}
            />
            {showFileInput && (
              <>
                <label htmlFor="profile-photo" className="profile-label">Photo</label>
                <input
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
          <div className="profile-github-actions">
            <motion.button
              onClick={handleUpdate}
              disabled={uploading}
              className="update-button"
              aria-label="Update profile"
              variants={buttonVariants}
              whileHover="hover"
            >
              {uploading ? 'Updating...' : 'Save Changes'}
            </motion.button>
            {(newPhoto || displayName !== (user.displayName || '') || bio || socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
              <motion.button
                onClick={handleCancel}
                disabled={uploading}
                className="cancel-button"
                aria-label="Cancel changes"
                variants={buttonVariants}
                whileHover="hover"
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              onClick={handleExportProfile}
              className="export-button"
              aria-label="Export profile"
              variants={buttonVariants}
              whileHover="hover"
            >
              Export Profile
            </motion.button>
            <motion.button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="theme-button"
              aria-label="Toggle theme"
              variants={buttonVariants}
              whileHover="hover"
            >
              <Brightness4Icon />
            </motion.button>
          </div>
        </aside>
        <main className="profile-github-main">
          <motion.div className="profile-github-stats-row" variants={cardVariants}>
            <StatCard label="Courses" value={stats.courses} />
            <StatCard label="Current Streak" value={streakStats.currentStreak} />
            <StatCard label="Longest Streak" value={streakStats.longestStreak} />
            <StatCard label="Lines of Code" value={stats.codeLines} />
            <StatCard label="Time Spent" value={formatMinutes(engagement.totalMinutes)} />
          </motion.div>
          {nextBadge && (
            <motion.div className="profile-progress-bar" variants={cardVariants}>
              <div className="profile-progress-bar-label">
                <StarIcon className="star-icon" />
                <span>Progress to {nextBadge.label}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  >
                    {progressToNext >= 100 && <div className="progress-bar-sparkle" />}
                  </motion.div>
                </div>
                <span className="progress-bar-percent">{Math.round(progressToNext)}%</span>
              </div>
            </motion.div>
          )}
          <motion.div className="profile-github-card" variants={cardVariants}>
            <h3>Streaks</h3>
            <div className="streak-info">
              <LocalFireDepartmentIcon className="streak-icon" />
              <p>{streakStats.currentStreak} Day Streak</p>
              <span className="longest-streak">Longest: {streakStats.longestStreak} days</span>
            </div>
            <div className="streak-calendar">
              {getStreakCalendarData(activityDates, engagement.dailyMinutes).map((cell) => (
                <Tooltip
                  key={cell.date}
                  title={`${cell.date}: ${cell.active ? `${cell.minutes} min` : 'No activity'}`}
                  arrow
                >
                  <div className={`calendar-cell ${cell.active ? 'active' : ''} level-${cell.level}`} />
                </Tooltip>
              ))}
            </div>
            <div className="streak-calendar-legend">
              <span>Less</span>
              <span className="calendar-cell level-0" />
              <span className="calendar-cell level-1" />
              <span className="calendar-cell level-2" />
              <span className="calendar-cell level-3" />
              <span className="calendar-cell level-4" />
              <span>More</span>
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