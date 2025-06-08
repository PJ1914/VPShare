import { useState, useEffect } from 'react';
import { auth, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star'; // MUI icon for achievements
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // MUI icon for streaks
import '../styles/UserProfile.css';

// Animation variants for the profile container
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Animation variants for buttons
const buttonHoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Animation variants for form elements
const formElementVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// Animation variants for messages
const messageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// Animation variants for achievements and streaks sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Sample achievements data (replace with real data from your backend)
const achievementsData = [
  { id: 1, title: 'First Course Completed', description: 'Completed your first course on the platform.', icon: <StarIcon /> },
  { id: 2, title: '5 Courses Mastered', description: 'Completed 5 courses successfully.', icon: <StarIcon /> },
  { id: 3, title: 'Code Ninja', description: 'Wrote 1000 lines of code in the playground.', icon: <StarIcon /> },
];

// Sample streaks data (replace with real data from your backend)
const streakData = { days: 7 };

function UserProfile() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewURL, setPreviewURL] = useState(''); // For image preview
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPreviewURL(currentUser.photoURL || '');
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
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
      // Update photo if a new one is selected
      let photoURL = user.photoURL;
      if (newPhoto) {
        const fileRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(fileRef, newPhoto);
        photoURL = await getDownloadURL(fileRef);
      }
      // Update profile with new display name and photo
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL,
      });
      setSuccess('Profile updated successfully!');
      setNewPhoto(null);
      setPreviewURL(photoURL);
    } catch (error) {
      console.error('Update failed:', error);
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

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <motion.div
      className="profile-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2>User Profile</h2>
      <AnimatePresence>
        {error && (
          <motion.p
            className="error-message"
            key="error"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            className="success-message"
            key="success"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.img
        src={previewURL || 'https://via.placeholder.com/150'}
        alt="Profile"
        className="profile-image"
        key={previewURL}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/150';
          console.error('Failed to load profile image:', previewURL);
        }}
      />
      <div className="profile-details">
        <p><strong>Name:</strong> {user.displayName || 'No name set'}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Achievements Section */}
      <motion.div
        className="achievements-section"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <h3>Achievements</h3>
        <div className="achievements-grid">
          {achievementsData.length > 0 ? (
            achievementsData.map((achievement) => (
              <motion.div
                key={achievement.id}
                className="achievement-card"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <h4>{achievement.title}</h4>
                <div className="achievement-tooltip">{achievement.description}</div>
              </motion.div>
            ))
          ) : (
            <p>No achievements yet. Keep learning to earn badges!</p>
          )}
        </div>
      </motion.div>

      {/* Streaks Section */}
      <motion.div
        className="streaks-section"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <h3>Streaks</h3>
        <div className="streak-info">
          <LocalFireDepartmentIcon className="streak-icon" />
          <p>{streakData.days} Day Streak</p>
        </div>
      </motion.div>

      <div className="upload-section">
        <motion.label
          htmlFor="display-name"
          className="profile-label"
          variants={formElementVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          Update Name
        </motion.label>
        <motion.input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="profile-input"
          disabled={uploading}
          variants={formElementVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        <motion.label
          htmlFor="profile-photo"
          className="profile-label"
          variants={formElementVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          Update Photo
        </motion.label>
        <motion.input
          id="profile-photo"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="profile-input"
          disabled={uploading}
          variants={formElementVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9 }}
        />
        <motion.div
          className="profile-actions"
          variants={formElementVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0 }}
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UserProfile;