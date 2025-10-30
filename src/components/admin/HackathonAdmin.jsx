import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hackathonService from '../../services/hackathonService';
import teamService from '../../services/teamService';
import TeamTable from '../teams/TeamTable';
import TeamDetailModal from '../teams/TeamDetailModal';
import TeamForm from '../teams/TeamForm';
import { auth } from '../../config/firebase';
import './HackathonAdmin.css';
import '../../styles/TeamTable.css';
import '../../styles/TeamDetailModal.css';
import '../../styles/TeamForm.css';
import axios from 'axios';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Groups as GroupsIcon,
  Payment as PaymentIcon,
  Pending as PendingIcon,
  Analytics as AnalyticsIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  RocketLaunch as RocketIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as EmojiEventsIcon,
  Send as SendIcon,
  Keyboard as KeyboardIcon,
  Announcement as AnnouncementIcon,
  Schedule as ScheduleIcon,
  BugReport as TestIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Summarize as SummaryIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  PieChart as PieChartIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
  CardMembership as CertificateIcon
} from '@mui/icons-material';
const CommunicationsSection = ({ registrations, handleSendEmails, handleSendPreEventReminders, handleTestEmail, setEmailModal }) => { 
  const [emailType, setEmailType] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // Filter recipients based on the selected type
    const recipients = registrations.filter(reg => {
      if (emailType === 'all') return true;
      if (emailType === 'confirmed') {
        return (reg.registration_status || reg.status) === 'confirmed';
      }
      if (emailType === 'pending') {
        return (reg.registration_status || reg.status) === 'pending_payment';
      }
      return true;
    }).map(reg => reg.email || reg.personal_info?.email);

    if (recipients.length === 0) {
      alert('No recipients found for the selected criteria');
      return;
    }

    setEmailModal({
      show: true,
      type: 'custom',
      recipients,
      subject,
      message
    });
  };

  const handleTemplateSelect = (template) => {
    const templates = {
      welcome: {
        subject: 'Welcome to the Hackathon!',
        message: 'Dear participant,\n\nThank you for registering for our hackathon! We are excited to have you on board.\n\nBest regards,\nThe Organizing Team'
      },
      reminder: {
        subject: 'Reminder: Complete Your Registration',
        message: 'Dear participant,\n\nThis is a friendly reminder to complete your registration by making the payment.\n\nBest regards,\nThe Organizing Team'
      },
      updates: {
        subject: 'Important: Hackathon Updates',
        message: 'Dear participant,\n\nWe have some important updates regarding the hackathon schedule and guidelines.\n\nBest regards,\nThe Organizing Team'
      },
      certificate: {
        subject: 'Your Hackathon Certificate is Ready!',
        message: 'Dear participant,\n\nWe are pleased to inform you that your participation certificate is now available for download.\n\nBest regards,\nThe Organizing Team'
      }
    };

    const selected = templates[template];
    setSubject(selected.subject);
    setMessage(selected.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="communications-section"
    >
      <h2><EmailIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Communications</h2>

      <div className="communication-tools">
        <div className="email-compose">
          <h3>Send Email to Participants</h3>
          <div className="compose-form">
            <select
              className="recipient-select"
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
            >
              <option value="all">All Participants</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="pending">Pending Payment</option>
            </select>

            <input
              type="text"
              placeholder="Email Subject"
              className="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
              placeholder="Email Message"
              className="email-message"
              rows="8"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              className="send-email-btn"
              onClick={handleSend}
            >
              <EmailIcon fontSize="small" style={{marginRight: '4px'}} /> Send Email
            </button>
          </div>
        </div>

        <div className="message-templates">
          <h3>Message Templates</h3>
          <div className="template-list">
            <button
              className="template-btn"
              onClick={() => handleTemplateSelect('welcome')}
            >
              Welcome Message
            </button>
            <button
              className="template-btn"
              onClick={() => handleTemplateSelect('reminder')}
            >
              Payment Reminder
            </button>
            <button
              className="template-btn"
              onClick={() => handleTemplateSelect('updates')}
            >
              Event Updates
            </button>
            <button
              className="template-btn"
              onClick={() => handleTemplateSelect('certificate')}
            >
              Certificate Ready
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Email Modal Component
const EmailModal = ({ emailType, recipients, onSend, onClose }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedEmailType, setSelectedEmailType] = useState(emailType);

  const emailTypes = [
    { value: 'confirmation', label: <><CheckCircleIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Confirmation Email</> },
    { value: 'reminder', label: <><ScheduleIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Reminder Email</> },
    { value: 'announcement', label: <><AnnouncementIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Announcement</> },
    { value: 'certificate', label: <><CertificateIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Certificate Notification</> }
  ];

  const handleSend = () => {
    onSend(recipients, selectedEmailType, customMessage);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="email-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2><EmailIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Send Emails</h2>
          <button onClick={onClose} className="close-btn"><CloseIcon /></button>
        </div>

        <div className="modal-content">
          <div className="email-config">
            <div className="form-group">
              <label>Email Type:</label>
              <select
                value={selectedEmailType}
                onChange={(e) => setSelectedEmailType(e.target.value)}
                className="email-type-select"
              >
                {emailTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Recipients: {recipients.length} selected</label>
            </div>

            <div className="form-group">
              <label>Custom Message (Optional):</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any custom message here..."
                rows={4}
                className="custom-message-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button onClick={handleSend} className="btn-send">
              <SendIcon fontSize="small" style={{marginRight: '4px'}} /> Send Emails
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const HackathonAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('user');
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [teams, setTeams] = useState([]);
  
  const [analyticsData, setAnalyticsData] = useState({
  yearWise: {},
  teamSize: {}
});

const fetchAnalytics = async () => {
  try {
    // Get Firebase auth token instead of localStorage
    const user = auth.currentUser;
    if (!user) {
      console.warn('No authenticated user for analytics');
      return;
    }

    const token = await user.getIdToken();
    const response = await axios.get(
      '/api/admin/codekurkshetra/analytics',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Process the data
    const processedData = response.data.reduce((acc, item) => {
      const [category, value] = item.pk.split('#');
      if (!acc[category]) {
        acc[category] = {};
      }
      acc[category][value] = item.count;
      return acc;
    }, {});

    setAnalyticsData(processedData);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    setAnalyticsData({});
  }
};

// Fallback data for when APIs are not available
const getFallbackAnalyticsData = () => {
  return {
    year: {
      '1st': 12,
      '2nd': 15,
      '3rd': 8,
      '4th': 5
    },
    teamsize: {
      '1': 25,
      '2': 18,
      '3': 12,
      '4': 8
    },
    college: {
      'TKR COLLEGE OF ENGINEERING AND TECHNOLOGY (K9)': 15,
      'TEEGALA KRISHNA REDDY ENGINEERING COLLEGE (R9)': 12,
      'Other': 20
    },
    status: {
      'confirmed': 35,
      'pending_payment': 10,
      'cancelled': 5
    }
  };
};
useEffect(() => {
  fetchAnalytics();
}, []);

  const [filters, setFilters] = useState({
    status: 'all',
    teamSize: 'all',
    search: '',
    dateRange: 'all',
    college: 'all',
    department: 'all',
    gender: 'All',
    yearWise: 'All',
    teamIndividual: 'All',
    timeline: 'All Time'
  });
  
  const handleFilterSelect = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    // Here you would typically update your data based on the selected filter
    // For example: filterRegistrations(filterId, value);
  };
  // Bulk operations state
  const [selectedRegistrations, setSelectedRegistrations] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Gallery-style selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState(null);
  const [dragEndIndex, setDragEndIndex] = useState(null);
  const [selectionMode, setSelectionMode] = useState('add'); // 'add' or 'remove'
  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Utils operations state
  const [isExporting, setIsExporting] = useState(false);
  const [emailModal, setEmailModal] = useState({ show: false, type: 'confirmation', recipients: [] });
  const [certificateModal, setCertificateModal] = useState({ show: false, registrationId: null });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Memoized load function to prevent unnecessary re-renders
  const loadDashboardData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      console.log('Loading hackathon admin data...');

      const [registrationsResult, statsResult, teamsResult] = await Promise.all([
        hackathonService.getAllRegistrations(1000), // Load more registrations to handle growth
        hackathonService.getRegistrationStats(),
        hackathonService.getAllTeams()
      ]);

      console.log('Registrations result:', registrationsResult);
      console.log('Stats result:', statsResult);

      if (registrationsResult.success) {
        // Handle the nested data structure from Lambda
        const registrationsData = registrationsResult.data.data || registrationsResult.data;
        console.log('Registrations data:', registrationsData);

        // Transform data to ensure consistent field names
        const transformedRegistrations = (registrationsData.registrations || []).map(reg => ({
          ...reg,
          registrationId: reg.registration_id || reg.registrationId, // Ensure consistent field name
          // Ensure personal_info exists with fallback
          personal_info: reg.personal_info || {
            fullName: reg.fullName || reg.name || 'N/A',
            email: reg.email || 'N/A'
          },
          // Ensure team_info exists with fallback
          team_info: reg.team_info || {
            teamName: reg.teamName || reg.team_name || 'Individual',
            teamSize: reg.teamSize || reg.team_size || 1
          },
          // Ensure payment_info exists
          payment_info: reg.payment_info || {
            status: reg.paymentStatus || reg.payment_status || 'pending'
          }
        }));

        setRegistrations(transformedRegistrations);

        // If statistics are included in registrations response
        if (registrationsData.statistics) {
          setStats(prev => ({ ...prev, ...registrationsData.statistics }));
        }
      } else {
        console.error('Failed to load registrations:', registrationsResult.message);
        showNotification(`Failed to load registrations: ${registrationsResult.message}`, 'error');
        setRegistrations([]);
      }

      if (statsResult.success) {
        // Handle the nested data structure from Lambda
        const statsData = statsResult.data.data || statsResult.data;
        console.log('Stats data:', statsData);
        setStats(prev => ({ ...prev, ...statsData }));
      } else {
        console.error('Failed to load stats:', statsResult.message);
        showNotification(`Failed to load statistics: ${statsResult.message}`, 'error');
        setStats({});
      }

      if (teamsResult.success) {
        // Handle the nested data structure from Lambda
        const teamsData = teamsResult.data.data || teamsResult.data;
        console.log('Teams data:', teamsData);
        // Transform teams data for component use
        const transformedTeams = (teamsData.teams || teamsData || []).map(team => ({
          id: team.id || `team-${team.teamname?.replace(/\s+/g, '-').toLowerCase()}`,
          teamname: team.teamname || team.name,
          name: team.teamname || team.name,
          leaderUid: team.leaderUid,
          problem_statement: team.problem_statement,
          teamsize: team.teamsize?.toString() || team.members?.length?.toString() || '1',
          members: team.members?.map(member => ({
            name: member.name,
            email: member.email,
            role: member.role,
            branch: member.branch,
            college: member.college,
            phonenumber: member.phonenumber,
            year: member.year,
            gender: member.gender
          })) || [],
          order_id: team.order_id,
          payment_id: team.payment_id,
          status: 'active' // Default status
        }));
        setTeams(transformedTeams);
      } else {
        console.error('Failed to load teams:', teamsResult.message);
        showNotification(`Failed to load teams: ${teamsResult.message}`, 'error');
        setTeams([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard data load error:', error);
      showNotification('Failed to load dashboard data', 'error');
      setRegistrations([]);
      setStats({});
      setTeams([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [showNotification]);


  const testAPIConnection = async () => {
    try {
      console.log('🔍 Testing API connection...');
      showNotification('🔍 Testing API connection...', 'info');
      
      const results = [];
      
      // Test 1: Registrations API
      try {
        const registrationsTest = await hackathonService.getAllRegistrations(5);
        results.push({ 
          name: 'Registrations API', 
          success: registrationsTest.success, 
          message: registrationsTest.message 
        });
        console.log('📊 Registrations API test:', registrationsTest);
      } catch (error) {
        results.push({ 
          name: 'Registrations API', 
          success: false, 
          message: error.message 
        });
      }
      
      // Test 2: Stats API
      try {
        const statsTest = await hackathonService.getRegistrationStats();
        results.push({ 
          name: 'Stats API', 
          success: statsTest.success, 
          message: statsTest.message 
        });
        console.log('📈 Stats API test:', statsTest);
      } catch (error) {
        results.push({ 
          name: 'Stats API', 
          success: false, 
          message: error.message 
        });
      }
      
      // Test 3: Auth Status
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;
        results.push({ 
          name: 'Authentication', 
          success: !!token, 
          message: token ? 'User authenticated' : 'Not authenticated' 
        });
        console.log('🔐 Auth test:', { hasUser: !!user, hasToken: !!token });
      } catch (error) {
        results.push({ 
          name: 'Authentication', 
          success: false, 
          message: error.message 
        });
      }
      
      // Summary
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log('🧪 API Test Results:', results);
      
      if (successCount === totalCount) {
        showNotification(`✅ All API tests passed (${successCount}/${totalCount})`, 'success');
      } else {
        showNotification(`⚠️ API tests: ${successCount}/${totalCount} passed`, 'error');
        results.filter(r => !r.success).forEach(failed => {
          console.error(`❌ ${failed.name} failed:`, failed.message);
        });
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
      showNotification('❌ API connection test failed', 'error');
    }
  };

  const updateRegistrationStatus = async (registrationId, newStatus) => {
    try {
      // Map frontend status to backend status values
      const statusMapping = {
        'pending': 'pending_payment',
        'confirmed': 'confirmed',
        'cancelled': 'cancelled',
        'refunded': 'refunded'
      };
      
      const backendStatus = statusMapping[newStatus] || newStatus;
      
      const result = await hackathonService.updateRegistrationStatus(
        registrationId, 
        backendStatus, 
        `Status updated to ${newStatus} by admin at ${new Date().toISOString()}`
      );

      if (result.success) {
        setRegistrations(prev => 
          prev.map(reg => 
            reg.registrationId === registrationId 
              ? { ...reg, registration_status: backendStatus, status: newStatus }
              : reg
          )
        );
        showNotification(`Registration ${newStatus} successfully`);
        
        // Reload stats to reflect changes
        const statsResult = await hackathonService.getRegistrationStats();
        if (statsResult.success) {
          const statsData = statsResult.data.data || statsResult.data;
          setStats(prev => ({ ...prev, ...statsData }));
        }
      } else {
        showNotification(result.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showNotification('Failed to update registration status', 'error');
      console.error('Status update error:', error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedRegistrations.size === 0) {
      showNotification('Please select registrations first', 'error');
      return;
    }

    if (!bulkAction) {
      showNotification('Please select an action', 'error');
      return;
    }

    try {
      showNotification(`Processing bulk action for ${selectedRegistrations.size} registrations...`, 'success');
      
      const updates = Array.from(selectedRegistrations).map(regId => ({
        registration_id: regId,
        status: bulkAction,
        admin_notes: `Bulk ${bulkAction} by admin at ${new Date().toISOString()}`
      }));

      const result = await hackathonService.bulkUpdateRegistrations(updates);
      
      if (result.success) {
        // Update local state
        setRegistrations(prev => 
          prev.map(reg => 
            selectedRegistrations.has(reg.registrationId)
              ? { ...reg, registration_status: bulkAction, status: bulkAction }
              : reg
          )
        );
        
        setSelectedRegistrations(new Set());
        setBulkAction('');
        setShowBulkModal(false);
        showNotification(`✅ Bulk action completed for ${selectedRegistrations.size} registrations`, 'success');
        
        // Reload stats
        const statsResult = await hackathonService.getRegistrationStats();
        if (statsResult.success) {
          const statsData = statsResult.data.data || statsResult.data;
          setStats(prev => ({ ...prev, ...statsData }));
        }
      } else {
        showNotification(`❌ Bulk action failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      showNotification('❌ Bulk action failed', 'error');
    }
  };

  const toggleRegistrationSelection = (registrationId) => {
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(registrationId)) {
        newSet.delete(registrationId);
      } else {
        newSet.add(registrationId);
      }
      return newSet;
    });
  };

  const selectAllFilteredRegistrations = () => {
    const allIds = new Set(filteredRegistrations.map(reg => reg.registrationId));
    setSelectedRegistrations(allIds);
  };

  const selectAllOnCurrentPage = () => {
    const currentPageIds = new Set(paginatedRegistrations.map(reg => reg.registrationId));
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev);
      currentPageIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const isCurrentPageFullySelected = () => {
    return paginatedRegistrations.length > 0 && 
           paginatedRegistrations.every(reg => selectedRegistrations.has(reg.registrationId));
  };

  const isCurrentPagePartiallySelected = () => {
    return paginatedRegistrations.some(reg => selectedRegistrations.has(reg.registrationId));
  };

  const clearSelection = () => {
    setSelectedRegistrations(new Set());
  };

  // Gallery-style drag selection functionality
  const handleMouseDown = (e, registrationId, index) => {
    // Prevent text selection during drag
    e.preventDefault();
    
    // Check if it's a left click
    if (e.button !== 0) return;
    
    // Don't start drag if clicking on interactive elements
    if (e.target.closest('button, select, input, .view-btn, .status-select')) {
      return;
    }

    setIsDragging(true);
    setDragStartIndex(index);
    setDragEndIndex(index);
    
    // Determine selection mode based on current state
    const isCurrentlySelected = selectedRegistrations.has(registrationId);
    setSelectionMode(isCurrentlySelected ? 'remove' : 'add');
    
    // Apply initial selection
    if (isCurrentlySelected) {
      setSelectedRegistrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    } else {
      setSelectedRegistrations(prev => new Set([...prev, registrationId]));
    }
  };

  const handleMouseEnter = (registrationId, index) => {
    if (!isDragging) return;
    
    setDragEndIndex(index);
    
    // Calculate the range of items to select
    const startIdx = Math.min(dragStartIndex, index);
    const endIdx = Math.max(dragStartIndex, index);
    
    // Get the registration IDs in the range
    const rangeIds = paginatedRegistrations
      .slice(startIdx, endIdx + 1)
      .map(reg => reg.registrationId);
    
    // Apply selection based on mode
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev);
      
      // First, reset the previously dragged selection
      paginatedRegistrations.forEach((reg, idx) => {
        if (idx !== dragStartIndex) { // Don't reset the initial clicked item
          const wasInPreviousRange = Math.min(dragStartIndex, dragEndIndex) <= idx && 
                                   idx <= Math.max(dragStartIndex, dragEndIndex);
          
          if (wasInPreviousRange) {
            if (selectionMode === 'add') {
              newSet.delete(reg.registrationId);
            } else {
              newSet.add(reg.registrationId);
            }
          }
        }
      });
      
      // Apply new selection
      rangeIds.forEach(id => {
        if (selectionMode === 'add') {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
      });
      
      return newSet;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartIndex(null);
    setDragEndIndex(null);
    setSelectionMode('add');
  };

  // Add global mouse up event listener to handle mouse up outside the table
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Prevent text selection during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isDragging]);

  // Export functionality
  const handleExport = async (format, exportType = 'detailed') => {
    try {
      setIsExporting(true);
      showNotification(`📊 Exporting ${exportType} data as ${format.toUpperCase()}...`, 'info');
      
      let csvContent = '';
      let filename = '';
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        // Use filtered registrations for export
        const dataToExport = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
        
        if (exportType === 'detailed') {
          csvContent = generateLocalCSV(dataToExport);
          filename = `hackathon_registrations_detailed_${timestamp}.csv`;
        } else if (exportType === 'analytics') {
          csvContent = generateAnalyticsCSV(dataToExport);
          filename = `hackathon_analytics_summary_${timestamp}.csv`;
        } else if (exportType === 'selected') {
          if (selectedRegistrations.size === 0) {
            showNotification('❌ No registrations selected for export', 'error');
            return;
          }
          const selectedData = registrations.filter(reg => selectedRegistrations.has(reg.registrationId));
          csvContent = generateLocalCSV(selectedData);
          filename = `hackathon_selected_registrations_${timestamp}.csv`;
        } else if (exportType === 'participant-details') {
          // Get participant details from API
          console.log('Fetching participant details from API...');
          const participantResponse = await hackathonService.getParticipantDetails();
          console.log('Received participant response:', participantResponse);
          
          if (participantResponse.success) {
            csvContent = generateParticipantDetailsCSV(participantResponse.data);
            filename = `hackathon_participant_details_${timestamp}.csv`;
          } else {
            showNotification(`❌ Failed to fetch participant details: ${participantResponse.message}`, 'error');
            return;
          }
        } else if (exportType === 'participant-analytics') {
          // Get participant details from API and generate analytics
          console.log('Fetching participant details for analytics from API...');
          const participantResponse = await hackathonService.getParticipantDetails();
          console.log('Received participant response for analytics:', participantResponse);
          
          if (participantResponse.success) {
            csvContent = generateParticipantAnalyticsCSV(participantResponse.data);
            filename = `hackathon_participant_analytics_${timestamp}.csv`;
          } else {
            showNotification(`❌ Failed to fetch participant details: ${participantResponse.message}`, 'error');
            return;
          }
        }
        
        if (csvContent) {
          downloadCSV(csvContent, filename);
          showNotification(`✅ ${exportType} data exported successfully as ${filename}`, 'success');
        } else {
          showNotification('❌ No data to export', 'error');
        }
      } else {
        // Try backend export for other formats
        const filterParams = {
          status: filters.status !== 'all' ? filters.status : undefined,
          teamSize: filters.teamSize !== 'all' ? filters.teamSize : undefined,
          college: filters.college !== 'all' ? filters.college : undefined,
          department: filters.department !== 'all' ? filters.department : undefined
        };
        
        const result = await hackathonService.exportRegistrations(format, filterParams);
        
        if (result.success) {
          showNotification(`✅ ${result.message}`, 'success');
        } else {
          showNotification(`❌ Export failed: ${result.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('❌ Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Certificate generation
  const handleGenerateCertificate = async (registrationId, certificateType = 'participation') => {
    try {
      showNotification('🏆 Generating certificate...', 'info');
      
      const result = await hackathonService.generateCertificate(registrationId, certificateType);
      
      if (result.success) {
        showNotification(`✅ ${result.message}`, 'success');
      } else {
        showNotification(`❌ Certificate generation failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      showNotification('❌ Certificate generation failed', 'error');
    }
  };

  // Email functionality
  const handleSendEmails = async (recipients, emailType, customMessage = '') => {
    try {
      showNotification(`📧 Sending ${emailType} emails to ${recipients.length} recipients...`, 'info');
      
      const result = await hackathonService.sendBulkEmails(recipients, emailType, customMessage);
      
      if (result.success) {
        showNotification(`✅ Emails sent successfully to ${recipients.length} recipients`, 'success');
      } else {
        showNotification(`❌ Email sending failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      showNotification('❌ Email sending failed', 'error');
    }
  };

  // Send individual emails
  const handleSendIndividualEmail = async (registrationId, emailType, customMessage = '') => {
    try {
      // Validate registration ID
      if (!registrationId) {
        console.error('❌ Registration ID is undefined or empty:', registrationId);
        showNotification('❌ Error: Registration ID is missing', 'error');
        return;
      }
      
      console.log(`📧 Sending ${emailType} email to registration:`, registrationId);
      showNotification(`📧 Sending ${emailType} email...`, 'info');
      
      let result;
      switch (emailType) {
        case 'confirmation':
          result = await hackathonService.sendConfirmationEmail(registrationId);
          break;
        case 'reminder':
          result = await hackathonService.sendReminderEmail(registrationId, 'general', customMessage);
          break;
        case 'announcement':
          result = await hackathonService.sendAnnouncementEmail([registrationId], 'Important Update', customMessage);
          break;
        case 'test':
          result = await hackathonService.testEmailSystem(registrationId, 'confirmation');
          break;
        default:
          result = await hackathonService.sendBulkEmails([registrationId], emailType, customMessage);
      }
      
      if (result.success) {
        showNotification(`✅ ${result.message}`, 'success');
      } else {
        showNotification(`❌ Email failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Individual email error:', error);
      showNotification('❌ Email sending failed', 'error');
    }
  };

  // Send pre-event reminders to all confirmed participants
  const handleSendPreEventReminders = async (customMessage = '') => {
    try {
      showNotification('📧 Sending pre-event reminders to all confirmed participants...', 'info');
      
      const result = await hackathonService.sendPreEventReminders(customMessage);
      
      if (result.success) {
        showNotification(`✅ ${result.message}`, 'success');
      } else {
        showNotification(`❌ Pre-event reminders failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Pre-event reminders error:', error);
      showNotification('❌ Failed to send pre-event reminders', 'error');
    }
  };

  // Test email system
  const handleTestEmail = async (registrationId = null) => {
    try {
      // Debug environment variables
      console.log('🔍 Environment Debug:');
      console.log('- Direct env var:', import.meta.env.VITE_HACKATHON_UTILS_API_URL);
      console.log('- Environment mode:', import.meta.env.MODE);
      
      // Use a test registration ID if none provided
      let testRegId = registrationId;
      
      // If no specific registration ID provided, try to use an actual registration
      if (!registrationId) {
        if (registrations.length > 0) {
          // First try to find a confirmed registration
          const confirmedReg = registrations.find(reg => 
            (reg.registration_status || reg.status) === 'confirmed'
          );
          // Use the correct field name: registration_id not registrationId
          testRegId = confirmedReg ? 
            (confirmedReg.registration_id || confirmedReg.registrationId) : 
            (registrations[0].registration_id || registrations[0].registrationId);
        } else {
          // Use a default test ID if no registrations are available
          testRegId = 'reg001';
        }
      }
      
      console.log('🧪 Testing email system with registration ID:', testRegId);
      console.log('� Selected from registrations:', registrations.length > 0 ? {
        total: registrations.length,
        selectedFrom: registrations.find(reg => (reg.registration_id || reg.registrationId) === testRegId) ? 'found match' : 'fallback'
      } : 'no registrations available');
      console.log('�📡 API endpoint will be:', import.meta.env.VITE_HACKATHON_UTILS_API_URL || 'UNDEFINED');
      
      showNotification('🧪 Testing email system...', 'info');
      
      const result = await hackathonService.testEmailSystem(testRegId, 'confirmation');
      
      console.log('📧 Email test result:', result);
      
      if (result.success) {
        showNotification(`✅ Email test successful for registration ${testRegId}`, 'success');
      } else {
        console.error('❌ Email test failed:', result);
        showNotification(`❌ Email test failed: ${result.message || 'Unknown error'}`, 'error');
        
        // Show detailed failure information if available
        if (result.data?.failed_sends) {
          console.error('📋 Failed email details:', result.data.failed_sends);
          result.data.failed_sends.forEach(failure => {
            console.error(`❌ ${failure.recipient_id}: ${failure.error}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Email test error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      showNotification(`❌ Email test failed: ${error.message || 'Network error'}`, 'error');
    }
  };

  const generateLocalCSV = (data) => {
    if (!data || data.length === 0) {
      return 'No data available';
    }

    // Comprehensive headers for detailed export
    const headers = [
      // Basic Information
      'Registration ID', 'Full Name', 'Email', 'Phone', 'College', 'Department', 'Year',
      
      // Team Information
      'Team Name', 'Team Size', 'Team Type', 'Team Members',
      
      // Technical Information
      'Problem Statement', 'Programming Languages', 'AI Experience', 'Previous Hackathons',
      
      // Status & Payment
      'Registration Status', 'Payment Status', 'Payment Amount', 'Payment ID', 'Order ID',
      
      // Timestamps
      'Registration Date', 'Last Updated',
      
      // Analytics Fields
      'College Code', 'Department Category', 'Experience Level', 'Team Formation',
      
      // Additional Fields
      'Additional Skills', 'Expectations', 'Admin Notes'
    ];

    const csvRows = [headers.join(',')];

    data.forEach(reg => {
      const personalInfo = reg.personal_info || {};
      const teamInfo = reg.team_info || {};
      const paymentInfo = reg.payment_info || {};
      const skills = reg.skills || {};
      
      // Extract team members info
      const teamMembers = (teamInfo.teamMembers || reg.team_members || [])
        .map(member => `${member.name || member.fullName || 'N/A'} (${member.email || 'N/A'})`)
        .join('; ');
      
      // Determine experience level
      const getExperienceLevel = (aiExp, prevHack) => {
        const ai = (aiExp || '').toLowerCase();
        const hack = (prevHack || '').toLowerCase();
        
        if (ai.includes('expert') || ai.includes('advanced') || hack.includes('5+') || hack.includes('many')) {
          return 'Expert';
        } else if (ai.includes('intermediate') || ai.includes('good') || hack.includes('2-4') || hack.includes('few')) {
          return 'Intermediate';
        } else if (ai.includes('beginner') || ai.includes('basic') || hack.includes('0-1') || hack.includes('none')) {
          return 'Beginner';
        }
        return 'Not Specified';
      };
      
      // Categorize department
      const categorizeDepartment = (dept) => {
        const department = (dept || '').toLowerCase();
        if (department.includes('cse') || department.includes('computer science') || department.includes('it') || department.includes('information technology')) {
          return 'Computer Science & IT';
        } else if (department.includes('ece') || department.includes('electronics') || department.includes('electrical')) {
          return 'Electronics & Electrical';
        } else if (department.includes('mech') || department.includes('mechanical')) {
          return 'Mechanical';
        } else if (department.includes('civil')) {
          return 'Civil';
        } else if (department.includes('aiml') || department.includes('ai') || department.includes('ml') || department.includes('data science')) {
          return 'AI & Data Science';
        } else if (department.includes('bio') || department.includes('chemical')) {
          return 'Bio & Chemical';
        }
        return 'Other';
      };
      
      // Extract college code
      const getCollegeCode = (college) => {
        if (college && college.includes('(') && college.includes(')')) {
          return college.match(/\(([^)]+)\)/)?.[1] || '';
        }
        return '';
      };
      
      const row = [
        // Basic Information
        reg.registrationId || '',
        personalInfo.fullName || reg.fullName || '',
        personalInfo.email || reg.email || '',
        personalInfo.phone || reg.phone || '',
        personalInfo.college || reg.college || '',
        personalInfo.department || reg.department || '',
        personalInfo.year || reg.year || '',
        
        // Team Information
        teamInfo.teamName || reg.teamName || 'Individual',
        teamInfo.teamSize || reg.teamSize || 1,
        (teamInfo.teamSize || reg.teamSize || 1) === 1 ? 'Individual' : 'Team',
        teamMembers,
        
        // Technical Information
        reg.problemStatement || '',
        (skills.programmingLanguages || reg.programmingLanguages || []).join('; '),
        skills.aiExperience || reg.aiExperience || '',
        skills.previousHackathons || reg.previousHackathons || '',
        
        // Status & Payment
        reg.registration_status || reg.status || 'pending',
        paymentInfo.status || reg.paymentStatus || 'pending',
        paymentInfo.amount || reg.amount || '',
        paymentInfo.razorpay_payment_id || reg.payment_id || '',
        paymentInfo.razorpay_order_id || reg.order_id || '',
        
        // Timestamps
        reg.createdAt || reg.registrationDate || '',
        reg.updatedAt || reg.lastUpdated || '',
        
        // Analytics Fields
        getCollegeCode(personalInfo.college || reg.college || ''),
        categorizeDepartment(personalInfo.department || reg.department || ''),
        getExperienceLevel(skills.aiExperience || reg.aiExperience || '', skills.previousHackathons || reg.previousHackathons || ''),
        (teamInfo.teamSize || reg.teamSize || 1) > 1 ? 'Team Registration' : 'Individual Registration',
        
        // Additional Fields
        skills.additionalSkills || reg.additionalSkills || '',
        skills.expectations || reg.expectations || '',
        reg.admin_notes || reg.adminNotes || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Proper CSV escaping
      
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  // Enhanced export with analytics summary
  const generateAnalyticsCSV = (data) => {
    if (!data || data.length === 0) {
      return 'No data available for analytics';
    }

    // Calculate analytics
    const analytics = {
      departmentStats: {},
      collegeStats: {},
      yearStats: {},
      experienceStats: {},
      teamStats: { individual: 0, team: 0 },
      statusStats: {},
      total: data.length
    };

    data.forEach(reg => {
      const personalInfo = reg.personal_info || {};
      const teamInfo = reg.team_info || {};
      const skills = reg.skills || {};
      
      const dept = personalInfo.department || reg.department || 'Not Specified';
      const college = personalInfo.college || reg.college || 'Not Specified';
      const year = personalInfo.year || reg.year || 'Not Specified';
      const status = reg.registration_status || reg.status || 'pending';
      const teamSize = teamInfo.teamSize || reg.teamSize || 1;
      
      // Department stats
      analytics.departmentStats[dept] = (analytics.departmentStats[dept] || 0) + 1;
      
      // College stats
      analytics.collegeStats[college] = (analytics.collegeStats[college] || 0) + 1;
      
      // Year stats
      analytics.yearStats[year] = (analytics.yearStats[year] || 0) + 1;
      
      // Team stats
      if (teamSize === 1) {
        analytics.teamStats.individual++;
      } else {
        analytics.teamStats.team++;
      }
      
      // Status stats
      analytics.statusStats[status] = (analytics.statusStats[status] || 0) + 1;
      
      // Experience stats
      const aiExp = (skills.aiExperience || reg.aiExperience || '').toLowerCase();
      let expLevel = 'Not Specified';
      if (aiExp.includes('expert') || aiExp.includes('advanced')) {
        expLevel = 'Expert';
      } else if (aiExp.includes('intermediate') || aiExp.includes('good')) {
        expLevel = 'Intermediate';
      } else if (aiExp.includes('beginner') || aiExp.includes('basic')) {
        expLevel = 'Beginner';
      }
      analytics.experienceStats[expLevel] = (analytics.experienceStats[expLevel] || 0) + 1;
    });

    // Create analytics CSV
    const analyticsRows = [
      '=== HACKATHON REGISTRATION ANALYTICS SUMMARY ===',
      '',
      'OVERVIEW',
      `Total Registrations,${analytics.total}`,
      `Export Date,${new Date().toLocaleString()}`,
      '',
      'DEPARTMENT WISE BREAKDOWN',
      'Department,Count,Percentage'
    ];

    Object.entries(analytics.departmentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([dept, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${dept}",${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('COLLEGE WISE BREAKDOWN');
    analyticsRows.push('College,Count,Percentage');

    Object.entries(analytics.collegeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([college, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${college}",${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('REGISTRATION TYPE');
    analyticsRows.push('Type,Count,Percentage');
    analyticsRows.push(`Individual,${analytics.teamStats.individual},${((analytics.teamStats.individual / analytics.total) * 100).toFixed(1)}%`);
    analyticsRows.push(`Team,${analytics.teamStats.team},${((analytics.teamStats.team / analytics.total) * 100).toFixed(1)}%`);

    analyticsRows.push('');
    analyticsRows.push('REGISTRATION STATUS');
    analyticsRows.push('Status,Count,Percentage');

    Object.entries(analytics.statusStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`${status},${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('EXPERIENCE LEVEL');
    analyticsRows.push('Level,Count,Percentage');

    Object.entries(analytics.experienceStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([level, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`${level},${count},${percentage}%`);
      });

    return analyticsRows.join('\n');
  };

  // New function to generate CSV from participant details API
  const generateParticipantDetailsCSV = (data) => {
    console.log('generateParticipantDetailsCSV received data:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid or empty data for participant details:', data);
      return 'No participant details available';
    }

    // Headers for participant details CSV
    const headers = [
      'Name', 'Team', 'Phone', 'Email', 'Department', 'Year', 'College'
    ];

    const csvRows = [headers.join(',')];

    data.forEach(participant => {
      const row = [
        participant.name || '',
        participant.team || '',
        participant.phone || '',
        participant.email || '',
        participant.department || '',
        participant.year || '',
        participant.college || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Proper CSV escaping
      
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  // Function to generate analytics from participant details API
  const generateParticipantAnalyticsCSV = (data) => {
    console.log('generateParticipantAnalyticsCSV received data:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid or empty data for participant analytics:', data);
      return 'No data available for participant analytics';
    }

    // Calculate analytics from participant details
    const analytics = {
      departmentStats: {},
      collegeStats: {},
      yearStats: {},
      teamStats: {},
      total: data.length
    };

    data.forEach(participant => {
      const dept = participant.department || 'Not Specified';
      const college = participant.college || 'Not Specified';
      const year = participant.year || 'Not Specified';
      const team = participant.team || 'Individual';
      
      // Department stats
      analytics.departmentStats[dept] = (analytics.departmentStats[dept] || 0) + 1;
      
      // College stats
      analytics.collegeStats[college] = (analytics.collegeStats[college] || 0) + 1;
      
      // Year stats
      analytics.yearStats[year] = (analytics.yearStats[year] || 0) + 1;
      
      // Team stats
      analytics.teamStats[team] = (analytics.teamStats[team] || 0) + 1;
    });

    // Create participant analytics CSV
    const analyticsRows = [
      '=== PARTICIPANT DETAILS ANALYTICS SUMMARY ===',
      '',
      'OVERVIEW',
      `Total Participants,${analytics.total}`,
      `Export Date,${new Date().toLocaleString()}`,
      `Data Source,Participant Details API`,
      '',
      'DEPARTMENT WISE BREAKDOWN',
      'Department,Count,Percentage'
    ];

    Object.entries(analytics.departmentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([dept, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${dept}",${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('COLLEGE WISE BREAKDOWN');
    analyticsRows.push('College,Count,Percentage');

    Object.entries(analytics.collegeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([college, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${college}",${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('YEAR WISE BREAKDOWN');
    analyticsRows.push('Year,Count,Percentage');

    Object.entries(analytics.yearStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([year, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${year}",${count},${percentage}%`);
      });

    analyticsRows.push('');
    analyticsRows.push('TEAM WISE BREAKDOWN');
    analyticsRows.push('Team,Count,Percentage');

    Object.entries(analytics.teamStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 teams
      .forEach(([team, count]) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);
        analyticsRows.push(`"${team}",${count},${percentage}%`);
      });

    return analyticsRows.join('\n');
  };

  // Enhanced download function
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter registrations based on current filters
  const filteredRegistrations = registrations.filter(reg => {
    const status = reg.registration_status || reg.status || 'pending';
    const frontendStatus = status === 'pending_payment' ? 'pending' : status;
    
    if (filters.status !== 'all' && frontendStatus !== filters.status) return false;
    
    if (filters.teamSize !== 'all') {
      const teamSize = reg.team_info?.teamSize || reg.teamSize || 1;
      const teamType = teamSize === 1 ? 'individual' : 'team';
      if (filters.teamSize !== teamType) return false;
    }
    
    if (filters.college !== 'all') {
      const college = reg.personal_info?.college || reg.college;
      if (!college || college !== filters.college) return false;
    }
    
    if (filters.department !== 'all') {
      const department = reg.personal_info?.department || reg.department;
      if (!department || department !== filters.department) return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const personalInfo = reg.personal_info || {};
      const teamInfo = reg.team_info || {};
      
      return (
        personalInfo.fullName?.toLowerCase().includes(searchLower) ||
        reg.fullName?.toLowerCase().includes(searchLower) ||
        personalInfo.email?.toLowerCase().includes(searchLower) ||
        reg.email?.toLowerCase().includes(searchLower) ||
        reg.registrationId?.toLowerCase().includes(searchLower) ||
        teamInfo.teamName?.toLowerCase().includes(searchLower) ||
        reg.teamName?.toLowerCase().includes(searchLower) ||
        personalInfo.department?.toLowerCase().includes(searchLower) ||
        reg.department?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Utility function to get college code
  const getCollegeCode = (collegeName) => {
    if (!collegeName) return 'UNKNOWN';

    const college = collegeName.toUpperCase();

    // TKR College
    if (college.includes('TKR') || college.includes('TEEGALA KRISHNA REDDY')) {
      return 'TKR';
    }

    // Other major colleges - you can expand this list
    if (college.includes('JNTU') || college.includes('JNTUH')) {
      return 'JNTU';
    }

    if (college.includes('OU') || college.includes('OSMANIA')) {
      return 'OU';
    }

    if (college.includes('CBIT') || college.includes('CHAITANYA BHARATHI')) {
      return 'CBIT';
    }

    if (college.includes('VNR') || college.includes('VIGNAN')) {
      return 'VNR';
    }

    if (college.includes('MVSR') || college.includes('MVS REC')) {
      return 'MVSR';
    }

    if (college.includes('GRIET') || college.includes('GOKARAJU RANGARAJU')) {
      return 'GRIET';
    }

    // Default to first 3 characters of college name as code
    return college.replace(/[^A-Z0-9]/g, '').substring(0, 3) || 'COL';
  };

  // Utility function to categorize department
  const categorizeDepartment = (department) => {
    if (!department) return 'Not Specified';

    const dept = department.toLowerCase();

    if (dept.includes('computer') || dept.includes('cse') || dept.includes('cs') || dept.includes('it') || dept.includes('information technology')) {
      return 'Computer Science & IT';
    }

    if (dept.includes('electronics') || dept.includes('ece') || dept.includes('eee') || dept.includes('electrical') || dept.includes('eie')) {
      return 'Electronics & Electrical';
    }

    if (dept.includes('mechanical') || dept.includes('mech')) {
      return 'Mechanical';
    }

    if (dept.includes('civil')) {
      return 'Civil';
    }

    if (dept.includes('chemical') || dept.includes('chem')) {
      return 'Chemical';
    }

    if (dept.includes('aeronautical') || dept.includes('aero')) {
      return 'Aeronautical';
    }

    if (dept.includes('biotechnology') || dept.includes('biotech')) {
      return 'Biotechnology';
    }

    if (dept.includes('automobile') || dept.includes('auto')) {
      return 'Automobile';
    }

    if (dept.includes('mining')) {
      return 'Mining';
    }

    if (dept.includes('petroleum')) {
      return 'Petroleum';
    }

    if (dept.includes('textile')) {
      return 'Textile';
    }

    if (dept.includes('agricultural') || dept.includes('agri')) {
      return 'Agricultural';
    }

    return 'Other';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + R: Manual refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadDashboardData(true);
      }
      // Ctrl/Cmd + E: Export detailed CSV
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        if (!isExporting) {
          handleExport('csv', 'detailed');
        }
      }
      // Ctrl/Cmd + Shift + E: Export analytics CSV
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        if (!isExporting) {
          handleExport('csv', 'analytics');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadDashboardData, isExporting, handleExport]);

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'registrations', name: 'Registrations', icon: <GroupIcon /> },
    { id: 'teams', name: 'Teams', icon: <GroupsIcon /> },
    { id: 'payments', name: 'Payments', icon: <PaymentIcon /> },
    { id: 'analytics', name: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'communications', name: 'Communications', icon: <EmailIcon /> }
  ];

  if (loading) {
    return (
      <div className="hackathon-admin-loading">
        <div className="loading-spinner">Loading hackathon admin...</div>
      </div>
    );
  }

  return (
    <div className="hackathon-admin">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`admin-notification ${notification.type}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="hackathon-admin-header">
        <div className="header-content">
          <h1><RocketIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> CognitiveX GenAI Hackathon Admin</h1>
          <div className="header-info">
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {refreshing && <span className="refreshing-indicator"><RefreshIcon fontSize="small" /></span>}
            </span>
            <div className="keyboard-shortcuts" title="Keyboard Shortcuts: Ctrl+R (Refresh), Ctrl+E (Export Detailed), Ctrl+Shift+E (Export Analytics) • Gallery Selection: Click and drag to select multiple rows">
              <KeyboardIcon fontSize="small" style={{marginRight: '4px'}} /> Shortcuts
            </div>
          </div>
        </div>
        <div className="admin-actions">
          <button onClick={() => loadDashboardData(true)} className="refresh-btn">
            <RefreshIcon fontSize="small" style={{marginRight: '4px'}} /> Manual Refresh
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="hackathon-admin-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            {section.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="hackathon-admin-content">
        {activeSection === 'dashboard' && (
  <DashboardSection 
    stats={stats} 
    registrations={registrations}
    analyticsData={analyticsData}
    teams={teams}
  />
)}
        {activeSection === 'registrations' && (
          <RegistrationsSection
            registrations={paginatedRegistrations}
            filters={filters}
            setFilters={setFilters}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalRegistrations={filteredRegistrations.length}
            updateRegistrationStatus={updateRegistrationStatus}
            setSelectedRegistration={setSelectedRegistration}
            handleExport={handleExport}
            isExporting={isExporting}
            selectedRegistrations={selectedRegistrations}
            setEmailModal={setEmailModal}
            filteredRegistrations={filteredRegistrations}
            paginatedRegistrations={paginatedRegistrations}
            selectAllFilteredRegistrations={selectAllFilteredRegistrations}
            selectAllOnCurrentPage={selectAllOnCurrentPage}
            isCurrentPageFullySelected={isCurrentPageFullySelected}
            isCurrentPagePartiallySelected={isCurrentPagePartiallySelected}
            clearSelection={clearSelection}
            bulkAction={bulkAction}
            setBulkAction={setBulkAction}
            handleBulkAction={handleBulkAction}
            setSelectedRegistrations={setSelectedRegistrations}
            handleSendEmails={handleSendEmails}
            handleTestEmail={handleTestEmail}
            // Gallery-style drag selection props
            isDragging={isDragging}
            dragStartIndex={dragStartIndex}
            dragEndIndex={dragEndIndex}
            selectionMode={selectionMode}
            handleMouseDown={handleMouseDown}
            handleMouseEnter={handleMouseEnter}
            tableRef={tableRef}
          />
        )}

        {activeSection === 'teams' && (
          <TeamsSection registrations={registrations} showNotification={showNotification} />
        )}

        {activeSection === 'payments' && (
          <PaymentsSection registrations={filteredRegistrations} />
        )}

        {activeSection === 'analytics' && (
          <AnalyticsSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            registrations={registrations}
            stats={stats}
            filters={filters}
            handleFilterSelect={handleFilterSelect}
            teams={teams}
          />
        )}

        {activeSection === 'communications' && (
          <CommunicationsSection 
            registrations={registrations} 
            handleSendEmails={handleSendEmails}
            handleSendPreEventReminders={handleSendPreEventReminders}
            handleTestEmail={handleTestEmail}
            setEmailModal={setEmailModal}
          />
        )}
      </div>

      {/* Registration Detail Modal */}
      <AnimatePresence>
        {selectedRegistration && (
          <RegistrationDetailModal
            registration={selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
            onStatusUpdate={updateRegistrationStatus}
            onGenerateCertificate={handleGenerateCertificate}
            onSendEmail={handleSendIndividualEmail}
          />
        )}

        {/* Email Modal */}
        {emailModal.show && (
          <EmailModal
            emailType={emailModal.type}
            recipients={emailModal.recipients}
            onSend={handleSendEmails}
            onClose={() => setEmailModal({ show: false, type: 'confirmation', recipients: [] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({ stats, registrations = [], analyticsData = {}, teams = [] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="dashboard-section"
  >
    <h2><DashboardIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Hackathon Overview</h2>
    
    <div className="stats-grid">
      <div className="stat-card total">
        <div className="stat-icon"><GroupIcon /></div>
        <div className="stat-info">
          <h3>{(() => {
            const confirmedCount = registrations.filter(reg => (reg.registration_status || reg.status) === 'confirmed').length;
            const totalCount = registrations.length;
            console.log('🔢 Participants count:', { total: totalCount, confirmed: confirmedCount, statsTotal: stats.total_participants });
            return confirmedCount || totalCount || teams.reduce((sum, team) => sum + (parseInt(team.teamsize) || team.members?.length || 1), 0);
          })()}</h3>
          <p>Total Participants</p>
        </div>
      </div>
      
      <div className="stat-card confirmed">
        <div className="stat-icon"><CheckCircleIcon /></div>
        <div className="stat-info">
          <h3>{stats.confirmed_registrations || 0}</h3>
          <p>Confirmed</p>
        </div>
      </div>
      
      <div className="stat-card pending">
        <div className="stat-icon"><HourglassIcon /></div>
        <div className="stat-info">
          <h3>{stats.pending_payments || stats.pending_registrations || 0}</h3>
          <p>Pending Payment</p>
        </div>
      </div>
      
      <div className="stat-card revenue">
        <div className="stat-icon"><MoneyIcon /></div>
        <div className="stat-info">
          <h3>₹{(stats.total_revenue || 0).toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      
      <div className="stat-card teams">
        <div className="stat-icon"><GroupsIcon /></div>
        <div className="stat-info">
          <h3>{teams.length}</h3>
          <p>Total Teams</p>
        </div>
      </div>
    </div>

    <div className="dashboard-charts">
      
<div className="chart-card">
  <h3>Registration Analytics</h3>
  <div className="chart-content">
    <div className="analytics-section">
      <h4>Year-wise Distribution</h4>
      {analyticsData.year && Object.entries(analyticsData.year).map(([year, count]) => (
        <div key={year} className="analytics-item">
          <span>{year} Year</span>
          <div className="analytics-bar">
            <div 
              className="bar-fill" 
              style={{
                width: `${(count / Math.max(...Object.values(analyticsData.year))) * 100}%`
              }}
            />
            <span>{count}</span>
          </div>
        </div>
      ))}
    </div>
   

    <div className="analytics-section">
      <h4>Registration Status</h4>
      {analyticsData.status && Object.entries(analyticsData.status).map(([status, count]) => (
        <div key={status} className="analytics-item">
          <span>{status.replace('_', ' ').toUpperCase()}</span>
          <div className="analytics-bar">
            <div
              className="bar-fill"
              style={{
                width: `${(count / Math.max(...Object.values(analyticsData.status))) * 100}%`
              }}
            />
            <span>{count}</span>
          </div>
        </div>
      ))}
    </div>

  
  </div>
</div>
      <div className="chart-card">
        <h3>Team Analytics</h3>
        <div className="chart-content">
          <div className="analytics-section">
            <h4>Team Size Distribution</h4>
            {teams.length > 0 ? (
              (() => {
                const teamSizeDistribution = teams.reduce((acc, team) => {
                  const size = parseInt(team.teamsize) || team.members?.length || 1;
                  const sizeKey = size === 1 ? '1' : size === 2 ? '2' : size === 3 ? '3' : size === 4 ? '4' : '5+';
                  acc[sizeKey] = (acc[sizeKey] || 0) + 1;
                  return acc;
                }, {});

                return Object.entries(teamSizeDistribution).map(([size, count]) => (
                  <div key={size} className="analytics-item">
                    <span>{size} Member{size !== '1' ? 's' : ''}</span>
                    <div className="analytics-bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(count / Math.max(...Object.values(teamSizeDistribution))) * 100}%`
                        }}
                      />
                      <span>{count}</span>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p>No teams data available</p>
            )}
          </div>

          <div className="analytics-section">
            <h4>Top Team Colleges</h4>
            {teams.length > 0 ? (
              (() => {
                const collegeDistribution = teams.reduce((acc, team) => {
                  team.members?.forEach(member => {
                    if (member.college) {
                      acc[member.college] = (acc[member.college] || 0) + 1;
                    }
                  });
                  return acc;
                }, {});

                return Object.entries(collegeDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([college, count]) => (
                    <div key={college} className="analytics-item">
                      <span>{college.length > 20 ? college.substring(0, 20) + '...' : college}</span>
                      <div className="analytics-bar">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(count / Math.max(...Object.values(collegeDistribution))) * 100}%`
                          }}
                        />
                        <span>{count}</span>
                      </div>
                    </div>
                  ));
              })()
            ) : (
              <p>No teams data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3>Registration Breakdown</h3>
        <div className="chart-placeholder">
          <p><TrendingUpIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Registration Distribution</p>
          <p>Individual: {stats.individual_registrations || 0}</p>
          <p>Teams: {stats.group_registrations || 0}</p>
          <p>Failed Payments: {stats.failed_payments || 0}</p>
        </div>
      </div>
      
      <div className="chart-card">
        <h3>College Distribution</h3>
        <div className="chart-placeholder">
          <p><SchoolIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Top Participating Colleges</p>
          {stats.college_wise_stats && Object.entries(stats.college_wise_stats)
            .slice(0, 5)
            .map(([college, count]) => (
              <p key={college}>{college}: {count}</p>
            ))
          }
        </div>
      </div>

      <div className="chart-card">
        <h3>TKR College Breakdown</h3>
        <div className="chart-placeholder">
          <p><SchoolIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> TKR COLLEGE OF ENGINEERING AND TECHNOLOGY (K9)</p>
          {(() => {
            const tkrRegs = registrations.filter(reg => 
              (reg.personal_info?.college || reg.college) === 'TKR COLLEGE OF ENGINEERING AND TECHNOLOGY (K9)'
            );
            const tkrIndividuals = tkrRegs.filter(reg => (reg.team_info?.teamSize || reg.teamSize || 1) === 1).length;
            const tkrTeams = tkrRegs.filter(reg => (reg.team_info?.teamSize || reg.teamSize || 1) > 1).length;
            const tkrTotal = tkrRegs.length;
            
            return (
              <>
                <p>Total Registrations: {tkrTotal}</p>
                <p>Individual: {tkrIndividuals}</p>
                <p>Team: {tkrTeams}</p>
              </>
            );
          })()}
        </div>
      </div>

      <div className="chart-card">
        <h3>TEEGALA Krishna Reddy Breakdown</h3>
        <div className="chart-placeholder">
          <p><SchoolIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> TEEGALA KRISHNA REDDY ENGINEERING COLLEGE (R9)</p>
          {(() => {
            const teeRegs = registrations.filter(reg => 
              (reg.personal_info?.college || reg.college) === 'TEEGALA KRISHNA REDDY ENGINEERING COLLEGE (R9)'
            );
            const teeIndividuals = teeRegs.filter(reg => (reg.team_info?.teamSize || reg.teamSize || 1) === 1).length;
            const teeTeams = teeRegs.filter(reg => (reg.team_info?.teamSize || reg.teamSize || 1) > 1).length;
            const teeTotal = teeRegs.length;
            
            return (
              <>
                <p>Total Registrations: {teeTotal}</p>
                <p>Individual: {teeIndividuals}</p>
                <p>Team: {teeTeams}</p>
              </>
            );
          })()}
        </div>
      </div>

      <div className="chart-card">
        <h3>📊 Export Data</h3>
        <div className="chart-placeholder">
          <p><DescriptionIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Available Export Options</p>
          <div className="export-summary">
            <p>• Detailed CSV with all fields ({registrations.length} records)</p>
            <p>• Analytics summary with statistics</p>
            <p>• Department-wise breakdown</p>
            <p>• College-wise analysis</p>
            <p>• Payment and status reports</p>
          </div>
          <small style={{color: '#94a3b8', fontSize: '11px'}}>
            💡 Go to Registrations section for export options
          </small>
        </div>
      </div>
    </div>
  </motion.div>
);

// Registrations Section Component
const RegistrationsSection = ({ 
  registrations, 
  filters, 
  setFilters, 
  currentPage, 
  setCurrentPage, 
  totalPages, 
  totalRegistrations,
  updateRegistrationStatus,
  setSelectedRegistration,
  handleExport,
  isExporting,
  selectedRegistrations,
  setEmailModal,
  filteredRegistrations,
  paginatedRegistrations,
  selectAllFilteredRegistrations,
  selectAllOnCurrentPage,
  isCurrentPageFullySelected,
  isCurrentPagePartiallySelected,
  clearSelection,
  bulkAction,
  setBulkAction,
  handleBulkAction,
  setSelectedRegistrations,
  // Gallery-style drag selection props
  isDragging,
  dragStartIndex,
  dragEndIndex,
  selectionMode,
  handleMouseDown,
  handleMouseEnter,
  tableRef
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="registrations-section"
  >
    <div className="section-header-with-actions">
      <h2>
        <GroupIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> 
        Registration Management
        <span 
          className="gallery-selection-tip" 
          title="💡 Gallery Selection: Click and drag across rows to select multiple items, just like selecting photos in a gallery!"
          style={{marginLeft: '8px', fontSize: '12px', opacity: 0.7, cursor: 'help'}}
        >
          📸
        </span>
      </h2>
      <div className="export-actions">
        <div className="export-dropdown">
          <button className="export-main-btn" disabled={isExporting}>
            <DescriptionIcon fontSize="small" style={{marginRight: '4px'}} />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          <div className="export-dropdown-content">
            <button 
              onClick={() => handleExport('csv', 'detailed')}
              className="export-option"
              disabled={isExporting}
            >
              <DescriptionIcon fontSize="small" style={{marginRight: '4px'}} />
              Detailed CSV ({filteredRegistrations.length} records)
            </button>
            <button 
              onClick={() => handleExport('csv', 'analytics')}
              className="export-option"
              disabled={isExporting}
            >
              <AnalyticsIcon fontSize="small" style={{marginRight: '4px'}} />
              Analytics Summary CSV
            </button>
            {selectedRegistrations.size > 0 && (
              <button 
                onClick={() => handleExport('csv', 'selected')}
                className="export-option"
                disabled={isExporting}
              >
                <CheckCircleIcon fontSize="small" style={{marginRight: '4px'}} />
                Selected Only CSV ({selectedRegistrations.size} records)
              </button>
            )}
            <hr />
            <div className="export-section-title">📡 API Data Exports</div>
            <button 
              onClick={() => handleExport('csv', 'participant-details')}
              className="export-option"
              disabled={isExporting}
            >
              <PersonIcon fontSize="small" style={{marginRight: '4px'}} />
              Participant Details CSV (from API)
            </button>
            <button 
              onClick={() => handleExport('csv', 'participant-analytics')}
              className="export-option"
              disabled={isExporting}
            >
              <AnalyticsIcon fontSize="small" style={{marginRight: '4px'}} />
              Participant Analytics CSV (from API)
            </button>
            <hr />
            <button 
              onClick={() => handleExport('xlsx')}
              className="export-option"
              disabled={isExporting}
            >
              <DescriptionIcon fontSize="small" style={{marginRight: '4px'}} />
              Excel (XLSX)
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="export-option"
              disabled={isExporting}
            >
              <DescriptionIcon fontSize="small" style={{marginRight: '4px'}} />
              PDF Report
            </button>
          </div>
        </div>
        <button 
          onClick={() => setEmailModal({ 
            show: true, 
            type: 'announcement', 
            recipients: Array.from(selectedRegistrations) 
          })}
          disabled={selectedRegistrations.size === 0}
          className="btn-email"
        >
          <EmailIcon fontSize="small" style={{marginRight: '4px'}} /> Send Emails ({selectedRegistrations.size})
        </button>
      </div>
    </div>

    {/* Filters */}
    <div className="filters-row">
      <input
        type="text"
        placeholder="Search by name, email, registration ID, or department..."
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        className="search-input"
      />
      
      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="filter-select"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      
      <select
        value={filters.teamSize}
        onChange={(e) => setFilters(prev => ({ ...prev, teamSize: e.target.value }))}
        className="filter-select"
      >
        <option value="all">All Types</option>
        <option value="individual">Individual</option>
        <option value="team">Team</option>
      </select>
      
      <select
        value={filters.college}
        onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
        className="filter-select"
      >
        <option value="all">All Colleges</option>
        <option value="TKR COLLEGE OF ENGINEERING AND TECHNOLOGY (K9)">TKR COLLEGE (K9)</option>
        <option value="TEEGALA KRISHNA REDDY ENGINEERING COLLEGE (R9)">TEEGALA KRISHNA REDDY (R9)</option>
      </select>
      
      <select
        value={filters.department}
        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
        className="filter-select"
      >
        <option value="all">All Departments</option>
        {[...new Set(registrations.map(reg => 
          reg.personal_info?.department || reg.department || 'Not Specified'
        ))].sort().map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
    </div>

    {/* Results summary and bulk actions */}
    <div className="results-summary-section">
      <div className="results-summary">
        Showing {registrations.length} of {totalRegistrations} registrations
        {/* Warning if we might be hitting the limit */}
        {registrations.length >= 1000 && (
          <span style={{color: 'orange', fontSize: '12px', display: 'block', marginTop: '4px'}}>
            ⚠️ Showing first 1000 registrations. Some registrations may not be displayed.
          </span>
        )}
        {selectedRegistrations.size > 0 && (
          <span className="selection-info">
            • {selectedRegistrations.size} selected
            {selectedRegistrations.size === filteredRegistrations.length && filteredRegistrations.length > 0 && (
              <span style={{color: 'var(--primary)', fontWeight: 'bold'}}> (All filtered)</span>
            )}
          </span>
        )}
        {isDragging && (
          <span className="drag-selection-info">
            • 🖱️ Gallery selection mode: {selectionMode === 'add' ? 'Adding' : 'Removing'} items
          </span>
        )}
      </div>
      
      {selectedRegistrations.size > 0 && (
        <div className="bulk-actions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bulk-select"
          >
            <option value="">Select Action</option>
            <option value="confirmed">Confirm Selected</option>
            <option value="cancelled">Cancel Selected</option>
            <option value="pending_payment">Mark as Pending</option>
            <option value="refunded">Mark as Refunded</option>
          </select>
          <button onClick={handleBulkAction} className="bulk-action-btn" disabled={!bulkAction}>
            Apply to {selectedRegistrations.size} items
          </button>
          <button onClick={selectAllFilteredRegistrations} className="select-all-btn" 
                  disabled={filteredRegistrations.length === 0 || 
                           (selectedRegistrations.size === filteredRegistrations.length && filteredRegistrations.length > 0)}>
            Select All Filtered ({filteredRegistrations.length})
          </button>
          <button onClick={clearSelection} className="clear-selection-btn">
            Clear Selection
          </button>
        </div>
      )}
    </div>

    {/* Registrations Table */}
    <div className="registrations-table" ref={tableRef}>
      <div className="table-header">
        <div className="select-column">
          <input
            type="checkbox"
            ref={(checkbox) => {
              if (checkbox) {
                const allFilteredSelected = filteredRegistrations.length > 0 && 
                                          filteredRegistrations.every(reg => selectedRegistrations.has(reg.registrationId));
                const someFilteredSelected = filteredRegistrations.some(reg => selectedRegistrations.has(reg.registrationId));
                
                checkbox.checked = allFilteredSelected;
                checkbox.indeterminate = someFilteredSelected && !allFilteredSelected;
              }
            }}
            onChange={(e) => {
              if (e.target.checked) {
                // Select all filtered registrations (all registrations matching current filters)
                selectAllFilteredRegistrations();
              } else {
                // Deselect all registrations
                clearSelection();
              }
            }}
            title={`Select all ${filteredRegistrations.length} filtered registrations`}
          />
        </div>
        <div>Registration ID</div>
        <div>Name</div>
        <div>Email</div>
        <div>Team</div>
        <div>Status</div>
        <div>Payment</div>
        <div>Actions</div>
      </div>
      
      {registrations.map((registration, index) => {
        const personalInfo = registration.personal_info || {};
        const teamInfo = registration.team_info || {};
        const paymentInfo = registration.payment_info || {};
        const status = registration.registration_status || registration.status || 'pending';
        const frontendStatus = status === 'pending_payment' ? 'pending' : status;
        const paymentStatus = paymentInfo.status || registration.paymentStatus || 'pending';
        
        return (
          <motion.div
            key={registration.registrationId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`table-row ${selectedRegistrations.has(registration.registrationId) ? 'selected' : ''} ${isDragging ? 'drag-mode' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, registration.registrationId, index)}
            onMouseEnter={() => handleMouseEnter(registration.registrationId, index)}
            style={{ 
              cursor: isDragging ? 'grabbing' : 'default',
              backgroundColor: isDragging && 
                              dragStartIndex !== null && 
                              dragEndIndex !== null && 
                              index >= Math.min(dragStartIndex, dragEndIndex) && 
                              index <= Math.max(dragStartIndex, dragEndIndex) ? 
                              (selectionMode === 'add' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.2)') : 
                              undefined
            }}
          >
            <div className="select-column" data-label="Select">
              <input
                type="checkbox"
                checked={selectedRegistrations.has(registration.registrationId)}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent drag selection
                  if (e.target.checked) {
                    setSelectedRegistrations(prev => new Set([...prev, registration.registrationId]));
                  } else {
                    setSelectedRegistrations(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(registration.registrationId);
                      return newSet;
                    });
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag selection on checkbox
              />
            </div>
            <div className="registration-id" data-label="Registration ID">
              {registration.registrationId?.slice(-8) || 'N/A'}
            </div>
            <div className="name" data-label="Name">
              <div>{personalInfo.fullName || registration.fullName || 'N/A'}</div>
            </div>
            <div className="email" data-label="Email">
              <div>{personalInfo.email || registration.email || 'N/A'}</div>
            </div>
            <div className="team" data-label="Team">
              <div className="team-name">
                {teamInfo.teamName || registration.teamName || 'Individual'}
              </div>
              {(teamInfo.teamSize > 1 || registration.teamSize > 1) && (
                <div className="team-size">
                  {teamInfo.teamSize || registration.teamSize} members
                </div>
              )}
            </div>
            <div className="status" data-label="Status">
              <span className={`status-badge ${frontendStatus}`}>
                {frontendStatus}
              </span>
            </div>
            <div className="payment" data-label="Payment">
              <span className={`payment-badge ${paymentStatus}`}>
                {paymentStatus}
              </span>
            </div>
            <div className="actions" data-label="Actions">
              <button
                onClick={() => setSelectedRegistration(registration)}
                className="view-btn"
                title="View Details"
              >
                <VisibilityIcon fontSize="small" />
              </button>
              <select
                value={frontendStatus}
                onChange={(e) => updateRegistrationStatus(registration.registrationId, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ← Previous
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    )}
  </motion.div>
);

// Teams Section Component

const TeamsSection = ({ registrations, showNotification }) => {
  // State for team operations
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  useEffect(() => {
    loadTeams();
  }, []);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSizeFilter, setTeamSizeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState(null);
  const [joinRequestNote, setJoinRequestNote] = useState('');

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    // Search query filter
    const matchesSearch = 
      team.teamname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.problem_statement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members?.some(member => 
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Team size filter
    const teamSize = typeof team.teamsize === 'string' ? parseInt(team.teamsize) : team.teamsize || 0;
    const matchesSize = 
      teamSizeFilter === 'all' || 
      (teamSizeFilter === '1' && teamSize === 1) ||
      (teamSizeFilter === '2' && teamSize === 2) ||
      (teamSizeFilter === '3' && teamSize === 3) ||
      (teamSizeFilter === '4' && teamSize === 4);
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && team.status === 'active') ||
      (statusFilter === 'inactive' && team.status === 'inactive');
    
    return matchesSearch && matchesSize && matchesStatus;
  });


  // Teams Section Component
const TeamsSection = ({ registrations }) => {
  // State for team operations
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add these new states for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSizeFilter, setTeamSizeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    // Search query filter
    const matchesSearch = 
      team.teamname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.problem_statement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members?.some(member => 
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Team size filter
    const matchesSize = 
      teamSizeFilter === 'all' || 
      (teamSizeFilter === '1' && teamSize === 1) ||
      (teamSizeFilter === '2' && teamSize === 2) ||
      (teamSizeFilter === '3' && teamSize === 3) ||
      (teamSizeFilter === '4' && teamSize === 4);
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && team.status === 'active') ||
      (statusFilter === 'inactive' && team.status === 'inactive');
    
    return matchesSearch && matchesSize && matchesStatus;
  });

  // Rest of your existing code...

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="teams-section"
    >
      <div className="teams-header">
        <h2><GroupIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Teams Management</h2>
        <div className="teams-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingTeam(null);
              setShowTeamForm(true);
            }}
          >
            <span>+</span> Create Team
          </button>
        </div>
      </div>

      

      {/* Team Table */}
      <div className="teams-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading teams...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error loading teams: {error}</p>
            <button onClick={loadTeams} className="btn-refresh">
              <RefreshIcon /> Try Again
            </button>
          </div>
        ) : (
          <>
            {filteredTeams.length > 0 ? (
              <div className="teams-grid">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="team-card">
                    <div className="team-card-header">
                      <h3>{team.teamname}</h3>
                      <span className={`status-badge ${team.status || 'active'}`}>
                        {team.status || 'Active'}
                      </span>
                    </div>
                    <div className="team-card-body">
                      <p className="problem-statement">
                        {team.problem_statement || 'No problem statement provided.'}
                      </p>
                      <div className="team-meta">
                        <span className="team-size">
                          <GroupIcon fontSize="small" /> {team.teamsize || 1} member{team.teamsize != 1 ? 's' : ''}
                        </span>
                        <span className="team-members">
                          {team.members?.slice(0, 3).map((m, i) => (
                            <span key={i} className="member-avatar" title={m.name}>
                              {m.name.charAt(0).toUpperCase()}
                            </span>
                          ))}
                          {team.members?.length > 3 && (
                            <span className="more-members">+{team.members.length - 3} more</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="team-card-actions">
                      <button 
                        className="btn-view"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowTeamDetail(true);
                        }}
                      >
                        View Details
                      </button>
                      
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No teams found matching your criteria.</p>
                {searchQuery || teamSizeFilter !== 'all' || statusFilter !== 'all' ? (
                  <button 
                    className="btn-clear-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setTeamSizeFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear all filters
                  </button>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinTeamModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJoinTeamModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              className="modal-content"
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem', fontWeight: '600' }}>Join a Team</h3>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowJoinTeamModal(false);
                    setSelectedTeamToJoin(null);
                    setJoinRequestNote('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.5rem'
                  }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ color: '#374151' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Select a team to join and send a join request.</p>

                {/* Team Selection */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Select Team:</label>
                  <select
                    value={selectedTeamToJoin?.id || ''}
                    onChange={(e) => {
                      const team = teams.find(t => t.id === e.target.value);
                      setSelectedTeamToJoin(team || null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="">Choose a team...</option>
                    {teams
                      .filter(team => team.status === 'active')
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.teamname} ({team.members?.length || 0} members) - {team.problem_statement?.substring(0, 50)}...
                        </option>
                      ))}
                  </select>
                </div>

                {/* Team Details Preview */}
                {selectedTeamToJoin && (
                  <div className="team-preview" style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#1f2937', fontSize: '1.125rem' }}>Team Details</h4>
                    <div className="preview-info">
                      <p style={{ margin: '0 0 0.5rem 0' }}><strong>Problem Statement:</strong> {selectedTeamToJoin.problem_statement}</p>
                      <p style={{ margin: '0 0 0.75rem 0' }}><strong>Current Members:</strong> {selectedTeamToJoin.members?.length || 0}</p>
                      <div className="member-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedTeamToJoin.members?.slice(0, 3).map((member, index) => (
                          <span key={index} className="member-tag" style={{
                            background: '#e5e7eb',
                            color: '#374151',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem'
                          }}>
                            {member.name} ({member.role})
                          </span>
                        ))}
                        {selectedTeamToJoin.members?.length > 3 && (
                          <span className="more-members" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            +{selectedTeamToJoin.members.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Join Request Message */}
                <div className="form-group">
                  <label htmlFor="joinNote" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Message (optional):</label>
                  <textarea
                    id="joinNote"
                    value={joinRequestNote}
                    onChange={(e) => setJoinRequestNote(e.target.value)}
                    placeholder="Tell the team why you want to join and what skills you bring..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
              }}>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowJoinTeamModal(false);
                    setSelectedTeamToJoin(null);
                    setJoinRequestNote('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={submitJoinRequest}
                  disabled={!selectedTeamToJoin}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: selectedTeamToJoin ? '#4f46e5' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: selectedTeamToJoin ? 'pointer' : 'not-allowed',
                    fontSize: '1rem'
                  }}
                >
                  Send Join Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest of your existing modals */}
      <AnimatePresence>
        {showTeamForm && (
          <TeamForm
            team={editingTeam}
            onClose={() => {
              setShowTeamForm(false);
              setEditingTeam(null);
            }}
            onSubmit={handleSaveTeam}
          />
        )}
        
        {showTeamDetail && selectedTeam && (
          <TeamDetailModal
            team={selectedTeam}
            onClose={() => {
              setShowTeamDetail(false);
              setSelectedTeam(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

  // Load teams from API
  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hackathonService.getAllTeams();
      if (result.success && result.data && result.data.length > 0) {
        const transformedTeams = result.data.map(transformTeamForComponent);
        setTeams(transformedTeams);
      } else {
        // Load dummy teams for demonstration if API returns no data
        setTeams(getDummyTeams());
      }
    } catch (err) {
      // Load dummy teams if API fails
      setTeams(getDummyTeams());
      console.error('Teams load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dummy teams data for demonstration
  const getDummyTeams = () => {
    return [
      {
        id: 'team-1',
        teamname: 'Tech Titans',
        name: 'Tech Titans',
        leaderUid: 'leader-1',
        problem_statement: 'Building an AI-powered waste management system for smart cities',
        teamsize: '4',
        members: [
          {
            name: 'Alice Johnson',
            email: 'alice.johnson@student.com',
            role: 'Technical Lead',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543210',
            year: '3rd',
            gender: 'female'
          },
          {
            name: 'Bob Smith',
            email: 'bob.smith@student.com',
            role: 'Developer',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543211',
            year: '3rd',
            gender: 'male'
          },
          {
            name: 'Carol Williams',
            email: 'carol.williams@student.com',
            role: 'Designer',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543212',
            year: '3rd',
            gender: 'female'
          },
          {
            name: 'David Brown',
            email: 'david.brown@student.com',
            role: 'Developer',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543213',
            year: '3rd',
            gender: 'male'
          }
        ],
        order_id: 'ORD001',
        payment_id: 'PAY001',
        status: 'active'
      },
      {
        id: 'team-2',
        teamname: 'Data Wizards',
        name: 'Data Wizards',
        leaderUid: 'leader-2',
        problem_statement: 'Creating a predictive analytics platform for agricultural optimization',
        teamsize: '3',
        members: [
          {
            name: 'Emma Davis',
            email: 'emma.davis@student.com',
            role: 'Data Scientist',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543214',
            year: '4th',
            gender: 'female'
          },
          {
            name: 'Frank Miller',
            email: 'frank.miller@student.com',
            role: 'ML Engineer',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543215',
            year: '4th',
            gender: 'male'
          },
          {
            name: 'Grace Wilson',
            email: 'grace.wilson@student.com',
            role: 'Business Analyst',
            branch: 'Computer Science',
            college: 'TKR College of Engineering',
            phonenumber: '9876543216',
            year: '4th',
            gender: 'female'
          }
        ],
        order_id: 'ORD002',
        payment_id: 'PAY002',
        status: 'active'
      }
    ];
  };

  // Transform team data from API format to component format
  const transformTeamForComponent = (team) => {
    return {
      id: team.id || `team-${team.teamname?.replace(/\s+/g, '-').toLowerCase()}`,
      teamname: team.teamname || team.name,
      name: team.teamname || team.name,
      leaderUid: team.leaderUid,
      problem_statement: team.problem_statement,
      teamsize: team.teamsize?.toString() || team.members?.length?.toString() || '1',
      members: team.members?.map(member => ({
        name: member.name,
        email: member.email,
        role: member.role,
        branch: member.branch,
        college: member.college,
        phonenumber: member.phonenumber,
        year: member.year,
        gender: member.gender
      })) || [],
      order_id: team.order_id,
      payment_id: team.payment_id,
      status: 'active' // Default status, API doesn't seem to have this field
    };
  };

  const transformTeamForService = (teamData) => {
    return {
      teamname: teamData.teamname,
      leaderUid: teamData.leaderUid,
      problem_statement: teamData.problem_statement,
      teamsize: parseInt(teamData.teamsize || teamData.members?.length || 1),
      members: teamData.members?.map(member => ({
        name: member.name,
        email: member.email,
        role: member.role,
        branch: member.branch,
        college: member.college,
        phonenumber: member.phonenumber,
        year: member.year,
        gender: member.gender
      })) || [],
      order_id: teamData.order_id,
      payment_id: teamData.payment_id
    };
  };

  // Handle team operations
const handleCreateTeam = async (teamData) => {
  try {
    const serviceData = transformTeamForService(teamData);
    const result = await hackathonService.createTeam(serviceData);
    if (result.success) {
      await loadTeams();
      setShowTeamForm(false);
      showNotification('Team created successfully');
    } else {
      throw new Error(result.message || 'Failed to create team');
    }
  } catch (err) {
    showNotification(err.message || 'Failed to create team', 'error');
    throw err;
  }
};

const handleEditTeam = async (teamData) => {
  try {
    const serviceData = transformTeamForService(teamData);
    const result = await hackathonService.updateTeam(teamData.leaderUid, serviceData);
    if (result.success) {
      await loadTeams();
      setShowTeamForm(false);
      setEditingTeam(null);
      showNotification('Team updated successfully');
    } else {
      throw new Error(result.message || 'Failed to update team');
    }
  } catch (err) {
    showNotification(err.message || 'Failed to update team', 'error');
    throw err;
  }
};

const handleDeleteTeam = async (teamId) => {
  if (!window.confirm('Are you sure you want to delete this team?')) {
    return;
  }

  try {
    const result = await hackathonService.deleteTeam(teamId);
    if (result.success) {
      await loadTeams();
      showNotification('Team deleted successfully');
    } else {
      throw new Error(result.message || 'Failed to delete team');
    }
  } catch (err) {
    showNotification(err.message || 'Failed to delete team', 'error');
  }
};

const handleViewTeam = (team) => {
  setSelectedTeam(team);
  setShowTeamDetail(true);
};

const handleEditTeamClick = (team) => {
  setEditingTeam(team);
  setShowTeamForm(true);
};  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="teams-section"
    >
      <div className="section-header-with-actions">
        <h2><GroupIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Team Management</h2>
        <div className="header-actions">
         
          <button
            onClick={() => setShowTeamForm(true)}
            className="btn-primary"
          >
            <GroupIcon fontSize="small" style={{marginRight: '4px'}} />
            Create Team
          </button>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="teams-controls-container" style={{
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Search Bar */}
        <div className="teams-search-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--background-tertiary)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: '0.75rem'
          }}>
            <SearchIcon style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }} />
            <input
              type="text"
              placeholder="Search teams by name, problem statement, or member names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              title="Clear search"
            >
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="teams-filters-container" style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div className="filter-group" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Size:</span>
            <select
              value={teamSizeFilter}
              onChange={(e) => setTeamSizeFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                minWidth: '120px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="all">All Sizes</option>
              <option value="1">1 Member</option>
              <option value="2">2 Members</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members</option>
            </select>
          </div>

          <div className="filter-group" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                minWidth: '120px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || teamSizeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTeamSizeFilter('all');
                setStatusFilter('all');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--background)',
                color: 'var(--text-secondary)',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--danger)';
                e.target.style.color = 'white';
                e.target.style.borderColor = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--background)';
                e.target.style.color = 'var(--text-secondary)';
                e.target.style.borderColor = 'var(--border)';
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Team Form - Above Teams Information */}
      <AnimatePresence mode="wait">
        {showTeamForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              marginTop: 24,
              transition: {
                opacity: { duration: 0.3, ease: "easeOut" },
                height: { duration: 0.4, ease: "easeInOut" },
                marginTop: { duration: 0.3, delay: 0.1, ease: "easeOut" }
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              transition: {
                opacity: { duration: 0.2 },
                height: { duration: 0.3, ease: "easeInOut" },
                marginTop: { duration: 0.2 }
              }
            }}
            className="team-form-container"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, delay: 0.2, ease: "easeOut" }
              }}
              exit={{
                opacity: 0,
                y: -10,
                transition: { duration: 0.2 }
              }}
              className="team-form-wrapper"
            >
              <TeamForm
                team={editingTeam}
                onSubmit={editingTeam ? handleEditTeam : handleCreateTeam}
                onCancel={() => {
                  setShowTeamForm(false);
                  setEditingTeam(null);
                }}
                isEditing={!!editingTeam}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeamTable
        teams={teams.filter(team => {
          // Search filter
          if (searchQuery) {
            const searchQueryLower = searchQuery.toLowerCase();
            const matchesSearch =
              team.teamname?.toLowerCase().includes(searchQueryLower) ||
              team.problem_statement?.toLowerCase().includes(searchQueryLower) ||
              team.members?.some(member =>
                member.name?.toLowerCase().includes(searchQueryLower) ||
                member.email?.toLowerCase().includes(searchQueryLower)
              );
            if (!matchesSearch) return false;
          }

          // Team size filter
          if (teamSizeFilter !== 'all') {
            const teamSize = typeof team.teamsize === 'string' ? parseInt(team.teamsize) : team.teamsize || 0;
            if (teamSize !== parseInt(teamSizeFilter)) return false;
          }

          // Status filter
          if (statusFilter !== 'all') {
            if (statusFilter === 'active' && team.status !== 'active') return false;
            if (statusFilter === 'inactive' && team.status !== 'inactive') return false;
          }

          return true;
        })}
        onEdit={handleEditTeamClick}
        onDelete={handleDeleteTeam}
        onView={handleViewTeam}
        loading={loading}
        error={error}
      />

      {/* Team Detail Modal */}
      <AnimatePresence>
        {showTeamDetail && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="modal-overlay"
            onClick={() => {
              setShowTeamDetail(false);
              setSelectedTeam(null);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                opacity: { duration: 0.2 }
              }}
              className="modal-content team-detail-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0',
                maxWidth: 'min(95vw, 1200px)',
                width: '100%',
                maxHeight: 'none',
                overflow: 'visible',
                boxShadow: 'none',
                position: 'static'
              }}
            >
              <TeamDetailModal
                team={selectedTeam}
                isOpen={showTeamDetail}
                onClose={() => {
                  setShowTeamDetail(false);
                  setSelectedTeam(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Registration Detail Modal Component
const RegistrationDetailModal = ({ registration, onClose, onStatusUpdate, onGenerateCertificate, onSendEmail }) => {
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [selectedEmailType, setSelectedEmailType] = useState('confirmation');
  
  const personalInfo = registration.personal_info || {};
  const teamInfo = registration.team_info || {};
  const skills = registration.skills || {};
  const paymentInfo = registration.payment_info || {};
  const status = registration.registration_status || registration.status || 'pending';
  const frontendStatus = status === 'pending_payment' ? 'pending' : status;

  const emailTypes = [
    { value: 'confirmation', label: <><CheckCircleIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Confirmation Email</>, description: 'Send registration confirmation' },
    { value: 'reminder', label: <><ScheduleIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Reminder Email</>, description: 'Send payment or event reminder' },
    { value: 'announcement', label: <><AnnouncementIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Announcement</>, description: 'Send important announcement' },
    { value: 'test', label: <><TestIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Test Email</>, description: 'Test email functionality' }
  ];

  const handleSendCustomEmail = () => {
    if (onSendEmail) {
      onSendEmail(registration.registration_id || registration.registrationId, selectedEmailType, customEmailMessage);
      setCustomEmailMessage('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="registration-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Registration Details</h2>
          <button onClick={onClose} className="close-btn"><CloseIcon /></button>
        </div>
        
        <div className="modal-content">
          <div className="detail-section">
            <h3>📋 Basic Information</h3>
            <div className="detail-grid">
              <div><strong>Registration ID:</strong> {registration.registrationId}</div>
              <div><strong>Name:</strong> {personalInfo.fullName || registration.fullName || 'N/A'}</div>
              <div><strong>Email:</strong> {personalInfo.email || registration.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {personalInfo.phone || registration.phone || 'N/A'}</div>
              <div><strong>College:</strong> {personalInfo.college || registration.college || 'N/A'}</div>
              <div><strong>Department:</strong> {personalInfo.department || registration.department || 'N/A'}</div>
              <div><strong>Year:</strong> {personalInfo.year || registration.year || 'N/A'}</div>
            </div>
          </div>

          {(teamInfo.teamName || registration.teamName) && (
            <div className="detail-section">
              <h3>👥 Team Information</h3>
              <div className="detail-grid">
                <div><strong>Team Name:</strong> {teamInfo.teamName || registration.teamName}</div>
                <div><strong>Team Size:</strong> {teamInfo.teamSize || registration.teamSize || 1}</div>
                {(teamInfo.teamMembers || registration.team_members) && (
                  <div className="team-members">
                    <strong>Team Members:</strong>
                    <ul>
                      {(teamInfo.teamMembers || registration.team_members).map((member, index) => (
                        <li key={index}>
                          {member.name || member.fullName} ({member.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>💻 Technical Information</h3>
            <div className="detail-grid">
              <div><strong>Problem Statement:</strong> {registration.problemStatement || 'N/A'}</div>
              <div><strong>Programming Languages:</strong> {
                (skills.programmingLanguages || registration.programmingLanguages || []).join(', ') || 'N/A'
              }</div>
              <div><strong>AI Experience:</strong> {skills.aiExperience || registration.aiExperience || 'N/A'}</div>
              <div><strong>Previous Hackathons:</strong> {skills.previousHackathons || registration.previousHackathons || 'N/A'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>� Payment Information</h3>
            <div className="detail-grid">
              <div><strong>Amount:</strong> ₹{paymentInfo.amount || registration.amount || 'N/A'}</div>
                            <div><strong>Payment Status:</strong> {paymentInfo.status || registration.paymentStatus || 'pending'}</div>
              <div><strong>Payment ID:</strong> {paymentInfo.razorpay_payment_id || registration.payment_id || 'N/A'}</div>
              <div><strong>Order ID:</strong> {paymentInfo.razorpay_order_id || registration.order_id || 'N/A'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>�📊 Status & Actions</h3>
            <div className="status-actions">
              <div className="current-status">
                <strong>Current Status:</strong>
                <span className={`status-badge ${frontendStatus}`}>
                  {frontendStatus}
                </span>
              </div>
              <div className="status-update">
                <strong>Update Status:</strong>
                <select
                  value={frontendStatus}
                  onChange={(e) => onStatusUpdate(registration.registrationId, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            
            {registration.admin_notes && (
              <div className="admin-notes">
                <strong>Admin Notes:</strong>
                <p>{registration.admin_notes}</p>
              </div>
            )}

            {/* Utilities Section */}
            <div className="detail-section">
              <h3>🛠️ Utilities & Actions</h3>
              
              {/* Quick Action Buttons */}
              <div className="utility-actions">
                <button 
                  onClick={() => onGenerateCertificate && onGenerateCertificate(registration.registration_id || registration.registrationId, 'participation')}
                  className="btn-utility"
                >
                  <CertificateIcon fontSize="small" style={{marginRight: '4px'}} /> Generate Certificate
                </button>
                <button 
                  onClick={() => onSendEmail && onSendEmail(registration.registration_id || registration.registrationId, 'confirmation')}
                  className="btn-utility"
                >
                  <EmailIcon fontSize="small" style={{marginRight: '4px'}} /> Quick Confirmation
                </button>
                <button 
                  onClick={() => onSendEmail && onSendEmail(registration.registration_id || registration.registrationId, 'reminder')}
                  className="btn-utility"
                >
                  <ScheduleIcon fontSize="small" style={{marginRight: '4px'}} /> Quick Reminder
                </button>
                <button 
                  onClick={() => onSendEmail && onSendEmail(registration.registration_id || registration.registrationId, 'test')}
                  className="btn-utility test"
                >
                  <TestIcon fontSize="small" style={{marginRight: '4px'}} /> Test Email
                </button>
              </div>

              {/* Custom Email Section */}
              <div className="custom-email-section">
                <h4><EmailIcon fontSize="small" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Send Custom Email</h4>
                <div className="email-compose-form">
                  <div className="email-type-selector">
                    <label>Email Type:</label>
                    <select 
                      value={selectedEmailType} 
                      onChange={(e) => setSelectedEmailType(e.target.value)}
                      className="email-type-select"
                    >
                      {emailTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <span className="email-type-description">
                      {emailTypes.find(t => t.value === selectedEmailType)?.description}
                    </span>
                  </div>
                  
                  <div className="custom-message-field">
                    <label>Custom Message (Optional):</label>
                    <textarea
                      value={customEmailMessage}
                      onChange={(e) => setCustomEmailMessage(e.target.value)}
                      placeholder="Add any custom message here... (Leave empty to use default template)"
                      rows={3}
                      className="custom-message-input"
                    />
                  </div>
                  
                  <button 
                    onClick={handleSendCustomEmail}
                    className="btn-send-custom-email"
                  >
                    <EmailIcon fontSize="small" style={{marginRight: '4px'}} /> Send Custom Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Payments Section Component
const PaymentsSection = ({ registrations }) => {
  const paymentStats = registrations.reduce((acc, reg) => {
    const status = reg.paymentStatus || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    if (status === 'completed') {
      acc.revenue = (acc.revenue || 0) + (reg.amount || 0);
    }
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="payments-section"
    >
      <h2><PaymentIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Payment Management</h2>
      
      <div className="payment-stats">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{(paymentStats.revenue || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Payments</h3>
          <p>{paymentStats.completed || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p>{paymentStats.pending || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Failed Payments</h3>
          <p>{paymentStats.failed || 0}</p>
        </div>
      </div>

      <div className="payments-table">
        <h3>Recent Payments</h3>
        {/* Payment details table would go here */}
        <p>Payment transaction details and management features</p>
      </div>
    </motion.div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({
  activeTab,
  setActiveTab,
  registrations,
  stats,
  filters,
  handleFilterSelect,
  teams = []
}) => {
  const [activeInsightFilters, setActiveInsightFilters] = useState({
    gender: false,
    yearWise: false,
    teamIndividual: false,
    timeline: false
  });

  // Toggle function for insight filters
  const toggleInsightFilter = (filterId) => {
    setActiveInsightFilters(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [filterId]: !prev[filterId]
    }));
  };

  // Calculate department statistics
  const [userAnalyticsFilters, setUserAnalyticsFilters] = useState({
    department: true,
    college: true,
    gender: false,
    year: false,
    team: false,
    timeline: false
  });
  const getDepartmentStats = () => {
    const deptStats = {};
    registrations.forEach(reg => {
      const dept = reg.personal_info?.department || reg.department || 'Not Specified';
      const college = reg.personal_info?.college || reg.college || 'Unknown College';

      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, colleges: {} };
      }
      deptStats[dept].total++;

      if (!deptStats[dept].colleges[college]) {
        deptStats[dept].colleges[college] = 0;
      }
      deptStats[dept].colleges[college]++;
    });
    return deptStats;
  };

  // Calculate college-wise department breakdown
  const getCollegeDepartmentStats = () => {
    const collegeStats = {};
    registrations.forEach(reg => {
      const college = reg.personal_info?.college || reg.college || 'Unknown College';
      const dept = reg.personal_info?.department || reg.department || 'Not Specified';
      const teamSize = reg.team_info?.teamSize || reg.teamSize || 1;
      const status = reg.registration_status || reg.status || 'pending';

      if (!collegeStats[college]) {
        collegeStats[college] = {
          total: 0,
          departments: {},
          individuals: 0,
          teams: 0,
          confirmed: 0,
          pending: 0
        };
      }

      collegeStats[college].total++;
      collegeStats[college][teamSize === 1 ? 'individuals' : 'teams']++;
      collegeStats[college][status === 'confirmed' ? 'confirmed' : 'pending']++;

      if (!collegeStats[college].departments[dept]) {
        collegeStats[college].departments[dept] = 0;
      }
      collegeStats[college].departments[dept]++;
    });
    return collegeStats;
  };

  // Calculate year-wise statistics
  const getYearWiseStats = () => {
    const yearStats = {};
    registrations.forEach(reg => {
      const year = reg.personal_info?.year || reg.year || 'Not Specified';
      const dept = reg.personal_info?.department || reg.department || 'Not Specified';

      if (!yearStats[year]) {
        yearStats[year] = { total: 0, departments: {} };
      }
      yearStats[year].total++;

      if (!yearStats[year].departments[dept]) {
        yearStats[year].departments[dept] = 0;
      }
      yearStats[year].departments[dept]++;
    });
    return yearStats;
  };

  // Calculate gender distribution
  const getGenderStats = () => {
    const genderStats = {};
    registrations.forEach(reg => {
      const gender = reg.personal_info?.gender || reg.gender || 'Not Specified';
      const dept = reg.personal_info?.department || reg.department || 'Not Specified';

      if (!genderStats[gender]) {
        genderStats[gender] = { total: 0, departments: {} };
      }
      genderStats[gender].total++;

      if (!genderStats[gender].departments[dept]) {
        genderStats[gender].departments[dept] = 0;
      }
      genderStats[gender].departments[dept]++;
    });
    return genderStats;
  };

  // Calculate registration timeline
  const getTimelineStats = () => {
    const timeline = {};
    registrations.forEach(reg => {
      const date = new Date(reg.created_at || reg.createdAt || Date.now()).toDateString();
      if (!timeline[date]) {
        timeline[date] = 0;
      }
      timeline[date]++;
    });
    return timeline;
  };

  // Get top performing departments
  const getTopDepartments = (limit = 5) => {
    const deptStats = getDepartmentStats();
    return Object.entries(deptStats)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, limit);
  };

  const departmentStats = getDepartmentStats();
  const collegeDepartmentStats = getCollegeDepartmentStats();
  const yearWiseStats = getYearWiseStats();
  const genderStats = getGenderStats();
  const timelineStats = getTimelineStats();
  const topDepartments = getTopDepartments();

  // State for additional insights filters
  const [insightFilters, setInsightFilters] = useState({
    yearWise: true,
    gender: true,
    timeline: true,
    teamIndividual: true
  });

  // State for sub-filters
  const [activeSubFilters, setActiveSubFilters] = useState({
    yearWise: { '1st Year': false, '2nd Year': false, '3rd Year': false, '4th Year': false },
    gender: { 'Male': false, 'Female': false, 'Other': false },
    timeline: { 'Today': false, 'This Week': false, 'This Month': false },
    teamIndividual: { 'Team': false, 'Individual': false }
  });

  const toggleSubFilter = (category, subFilter) => {
    setActiveSubFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subFilter]: !prev[category][subFilter]
      }
    }));
  };

  const clearAllInsightFilters = () => {
    setActiveInsightFilters({
      yearWise: false,
      gender: false,
      timeline: false,
      teamIndividual: false
    });
  };

  const clearSubFilters = (category) => {
    setActiveSubFilters(prev => ({
      ...prev,
      [category]: Object.keys(prev[category]).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    }));
  };

  const hasActiveFilters = Object.values(insightFilters).some(Boolean);
  const activeFilterCount = Object.values(insightFilters).filter(Boolean).length;

  // Check if any sub-filters are active for a category
  const hasActiveSubFilters = (category) => {
    return Object.values(activeSubFilters[category]).some(Boolean);
  };

  const activeSubFilterCount = (category) => {
    return Object.values(activeSubFilters[category]).filter(Boolean).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-section"
    >
      {/* Advanced Analytics & Insights Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1.5rem',
        background: 'var(--background)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary)30'
          }}>
            <TrendingUpIcon style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2
            }}>
              Advanced Analytics & Insights
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.3
            }}>
              Comprehensive data analysis and insights for hackathon management
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'var(--background-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--primary)';
            e.target.style.color = 'white';
            e.target.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--background-tertiary)';
            e.target.style.color = 'var(--text-primary)';
            e.target.style.borderColor = 'var(--border)';
          }}
        >
          <RefreshIcon fontSize="small" />
          Refresh Data
        </button>
      </div>
{/* Stats Cards Section */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem'
}}>
  {[
    {
      icon: <GroupIcon style={{ color: 'white' }} />,
      label: 'Total Participants',
      value: registrations.length,
      
      borderColor: 'var(--primary)'
    },
    {
      icon: <EmojiEventsIcon style={{ color: 'white' }} />,
      label: 'Active Hackathons',
      value: stats.activeHackathons || 1, // Fallback to 3 if not available
      
      borderColor: 'var(--primary)'
    },
    {
      icon: <GroupsIcon style={{ color: 'white' }} />,
      label: 'Total Teams',
      value: teams.length,
     
       borderColor: 'var(--primary)'
    },
    {
      icon: <AssignmentIcon style={{ color: 'white' }} />,
      label: 'Projects Submitted',
      value: stats.projectsSubmitted || Math.floor(registrations.length * 0.8), // Estimate if not available
     
      borderColor: 'var(--primary)'
    }
  ].map((stat, index) => (
    <div
      key={stat.label}
      style={{
        padding: '1.25rem',
        background: stat.bgColor,
        borderRadius: '12px',
        border: `1px solid ${stat.borderColor}`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: 'white',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {stat.icon}
        </div>
        <div>
          <div style={{
            fontSize: '0.85rem',
            opacity: 0.9,
            marginBottom: '0.25rem'
          }}>
            {stat.label}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            {stat.value}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
     {/* Insight Filters Section */}
<div style={{
  marginBottom: '2rem',
  padding: '1.5rem',
  background: 'var(--background-tertiary)',
  borderRadius: '12px',
  border: '1px solid var(--border)'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  }}>
    <FilterListIcon style={{ color: 'var(--primary)', fontSize: '1.3rem' }} />
    <h3 style={{
      margin: 0,
      fontSize: '1.2rem',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }}>
      Insight Filters
    </h3>
  </div>

  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem'
  }}>
    {[
      { 
        id: 'gender', 
        icon: <PersonIcon />, 
        label: 'Gender',
        options: ['All', 'Male', 'Female', 'Other']
      },
      { 
        id: 'yearWise', 
        icon: <ScheduleIcon />, 
        label: 'Year',
        options: ['All', '1st Year', '2nd Year', '3rd Year', '4th Year']
      },
      { 
        id: 'teamIndividual', 
        icon: <GroupIcon />, 
        label: 'Team Type',
        options: ['All', 'Team', 'Individual']
      },
      { 
        id: 'timeline', 
        icon: <TrendingUpIcon />, 
        label: 'Timeline',
        options: ['All Time', 'This Month', 'This Week', 'Today']
      }
    ].map(({ id, icon, label, options }) => (
      <div key={id} style={{ position: 'relative' }}>
        <button
          onClick={() => toggleInsightFilter(id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: `1px solid ${activeInsightFilters[id] ? 'var(--primary)' : 'var(--border)'}`,
            background: activeInsightFilters[id] ? 'var(--primary)' : 'var(--background)',
            color: activeInsightFilters[id] ? 'white' : 'var(--text-primary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            minWidth: 'fit-content'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          {label}
          {activeInsightFilters[id] && (
            <span style={{ 
              marginLeft: '0.5rem',
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px'
            }}>
              {filters[id] || options[0]}
            </span>
          )}
        </button>
        
        {/* Dropdown Menu */}
        {activeInsightFilters[id] && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            background: 'var(--background)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)',
            marginTop: '0.5rem',
            minWidth: '180px',
            overflow: 'hidden'
          }}>
            {options.map((option) => (
              <div
                key={option}
                onClick={() => handleFilterSelect(id, option)}
                style={{
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: filters[id] === option ? 'var(--primary-light)' : 'transparent',
                  color: filters[id] === option ? 'var(--primary)' : 'var(--text-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--background-hover)'
                  }
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>

      {/* Department Analytics */}
      <div className="analytics-section-group">
        <h3><SchoolIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Department-wise Analysis</h3>
        <div className="analytics-grid">
          <div className="analytics-card large">
            <div className="card-header">
              <h4><AssessmentIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Department Participation Overview</h4>
              <InfoIcon className="card-info-icon" title="Department-wise participant distribution" />
            </div>
            <div className="department-stats">
              {Object.entries(departmentStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([dept, data]) => (
                  <div key={dept} className="dept-stat-row">
                    <div className="dept-info">
                      <div className="dept-name">{dept}</div>
                      <div className="dept-count">{data.total} participants</div>
                    </div>
                    <div className="dept-bar">
                      <div
                        className="dept-bar-fill"
                        style={{width: `${(data.total / registrations.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h4><EmojiEventsIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Top 5 Departments</h4>
              <InfoIcon className="card-info-icon" title="Highest participating departments" />
            </div>
            <div className="top-departments">
              {topDepartments.map(([dept, data], index) => (
                <div key={dept} className="top-dept-item">
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="dept-info">
                    <span className="dept-name">{dept}</span>
                    <span className="dept-count">{data.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h4><PieChartIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Department Distribution</h4>
              <InfoIcon className="card-info-icon" title="Percentage distribution by department" />
            </div>
            <div className="dept-distribution">
              {Object.entries(departmentStats).map(([dept, data]) => {
                const percentage = ((data.total / registrations.length) * 100).toFixed(1);
                return (
                  <div key={dept} className="dept-percentage">
                    <span className="dept-name">{dept.length > 15 ? dept.substring(0, 15) + '...' : dept}</span>
                    <div className="percentage-container">
                      <span className="percentage">{percentage}%</span>
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{width: `${percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* College-wise Department Analysis */}
      <div className="analytics-section-group">
        <h3><BusinessIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> College-wise Department Breakdown</h3>
        <div className="analytics-grid">
          {Object.entries(collegeDepartmentStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .map(([college, data]) => (
              <div key={college} className="analytics-card college-card">
                <div className="card-header">
                  <h4>{college.length > 30 ? college.substring(0, 30) + '...' : college}</h4>
                  <InfoIcon className="card-info-icon" title="College-specific department analysis" />
                </div>
                <div className="college-summary">
                  <div className="summary-stat">
                    <span className="stat-label">Total Participants</span>
                    <span className="stat-value">{data.total}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Confirmed</span>
                    <span className="stat-value confirmed">{data.confirmed}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value pending">{data.pending}</span>
                  </div>
                </div>
                <div className="college-departments">
                  <div className="college-dept-header">Top Departments:</div>
                  {Object.entries(data.departments)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([dept, count]) => (
                      <div key={dept} className="college-dept-row">
                        <span className="dept-name">{dept.length > 20 ? dept.substring(0, 20) + '...' : dept}</span>
                        <span className="dept-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Enhanced Analytics Section */}
      <motion.div
        className="analytics-section-group"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 8px 32px var(--shadow)',
          marginBottom: '2.5rem',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
       
     
       

       

        {/* Analytics Tabs Section */}
        <motion.div
          className="analytics-tabs-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          style={{
            backgroundColor: 'var(--background)',
            borderRadius: '12px',
            marginTop: '2rem',
            boxShadow: '0 2px 8px var(--shadow)',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}
        >
          {/* Tab Navigation */}
          <div className="analytics-tabs-nav" style={{
            display: 'flex',
            backgroundColor: 'var(--background-secondary)',
            borderBottom: '1px solid var(--border)',marginBottom: '1.5rem',
  borderRadius: '8px'
          }}>
            {[
              { id: 'user', label: 'User Analytics', icon: <PersonIcon /> },
              { id: 'hackathon', label: 'Hackathon Analytics', icon: <EmojiEventsIcon /> },
              { id: 'revenue', label: 'Revenue Analytics', icon: <TrendingUpIcon /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-hover)' : '3px solid transparent'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="analytics-tabs-content" style={{
            padding: '1.5rem'
          }}>
            {/* User Analytics Tab */}
            {activeTab === 'user' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="user-analytics-tab"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PersonIcon style={{ fontSize: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    User Analytics
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {[
                    {
                      icon: <PersonIcon />,
                      label: 'Total Users',
                      value: registrations.length,
                      bgColor: 'var(--background)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <CheckCircleIcon />,
                      label: 'Verified Users',
                      value: registrations.filter(r => r.status === 'confirmed').length,
                      bgColor: 'var(--background-secondary)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <ScheduleIcon />,
                      label: 'Pending Users',
                      value: registrations.filter(r => r.status === 'pending').length,
                      bgColor: 'var(--background-tertiary)',
                      borderColor: 'var(--border)'
                    }
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: '1rem',
                        backgroundColor: stat.bgColor,
                        borderRadius: '8px',
                        border: `1px solid ${stat.borderColor}`,
                        boxShadow: '0 1px 3px var(--shadow)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(stat.icon, {
                            style: { fontSize: '16px', color: 'white' }
                          })}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            {stat.label}
                          </div>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}>
                    User Registration Trends
                  </h4>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    Track user registration patterns, verification rates, and engagement metrics over time.
                    Monitor conversion rates from registration to verification.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Hackathon Analytics Tab */}
            {activeTab === 'hackathon' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="hackathon-analytics-tab"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EmojiEventsIcon style={{ fontSize: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    Hackathon Analytics
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {[
                    {
                      icon: <EmojiEventsIcon />,
                      label: 'Active Hackathons',
                      value: '1',
                      bgColor: 'var(--background)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <GroupIcon />,
                      label: 'Total Teams',
                      value: teams.length,
                      bgColor: 'var(--background-secondary)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <SchoolIcon />,
                      label: 'Departments',
                      value: Object.keys(departmentStats).length,
                      bgColor: 'var(--background-tertiary)',
                      borderColor: 'var(--border)'
                    }
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: '1rem',
                        backgroundColor: stat.bgColor,
                        borderRadius: '8px',
                        border: `1px solid ${stat.borderColor}`,
                        boxShadow: '0 1px 3px var(--shadow)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(stat.icon, {
                            style: { fontSize: '16px', color: 'white' }
                          })}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            {stat.label}
                          </div>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}>
                    Hackathon Performance
                  </h4>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    Monitor hackathon participation, team formations, department-wise engagement,
                    and overall event success metrics.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Revenue Analytics Tab */}
            {activeTab === 'revenue' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="revenue-analytics-tab"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUpIcon style={{ fontSize: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    Revenue Analytics
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {[
                    {
                      icon: <PaymentIcon />,
                      label: 'Total Revenue',
                      value: (() => {
                        // Calculate actual revenue from confirmed registrations
                        const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed');
                        const totalRevenue = confirmedRegistrations.reduce((sum, reg) => {
                          const teamSize = reg.team_info?.teamSize || reg.teamSize || 1;
                          return sum + (teamSize === 1 ? 250 : teamSize === 2 ? 500 : teamSize === 3 ? 750 : teamSize === 4 ? 1000 : 0);
                        }, 0);
                        return `₹${totalRevenue.toLocaleString()}`;
                      })(),
                      bgColor: 'var(--background)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <CheckCircleIcon />,
                      label: 'Paid Users',
                      value: registrations.filter(r => r.status === 'confirmed').length,
                      bgColor: 'var(--background-secondary)',
                      borderColor: 'var(--border)'
                    },
                    {
                      icon: <PendingIcon />,
                      label: 'Pending Payments',
                      value: registrations.filter(r => r.status === 'pending').length,
                      bgColor: 'var(--background-tertiary)',
                      borderColor: 'var(--border)'
                    }
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: '1rem',
                        backgroundColor: stat.bgColor,
                        borderRadius: '8px',
                        border: `1px solid ${stat.borderColor}`,
                        boxShadow: '0 1px 3px var(--shadow)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(stat.icon, {
                            style: { fontSize: '16px', color: 'white' }
                          })}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            {stat.label}
                          </div>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}>
                    Revenue Insights
                  </h4>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    Track payment collection, conversion rates, and revenue trends.
                    Monitor payment pending users and overall financial performance.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Additional CSS for custom email functionality
const additionalStyles = `
  .btn-utility.test {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .custom-email-section {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
  }

  .custom-email-section h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 14px;
  }

  .email-compose-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .email-type-selector {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .email-type-selector label {
    font-weight: 600;
    font-size: 12px;
    color: #555;
  }

  .email-type-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  .email-type-description {
    font-size: 11px;
    color: #666;
    font-style: italic;
  }

  .custom-message-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .custom-message-field label {
    font-weight: 600;
    font-size: 12px;
    color: #555;
  }

  .custom-message-input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    font-family: inherit;
  }

  .btn-send-custom-email {
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    align-self: flex-start;
  }

  .btn-send-custom-email:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

export default HackathonAdmin;
