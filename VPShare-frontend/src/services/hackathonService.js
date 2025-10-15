import axios from 'axios';
import { auth } from '../config/firebase';
import { logger } from '../config/environment';

// ===== API ENDPOINTS FROM ENV =====
const CREATE_ORDER_API = `${import.meta.env.VITE_HACKATHON_PAYMENT_API_URL}/create-order`;
const VERIFY_PAYMENT_API = `${import.meta.env.VITE_HACKATHON_PAYMENT_API_URL}/verify-hackathon-payment`;
const REGISTRATION_API = `${import.meta.env.VITE_HACKATHON_API_URL}/registrationCK`;

// ===== HACKATHON PRICING =====
const HACKATHON_PRICING = {
  2: 699,  // ₹699 for 2 members
  3: 699,  // ₹699 for 3 members
  4: 699   // ₹699 for 4 members
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
  if (size < 2 || size > 4) {
    throw new Error('Team size must be 2-4 members');
  }
  return HACKATHON_PRICING[size];
};

// ===== API 1: CREATE PAYMENT ORDER =====
export const createPaymentOrder = async (teamData) => {
  let orderData = null; // Declare outside try block
  let headers = null;   // Declare outside try block
  
  try {
    const { teamSize, teamname, leaderUid, email, members } = teamData;
    
    // Validate inputs more thoroughly
    const validationErrors = [];
    if (!teamSize || isNaN(teamSize) || teamSize < 2 || teamSize > 4) {
      validationErrors.push(`Invalid team size: ${teamSize} (must be 2-4)`);
    }
    if (!teamname || teamname.trim() === '') {
      validationErrors.push('Team name is required');
    }
    if (!leaderUid || leaderUid.trim() === '') {
      validationErrors.push('Leader UID is required');
    }
    if (!email || email.trim() === '') {
      validationErrors.push('Email is required');
    }
    if (!Array.isArray(members) || members.length === 0) {
      validationErrors.push('Members array is required and cannot be empty');
    }
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Calculate amount in PAISE (your Lambda expects paise for create-order)
    const amountInRupees = getTeamPrice(teamSize);
    const amountInPaise = amountInRupees * 100;
    
    // Prepare order data matching your Lambda expectations
    // Try multiple field naming conventions to match backend expectations
    orderData = {
      payment_type: 'hackathon',  // Required by your Lambda
      leaderUid: leaderUid,
      teamsize: parseInt(teamSize), // Ensure it's a number
      teamSize: parseInt(teamSize), // Alternative field name
      amount: amountInPaise,  // Your Lambda expects paise: 100 for ₹1
      teamname: teamname.trim(), // Clean team name
      teamName: teamname.trim(), // Alternative field name
      email: email.trim(), // Clean email
      members: members || [],
      // Add some additional fields that might be expected
      currency: 'INR',
      description: `CodeKurukshetra Registration - Team: ${teamname.trim()}`
    };

    // Validate that amount matches expected backend pricing (₹699 = 69900 paise)
    const expectedAmountInPaise = 699 * 100; // ₹699 in paise = 69900
    if (amountInPaise !== expectedAmountInPaise) {
      console.warn(`⚠️ Amount mismatch! Sending: ${amountInPaise}, Expected: ${expectedAmountInPaise}`);
    }

    logger.info('Creating hackathon payment order:', { 
      teamname, 
      teamSize, 
      amountInRupees, 
      amountInPaise 
    });

    headers = await getAuthHeaders();
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
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestData: orderData || 'orderData not yet defined',
      endpoint: CREATE_ORDER_API,
      headers: headers || 'headers not yet defined'
    };
    
    console.error('🚨 Detailed Order Creation Error:', JSON.stringify(errorDetails, null, 2));
    
    // If it's a 400 error, it's likely a validation issue on the backend
    if (error.response?.status === 400) {
      console.error('🔍 400 Error suggests backend validation failure. Check field names and data types.');
      console.error('🔍 Backend might be expecting different field names or missing required fields.');
    }
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
    const amountInRupees = getTeamPrice(parseInt(teamSize));
    const amountInPaise = amountInRupees * 100; // Convert to paise for verification
    
    const verifyData = {
      razorpay_payment_id,
      razorpay_order_id, 
      razorpay_signature,
      leaderUid,
      teamsize: parseInt(teamSize),
      members: members || [],
      amount: amountInPaise, // Your verify Lambda expects PAISE: 100 for ₹1
      teamname,
      problem_statement: problem_statement || ''
    };

    logger.info('Verifying hackathon payment:', { 
      razorpay_order_id, 
      razorpay_payment_id,
      teamSize,
      amountInRupees,
      amountInPaise,
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

// ===== DASHBOARD API FUNCTIONS =====

// Fetch user's team registration status and data
export const fetchUserTeamData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }

    console.log('🔍 API: Fetching team data for UID:', user.uid);
    
    const headers = await getAuthHeaders();
    
    // Try different API call approaches based on Lambda code analysis
    let response;
    try {
      // First try: GET with leaderUid parameter (as expected by Lambda)
      console.log('🔄 API: Trying GET with leaderUid parameter');
      response = await axios.get(`${REGISTRATION_API}?leaderUid=${user.uid}`, {
        headers,
        timeout: 30000
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // User not registered, this is expected
        console.log('ℹ️ API: User not found (404), returning not registered');
        return {
          success: true,
          data: null,
          registered: false,
          teamData: null
        };
      }
      
      console.log('⚠️ API: GET with leaderUid failed, trying without parameter (will use authenticated uid)');
      // Second try: GET without parameter (Lambda will use authenticated uid)
      response = await axios.get(REGISTRATION_API, {
        headers,
        timeout: 30000
      });
    }

    console.log('✅ API: Team data response:', response.data);
    logger.info('Fetched user team data:', { uid: user.uid });

    return {
      success: true,
      data: response.data,
      registered: !!response.data,
      teamData: response.data
    };

  } catch (error) {
    console.error('💥 API: Failed to fetch user team data:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${REGISTRATION_API}?leaderUid=${auth.currentUser?.uid}`
    });
    logger.error('Failed to fetch user team data:', error);
    
    // If 404, user is not registered
    if (error.response?.status === 404) {
      console.log('ℹ️ API: User not found (404), returning not registered');
      return {
        success: true,
        data: null,
        registered: false,
        teamData: null
      };
    }

    // If 500, there's a server error - still return false but with error info
    if (error.response?.status === 500) {
      console.log('🚨 API: Server error (500), API might be down');
      return {
        success: false,
        error: 'Server error - please try again later',
        registered: false,
        teamData: null,
        serverError: true
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message,
      registered: false,
      teamData: null
    };
  }
};

// Fetch all registered teams (for admin or general stats)
export const fetchAllTeams = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(REGISTRATION_API, {
      headers,
      timeout: 30000
    });

    logger.info('Fetched all teams data');

    return {
      success: true,
      data: response.data,
      teams: response.data || []
    };

  } catch (error) {
    logger.error('Failed to fetch all teams:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      teams: []
    };
  }
};

