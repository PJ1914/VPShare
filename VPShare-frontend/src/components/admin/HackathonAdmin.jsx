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
  Person as PersonIcon,
  EmojiEvents as CertificateIcon,
  Send as SendIcon,
  Keyboard as KeyboardIcon,
  Announcement as AnnouncementIcon,
  Schedule as ScheduleIcon,
  BugReport as TestIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Summarize as SummaryIcon
} from '@mui/icons-material';

const HackathonAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    teamSize: 'all',
    search: '',
    dateRange: 'all',
    college: 'all',
    department: 'all'
  });

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
const AnalyticsSection = ({ registrations, stats }) => {
  // Calculate department statistics
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-section"
    >
      <h2><TrendingUpIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Advanced Analytics & Insights</h2>
      
      {/* Department Analytics */}
      <div className="analytics-section-group">
        <h3><SchoolIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Department-wise Analysis</h3>
        <div className="analytics-grid">
          <div className="analytics-card large">
            <h4>Department Participation Overview</h4>
            <div className="department-stats">
              {Object.entries(departmentStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([dept, data]) => (
                  <div key={dept} className="dept-stat-row">
                    <div className="dept-name">{dept}</div>
                    <div className="dept-count">{data.total} participants</div>
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
            <h4>Top 5 Departments</h4>
            <div className="top-departments">
              {topDepartments.map(([dept, data], index) => (
                <div key={dept} className="top-dept-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="dept-name">{dept}</span>
                  <span className="dept-count">{data.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>Department Distribution</h4>
            <div className="dept-distribution">
              {Object.entries(departmentStats).map(([dept, data]) => {
                const percentage = ((data.total / registrations.length) * 100).toFixed(1);
                return (
                  <div key={dept} className="dept-percentage">
                    <span className="dept-name">{dept.length > 15 ? dept.substring(0, 15) + '...' : dept}</span>
                    <span className="percentage">{percentage}%</span>
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
                <h4>{college.length > 30 ? college.substring(0, 30) + '...' : college}</h4>
                <div className="college-summary">
                  <div className="summary-stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{data.total}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Confirmed:</span>
                    <span className="stat-value confirmed">{data.confirmed}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Pending:</span>
                    <span className="stat-value pending">{data.pending}</span>
                  </div>
                </div>
                <div className="college-departments">
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

      {/* Additional Analytics */}
      <div className="analytics-section-group">
        <h3><AnalyticsIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Additional Insights</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Year-wise Distribution</h4>
            <div className="year-stats">
              {Object.entries(yearWiseStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([year, data]) => (
                  <div key={year} className="year-stat-row">
                    <span className="year-label">{year}</span>
                    <span className="year-count">{data.total}</span>
                    <div className="year-depts">
                      {Object.entries(data.departments)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([dept, count]) => (
                          <span key={dept} className="dept-tag">{dept}: {count}</span>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>Gender Distribution</h4>
            <div className="gender-stats">
              {Object.entries(genderStats).map(([gender, data]) => (
                <div key={gender} className="gender-stat-row">
                  <span className="gender-label">{gender}</span>
                  <span className="gender-count">{data.total}</span>
                  <div className="gender-percentage">
                    {((data.total / registrations.length) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>Registration Timeline</h4>
            <div className="timeline-stats">
              {Object.entries(timelineStats)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .slice(-7) // Last 7 days
                .map(([date, count]) => (
                  <div key={date} className="timeline-row">
                    <span className="timeline-date">{new Date(date).toLocaleDateString()}</span>
                    <span className="timeline-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>Team vs Individual by Department</h4>
            <div className="team-individual-stats">
              {Object.entries(departmentStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 8)
                .map(([dept]) => {
                  const deptRegs = registrations.filter(reg => 
                    (reg.personal_info?.department || reg.department) === dept
                  );
                  const individuals = deptRegs.filter(reg => 
                    (reg.team_info?.teamSize || reg.teamSize || 1) === 1
                  ).length;
                  const teams = deptRegs.length - individuals;
                  
                  return (
                    <div key={dept} className="team-individual-row">
                      <div className="dept-name">{dept.length > 15 ? dept.substring(0, 15) + '...' : dept}</div>
                      <div className="team-individual-counts">
                        <span className="individual-count">Individual: {individuals}</span>
                        <span className="team-count">Team: {teams}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Statistics Summary */}
      <div className="analytics-summary">
        <h3><SummaryIcon style={{marginRight: '8px', verticalAlign: 'middle'}} /> Quick Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Departments:</span>
            <span className="summary-value">{Object.keys(departmentStats).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Colleges:</span>
            <span className="summary-value">{Object.keys(collegeDepartmentStats).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Most Popular Dept:</span>
            <span className="summary-value">{topDepartments[0]?.[0] || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg per Department:</span>
            <span className="summary-value">{(registrations.length / Object.keys(departmentStats).length).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
