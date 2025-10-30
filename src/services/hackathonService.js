/**
 * Hackathon Service - Simple & Secure
 * 2 APIs: Create Order & Verify Payment
 * 4 members max per team
 * Pricing: 1=₹250, 2=₹500, 3=₹750, 4=₹1000
 */

import axios from 'axios';
import { auth } from '../config/firebase';
import { logger } from '../config/environment';

// ===== API ENDPOINTS FROM ENV =====
const CREATE_ORDER_API = `${import.meta.env.VITE_HACKATHON_PAYMENT_API_URL}/create-order`;
const VERIFY_PAYMENT_API = `${import.meta.env.VITE_HACKATHON_PAYMENT_API_URL}/verify-hackathon-payment`;
const REGISTRATIONS_API = `/api/utils/registrations`;
const STATS_API = `/api/utils/stats`;
const EMAIL_API = `/api/utils/email`;
const EXPORT_API = `/api/utils/export`;
const CERTIFICATE_API = `/api/utils/certificate`;

// ===== ADMIN API ENDPOINTS =====
const ADMIN_API = `/api/admin/codekurkshetra`;
const HACKATHON_PRICING = {
  1: 250,  // ₹250 for 1 member
  2: 500,  // ₹500 for 2 members  
  3: 750,  // ₹750 for 3 members
  4: 1000  // ₹1000 for 4 members
};

// ===== AUTH HELPER =====
const getAuthHeaders = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    logger.error('Auth failed:', error);
    throw error;
  }
};

// ===== PRICING CALCULATOR =====
export const getTeamPrice = (teamSize) => {
  const size = parseInt(teamSize);
  if (size < 1 || size > 4) {
    throw new Error('Team size must be 1-4 members');
  }
  return HACKATHON_PRICING[size];
};

