import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Clock, 
  Upload, 
  Github, 
  ExternalLink, 
  Video,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield,
  Target,
  Award,
  BookOpen,
  Code,
  Zap,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  Sword,
  Flag,
  UserPlus,
  LogOut,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { HackathonContext } from '../../contexts/HackathonContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import submissionService from '../../services/submissionService';
import teamService from '../../services/teamService';
import TeamManagement from './TeamManagement';
import './HackathonDashboard.css';

const HackathonDashboard = ({ user, onBack }) => {
  const { currentHackathon } = useContext(HackathonContext);
  const { showNotification } = useContext(NotificationContext);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Submission form state
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    projectTitle: '',
    description: '',
    githubRepo: '',
    liveDemo: '',
    videoDemo: '',
    techStack: [],
    problemStatement: '',
    features: [],
    challenges: '',
    futureScope: '',
    teamContributions: []
  });

  // Load dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!currentHackathon) return;
      
      const now = new Date();
      const hackathonStart = new Date(currentHackathon.startDate);
      const hackathonEnd = new Date(currentHackathon.endDate);
      
      let targetDate;
      let description;
      
      if (now < hackathonStart) {
        targetDate = hackathonStart;
        description = 'Until hackathon begins';
      } else if (now < hackathonEnd) {
        targetDate = hackathonEnd;
        description = 'Until submission deadline';
      } else {
        setCountdown('Event completed');
        return;
      }
      
      const timeDiff = targetDate - now;
      
      if (timeDiff <= 0) {
        setCountdown('Event completed');
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown({
        time: `${days}d ${hours}h ${minutes}m`,
        description
      });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [currentHackathon]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUserSubmissions(),
        loadUserTeam()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubmissions = async () => {
    const result = await submissionService.getUserSubmissions();
    if (result.success) {
      setSubmissions(result.data);
    }
  };

  const loadUserTeam = async () => {
    const result = await teamService.getUserTeam();
    if (result.success) {
      setTeamData(result.data);
    }
  };

  // Submission handlers
  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submissionService.submitProject(submissionData);
      
      if (result.success) {
        showNotification(result.message, 'success');
        setShowSubmissionForm(false);
        setSubmissionData({
          projectTitle: '',
          description: '',
          githubRepo: '',
          liveDemo: '',
          videoDemo: '',
          techStack: [],
          problemStatement: '',
          features: [],
          challenges: '',
          futureScope: '',
          teamContributions: []
        });
        await loadUserSubmissions();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to submit project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    const result = await submissionService.deleteSubmission(submissionId);
    if (result.success) {
      showNotification(result.message, 'success');
      await loadUserSubmissions();
    } else {
      showNotification(result.message, 'error');
    }
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="overview-cards">
        <motion.div 
          className="overview-card registration-status"
          whileHover={{ scale: 1.02 }}
        >
          <div className="card-icon">
            <CheckCircle className="icon registered" />
          </div>
          <div className="card-content">
            <h3>Registration Status</h3>
            <p className="status confirmed">Confirmed</p>
            <span className="status-description">Ready for battle!</span>
          </div>
        </motion.div>

        <motion.div 
          className="overview-card team-info"
          whileHover={{ scale: 1.02 }}
        >
          <div className="card-icon">
            <Users className="icon team" />
          </div>
          <div className="card-content">
            <h3>Team Status</h3>
            <p className="team-name">{teamData ? teamData.name : 'No Team'}</p>
            <span className="team-members">
              {teamData ? `${teamData.members.length}/4 members` : 'Join or create a team'}
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="overview-card submissions-count"
          whileHover={{ scale: 1.02 }}
        >
          <div className="card-icon">
            <Trophy className="icon submissions" />
          </div>
          <div className="card-content">
            <h3>Submissions</h3>
            <p className="count">{submissions.length}</p>
            <span className="count-description">Projects submitted</span>
          </div>
        </motion.div>

        <motion.div 
          className="overview-card countdown"
          whileHover={{ scale: 1.02 }}
        >
          <div className="card-icon">
            <Timer className="icon timer" />
          </div>
          <div className="card-content">
            <h3>Time Remaining</h3>
            <p className="time">{countdown?.time || 'Calculating...'}</p>
            <span className="time-description">{countdown?.description || 'Until submission deadline'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="dashboard-submissions">
      <div className="submissions-header">
        <h3>Project Submissions</h3>
        <motion.button
          className="add-submission-btn"
          onClick={() => setShowSubmissionForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="btn-icon" />
          New Submission
        </motion.button>
      </div>

      {submissions.length === 0 ? (
        <div className="no-submissions">
          <Code className="empty-icon" />
          <h4>No submissions yet</h4>
          <p>Start building your project and submit it to showcase your skills!</p>
          <button 
            className="create-first-btn"
            onClick={() => setShowSubmissionForm(true)}
          >
            Create Your First Submission
          </button>
        </div>
      ) : (
        <div className="submissions-grid">
          {submissions.map((submission) => (
            <motion.div
              key={submission.id}
              className="submission-card"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="submission-header">
                <h4>{submission.projectTitle}</h4>
                <div className="submission-actions">
                  <button className="action-btn edit">
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteSubmission(submission.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="submission-description">
                {submission.description.substring(0, 100)}...
              </p>
              
              <div className="submission-links">
                {submission.githubRepo && (
                  <a href={submission.githubRepo} target="_blank" rel="noopener noreferrer" className="submission-link github">
                    <Github size={16} />
                    Repository
                  </a>
                )}
                {submission.liveDemo && (
                  <a href={submission.liveDemo} target="_blank" rel="noopener noreferrer" className="submission-link demo">
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                )}
                {submission.videoDemo && (
                  <a href={submission.videoDemo} target="_blank" rel="noopener noreferrer" className="submission-link video">
                    <Video size={16} />
                    Video Demo
                  </a>
                )}
              </div>
              
              {submission.techStack && submission.techStack.length > 0 && (
                <div className="tech-stack">
                  {submission.techStack.slice(0, 3).map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                  {submission.techStack.length > 3 && (
                    <span className="tech-more">+{submission.techStack.length - 3} more</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Submission Form Modal */}
      <AnimatePresence>
        {showSubmissionForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSubmissionForm(false)}
          >
            <motion.div
              className="submission-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Submit Your Project</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowSubmissionForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form className="submission-form" onSubmit={handleSubmissionSubmit}>
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={submissionData.projectTitle}
                    onChange={(e) => setSubmissionData({...submissionData, projectTitle: e.target.value})}
                    placeholder="Enter your project title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={submissionData.description}
                    onChange={(e) => setSubmissionData({...submissionData, description: e.target.value})}
                    placeholder="Describe your project..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>GitHub Repository *</label>
                    <input
                      type="url"
                      value={submissionData.githubRepo}
                      onChange={(e) => setSubmissionData({...submissionData, githubRepo: e.target.value})}
                      placeholder="https://github.com/username/project"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Live Demo URL</label>
                    <input
                      type="url"
                      value={submissionData.liveDemo}
                      onChange={(e) => setSubmissionData({...submissionData, liveDemo: e.target.value})}
                      placeholder="https://your-project.vercel.app"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Video Demo URL</label>
                  <input
                    type="url"
                    value={submissionData.videoDemo}
                    onChange={(e) => setSubmissionData({...submissionData, videoDemo: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowSubmissionForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTeam = () => (
    <div className="dashboard-team">
      <TeamManagement 
        user={user} 
        teamData={teamData} 
        onTeamUpdate={loadUserTeam}
      />
    </div>
  );

  const renderResources = () => (
    <div className="dashboard-resources">
      <div className="resources-grid">
        <div className="resource-card guidelines">
          <div className="resource-icon">
            <BookOpen className="icon" />
          </div>
          <h4>Submission Guidelines</h4>
          <ul>
            <li>Submit your project before the deadline</li>
            <li>Include a comprehensive README</li>
            <li>Provide working demo links</li>
            <li>Document your code properly</li>
          </ul>
        </div>

        <div className="resource-card tech-stack">
          <div className="resource-icon">
            <Code className="icon" />
          </div>
          <h4>Recommended Tech Stack</h4>
          <div className="tech-categories">
            <div className="tech-category">
              <h5>Frontend</h5>
              <span>React, Vue, Angular, Next.js</span>
            </div>
            <div className="tech-category">
              <h5>Backend</h5>
              <span>Node.js, Python, Java, .NET</span>
            </div>
            <div className="tech-category">
              <h5>Database</h5>
              <span>MongoDB, PostgreSQL, Firebase</span>
            </div>
          </div>
        </div>

        <div className="resource-card deployment">
          <div className="resource-icon">
            <Globe className="icon" />
          </div>
          <h4>Deployment Platforms</h4>
          <ul>
            <li>Vercel - Perfect for React/Next.js</li>
            <li>Netlify - Great for static sites</li>
            <li>GitHub Pages - Free hosting</li>
            <li>Heroku - Full-stack applications</li>
          </ul>
        </div>

        <div className="resource-card judging">
          <div className="resource-icon">
            <Award className="icon" />
          </div>
          <h4>Judging Criteria</h4>
          <ul>
            <li>Innovation & Creativity (25%)</li>
            <li>Technical Implementation (25%)</li>
            <li>User Experience (20%)</li>
            <li>Code Quality (15%)</li>
            <li>Presentation (15%)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hackathon-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Back to Landing
          </button>
          <div className="header-title">
            <Sword className="header-icon" />
            <h1>CodeKurukshetra Dashboard</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.displayName || user?.email || 'Warrior'}!</span>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <div className="nav-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'submissions', label: 'Submissions', icon: Upload },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'resources', label: 'Resources', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="tab-icon" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'submissions' && renderSubmissions()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'resources' && renderResources()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HackathonDashboard;
