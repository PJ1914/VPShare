import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Send, User, Users, GraduationCap, Building, BookOpen, Heart } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const RegistrationForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    email: user?.email || '',
    phone: '',
    college: '',
    stream: '',
    currentYear: '',
    whyJoin: '',
    agreeToTrial: false,
    agreeToTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.email || 
        !formData.college || !formData.stream || !formData.whyJoin) {
      setError('Please fill all required fields');
      return;
    }

    if (!formData.agreeToTrial || !formData.agreeToTerms) {
      setError('Please agree to the trial terms and conditions');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Store in Firestore
      await addDoc(collection(db, 'liveClassRegistrations'), {
        ...formData,
        userId: user?.uid || null,
        userEmail: user?.email || formData.email,
        createdAt: serverTimestamp(),
        status: 'pending',
        trialStarted: false
      });

      setSubmitted(true);
      setFormData({
        name: '',
        fatherName: '',
        email: user?.email || '',
        phone: '',
        college: '',
        stream: '',
        currentYear: '',
        whyJoin: '',
        agreeToTrial: false,
        agreeToTerms: false
      });
    } catch (err) {
      console.error('Error submitting registration:', err);
      let errorMessage = 'Failed to submit registration. Please try again.';
      
      // Provide more specific error messages
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your connection and try again.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="registration-section">
        <div className="container">
          <motion.div
            className="registration-success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={64} />
            </motion.div>
            <h2>Registration Successful! 🎉</h2>
            <p>
              Thank you for registering for the Python & AWS Full Stack Live Classes!
              <br /><br />
              <strong>What's Next?</strong>
              <br />
              ✅ You'll receive a confirmation email within 24 hours
              <br />
              ✅ Your 1-week free trial will start on the course commencement date
              <br />
              ✅ Our team will contact you with joining details
              <br /><br />
              During your free trial week, you'll get full access to:
              <br />
              • Live mentor-led classes
              <br />
              • All course materials
              <br />
              • Project assignments
              <br />
              • Community support
              <br /><br />
              After the trial, if you love our course, you can continue with the full program!
            </p>
            <motion.button
              className="back-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSubmitted(false)}
            >
              Register Another Student
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="registration-section" id="register">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Register for Live Classes</h2>
          <p className="section-description">
            Join our Python & AWS Full Stack Development course with a <strong>FREE 1-Week Trial</strong>!
          </p>

          {/* Trial Info Banner */}
          <motion.div
            className="trial-banner"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="trial-icon">🎁</div>
            <div className="trial-content">
              <h3>1-Week FREE Trial</h3>
              <p>
                Experience the full course for <strong>1 week absolutely free</strong>! Attend live classes, 
                work on projects, and interact with mentors. If you love it, continue with the full program. 
                No payment required for trial!
              </p>
            </div>
          </motion.div>

          <form className="registration-form" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div className="form-grid">
              {/* Personal Information */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <User size={20} />
                  Personal Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fatherName">Father's Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter your father's name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              {/* Educational Information */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <GraduationCap size={20} />
                  Educational Background
                </h3>
                
                <div className="form-group">
                  <label htmlFor="college">College/University <span className="required">*</span></label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stream">Stream/Branch <span className="required">*</span></label>
                  <input
                    type="text"
                    id="stream"
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science, IT, ECE"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentYear">Current Year</label>
                  <select
                    id="currentYear"
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="graduate">Graduate</option>
                    <option value="working">Working Professional</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Why Join */}
            <div className="form-section full-width">
              <h3 className="form-section-title">
                <Heart size={20} />
                Tell Us About Your Goals
              </h3>
              
              <div className="form-group">
                <label htmlFor="whyJoin">
                  Why do you want to join this course? What are your career goals? 
                  <span className="required">*</span>
                </label>
                <textarea
                  id="whyJoin"
                  name="whyJoin"
                  value={formData.whyJoin}
                  onChange={handleChange}
                  placeholder="Tell us about your motivation, career goals, and what you hope to achieve from this course..."
                  rows="5"
                  required
                />
                <small>Share your aspirations, current skill level, and what you want to learn</small>
              </div>
            </div>

            {/* Trial Agreement */}
            <div className="form-section full-width">
              <h3 className="form-section-title">
                <BookOpen size={20} />
                Trial Agreement
              </h3>
              
              <div className="agreement-box">
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="agreeToTrial"
                    name="agreeToTrial"
                    checked={formData.agreeToTrial}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreeToTrial">
                    <strong>I understand and agree to the trial terms:</strong>
                    <ul>
                      <li>The first week of the course is completely FREE</li>
                      <li>I will have full access to live classes, materials, and mentorship during the trial</li>
                      <li>After the 1-week trial, if I wish to continue, I will need to pay the course fee</li>
                      <li>I can choose not to continue after the trial with no obligations</li>
                      <li>I will receive payment details at the end of the trial period</li>
                    </ul>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreeToTerms">
                    I agree to the terms and conditions and understand that continuation after the trial period requires payment
                    <span className="required">*</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="submit-btn"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.05 }}
              whileTap={{ scale: submitting ? 1 : 0.95 }}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Register for FREE Trial
                </>
              )}
            </motion.button>

            <p className="form-note">
              <CheckCircle size={16} />
              By registering, you'll receive a confirmation email with next steps. 
              Our team will contact you before the course starts!
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default RegistrationForm;
