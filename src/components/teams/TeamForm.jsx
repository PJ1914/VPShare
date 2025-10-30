import React, { useState, useEffect } from "react";
import { X, Plus, CheckCircle, AlertCircle, Users } from 'lucide-react';
import "../../styles/TeamForm.css";

const TeamForm = ({ team, onSubmit, onCancel, isEditing = false }) => {
  // Initialize form state with team data if in edit mode, or empty values if creating
  const [formData, setFormData] = useState({
    teamname: team?.teamname || team?.name || "",
    leaderUid: team?.leaderUid || "",
    problem_statement: team?.problem_statement || team?.project_name || "",
    teamsize: team?.teamsize || team?.members?.length?.toString() || "3",
    members: team?.members || [],
    order_id: team?.order_id || "",
    payment_id: team?.payment_id || "",
  });

  const initialMember = {
    name: "",
    email: "",
    role: "Student Coordinator",
    branch: "",
    college: "",
    phonenumber: "",
    year: "1st",
    gender: "male"
  };

  const [member, setMember] = useState(initialMember);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [memberErrors, setMemberErrors] = useState({});

  // Update form data when team prop changes
  useEffect(() => {
    if (team) {
      setFormData({
        teamname: team.teamname || team.name || "",
        leaderUid: team.leaderUid || "",
        problem_statement: team.problem_statement || team.project_name || "",
        teamsize: team.teamsize || team.members?.length?.toString() || "3",
        members: team.members || [],
        order_id: team.order_id || "",
        payment_id: team.payment_id || "",
      });
    }
  }, [team]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone number validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validate = () => {
    const newErrors = {};

    // Team name validation
    if (!formData.teamname.trim()) {
      newErrors.teamname = 'Team name is required';
    } else if (formData.teamname.trim().length < 3) {
      newErrors.teamname = 'Team name must be at least 3 characters';
    } else if (formData.teamname.trim().length > 50) {
      newErrors.teamname = 'Team name must be less than 50 characters';
    }

    // Problem statement validation
    if (!formData.problem_statement.trim()) {
      newErrors.problem_statement = 'Problem statement is required';
    } else if (formData.problem_statement.trim().length < 10) {
      newErrors.problem_statement = 'Problem statement must be at least 10 characters';
    } else if (formData.problem_statement.trim().length > 500) {
      newErrors.problem_statement = 'Problem statement must be less than 500 characters';
    }

    // Team size validation
    const teamSizeNum = parseInt(formData.teamsize);
    if (!formData.teamsize || teamSizeNum < 1) {
      newErrors.teamsize = 'Team size must be at least 1';
    } else if (teamSizeNum > 5) {
      newErrors.teamsize = 'Team size cannot exceed 5 members';
    }

    // Members validation
    if (formData.members.length === 0) {
      newErrors.members = 'At least one team member is required';
    } else if (formData.members.length > 5) {
      newErrors.members = 'Maximum 5 team members allowed';
    }

    // Payment IDs validation (if provided)
    if (formData.order_id && formData.order_id.length < 5) {
      newErrors.order_id = 'Order ID must be at least 5 characters';
    }
    if (formData.payment_id && formData.payment_id.length < 5) {
      newErrors.payment_id = 'Payment ID must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMember = (memberData) => {
    const errors = {};

    if (!memberData.name.trim()) {
      errors.name = 'Name is required';
    } else if (memberData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!memberData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(memberData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!memberData.phonenumber.trim()) {
      errors.phonenumber = 'Phone number is required';
    } else if (!validatePhone(memberData.phonenumber)) {
      errors.phonenumber = 'Please enter a valid 10-digit phone number';
    }

    if (!memberData.branch.trim()) {
      errors.branch = 'Branch/Department is required';
    }

    if (!memberData.college.trim()) {
      errors.college = 'College/University is required';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMember(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear member errors when user starts typing
    if (memberErrors[name]) {
      setMemberErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();

    // Validate member data
    const validationErrors = validateMember(member);
    setMemberErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Check for duplicate emails
    const emailExists = formData.members.some(m => m.email.toLowerCase() === member.email.toLowerCase());
    if (emailExists) {
      setMemberErrors({ email: 'This email is already added to the team' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...member }]
    }));

    setMember(initialMember);
    setMemberErrors({});

    // Clear members error if we now have at least one member
    if (formData.members.length === 0 && errors.members) {
      setErrors(prev => ({
        ...prev,
        members: null
      }));
    }
  };

  const handleRemoveMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      teamname: true,
      problem_statement: true,
      teamsize: true,
      members: true
    });

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      if (result && !result.success) {
        setErrors(prev => ({
          ...prev,
          form: result.error || 'An error occurred. Please try again.'
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.message || 'An unexpected error occurred.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get member count for display
  const memberCount = formData.members.length;
  const maxMembers = parseInt(formData.teamsize);

  return (
    <form className="team-form" onSubmit={handleSubmit}>
      {errors.form && (
        <div className="alert-error">
          <AlertCircle size={16} />
          {errors.form}
        </div>
      )}

      <div className="form-header">
        <div>
          <h2 className="form-title">{isEditing ? 'Edit Team' : 'Create New Team'}</h2>
          <p className="form-subtitle">
            {isEditing ? 'Update your team information' : 'Fill in the details to create your team'}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="close-btn" disabled={isSubmitting}>
          <X size={20} />
        </button>
      </div>

      {/* Team Information Section */}
      <div className="form-section">
        <h3>Team Information</h3>

        <div className="form-grid">
          <div className="form-group">
            <label className={errors.teamname ? 'error' : ''}>Team Name *</label>
            <input
              type="text"
              name="teamname"
              value={formData.teamname}
              onChange={handleChange}
              required
              className={errors.teamname ? 'error' : ''}
              disabled={isSubmitting}
              placeholder="Enter your team name"
            />
            {errors.teamname && <span className="error-message">{errors.teamname}</span>}
          </div>

          <div className="form-group">
            <label className={errors.teamsize ? 'error' : ''}>Team Size *</label>
            <select
              name="teamsize"
              value={formData.teamsize}
              onChange={handleChange}
              required
              className={errors.teamsize ? 'error' : ''}
              disabled={isSubmitting}
            >
              <option value="1">1 Member</option>
              <option value="2">2 Members</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members</option>
              <option value="5">5 Members</option>
            </select>
            {errors.teamsize && <span className="error-message">{errors.teamsize}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className={errors.problem_statement ? 'error' : ''}>Problem Statement *</label>
          <textarea
            name="problem_statement"
            value={formData.problem_statement}
            onChange={handleChange}
            rows="4"
            required
            className={errors.problem_statement ? 'error' : ''}
            disabled={isSubmitting}
            placeholder="Describe the problem your team will solve in detail..."
          />
          {errors.problem_statement && <span className="error-message">{errors.problem_statement}</span>}
          <div className="char-count">
            {formData.problem_statement.length}/500 characters
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="form-section">
        <h3>Payment Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Order ID</label>
            <input
              type="text"
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Payment order ID (optional)"
            />
            {errors.order_id && <span className="error-message">{errors.order_id}</span>}
          </div>

          <div className="form-group">
            <label>Payment ID</label>
            <input
              type="text"
              name="payment_id"
              value={formData.payment_id}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Payment transaction ID (optional)"
            />
            {errors.payment_id && <span className="error-message">{errors.payment_id}</span>}
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="form-section">
        <div className="section-header">
          <h3>Team Members</h3>
          <div className="member-count">
            <Users size={16} />
            {memberCount}/{maxMembers} members
          </div>
        </div>

        {errors.members && <span className="error-message">{errors.members}</span>}

        {/* Member Input Form */}
        <div className="member-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={member.name}
                onChange={handleMemberChange}
                placeholder="Enter full name"
                disabled={isSubmitting}
                className={memberErrors.name ? 'error' : ''}
              />
              {memberErrors.name && <span className="error-message">{memberErrors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={member.email}
                onChange={handleMemberChange}
                placeholder="Enter email address"
                disabled={isSubmitting}
                className={memberErrors.email ? 'error' : ''}
              />
              {memberErrors.email && <span className="error-message">{memberErrors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phonenumber"
              value={member.phonenumber}
              onChange={handleMemberChange}
              placeholder="Enter 10-digit phone number"
              disabled={isSubmitting}
              className={memberErrors.phonenumber ? 'error' : ''}
            />
            {memberErrors.phonenumber && <span className="error-message">{memberErrors.phonenumber}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Branch/Department *</label>
              <input
                type="text"
                name="branch"
                value={member.branch}
                onChange={handleMemberChange}
                placeholder="e.g., Computer Science"
                disabled={isSubmitting}
                className={memberErrors.branch ? 'error' : ''}
              />
              {memberErrors.branch && <span className="error-message">{memberErrors.branch}</span>}
            </div>

            <div className="form-group">
              <label>College/University *</label>
              <input
                type="text"
                name="college"
                value={member.college}
                onChange={handleMemberChange}
                placeholder="e.g., TKR College"
                disabled={isSubmitting}
                className={memberErrors.college ? 'error' : ''}
              />
              {memberErrors.college && <span className="error-message">{memberErrors.college}</span>}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={member.role}
                onChange={handleMemberChange}
                disabled={isSubmitting}
              >
                <option value="Student Coordinator">Student Coordinator</option>
                <option value="Technical Lead">Technical Lead</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select
                name="year"
                value={member.year}
                onChange={handleMemberChange}
                disabled={isSubmitting}
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={member.gender}
                onChange={handleMemberChange}
                disabled={isSubmitting}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="add-button-container">
            <button
              type="button"
              onClick={handleAddMember}
              className="add-button"
              disabled={!member.name || !member.email || !member.phonenumber || !member.branch || !member.college || isSubmitting || memberCount >= maxMembers}
              title={memberCount >= maxMembers ? `Maximum ${maxMembers} members allowed` : "Add member"}
            >
              <Plus size={20} />
              
            </button>
          </div>
        </div>

        {/* Members List */}
        {formData.members.length > 0 && (
          <div className="members-list">
            {formData.members.map((m, index) => (
              <div key={m.email || index} className="member-card">
                <div className="member-info">
                  <div className="member-name">{m.name}</div>
                  <div className="member-details">
                    <span>{m.email}</span> • <span>{m.role}</span> • <span>{m.year} Year</span>
                  </div>
                  <div className="member-college">{m.college} • {m.branch}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="remove-btn"
                  disabled={isSubmitting}
                  title="Remove member"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              {team ? 'Update Team' : 'Create Team'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
