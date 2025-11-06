import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Download, CheckCircle, XCircle, Trash2, RefreshCw, User, Users, Mail, Phone, Building2, BookOpen, Calendar, Clock, Eye, X } from 'lucide-react';
import '../../styles/AdminRegistrations.css';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, trial-started, enrolled
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const registrationsRef = collection(db, 'liveClassRegistrations');
      const q = query(registrationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const data = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
        .filter(reg => !reg.deleted); // Exclude deleted registrations

      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to fetch registrations');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 600); // Keep spinning for smooth animation
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, 'liveClassRegistrations', id);
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };

      // Add specific fields based on status
      if (newStatus === 'approved') {
        updateData.approvedAt = new Date();
      } else if (newStatus === 'rejected') {
        updateData.rejectedAt = new Date();
      } else if (newStatus === 'trial-started') {
        updateData.trialStarted = true;
        updateData.trialStartedAt = new Date();
      } else if (newStatus === 'enrolled') {
        updateData.enrolled = true;
        updateData.enrolledAt = new Date();
      } else if (newStatus === 'course-completed') {
        updateData.courseCompleted = true;
        updateData.courseCompletedAt = new Date();
      }

      await updateDoc(docRef, updateData);
      
      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === id ? { ...reg, status: newStatus, ...updateData } : reg
        )
      );

      alert(`Status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const deleteRegistration = async (id) => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) return;

    try {
      const docRef = doc(db, 'liveClassRegistrations', id);
      
      // Mark as deleted with timestamp instead of actually deleting
      await updateDoc(docRef, {
        status: 'deleted',
        deleted: true,
        deletedAt: new Date()
      });
      
      // Remove from local state
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      setShowDetailsModal(false);
      alert('Registration marked as deleted successfully');
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const openDetailsModal = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRegistration(null);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await updateStatus(id, newStatus);
    // Update selected registration if it's the one being updated
    if (selectedRegistration && selectedRegistration.id === id) {
      setSelectedRegistration(prev => ({ ...prev, status: newStatus }));
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Father Name', 'Email', 'Phone', 'College', 'Stream', 'Year', 'Status', 'Registered On', 'Why Join'];
    const csvData = filteredRegistrations.map(reg => [
      reg.name,
      reg.fatherName,
      reg.email,
      reg.phone || 'N/A',
      reg.college,
      reg.stream,
      reg.currentYear || 'N/A',
      reg.status,
      reg.createdAt.toLocaleDateString(),
      `"${reg.whyJoin.replace(/"/g, '""')}"`
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-class-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.status === filter;
    const matchesSearch = !searchTerm ||
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.college.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    'trial-started': registrations.filter(r => r.status === 'trial-started').length,
    enrolled: registrations.filter(r => r.status === 'enrolled').length,
    'course-completed': registrations.filter(r => r.status === 'course-completed').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="admin-registrations-container">
        <div className="loading-spinner">
          <RefreshCw size={48} className="spin" />
          <p>Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-registrations-container">
      <div className="registrations-header">
        <h1>Live Classes Registrations</h1>
        <div className="header-actions">
          <motion.button
            className="refresh-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRegistrations}
            disabled={refreshing}
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "linear", repeat: refreshing ? Infinity : 0 }}
            >
              <RefreshCw size={18} />
            </motion.div>
            Refresh
          </motion.button>
          <motion.button
            className="export-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            disabled={filteredRegistrations.length === 0}
          >
            <Download size={18} />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {Object.entries(statusCounts).map(([status, count]) => (
          <motion.div
            key={status}
            className={`stat-card ${filter === status ? 'active' : ''}`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilter(status)}
          >
            <span className="stat-label">{status.replace('-', ' ')}</span>
            <span className="stat-value">{count}</span>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or college..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Registrations Table */}
      <div className="registrations-table-container">
        {filteredRegistrations.length === 0 ? (
          <div className="empty-state">
            <p>No registrations found</p>
          </div>
        ) : (
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Stream</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <motion.tr
                  key={reg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td>
                    <div className="student-info">
                      <strong>
                        <User size={14} />
                        {reg.name}
                      </strong>
                      <small>
                        <Users size={12} />
                        {reg.fatherName}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <a href={`mailto:${reg.email}`}>
                        <Mail size={14} />
                        {reg.email}
                      </a>
                      {reg.phone && (
                        <small>
                          <Phone size={12} />
                          {reg.phone}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="college-info">
                      <Building2 size={14} />
                      {reg.college}
                    </div>
                  </td>
                  <td>
                    <div className="academic-info">
                      <strong>{reg.stream}</strong>
                      {reg.currentYear && (
                        <small>
                          <BookOpen size={12} />
                          {reg.currentYear} Year
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${reg.status}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td>
                    <div className="registered-date">
                      <span className="date">
                        <Calendar size={14} />
                        {reg.createdAt.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="time">
                        <Clock size={12} />
                        {reg.createdAt.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <motion.button
                        className="action-btn view-details"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openDetailsModal(reg)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDetailsModal}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Personal Information */}
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <User size={18} />
                    <div>
                      <label>Full Name</label>
                      <p>{selectedRegistration.name}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Users size={18} />
                    <div>
                      <label>Father's Name</label>
                      <p>{selectedRegistration.fatherName}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Mail size={18} />
                    <div>
                      <label>Email</label>
                      <p><a href={`mailto:${selectedRegistration.email}`}>{selectedRegistration.email}</a></p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Phone size={18} />
                    <div>
                      <label>Phone Number</label>
                      <p>{selectedRegistration.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="detail-section">
                <h3>Academic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <Building2 size={18} />
                    <div>
                      <label>College</label>
                      <p>{selectedRegistration.college}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <BookOpen size={18} />
                    <div>
                      <label>Stream</label>
                      <p>{selectedRegistration.stream}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <BookOpen size={18} />
                    <div>
                      <label>Current Year</label>
                      <p>{selectedRegistration.currentYear ? `${selectedRegistration.currentYear} Year` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="detail-section">
                <h3>Registration Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <Calendar size={18} />
                    <div>
                      <label>Registered On</label>
                      <p>{selectedRegistration.createdAt.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <div>
                      <label>Time</label>
                      <p>{selectedRegistration.createdAt.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>
                    </div>
                  </div>
                  <div className="detail-item status-item">
                    <div>
                      <label>Status</label>
                      <span className={`status-badge status-${selectedRegistration.status}`}>
                        {selectedRegistration.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Join Section */}
              {selectedRegistration.whyJoin && (
                <div className="detail-section">
                  <h3>Why Join Live Classes?</h3>
                  <div className="why-join-box">
                    <p>{selectedRegistration.whyJoin}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-footer">
              {selectedRegistration.status === 'pending' && (
                <>
                  <motion.button
                    className="modal-btn approve-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatusUpdate(selectedRegistration.id, 'approved')}
                  >
                    <CheckCircle size={18} />
                    Approve
                  </motion.button>
                  <motion.button
                    className="modal-btn reject-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatusUpdate(selectedRegistration.id, 'rejected')}
                  >
                    <XCircle size={18} />
                    Reject
                  </motion.button>
                </>
              )}
              {selectedRegistration.status === 'approved' && (
                <motion.button
                  className="modal-btn trial-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(selectedRegistration.id, 'trial-started')}
                >
                  <CheckCircle size={18} />
                  Start Trial
                </motion.button>
              )}
              {selectedRegistration.status === 'trial-started' && (
                <motion.button
                  className="modal-btn enroll-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(selectedRegistration.id, 'enrolled')}
                >
                  <CheckCircle size={18} />
                  Mark Enrolled
                </motion.button>
              )}
              {selectedRegistration.status === 'enrolled' && (
                <motion.button
                  className="modal-btn complete-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(selectedRegistration.id, 'course-completed')}
                >
                  <CheckCircle size={18} />
                  Mark Course Completed
                </motion.button>
              )}
              <motion.button
                className="modal-btn delete-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => deleteRegistration(selectedRegistration.id)}
              >
                <Trash2 size={18} />
                Delete Registration
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminRegistrations;
