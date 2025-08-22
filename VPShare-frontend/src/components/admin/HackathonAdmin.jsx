import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hackathonService from '../../services/hackathonService';
import './HackathonAdmin.css';

// Material-UI Icons
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Payment as PaymentIcon,
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
  EmojiEvents as CertificateIcon,
  Send as SendIcon,
  Keyboard as KeyboardIcon,
  Announcement as AnnouncementIcon,
  Schedule as ScheduleIcon,
  BugReport as TestIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const HackathonAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    teamSize: 'all',
    search: '',
    dateRange: 'all',
    college: 'all'
  });

  // Bulk operations state
  const [selectedRegistrations, setSelectedRegistrations] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

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
      
      const [registrationsResult, statsResult] = await Promise.all([
        hackathonService.getAllRegistrations(1000), // Load more registrations to handle growth
        hackathonService.getRegistrationStats()
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
      }

      if (statsResult.success) {
        // Handle the nested data structure from Lambda
        const statsData = statsResult.data.data || statsResult.data;
        console.log('Stats data:', statsData);
        setStats(prev => ({ ...prev, ...statsData }));
      } else {
        console.error('Failed to load stats:', statsResult.message);
        showNotification(`Failed to load statistics: ${statsResult.message}`, 'error');
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard data load error:', error);
      showNotification('Failed to load dashboard data', 'error');
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

  // Export functionality
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      showNotification(`📊 Exporting data as ${format.toUpperCase()}...`, 'info');
      
      const filterParams = {
        status: filters.status !== 'all' ? filters.status : undefined,
        teamSize: filters.teamSize !== 'all' ? filters.teamSize : undefined,
        college: filters.college !== 'all' ? filters.college : undefined
      };
      
      const result = await hackathonService.exportRegistrations(format, filterParams);
      
      if (result.success) {
        showNotification(`✅ ${result.message}`, 'success');
      } else {
        showNotification(`❌ Export failed: ${result.message}`, 'error');
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

    const headers = [
      'Registration ID', 'Full Name', 'Email', 'Phone', 'College', 'Department', 
      'Year', 'Team Name', 'Team Size', 'Problem Statement', 'Programming Languages',
      'AI Experience', 'Previous Hackathons', 'Status', 'Payment Status', 'Registration Date'
    ];

    const csvRows = [headers.join(',')];

    data.forEach(reg => {
      const row = [
        reg.registrationId || '',
        reg.fullName || '',
        reg.email || '',
        reg.phone || '',
        reg.college || '',
        reg.department || '',
        reg.year || '',
        reg.teamName || 'Individual',
        reg.teamSize || 1,
        reg.problemStatement || '',
        (reg.programmingLanguages || []).join('; '),
        reg.aiExperience || '',
        reg.previousHackathons || '',
        reg.status || 'pending',
        reg.paymentStatus || 'pending',
        reg.createdAt || reg.registrationDate || ''
      ].map(field => `"${field}"`);
      
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
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
        reg.teamName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  // Load data on component mount and set up auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadDashboardData(false); // Silent refresh
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, loadDashboardData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + R: Manual refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadDashboardData(true);
      }
      // Ctrl/Cmd + E: Export CSV
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        if (!isExporting) {
          handleExport('csv');
        }
      }
      // Ctrl/Cmd + Space: Toggle auto-refresh
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        setAutoRefresh(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadDashboardData, isExporting, handleExport]);

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'registrations', name: 'Registrations', icon: <GroupIcon /> },
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
            <span className={`auto-refresh-indicator ${autoRefresh ? 'active' : ''}`}>
              {autoRefresh ? <><RefreshIcon fontSize="small" /> Auto-refresh ON</> : <><PauseIcon fontSize="small" /> Auto-refresh OFF</>}
            </span>
            <div className="keyboard-shortcuts" title="Keyboard Shortcuts: Ctrl+R (Refresh), Ctrl+E (Export), Ctrl+Space (Toggle Auto-refresh)">
              <KeyboardIcon fontSize="small" style={{marginRight: '4px'}} /> Shortcuts
            </div>
          </div>
        </div>
        <div className="admin-actions">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
          >
            {autoRefresh ? <><PauseIcon fontSize="small" style={{marginRight: '4px'}} /> Pause Auto-refresh</> : <><PlayIcon fontSize="small" style={{marginRight: '4px'}} /> Enable Auto-refresh</>}
          </button>
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
          <DashboardSection stats={stats} registrations={registrations} />
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
          />
        )}

        {activeSection === 'payments' && (
          <PaymentsSection registrations={filteredRegistrations} />
        )}

        {activeSection === 'analytics' && (
          <AnalyticsSection registrations={registrations} stats={stats} />
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
const DashboardSection = ({ stats, registrations = [] }) => (
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
          <h3>{stats.total_registrations || 0}</h3>
          <p>Total Registrations</p>
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
    </div>

    <div className="dashboard-charts">
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
  setSelectedRegistrations 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="registrations-section"
  >
    <div className="section-header-with-actions">
      <h2><GroupIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Registration Management</h2>
      <div className="export-actions">
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
        placeholder="Search by name, email, or registration ID..."
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
    <div className="registrations-table">
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
            className={`table-row ${selectedRegistrations.has(registration.registrationId) ? 'selected' : ''}`}
          >
            <div className="select-column" data-label="Select">
              <input
                type="checkbox"
                checked={selectedRegistrations.has(registration.registrationId)}
                onChange={(e) => {
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
const AnalyticsSection = ({ registrations, stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="analytics-section"
  >
    <h2><TrendingUpIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Analytics & Insights</h2>
    
    <div className="analytics-grid">
      <div className="analytics-card">
        <h3>Registration Timeline</h3>
        <p>Track registration growth over time</p>
        {/* Chart component would go here */}
      </div>
      
      <div className="analytics-card">
        <h3>Geographic Distribution</h3>
        <p>Where participants are coming from</p>
        {/* Map or chart component */}
      </div>
      
      <div className="analytics-card">
        <h3>College Participation</h3>
        <p>Top participating institutions</p>
        {/* List or chart of colleges */}
      </div>
      
      <div className="analytics-card">
        <h3>Technology Preferences</h3>
        <p>Popular programming languages and tools</p>
        {/* Technology usage statistics */}
      </div>
    </div>
  </motion.div>
);

// Communications Section Component
const CommunicationsSection = ({ registrations }) => (
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
          <select className="recipient-select">
            <option value="all">All Participants</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Payment</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Email Subject"
            className="email-subject"
          />
          
          <textarea 
            placeholder="Email Message"
            className="email-message"
            rows="8"
          />
          
          <button className="send-email-btn"><EmailIcon fontSize="small" style={{marginRight: '4px'}} /> Send Email</button>
        </div>
      </div>
      
      <div className="message-templates">
        <h3>Message Templates</h3>
        <div className="template-list">
          <button className="template-btn">Welcome Message</button>
          <button className="template-btn">Payment Reminder</button>
          <button className="template-btn">Event Updates</button>
          <button className="template-btn">Certificate Ready</button>
        </div>
      </div>
    </div>
  </motion.div>
);

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
