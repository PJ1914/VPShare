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
        const response = await axios.get(apiUrl, { headers, timeout: 30000 });
        // Expecting API to return [{ name: 'HTML', modules: [ ... ] }, ...]
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.Items || response.data.assignments || [];
        setCourses(data);
        setSelectedCourse(data[0]?.name || '');
      } catch (err) {
        setError('Unexpected error: ' + (err.message || err));
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
                      <motion.button 
                        className={`action-button ${assignment.status === 'Pending' ? 'primary' : 'secondary'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {assignment.status === 'Pending' ? (
                          <>
                            <UploadIcon />
                            Submit Assignment
                          </>
                        ) : (
                          <>
                            <VisibilityIcon />
                            View Submission
                          </>
                        )}
                      </motion.button>
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
                          <Tooltip title={assignment.status === 'Pending' ? 'Submit' : 'View'}>
                            <IconButton size="small" className="table-action-btn">
                              {assignment.status === 'Pending' ? <UploadIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Tooltip>
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
    </div>
  );
}

export default Assignments;
