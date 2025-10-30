import React from 'react';
import Confetti from 'react-confetti';

const CourseCompletionModal = ({ open, onClose, onShare, onDownload, userName, courseName }) => {
  if (!open) return null;
  return (
    <div className="completion-modal-overlay">
      <Confetti numberOfPieces={350} recycle={false} className="confetti-overlay" />
      <div className="completion-modal">
        <div className="trophy-animation">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#FFD700" strokeWidth="4" fill="#FFFBEA" />
            <path d="M20 30 Q40 10 60 30 Q60 50 40 60 Q20 50 20 30 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
            <circle cx="40" cy="35" r="8" fill="#FFF8DC" stroke="#FFD700" strokeWidth="2" />
          </svg>
        </div>
        <h2>Congratulations, {userName || 'Coder'}!</h2>
        <p>
          You have <span className="highlight">completed</span> the course <b>{courseName}</b>!<br />
          This is a huge achievement—keep building, keep learning!
        </p>
        <div className="modal-actions">
          <button className="modal-btn share-btn" onClick={onShare}>Share</button>
          <button className="modal-btn download-btn" onClick={onDownload}>Download Certificate</button>
          <button className="modal-btn close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionModal;
