import { useState, useEffect } from 'react';
import { auth, storage } from '../config/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewURL, setPreviewURL] = useState(''); // For image preview
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    <div className="profile-container">
      <h2>User Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <img
        src={previewURL || 'https://via.placeholder.com/150'}
        alt="Profile"
        className="profile-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/150';
          console.error('Failed to load profile image:', previewURL);
        }}
      />
      <div className="profile-details">
        <p><strong>Name:</strong> {user.displayName || 'No name set'}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="upload-section">
        <label htmlFor="display-name" className="profile-label">Update Name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="profile-input"
          disabled={uploading}
        />
        <label htmlFor="profile-photo" className="profile-label">Update Photo</label>
        <input
          id="profile-photo"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="profile-input"
          disabled={uploading}
        />
        <div className="profile-actions">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="update-button"
            aria-label="Update profile"
          >
            {uploading ? 'Updating...' : 'Update Profile'}
          </button>
          {(newPhoto || displayName !== (user.displayName || '')) && (
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="cancel-button"
              aria-label="Cancel changes"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;