// ===== API 1: CREATE PAYMENT ORDER =====
export const createPaymentOrder = async (teamData) => {
  try {
    const { teamSize, teamname, leaderUid, email, members } = teamData;
    
    // Validate team size
    if (!teamSize || teamSize < 1 || teamSize > 4) {
      throw new Error('Team size must be 1-4 members');
    }
    
    // Calculate amount in PAISE (your Lambda expects paise for create-order)
    const amountInRupees = getTeamPrice(teamSize);
    const amountInPaise = amountInRupees * 100;
    
    // Prepare order data matching your Lambda expectations
    const orderData = {
      payment_type: 'hackathon',  // Required by your Lambda
      leaderUid: leaderUid,
      teamsize: parseInt(teamSize),
      amount: amountInPaise,  // Your Lambda expects paise: 25000, 50000, 75000, 100000
      teamname: teamname,
      email: email,
      members: members || []
    };

    logger.info('Creating hackathon payment order:', { 
      teamname, 
      teamSize, 
      amountInRupees, 
      amountInPaise 
    });

    const headers = await getAuthHeaders();
    const response = await axios.post(CREATE_ORDER_API, orderData, { 
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data,
      amount: amountInRupees  // Return rupees for display
    };

  } catch (error) {
    logger.error('Create order failed:', error);
    console.error('Order creation error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// ===== API 2: VERIFY PAYMENT =====
export const verifyPayment = async (paymentData) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      leaderUid,
      teamSize,
      members,
      teamname,
      problem_statement
    } = paymentData;
    
    // Validate required fields with detailed error
    const missing = [];
    if (!razorpay_order_id) missing.push('razorpay_order_id');
    if (!razorpay_payment_id) missing.push('razorpay_payment_id');
    if (!razorpay_signature) missing.push('razorpay_signature');
    if (!leaderUid) missing.push('leaderUid');
    if (!teamSize) missing.push('teamSize');
    if (!teamname) missing.push('teamname');
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Prepare verification data matching your Lambda expectations
    const verifyData = {
      razorpay_payment_id,
      razorpay_order_id, 
      razorpay_signature,
      leaderUid,
      teamsize: parseInt(teamSize),
      members: members || [],
      amount: getTeamPrice(parseInt(teamSize)), // Your verify Lambda expects RUPEES: 250, 500, 750, 1000
      teamname,
      problem_statement: problem_statement || ''
    };

    logger.info('Verifying hackathon payment:', { 
      razorpay_order_id, 
      razorpay_payment_id,
      teamSize,
      amount: verifyData.amount,
      leaderUid
    });

    const headers = await getAuthHeaders();
    const response = await axios.post(VERIFY_PAYMENT_API, verifyData, { 
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data,
      message: 'Payment verified and registration complete'
    };

  } catch (error) {
    logger.error('Payment verification failed:', error);
    console.error('Verification error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      paymentData
    });
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// ===== COMPLETE PAYMENT FLOW =====
export const processHackathonPayment = async (teamData) => {
  try {
    // Step 1: Create order
    const orderResult = await createPaymentOrder(teamData);
    if (!orderResult.success) {
      throw new Error(orderResult.error);
    }

    return {
      success: true,
      orderData: orderResult.data,
      amount: orderResult.amount
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ===== REGISTRATION MANAGEMENT =====

// Get all registrations
export const getAllRegistrations = async (limit = 1000) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${REGISTRATIONS_API}?limit=${limit}`, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Get registrations failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get registration statistics
export const getRegistrationStats = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(STATS_API, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Get registration stats failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Update registration status
export const updateRegistrationStatus = async (registrationId, status, adminNotes = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${REGISTRATIONS_API}/${registrationId}/status`,
      { status, admin_notes: adminNotes },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Update registration status failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Bulk update registrations
export const bulkUpdateRegistrations = async (updates) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${REGISTRATIONS_API}/bulk-update`,
      { updates },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Bulk update registrations failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Export registrations
export const exportRegistrations = async (format, filters = {}) => {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ format, ...filters });

    const response = await axios.get(`${EXPORT_API}?${params}`, {
      headers,
      timeout: 60000 // Longer timeout for exports
    });

    return {
      success: true,
      data: response.data,
      message: `Export completed in ${format.toUpperCase()} format`
    };
  } catch (error) {
    logger.error('Export registrations failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Generate certificate
export const generateCertificate = async (registrationId, certificateType = 'participation') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${CERTIFICATE_API}/generate`,
      { registrationId, certificateType },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data,
      message: 'Certificate generated successfully'
    };
  } catch (error) {
    logger.error('Generate certificate failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// ===== EMAIL MANAGEMENT =====

// Send bulk emails
export const sendBulkEmails = async (recipients, emailType, customMessage = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/bulk`,
      { recipients, emailType, customMessage },
      { headers, timeout: 60000 }
    );

    return {
      success: true,
      data: response.data,
      message: `Emails sent to ${recipients.length} recipients`
    };
  } catch (error) {
    logger.error('Send bulk emails failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Send confirmation email
export const sendConfirmationEmail = async (registrationId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/confirmation`,
      { registrationId },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data,
      message: 'Confirmation email sent'
    };
  } catch (error) {
    logger.error('Send confirmation email failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Send reminder email
export const sendReminderEmail = async (registrationId, reminderType = 'general', customMessage = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/reminder`,
      { registrationId, reminderType, customMessage },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data,
      message: 'Reminder email sent'
    };
  } catch (error) {
    logger.error('Send reminder email failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Send announcement email
export const sendAnnouncementEmail = async (recipients, subject, message) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/announcement`,
      { recipients, subject, message },
      { headers, timeout: 60000 }
    );

    return {
      success: true,
      data: response.data,
      message: `Announcement sent to ${recipients.length} recipients`
    };
  } catch (error) {
    logger.error('Send announcement email failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Send pre-event reminders
export const sendPreEventReminders = async (customMessage = '') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/pre-event-reminders`,
      { customMessage },
      { headers, timeout: 60000 }
    );

    return {
      success: true,
      data: response.data,
      message: 'Pre-event reminders sent to all confirmed participants'
    };
  } catch (error) {
    logger.error('Send pre-event reminders failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Test email system
export const testEmailSystem = async (registrationId, emailType = 'confirmation') => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${EMAIL_API}/test`,
      { registrationId, emailType },
      { headers, timeout: 30000 }
    );

    return {
      success: true,
      data: response.data,
      message: 'Email system test completed'
    };
  } catch (error) {
    logger.error('Test email system failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get participant details
export const getParticipantDetails = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${REGISTRATIONS_API}/participants`, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Get participant details failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// ===== TEAM MANAGEMENT (ADMIN API) =====

// Get all teams
export const getAllTeams = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(ADMIN_API, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Get all teams failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get team by leader ID
export const getTeamByLeaderId = async (leaderId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${ADMIN_API}?leaderId=${leaderId}`, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Get team by leader ID failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Create new team
export const createTeam = async (teamData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(ADMIN_API, teamData, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data,
      message: 'Team created successfully'
    };
  } catch (error) {
    logger.error('Create team failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Update team
export const updateTeam = async (leaderId, teamData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${ADMIN_API}?leaderId=${leaderId}`, teamData, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data,
      message: 'Team updated successfully'
    };
  } catch (error) {
    logger.error('Update team failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Delete team
export const deleteTeam = async (leaderId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${ADMIN_API}?leaderId=${leaderId}`, {
      headers,
      timeout: 30000
    });

    return {
      success: true,
      data: response.data,
      message: 'Team deleted successfully'
    };
  } catch (error) {
    logger.error('Delete team failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// ===== EXPORTS =====
export default {
  // Payment methods
  createPaymentOrder,
  verifyPayment,
  processHackathonPayment,
  getTeamPrice,

  // Registration management
  getAllRegistrations,
  getRegistrationStats,
  updateRegistrationStatus,
  bulkUpdateRegistrations,
  exportRegistrations,
  generateCertificate,

  // Email management
  sendBulkEmails,
  sendConfirmationEmail,
  sendReminderEmail,
  sendAnnouncementEmail,
  sendPreEventReminders,
  testEmailSystem,
  getParticipantDetails,

  // Team management (Admin API)
  getAllTeams,
  getTeamByLeaderId,
  createTeam,
  updateTeam,
  deleteTeam
};
