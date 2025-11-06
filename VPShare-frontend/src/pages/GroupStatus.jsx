import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Mail, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { getGroupEnrollmentStatus, checkGroupPaymentEligibility, resendVerificationEmail } from '../services/groupEnrollmentService';
import '../styles/GroupStatus.css';

const GroupStatus = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [paymentEligibility, setPaymentEligibility] = useState(null);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(null);

  // Fetch group status
  useEffect(() => {
    fetchGroupStatus();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchGroupStatus, 30000);
    return () => clearInterval(interval);
  }, [groupId]);

  const fetchGroupStatus = async () => {
    try {
      const [status, eligibility] = await Promise.all([
        getGroupEnrollmentStatus(groupId),
        checkGroupPaymentEligibility(groupId),
      ]);
      setGroupData(status);
      setPaymentEligibility(eligibility);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch group status');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async (memberEmail) => {
    setResending(memberEmail);
    try {
      await resendVerificationEmail(groupId, memberEmail);
      alert('Verification email resent successfully!');
    } catch (err) {
      alert(err.message || 'Failed to resend email');
    } finally {
      setResending(null);
    }
  };

  // Proceed to payment
  const handleProceedToPayment = () => {
    navigate(`/payment?plan=live-classes-group&groupId=${groupId}`);
  };

  if (loading) {
    return (
      <div className="group-status-page loading">
        <div className="spinner"></div>
        <p>Loading group status...</p>
      </div>
    );
  }

  if (error || !groupData) {
    return (
      <div className="group-status-page error">
        <AlertCircle size={64} />
        <h2>Error Loading Group</h2>
        <p>{error || 'Group not found'}</p>
        <button onClick={() => navigate('/courses')} className="back-btn">
          Back to Courses
        </button>
      </div>
    );
  }

  const verificationProgress = (groupData.verifiedCount / groupData.totalMembers) * 100;
  const isReadyForPayment = paymentEligibility?.eligible;
  const timeRemaining = new Date(groupData.expiresAt) - Date.now();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <div className="group-status-page">
      <div className="group-status-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="status-header"
        >
          <Users className="header-icon" size={48} />
          <h1>Group Enrollment Status</h1>
          <p>Track verification progress and proceed to payment</p>
        </motion.div>

        {/* Status Badge */}
        <div className={`status-badge ${groupData.status}`}>
          {groupData.status === 'pending_verification' && '⏳ Pending Verification'}
          {groupData.status === 'verified_ready_for_payment' && '✅ Ready for Payment'}
          {groupData.status === 'enrolled' && '🎉 Enrolled'}
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <h3>Verification Progress</h3>
            <span className="progress-count">
              {groupData.verifiedCount} / {groupData.totalMembers} verified
            </span>
          </div>

          <div className="progress-bar-container">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${verificationProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="progress-info">
            {isReadyForPayment ? (
              <div className="ready-message">
                <CheckCircle size={20} />
                <span>Minimum members verified! You can now proceed to payment.</span>
              </div>
            ) : (
              <div className="pending-message">
                <Clock size={20} />
                <span>Need {3 - groupData.verifiedCount} more verification(s) to unlock payment</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Warning */}
        {daysRemaining <= 3 && groupData.status !== 'enrolled' && (
          <div className="expiry-warning">
            <AlertCircle size={20} />
            <span>
              ⚠️ Group enrollment expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}! 
              Complete verification soon.
            </span>
          </div>
        )}

        {/* Members List */}
        <div className="members-section">
          <h3>Group Members</h3>

          <div className="members-list">
            {groupData.members.map((member, index) => (
              <motion.div
                key={member.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`member-item ${member.verified ? 'verified' : 'pending'}`}
              >
                <div className="member-info">
                  <div className="member-avatar">
                    {member.verified ? (
                      <CheckCircle size={24} className="verified-icon" />
                    ) : (
                      <Clock size={24} className="pending-icon" />
                    )}
                  </div>

                  <div className="member-details">
                    <h4>{member.name}</h4>
                    <p>{member.email}</p>
                    {member.verified && member.verifiedAt && (
                      <span className="verified-time">
                        Verified {new Date(member.verifiedAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {!member.verified && (
                  <button
                    onClick={() => handleResendEmail(member.email)}
                    className="resend-btn"
                    disabled={resending === member.email}
                  >
                    {resending === member.email ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Resend Email
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pricing-summary">
          <h3>Payment Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Price per student:</span>
              <span>₹{groupData.pricePerStudent.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Total verified members:</span>
              <span>{groupData.verifiedCount}</span>
            </div>
            <div className="summary-row total">
              <span>Total amount:</span>
              <span className="total-amount">
                ₹{(groupData.verifiedCount * groupData.pricePerStudent).toLocaleString()}
              </span>
            </div>
            <div className="savings-note">
              💰 Saving ₹{((10199 - 5199) * groupData.verifiedCount).toLocaleString()} compared to individual pricing!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {isReadyForPayment && groupData.paymentStatus !== 'completed' ? (
            <button onClick={handleProceedToPayment} className="payment-btn">
              <CreditCard size={20} />
              Proceed to Payment
            </button>
          ) : groupData.paymentStatus === 'completed' ? (
            <button onClick={() => navigate('/courses')} className="enrolled-btn">
              <CheckCircle size={20} />
              View Live Classes
            </button>
          ) : (
            <button disabled className="payment-btn disabled">
              <Clock size={20} />
              Waiting for Verifications
            </button>
          )}

          <button onClick={fetchGroupStatus} className="refresh-btn">
            <RefreshCw size={20} />
            Refresh Status
          </button>
        </div>

        {/* Information Box */}
        <div className="info-box">
          <h4>Important Information</h4>
          <ul>
            <li>Each member must verify their email within 24 hours of receiving the link</li>
            <li>Minimum 3 verified members required before payment can be processed</li>
            <li>Payment will be processed for all verified members only</li>
            <li>Members who don't verify in time can be added to a new group</li>
            <li>Group enrollment expires in {daysRemaining} days</li>
            <li>All verified members will get instant access after payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupStatus;
