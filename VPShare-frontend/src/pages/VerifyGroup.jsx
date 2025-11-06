import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { verifyGroupMember } from '../services/groupEnrollmentService';
import '../styles/VerifyGroup.css';

const VerifyGroup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const groupId = searchParams.get('groupId');

  useEffect(() => {
    if (!token || !groupId) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    verifyEmail();
  }, [token, groupId]);

  const verifyEmail = async () => {
    try {
      const response = await verifyGroupMember(token, groupId);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="verify-group-page loading">
        <div className="verification-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock size={64} className="loading-icon" />
          </motion.div>
          <h2>Verifying your email...</h2>
          <p>Please wait while we verify your group enrollment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verify-group-page error">
        <div className="verification-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <XCircle size={64} className="error-icon" />
          </motion.div>

          <h2>Verification Failed</h2>
          <p className="error-message">{error}</p>

          <div className="error-reasons">
            <h4>Common reasons:</h4>
            <ul>
              <li>Verification link has expired (valid for 24 hours)</li>
              <li>Link has already been used</li>
              <li>Group enrollment has expired</li>
              <li>Invalid or corrupted link</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={() => navigate('/courses')} className="secondary-btn">
              Go to Courses
            </button>
            <button onClick={() => navigate('/group-enrollment')} className="primary-btn">
              Create New Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    const { verifiedCount, totalMembers, readyForPayment } = result;

    return (
      <div className="verify-group-page success">
        <div className="verification-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={80} className="success-icon" />
          </motion.div>

          <h2>Email Verified Successfully!</h2>
          <p className="success-message">
            You're now part of the group enrollment for Live Classes - Python & AWS
          </p>

          {/* Progress Info */}
          <div className="verification-stats">
            <div className="stat-card">
              <div className="stat-number">{verifiedCount}</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-card">
              <div className="stat-number">{totalMembers}</div>
              <div className="stat-label">Total Members</div>
            </div>
          </div>

          {/* Status Message */}
          {readyForPayment ? (
            <div className="status-message ready">
              <CheckCircle size={24} />
              <div>
                <h4>Group Ready for Payment! 🎉</h4>
                <p>Your group has reached the minimum verified members. The group leader can now proceed with payment.</p>
              </div>
            </div>
          ) : (
            <div className="status-message pending">
              <Clock size={24} />
              <div>
                <h4>Waiting for More Verifications</h4>
                <p>
                  {3 - verifiedCount} more member{3 - verifiedCount !== 1 ? 's' : ''} need{3 - verifiedCount === 1 ? 's' : ''} to verify before payment can be processed.
                </p>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="next-steps-box">
            <h3>What happens next?</h3>
            <ol className="steps-list">
              <li>
                <strong>Wait for others to verify</strong>
                <p>All group members need to verify their email addresses</p>
              </li>
              <li>
                <strong>Group leader processes payment</strong>
                <p>Once minimum 3 members verify, the leader can complete payment</p>
              </li>
              <li>
                <strong>Instant access</strong>
                <p>All verified members get immediate access to Live Classes after payment</p>
              </li>
              <li>
                <strong>Check your email</strong>
                <p>You'll receive updates about enrollment status and class schedule</p>
              </li>
            </ol>
          </div>

          {/* Course Benefits */}
          <div className="course-benefits">
            <h4>What you'll get:</h4>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">🎓</div>
                <div className="benefit-text">12-week live program</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">👨‍🏫</div>
                <div className="benefit-text">Expert mentorship</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💻</div>
                <div className="benefit-text">Hands-on projects</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📜</div>
                <div className="benefit-text">Certificate</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => navigate(`/group-status/${groupId}`)}
              className="primary-btn"
            >
              View Group Status
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="secondary-btn"
            >
              Explore Courses
            </button>
          </div>

          {/* Important Note */}
          <div className="note-box">
            <AlertCircle size={20} />
            <p>
              <strong>Important:</strong> Save this link! You can check your group's verification 
              progress anytime by visiting the group status page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyGroup;
