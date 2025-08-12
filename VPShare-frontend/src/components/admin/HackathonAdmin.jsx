import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hackathonService from '../../services/hackathonService';

const HackathonAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    teamSize: 'all',
    search: '',
    dateRange: 'all'
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

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Loading hackathon admin data...');
      
      const [registrationsResult, statsResult] = await Promise.all([
        hackathonService.getAllRegistrations(100), // Load more for filtering
        hackathonService.getRegistrationStats()
      ]);

      console.log('Registrations result:', registrationsResult);
      console.log('Stats result:', statsResult);

      if (registrationsResult.success) {
        // Handle the nested data structure from Lambda
        const registrationsData = registrationsResult.data.data || registrationsResult.data;
        console.log('Registrations data:', registrationsData);
        
        setRegistrations(registrationsData.registrations || []);
        
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
    } catch (error) {
      console.error('Dashboard data load error:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      showNotification('Testing API connection...', 'success');
      
      // Test individual API calls
      const registrationsTest = await hackathonService.getAllRegistrations(5);
      console.log('Registrations API test:', registrationsTest);
      
      const statsTest = await hackathonService.getRegistrationStats();
      console.log('Stats API test:', statsTest);
      
      if (registrationsTest.success && statsTest.success) {
        showNotification('✅ API connection successful!', 'success');
      } else {
        showNotification(`⚠️ API test partial: Reg: ${registrationsTest.success}, Stats: ${statsTest.success}`, 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      showNotification('❌ API connection failed', 'error');
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
            reg.registration_id === registrationId 
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

  const exportData = async (format = 'csv') => {
    try {
      showNotification(`Exporting data as ${format.toUpperCase()}...`, 'success');
      
      // Try the API export endpoint first
      const result = await hackathonService.exportData(format, 'registrations');
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hackathon_registrations_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('✅ Data exported successfully', 'success');
      } else {
        // Fallback to local CSV generation
        if (format === 'csv') {
          const csvData = generateLocalCSV(registrations);
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hackathon_registrations_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          showNotification('✅ Data exported successfully (local)', 'success');
        } else {
          const jsonData = JSON.stringify(registrations, null, 2);
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hackathon_registrations_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
          showNotification('✅ Data exported successfully', 'success');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('❌ Failed to export data', 'error');
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
            selectedRegistrations.has(reg.registration_id)
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
    const allIds = new Set(filteredRegistrations.map(reg => reg.registration_id));
    setSelectedRegistrations(allIds);
  };

  const clearSelection = () => {
    setSelectedRegistrations(new Set());
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
        reg.registration_id || '',
        reg.full_name || '',
        reg.email || '',
        reg.phone || '',
        reg.college || '',
        reg.department || '',
        reg.year || '',
        reg.team_name || 'Individual',
        reg.team_size || 1,
        reg.problem_statement || '',
        (reg.programming_languages || []).join('; '),
        reg.ai_experience || '',
        reg.previous_hackathons || '',
        reg.status || 'pending',
        reg.payment_status || 'pending',
        reg.created_at || reg.registration_date || ''
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
      const teamSize = reg.team_info?.teamSize || reg.team_size || 1;
      const teamType = teamSize === 1 ? 'individual' : 'team';
      if (filters.teamSize !== teamType) return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const personalInfo = reg.personal_info || {};
      const teamInfo = reg.team_info || {};
      
      return (
        personalInfo.fullName?.toLowerCase().includes(searchLower) ||
        reg.full_name?.toLowerCase().includes(searchLower) ||
        personalInfo.email?.toLowerCase().includes(searchLower) ||
        reg.email?.toLowerCase().includes(searchLower) ||
        reg.registration_id?.toLowerCase().includes(searchLower) ||
        teamInfo.teamName?.toLowerCase().includes(searchLower) ||
        reg.team_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'registrations', name: 'Registrations', icon: '👥' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'communications', name: 'Communications', icon: '📧' }
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
        <h1>🚀 CognitiveX GenAI Hackathon Admin</h1>
        <div className="admin-actions">
          <button onClick={() => exportData('csv')} className="export-btn">
            📄 Export CSV
          </button>
          <button onClick={() => exportData('json')} className="export-btn">
            📋 Export JSON
          </button>
          <button onClick={loadDashboardData} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={testAPIConnection} className="test-btn">
            🔍 Test API
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
          <DashboardSection stats={stats} />
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
          />
        )}

        {activeSection === 'payments' && (
          <PaymentsSection registrations={filteredRegistrations} />
        )}

        {activeSection === 'analytics' && (
          <AnalyticsSection registrations={registrations} stats={stats} />
        )}

        {activeSection === 'communications' && (
          <CommunicationsSection registrations={registrations} />
        )}
      </div>

      {/* Registration Detail Modal */}
      <AnimatePresence>
        {selectedRegistration && (
          <RegistrationDetailModal
            registration={selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
            onStatusUpdate={updateRegistrationStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="dashboard-section"
  >
    <h2>📊 Hackathon Overview</h2>
    
    <div className="stats-grid">
      <div className="stat-card total">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>{stats.total_registrations || 0}</h3>
          <p>Total Registrations</p>
        </div>
      </div>
      
      <div className="stat-card confirmed">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>{stats.confirmed_registrations || 0}</h3>
          <p>Confirmed</p>
        </div>
      </div>
      
      <div className="stat-card pending">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>{stats.pending_payments || stats.pending_registrations || 0}</h3>
          <p>Pending Payment</p>
        </div>
      </div>
      
      <div className="stat-card revenue">
        <div className="stat-icon">💰</div>
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
          <p>📈 Registration Distribution</p>
          <p>Individual: {stats.individual_registrations || 0}</p>
          <p>Teams: {stats.group_registrations || 0}</p>
          <p>Failed Payments: {stats.failed_payments || 0}</p>
        </div>
      </div>
      
      <div className="chart-card">
        <h3>College Distribution</h3>
        <div className="chart-placeholder">
          <p>🏫 Top Participating Colleges</p>
          {stats.college_wise_stats && Object.entries(stats.college_wise_stats)
            .slice(0, 5)
            .map(([college, count]) => (
              <p key={college}>{college}: {count}</p>
            ))
          }
        </div>
      </div>

      <div className="chart-card">
        <h3>Technical Skills</h3>
        <div className="chart-placeholder">
          <p>💻 Popular Programming Languages</p>
          {stats.programming_language_stats && Object.entries(stats.programming_language_stats)
            .slice(0, 5)
            .map(([lang, count]) => (
              <p key={lang}>{lang}: {count}</p>
            ))
          }
        </div>
      </div>

      <div className="chart-card">
        <h3>AI Experience Levels</h3>
        <div className="chart-placeholder">
          <p>🤖 AI Experience Distribution</p>
          {stats.ai_experience_stats && Object.entries(stats.ai_experience_stats)
            .map(([level, count]) => (
              <p key={level}>{level}: {count}</p>
            ))
          }
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
  setSelectedRegistration 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="registrations-section"
  >
    <h2>👥 Registration Management</h2>

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
    </div>

    {/* Results summary and bulk actions */}
    <div className="results-summary-section">
      <div className="results-summary">
        Showing {registrations.length} of {totalRegistrations} registrations
        {selectedRegistrations.size > 0 && (
          <span className="selection-info">
            • {selectedRegistrations.size} selected
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
            checked={selectedRegistrations.size === filteredRegistrations.length && filteredRegistrations.length > 0}
            onChange={(e) => e.target.checked ? selectAllFilteredRegistrations() : clearSelection()}
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
        const paymentStatus = paymentInfo.status || registration.payment_status || 'pending';
        
        return (
          <motion.div
            key={registration.registration_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`table-row ${selectedRegistrations.has(registration.registration_id) ? 'selected' : ''}`}
          >
            <div className="select-column">
              <input
                type="checkbox"
                checked={selectedRegistrations.has(registration.registration_id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRegistrations(prev => new Set([...prev, registration.registration_id]));
                  } else {
                    setSelectedRegistrations(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(registration.registration_id);
                      return newSet;
                    });
                  }
                }}
              />
            </div>
            <div className="registration-id">
              {registration.registration_id}
            </div>
            <div className="name">
              {personalInfo.fullName || registration.full_name || 'N/A'}
            </div>
            <div className="email">
              {personalInfo.email || registration.email || 'N/A'}
            </div>
            <div className="team">
              {teamInfo.teamName || registration.team_name || 'Individual'}
              {(teamInfo.teamSize > 1 || registration.team_size > 1) && (
                <span className="team-size">
                  ({teamInfo.teamSize || registration.team_size} members)
                </span>
              )}
            </div>
            <div className="status">
              <span className={`status-badge ${frontendStatus}`}>
                {frontendStatus}
              </span>
            </div>
            <div className="payment">
              <span className={`payment-badge ${paymentStatus}`}>
                {paymentStatus}
              </span>
            </div>
            <div className="actions">
              <button
                onClick={() => setSelectedRegistration(registration)}
                className="view-btn"
                title="View Details"
              >
                👁️
              </button>
              <select
                value={frontendStatus}
                onChange={(e) => updateRegistrationStatus(registration.registration_id, e.target.value)}
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
const RegistrationDetailModal = ({ registration, onClose, onStatusUpdate }) => {
  const personalInfo = registration.personal_info || {};
  const teamInfo = registration.team_info || {};
  const skills = registration.skills || {};
  const paymentInfo = registration.payment_info || {};
  const status = registration.registration_status || registration.status || 'pending';
  const frontendStatus = status === 'pending_payment' ? 'pending' : status;

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
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="modal-content">
          <div className="detail-section">
            <h3>📋 Basic Information</h3>
            <div className="detail-grid">
              <div><strong>Registration ID:</strong> {registration.registration_id}</div>
              <div><strong>Name:</strong> {personalInfo.fullName || registration.full_name || 'N/A'}</div>
              <div><strong>Email:</strong> {personalInfo.email || registration.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {personalInfo.phone || registration.phone || 'N/A'}</div>
              <div><strong>College:</strong> {personalInfo.college || registration.college || 'N/A'}</div>
              <div><strong>Department:</strong> {personalInfo.department || registration.department || 'N/A'}</div>
              <div><strong>Year:</strong> {personalInfo.year || registration.year || 'N/A'}</div>
            </div>
          </div>

          {(teamInfo.teamName || registration.team_name) && (
            <div className="detail-section">
              <h3>👥 Team Information</h3>
              <div className="detail-grid">
                <div><strong>Team Name:</strong> {teamInfo.teamName || registration.team_name}</div>
                <div><strong>Team Size:</strong> {teamInfo.teamSize || registration.team_size || 1}</div>
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
              <div><strong>Problem Statement:</strong> {registration.problem_statement || 'N/A'}</div>
              <div><strong>Programming Languages:</strong> {
                (skills.programmingLanguages || registration.programming_languages || []).join(', ') || 'N/A'
              }</div>
              <div><strong>AI Experience:</strong> {skills.aiExperience || registration.ai_experience || 'N/A'}</div>
              <div><strong>Previous Hackathons:</strong> {skills.previousHackathons || registration.previous_hackathons || 'N/A'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>� Payment Information</h3>
            <div className="detail-grid">
              <div><strong>Amount:</strong> ₹{paymentInfo.amount || registration.amount || 'N/A'}</div>
              <div><strong>Payment Status:</strong> {paymentInfo.status || registration.payment_status || 'pending'}</div>
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
                  onChange={(e) => onStatusUpdate(registration.registration_id, e.target.value)}
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Payments Section Component
const PaymentsSection = ({ registrations }) => {
  const paymentStats = registrations.reduce((acc, reg) => {
    const status = reg.payment_status || 'pending';
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
      <h2>💳 Payment Management</h2>
      
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
    <h2>📈 Analytics & Insights</h2>
    
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
    <h2>📧 Communications</h2>
    
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
          
          <button className="send-email-btn">📧 Send Email</button>
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

export default HackathonAdmin;
