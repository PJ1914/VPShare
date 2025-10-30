import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAuth } from 'firebase/auth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FeedbackIcon from '@mui/icons-material/Feedback';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import '../styles/Assignments.css';

// Configure axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => axios.isAxiosError(error) && [502, 503, 504].includes(error.response?.status),
});

const statusColors = {
  Pending: 'pending',
  Submitted: 'submitted',
  Graded: 'graded',
};

const statusIcons = {
  Pending: <PendingIcon />,
  Submitted: <UploadIcon />,
  Graded: <CheckCircleIcon />,
};

function getProgress(modules) {
  const total = modules.length;
  const completed = modules.filter(m => m.status === 'Graded').length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function Assignments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    solution: '',
    submission_url: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const token = await user.getIdToken(true);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Submit assignment function
  const submitAssignment = async (assignmentId, submissionData) => {
    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const apiUrl = import.meta.env.VITE_ASSIGNMENTS_API_URL;
      
      await axios.post(`${apiUrl}/assignments/${assignmentId}/submit`, submissionData, { headers });
      
      // Refresh assignments to show updated status
      const response = await axios.get(`${apiUrl}/assignments`, { headers });
      setCourses(Array.isArray(response.data) ? response.data : []);
      
      setSubmissionModalOpen(false);
      setSubmissionData({ solution: '', submission_url: '', notes: '' });
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Mark assignment as complete function
  const markAsComplete = async (assignmentId) => {
    try {
      const headers = await getAuthHeaders();
      const apiUrl = import.meta.env.VITE_ASSIGNMENTS_API_URL;
      
      await axios.post(`${apiUrl}/assignments/${assignmentId}/complete`, {}, { headers });
      
      // Refresh assignments to show updated status
      const response = await axios.get(`${apiUrl}/assignments`, { headers });
      setCourses(Array.isArray(response.data) ? response.data : []);
      
      alert('Assignment marked as completed!');
    } catch (error) {
      console.error('Error marking assignment complete:', error);
      alert('Failed to mark assignment as complete: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open submission modal
  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionModalOpen(true);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to view assignments.');
        setLoading(false);
        return;
      }
      let authToken;
      try {
        authToken = await user.getIdToken(true);
      } catch (tokenError) {
        setError('Authentication error. Please log out and log in again.');
        setLoading(false);
        return;
      }
      const apiUrl = import.meta.env.VITE_ASSIGNMENTS_API_URL;
      if (!apiUrl) {
        setError('Server configuration error. Please contact support.');
        setLoading(false);
        return;
      }
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };
        const response = await axios.get(`${apiUrl}/assignments`, { headers, timeout: 30000 });
        console.log('Assignments API response:', response.data);
        
        // API returns array of courses with modules
        const data = Array.isArray(response.data) ? response.data : [];
        setCourses(data);
        setSelectedCourse(data[0]?.name || '');
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments: ' + (err.response?.data?.error || err.message));
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
    window.scrollTo(0, 0);
  }, []);

  const course = courses.find(c => c.name === selectedCourse) || { modules: [] };
  const progress = getProgress(course.modules);

  // Flatten all assignments for dashboard
  const allAssignments = courses.flatMap(c =>
    (c.modules || []).map(m => ({
      course: c.name,
      ...m
    }))
  );

  // Filter assignments based on search and status
  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(a => a.status === 'Graded').length;
  const submittedAssignments = allAssignments.filter(a => a.status === 'Submitted').length;
  const pendingAssignments = allAssignments.filter(a => a.status === 'Pending').length;

  const refreshData = () => {
    setLoading(true);
    // Trigger data refresh
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="assignments-page">
        <div className="loading-container">
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshIcon fontSize="large" />
          </motion.div>
          <p>Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignments-page">
        <div className="error-container">
          <AssignmentIcon className="error-icon" />
          <h2>Oops! Something went wrong</h2>
          <p className="error-text">{error}</p>
          <motion.button 
            className="retry-button"
            onClick={refreshData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshIcon />
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }
  return (
    <div className="assignments-page">
      <div className="assignments-header">
        <div className="assignments-title-section">
          <AssignmentIcon className="assignments-icon" />
          <div>
            <h1>Your Assignments</h1>
            <p>Track, submit, and manage your assignments efficiently</p>
          </div>
        </div>
        
        <div className="header-actions">
          <Tooltip title="Refresh">
            <IconButton onClick={refreshData} className="action-btn">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <motion.button 
            className="dashboard-toggle"
            onClick={() => setShowDashboard(d => !d)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DashboardIcon />
            {showDashboard ? 'Back to Assignments' : 'View Dashboard'}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="assignments-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <AssignmentIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalAssignments}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircleIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedAssignments}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon submitted">
            <UploadIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{submittedAssignments}</div>
            <div className="stat-label">Submitted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <PendingIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{pendingAssignments}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {!showDashboard ? (
        <>
          {/* Course Tabs */}
          <motion.section 
            className="course-tabs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="course-tabs">
              {courses.map(c => (
                <motion.button
                  key={c.name}
                  className={`course-tab ${selectedCourse === c.name ? 'active' : ''}`}
                  onClick={() => setSelectedCourse(c.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SchoolIcon />
                  {c.name}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Progress Tracker */}
          <motion.section 
            className="progress-tracker"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="progress-header">
              <TrendingUpIcon />
              <span>Course Progress: {progress}%</span>
            </div>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444',
                  borderRadius: 6,
                }
              }}
            />
            <div className="progress-details">
              <span>{course.modules.filter(m => m.status === 'Graded').length} of {course.modules.length} completed</span>
            </div>
          </motion.section>

          {/* Assignment List */}
          <motion.section 
            className="assignment-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="section-header">
              <h2>{selectedCourse} Assignments</h2>
              <div className="assignment-actions">
                <Tooltip title="Download Report">
                  <IconButton className="action-btn">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Progress">
                  <IconButton className="action-btn">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            
            <div className="assignment-grid">
              <AnimatePresence>
                {course.modules.map((assignment, idx) => (
                  <motion.div
                    key={assignment.title}
                    className={`assignment-card ${assignment.isFinal ? 'final-project' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
                  >
                    <div className="assignment-card-header">
                      <div className="assignment-status-badge">
                        <Chip
                          icon={statusIcons[assignment.status]}
                          label={assignment.status}
                          size="small"
                          className={`status-chip ${statusColors[assignment.status]}`}
                        />
                      </div>
                      {assignment.isFinal && (
                        <Tooltip title="Final Project">
                          <div className="final-badge">
                            <EmojiEventsIcon />
                            <span>Final</span>
                          </div>
                        </Tooltip>
                      )}
                    </div>

                    <div className="assignment-content">
                      <h3>{assignment.title}</h3>
                      <p className="assignment-description">{assignment.instructions}</p>
                      
                      <div className="assignment-meta">
                        <div className="meta-item">
                          <CalendarTodayIcon />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        {assignment.marks !== null && (
                          <div className="meta-item">
                            <GradeIcon />
                            <span>Score: {assignment.marks}%</span>
                          </div>
                        )}
                      </div>

                      {assignment.feedback && (
                        <div className="assignment-feedback">
                          <FeedbackIcon />
                          <p>{assignment.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="assignment-actions">
                      {assignment.status === 'Pending' ? (
                        <div className="action-buttons">
                          <motion.button 
                            className="action-button primary"
                            onClick={() => openSubmissionModal(assignment)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <UploadIcon />
                            Submit Assignment
                          </motion.button>
                          <motion.button 
                            className="action-button secondary"
                            onClick={() => markAsComplete(assignment.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <CheckCircleIcon />
                            Mark Complete
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button 
                          className="action-button secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <VisibilityIcon />
                          View Submission
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        </>
      ) : (
        /* Dashboard View */
        <motion.section 
          className="submission-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dashboard-header">
            <h2>Submission Dashboard</h2>
            <div className="dashboard-controls">
              <div className="search-box">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Graded">Graded</option>
              </select>
              <Tooltip title="Print Report">
                <IconButton className="action-btn">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <div className="dashboard-table-container">
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => (
                    <motion.tr 
                      key={`${assignment.title}-${assignment.course}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td>
                        <div className="assignment-cell">
                          <AssignmentIcon className="assignment-icon" />
                          <div>
                            <div className="assignment-title">{assignment.title}</div>
                            {assignment.isFinal && <span className="final-label">Final Project</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Chip label={assignment.course} size="small" variant="outlined" />
                      </td>
                      <td>
                        <div className="date-cell">
                          <CalendarTodayIcon fontSize="small" />
                          {assignment.dueDate}
                        </div>
                      </td>
                      <td>
                        <Chip
                          icon={statusIcons[assignment.status]}
                          label={assignment.status}
                          size="small"
                          className={`status-chip ${statusColors[assignment.status]}`}
                        />
                      </td>
                      <td>
                        {assignment.marks !== null ? (
                          <div className="score-cell">
                            <GradeIcon fontSize="small" />
                            <strong>{assignment.marks}%</strong>
                          </div>
                        ) : (
                          <span className="no-score">-</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          {assignment.status === 'Pending' ? (
                            <>
                              <Tooltip title="Submit Assignment">
                                <IconButton 
                                  size="small" 
                                  className="table-action-btn"
                                  onClick={() => openSubmissionModal(assignment)}
                                >
                                  <UploadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark Complete">
                                <IconButton 
                                  size="small" 
                                  className="table-action-btn"
                                  onClick={() => markAsComplete(assignment.id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="View Submission">
                              <IconButton size="small" className="table-action-btn">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {assignment.feedback && (
                            <Tooltip title="View Feedback">
                              <IconButton size="small" className="table-action-btn">
                                <FeedbackIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAssignments.length === 0 && (
              <div className="no-assignments">
                <AssignmentIcon className="no-assignments-icon" />
                <h3>No assignments found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {submissionModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSubmissionModalOpen(false)}
          >
            <motion.div 
              className="submission-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Submit Assignment: {selectedAssignment?.title}</h3>
                <button 
                  className="close-button"
                  onClick={() => setSubmissionModalOpen(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="form-group">
                  <label>Solution/Code:</label>
                  <textarea
                    value={submissionData.solution}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      solution: e.target.value
                    })}
                    placeholder="Paste your code solution here..."
                    rows="10"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Submission URL (optional):</label>
                  <input
                    type="url"
                    value={submissionData.submission_url}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      submission_url: e.target.value
                    })}
                    placeholder="https://github.com/username/repo or live demo URL"
                  />
                </div>
                
                <div className="form-group">
                  <label>Notes (optional):</label>
                  <textarea
                    value={submissionData.notes}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      notes: e.target.value
                    })}
                    placeholder="Add any notes about your solution..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setSubmissionModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  className="submit-button"
                  onClick={() => submitAssignment(selectedAssignment?.id, submissionData)}
                  disabled={submitting || !submissionData.solution.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Assignments;