// Update team registration data
export const updateTeamRegistration = async (teamData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const headers = await getAuthHeaders();
    const response = await axios.put(REGISTRATION_API, {
      ...teamData,
      leaderUid: user.uid
    }, {
      headers,
      timeout: 30000
    });

    logger.info('Updated team registration:', { uid: user.uid });

    return {
      success: true,
      data: response.data,
      message: 'Team registration updated successfully'
    };

  } catch (error) {
    logger.error('Failed to update team registration:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Check registration confirmation status
export const checkRegistrationConfirmation = async () => {
  try {
    const teamResult = await fetchUserTeamData();
    
    if (!teamResult.success) {
      return {
        success: false,
        confirmed: false,
        error: teamResult.error
      };
    }

    // Check multiple possible confirmation statuses based on API response format
    const isConfirmed = !!(teamResult.teamData?.registration_status === 'confirmed' || 
                          teamResult.teamData?.paymentStatus === 'completed' ||
                          teamResult.teamData?.registrationConfirmed === true ||
                          teamResult.teamData?.payment_verified === true ||
                          teamResult.teamData?.payment_id); // If payment_id exists, it's confirmed

    return {
      success: true,
      confirmed: isConfirmed,
      teamData: teamResult.teamData,
      registrationStatus: teamResult.teamData?.registration_status || teamResult.teamData?.paymentStatus || 'pending'
    };

  } catch (error) {
    logger.error('Failed to check registration confirmation:', error);
    return {
      success: false,
      confirmed: false,
      error: error.message
    };
  }
};

// ===== EXPORTS =====
export default {
  createPaymentOrder,
  verifyPayment,
  processHackathonPayment,
  getTeamPrice,
  fetchUserTeamData,
  fetchAllTeams,
  updateTeamRegistration,
  checkRegistrationConfirmation
};
