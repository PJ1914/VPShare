import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, CheckCircle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { createGroupEnrollment } from '../services/groupEnrollmentService';
import '../styles/GroupEnrollment.css';

const GroupEnrollment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [members, setMembers] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
  ]);

  // Add new member field
  const addMember = () => {
    if (members.length >= 20) {
      setError('Maximum 20 students per group');
      return;
    }
    setMembers([...members, { name: '', email: '' }]);
  };

  // Remove member field
  const removeMember = (index) => {
    if (members.length <= 2) {
      setError('Minimum 3 students required (including you)');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  // Update member data
  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
    setError('');
  };

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate form
  const validateForm = () => {
    // Check if all fields are filled
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) {
        setError(`Please enter name for Student ${i + 2}`);
        return false;
      }
      if (!members[i].email.trim()) {
        setError(`Please enter email for Student ${i + 2}`);
        return false;
      }
      if (!isValidEmail(members[i].email)) {
        setError(`Invalid email format for Student ${i + 2}`);
        return false;
      }
    }

    // Check for duplicate emails
    const emails = members.map(m => m.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError('Duplicate emails found. Each student must have a unique email.');
      return false;
    }

    return true;
  };

  // Submit group enrollment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await createGroupEnrollment({ members });
      setGroupId(result.groupId);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to create group enrollment');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  const totalMembers = members.length + 1; // +1 for leader
  const pricePerStudent = 5199;
  const totalAmount = totalMembers * pricePerStudent;
  const savings = totalMembers * (10199 - 5199);

  return (
    <div className="group-enrollment-page">
      <div className="group-enrollment-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="enrollment-header"
        >
          <Users className="header-icon" size={48} />
          <h1>Group Enrollment</h1>
          <p>Join Live Classes with your team and save up to 49%!</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Add Members</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Verification</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Payment</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Add Members Form */}
          {step === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="enrollment-content"
            >
              <form onSubmit={handleSubmit} className="enrollment-form">
                {/* Pricing Info */}
                <div className="pricing-info">
                  <div className="pricing-card">
                    <h3>Group Pricing</h3>
                    <div className="price-details">
                      <div className="price-row">
                        <span>Price per student:</span>
                        <span className="price">₹{pricePerStudent}</span>
                      </div>
                      <div className="price-row">
                        <span>Total members:</span>
                        <span className="count">{totalMembers}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total amount:</span>
                        <span className="total-price">₹{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="savings">
                        💰 You save ₹{savings.toLocaleString()} compared to individual pricing!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leader Info */}
                <div className="member-card leader-card">
                  <div className="card-header">
                    <Users size={20} />
                    <h3>Group Leader (You)</h3>
                    <span className="verified-badge">Auto-verified ✓</span>
                  </div>
                  <p className="info-text">
                    You will coordinate payment and receive updates about verification status.
                  </p>
                </div>

                {/* Member Fields */}
                <div className="members-section">
                  <h3>Add Team Members</h3>
                  <p className="section-desc">
                    Enter details for at least 2 more students (minimum 3 total). Each will receive a verification email.
                  </p>

                  {members.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="member-card"
                    >
                      <div className="card-header">
                        <Mail size={18} />
                        <h4>Student {index + 2}</h4>
                        {members.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="remove-btn"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Email Address *</label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <button
                    type="button"
                    onClick={addMember}
                    className="add-member-btn"
                    disabled={members.length >= 20}
                  >
                    <Plus size={20} />
                    Add Another Member
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error-message"
                  >
                    <AlertCircle size={20} />
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || members.length < 2}
                >
                  {loading ? 'Creating Group...' : 'Create Group & Send Verifications'}
                </button>

                <p className="terms-text">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                  All members must verify their email within 24 hours.
                </p>
              </form>
            </motion.div>
          )}

          {/* Step 2: Verification Status */}
          {step === 2 && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="enrollment-content"
            >
              <div className="success-message">
                <CheckCircle size={64} className="success-icon" />
                <h2>Group Created Successfully!</h2>
                <p>Verification emails have been sent to all members.</p>
              </div>

              <div className="verification-info">
                <div className="info-card">
                  <Clock size={24} />
                  <div>
                    <h4>Verification Deadline</h4>
                    <p>All members have 24 hours to verify their email addresses.</p>
                  </div>
                </div>

                <div className="info-card">
                  <Users size={24} />
                  <div>
                    <h4>Minimum Required</h4>
                    <p>At least 3 verified members needed to unlock payment.</p>
                  </div>
                </div>

                <div className="info-card">
                  <Mail size={24} />
                  <div>
                    <h4>Check Email</h4>
                    <p>Each member will receive a verification link in their inbox.</p>
                  </div>
                </div>
              </div>

              <div className="next-steps">
                <h3>What happens next?</h3>
                <ol>
                  <li>All members check their email and click the verification link</li>
                  <li>Once 3+ members are verified, you'll be able to proceed to payment</li>
                  <li>After payment, all verified members get instant access to Live Classes</li>
                  <li>You'll receive updates about verification status via email</li>
                </ol>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/group-status/${groupId}`)}
                  className="primary-btn"
                >
                  View Verification Status
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="secondary-btn"
                >
                  Back to Courses
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupEnrollment;
