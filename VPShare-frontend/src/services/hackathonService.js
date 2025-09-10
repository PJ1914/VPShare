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

// ===== HACKATHON PRICING =====
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
      teamname
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
      teamname
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

// ===== EXPORTS =====
export default {
  createPaymentOrder,
  verifyPayment,
  processHackathonPayment,
  getTeamPrice
};
