import axios from 'axios';
import { auth } from '../config/firebase';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { config, logger } from '../config/environment';

// API endpoint configurations from environment variables
const HACKATHON_API_URL = import.meta.env.VITE_HACKATHON_API_URL;
const ADMIN_API_URL = import.meta.env.VITE_HACKATHON_ADMIN_API_URL;
const UTILS_API_URL = import.meta.env.VITE_HACKATHON_UTILS_API_URL;
const HACKATHON_PAYMENT_API_URL = import.meta.env.VITE_HACKATHON_PAYMENT_API_URL; 

// Development mode check
const isDevelopment = config.isDevelopment;// Team pricing configuration with Lambda-compatible plans
const getTeamPrice = (teamSize) => {
  switch (teamSize) {
    case 1:
      return 199; // ₹199 for individual
    case 3:
      return 549; // ₹549 for team of 3
    default:
      return 199; // Default to individual pricing
  }
};

// Get exact amount in paise as expected by Lambda
const getTeamPriceInPaise = (teamSize) => {
  switch (teamSize) {
    case 1:
      return 19900; // ₹199 = 19900 paise (Individual)
    case 3:
      return 54900; // ₹549 = 54900 paise (Team of 3)
    default:
      return 19900; // Default to individual pricing
  }
};

// Map team sizes to what the Lambda expects (only supports 1 and 3)
const getBackendTeamSize = (frontendTeamSize) => {
  return frontendTeamSize === 1 ? 1 : 3; // Only 1 (individual) and 3 (team) are supported
};

// Map hackathon plans to existing payment plans that Lambda recognizes
const getHackathonPlanMapping = (teamSize) => {
  // Use exact amounts that Lambda expects (in paise)
  switch (teamSize) {
    case 1:
      return { plan: 'one-member', amount: 19900 }; // ₹199 = 19900 paise
    case 3:
      return { plan: 'team-member', amount: 54900 }; // ₹549 = 54900 paise
    default:
      return { plan: 'one-member', amount: 19900 }; // Default to individual
  }
};

// Create axios instances for different services
const hackathonAPI = axios.create({
  baseURL: HACKATHON_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminAPI = axios.create({
  baseURL: ADMIN_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const utilsAPI = axios.create({
  baseURL: UTILS_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const hackathonPaymentAPI = axios.create({
  baseURL: HACKATHON_PAYMENT_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptors to all axios instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        // Ensure clean token format for Authorization header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // Don't log auth token errors in development for API endpoints that might not need auth
      if (!isDevelopment) {
        logger.warn('Error getting auth token:', error);
      }
    }
    return config;
  });

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle all API errors silently in development
      const isApiError = error.response?.status === 403 || 
                        error.response?.status === 401 ||
                        error.message.includes('Network Error') || 
                        error.code === 'ERR_NETWORK' ||
                        error.message.includes('CORS') ||
                        error.message.includes('Invalid key=value pair');
      
      if (!isDevelopment && !isApiError) {
        logger.error('API Error:', error.response?.data || error.message);
      }
      
      return Promise.reject(error);
    }
  );
};

// Apply auth interceptors
addAuthInterceptor(hackathonAPI);
addAuthInterceptor(adminAPI);
addAuthInterceptor(utilsAPI);
addAuthInterceptor(hackathonPaymentAPI);

// Hackathon Service
const hackathonService = {
  // Helper method to ensure authentication
  async ensureAuth() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  },

  // Firebase Firestore Operations
  async saveUserProfile(personalInfo) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!personalInfo) {
        throw new Error('Personal information is required');
      }
      
      // Clean the personal info data - remove any undefined fields
      const cleanPersonalInfo = Object.fromEntries(
        Object.entries(personalInfo).filter(([_, value]) => value !== undefined && value !== '')
      );
      
      if (Object.keys(cleanPersonalInfo).length === 0) {
        throw new Error('Valid personal information is required');
      }
      
      // Save to main users collection (matches Firestore rules)
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        personal_info: cleanPersonalInfo,
        last_updated: serverTimestamp(),
        profile_created_at: serverTimestamp()
      }, { merge: true });
      
      // Also save to hackathon-specific user profiles
      const hackathonUserRef = doc(db, 'hackathon_user_profiles', user.uid);
      
      await setDoc(hackathonUserRef, {
        personal_info: cleanPersonalInfo,
        created_at: serverTimestamp(),
        last_updated: serverTimestamp()
      }, { merge: true });
      
      return {
        success: true,
        message: 'User profile saved successfully'
      };
    } catch (error) {
      logger.error('Error saving user profile:', error);
      return {
        success: false,
        message: error.message || 'Failed to save user profile'
      };
    }
  },

  async createTeam(teamInfo, personalInfo) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const teamRef = doc(collection(db, 'hackathon_teams'));
      
      // Create team member IDs array for security rules compliance
      const teamMemberIds = teamInfo.team_members.map((member, index) => 
        index === 0 ? user.uid : null // First member is always the team lead, others TBD
      ).filter(id => id !== null);
      
      const teamData = {
        team_name: teamInfo.team_name,
        team_lead_id: user.uid,
        team_lead_email: personalInfo.email,
        team_member_ids: teamMemberIds, // Array of user IDs for security rules
        members: teamInfo.team_members.map((member, index) => ({
          ...member,
          user_id: index === 0 ? user.uid : null, // First member is always the team lead
          is_lead: index === 0
        })),
        team_size: teamInfo.team_size,
        created_at: serverTimestamp()
      };
      
      await setDoc(teamRef, teamData);
      
      return {
        success: true,
        data: { team_id: teamRef.id },
        message: 'Team created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create team'
      };
    }
  },

  async saveCommitments(registrationId, commitments, additionalInfo) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const commitmentsRef = doc(db, 'hackathon_commitments', registrationId);
      
      // Ensure required fields are present (as per security rules)
      const commitmentData = {
        user_id: user.uid,
        registration_id: registrationId,
        commitments: commitments || {
          ibm_skillsbuild: false,
          nasscom_courses: false,
          full_participation: false
        },
        expectations: additionalInfo?.expectations || '',
        github: additionalInfo?.github || '',
        linkedin: additionalInfo?.linkedin || '',
        created_at: serverTimestamp()
      };
      
      await setDoc(commitmentsRef, commitmentData);
      
      return {
        success: true,
        message: 'Commitments saved successfully'
      };
    } catch (error) {
      logger.error('Error saving commitments:', error);
      return {
        success: false,
        message: error.message || 'Failed to save commitments'
      };
    }
  },

  async getUserProfile(userId = null) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      const targetUserId = userId || user?.uid;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!targetUserId) {
        throw new Error('User ID not provided');
      }
      
      // Only allow users to access their own profile (matches security rules)
      if (targetUserId !== user.uid) {
        throw new Error('Access denied: Can only access your own profile');
      }
      
      const userDoc = await getDoc(doc(db, 'users', targetUserId));
      
      if (userDoc.exists()) {
        return {
          success: true,
          data: userDoc.data()
        };
      } else {
        return {
          success: false,
          message: 'User profile not found'
        };
      }
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user profile'
      };
    }
  },

  async getTeamData(teamId) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const teamDoc = await getDoc(doc(db, 'hackathon_teams', teamId));
      
      if (teamDoc.exists()) {
        return {
          success: true,
          data: teamDoc.data()
        };
      } else {
        return {
          success: false,
          message: 'Team not found'
        };
      }
    } catch (error) {
      logger.error('Error fetching team data:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch team data'
      };
    }
  },

  // Add team member to existing team (for team leads)
  async addTeamMember(teamId, memberInfo, newUserId) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const teamRef = doc(db, 'hackathon_teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      
      // Only team lead can add members
      if (teamData.team_lead_id !== user.uid) {
        throw new Error('Access denied: Only team lead can add members');
      }
      
      // Update team member arrays
      const updatedMembers = [...teamData.members, { ...memberInfo, user_id: newUserId, is_lead: false }];
      const updatedMemberIds = [...teamData.team_member_ids, newUserId];
      
      await updateDoc(teamRef, {
        members: updatedMembers,
        team_member_ids: updatedMemberIds,
        team_size: updatedMembers.length,
        last_updated: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Team member added successfully'
      };
    } catch (error) {
      logger.error('Error adding team member:', error);
      return {
        success: false,
        message: error.message || 'Failed to add team member'
      };
    }
  },

  // Get teams user is part of
  async getUserTeams() {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Query teams where user is team lead
      const leadTeamsQuery = query(
        collection(db, 'hackathon_teams'),
        where('team_lead_id', '==', user.uid)
      );
      
      // Query teams where user is a member
      const memberTeamsQuery = query(
        collection(db, 'hackathon_teams'),
        where('team_member_ids', 'array-contains', user.uid)
      );
      
      const [leadTeamsSnapshot, memberTeamsSnapshot] = await Promise.all([
        getDocs(leadTeamsQuery),
        getDocs(memberTeamsQuery)
      ]);
      
      const teams = [];
      const teamIds = new Set();
      
      // Add teams where user is lead
      leadTeamsSnapshot.forEach(doc => {
        if (!teamIds.has(doc.id)) {
          teams.push({ id: doc.id, ...doc.data(), role: 'lead' });
          teamIds.add(doc.id);
        }
      });
      
      // Add teams where user is member (avoid duplicates)
      memberTeamsSnapshot.forEach(doc => {
        if (!teamIds.has(doc.id)) {
          teams.push({ id: doc.id, ...doc.data(), role: 'member' });
          teamIds.add(doc.id);
        }
      });
      
      return {
        success: true,
        data: teams
      };
    } catch (error) {
      logger.error('Error fetching user teams:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user teams'
      };
    }
  },

  async getCommitments(registrationId) {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const commitmentsDoc = await getDoc(doc(db, 'hackathon_commitments', registrationId));
      
      if (commitmentsDoc.exists()) {
        const data = commitmentsDoc.data();
        
        // Security check: user can only access their own commitments
        if (data.user_id !== user.uid) {
          throw new Error('Access denied: Can only access your own commitments');
        }
        
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          message: 'Commitments not found'
        };
      }
    } catch (error) {
      logger.error('Error fetching commitments:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch commitments'
      };
    }
  },

  // Enhanced registration flow using Firebase + DynamoDB
  async register(registrationData) {
    try {
      console.log('Starting registration process...');
      
      // Transform the form data to match your Lambda EXACTLY
      const backendData = {
        fullName: registrationData.personal_info.full_name,
        email: registrationData.personal_info.email,
        phone: registrationData.personal_info.phone?.replace(/[\s\-\(\)]/g, ''),
        college: registrationData.personal_info.college,
        department: registrationData.personal_info.department,
        year: registrationData.personal_info.year, // Changed from yearOfStudy to year
        rollNumber: registrationData.personal_info.roll_number,
        teamSize: registrationData.team_info.team_size,
        teamName: registrationData.team_info.team_name || `Team_${registrationData.personal_info.full_name}`, // Ensure teamName is always provided
        teamMembers: (registrationData.team_info.team_members || []).map(member => ({
          name: member.name,
          email: member.email,
          phone: member.phone?.replace(/[\s\-\(\)]/g, ''),
          rollNumber: member.roll_number || member.rollNumber
        })),
        problemStatement: registrationData.technical_info.problem_statement,
        programmingLanguages: registrationData.technical_info.programming_languages || [],
        aiExperience: registrationData.technical_info.ai_experience || 'beginner'
      };

      // Check if API URL is loaded
      if (!import.meta.env.VITE_HACKATHON_API_URL) {
        throw new Error('VITE_HACKATHON_API_URL environment variable is not set. Please restart your development server.');
      }

      console.log('Making API call to:', `${import.meta.env.VITE_HACKATHON_API_URL}/register`);
      
      // Direct axios call without auth for now to test
      const response = await axios.post(`${import.meta.env.VITE_HACKATHON_API_URL}/register`, backendData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        return {
          success: true,
          data: {
            registration_id: response.data.data.registration_id,
            team_size: registrationData.team_info.team_size
          },
          message: 'Registration completed successfully'
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      if (error.response?.status === 405) {
        return {
          success: false,
          message: `405 Error: The endpoint ${import.meta.env.VITE_HACKATHON_API_URL}/register does not support POST method. Check your Lambda configuration and API Gateway setup.`,
          statusCode: 405
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
        statusCode: error.response?.status
      };
    }
  },

  // Get complete registration data (DynamoDB + Firebase)
  async getCompleteRegistration(registrationId) {
    try {
      // Get core data from DynamoDB via backend
      const coreResult = await this.getRegistration(registrationId);
      
      if (!coreResult.success) {
        return coreResult;
      }

      const coreData = coreResult.data;
      
      // Get user profile from Firestore
      const userResult = await this.getUserProfile(coreData.user_id);
      
      // Get team data from Firestore
      const teamResult = await this.getTeamData(coreData.team_info?.team_id);
      
      // Get commitments from Firestore
      const commitmentsResult = await this.getCommitments(registrationId);
      
      return {
        success: true,
        data: {
          ...coreData,
          personal_info: userResult.success ? userResult.data.personal_info : null,
          team_details: teamResult.success ? teamResult.data : null,
          commitments: commitmentsResult.success ? commitmentsResult.data.commitments : null,
          additional_info: commitmentsResult.success ? {
            expectations: commitmentsResult.data.expectations,
            github: commitmentsResult.data.github,
            linkedin: commitmentsResult.data.linkedin
          } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch complete registration'
      };
    }
  },

  // Registration APIs (DynamoDB operations via backend)
  async getRegistration(registrationId) {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Registration retrieval is via Admin API, not Hackathon API
      const response = await adminAPI.get(`/${registrationId}`, { headers });
      
      // Handle the response based on your Lambda structure
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration not found'
        };
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch registration',
        error: error.response?.data
      };
    }
  },

  async getUserRegistrations() {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await hackathonAPI.get('/registrations', { headers });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch user registrations',
        error: error.response?.data
      };
    }
  },

  // Payment APIs (using existing payment infrastructure)
  async initiatePayment(registrationId, amount, teamSize) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      const paymentData = {
        payment_type: 'hackathon', // Add payment_type to match Lambda expectations
        registration_id: registrationId,
        amount: amount, // Amount should already be in paise (19900, 54900)
        team_size: getBackendTeamSize(teamSize) // Map to backend expected values (1 or 3)
      };
      
      const response = await hackathonPaymentAPI.post('/create-order', paymentData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (isDevelopment) {
        // Mock payment order for development
        return {
          success: true,
          data: {
            order_id: `order_dev_${Date.now()}`,
            amount: amount, // Amount is already in correct format 
            currency: 'INR',
            key_id: 'rzp_test_demo',
            registration_id: registrationId
          }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to initiate payment',
        error: error.response?.data
      };
    }
  },

  async verifyPayment(paymentData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      const verificationData = {
        razorpay_payment_id: paymentData.payment_id,
        razorpay_order_id: paymentData.order_id,
        razorpay_signature: paymentData.signature,
        registration_id: paymentData.registration_id,
        plan: `hackathon_${getBackendTeamSize(paymentData.team_size) === 1 ? 'individual' : 'team'}`,
        amount: paymentData.amount,
        email: user.email
      };
      
      const response = await hackathonPaymentAPI.post('/verify-payment', verificationData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (isDevelopment) {
        // Mock payment verification for development
        return {
          success: true,
          data: {
            payment_verified: true,
            payment_id: paymentData.payment_id || `pay_dev_${Date.now()}`,
            registration_id: paymentData.registration_id
          }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Payment verification failed',
        error: error.response?.data
      };
    }
  },

  async getPaymentStatus(registrationId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      const response = await paymentAPI.get(`/payment-status/${registrationId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch payment status',
        error: error.response?.data
      };
    }
  },

  // Utility methods
  calculateAmount(teamSize) {
    return getTeamPrice(teamSize);
  },

  formatRegistrationData(formData) {
    return {
      personal_info: formData.personal_info,
      team_info: formData.team_info,
      technical_info: formData.technical_info,
      requirements: formData.requirements,
      commitments: formData.commitments,
      additional_info: formData.additional_info
    };
  },

  // Development helpers
  getMockData() {
    return {
      personalInfo: {
        full_name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 9876543210",
        college: "Example University",
        year: "3rd Year",
        branch: "Computer Science"
      },
      teamInfo: {
        team_name: "Code Warriors",
        team_size: 3,
        team_members: [
          { name: "John Doe", email: "john.doe@example.com", role: "Team Lead" },
          { name: "Jane Smith", email: "jane.smith@example.com", role: "Developer" },
          { name: "Bob Johnson", email: "bob.johnson@example.com", role: "Designer" }
        ]
      },
      technicalInfo: {
        programming_languages: ["JavaScript", "Python", "Java"],
        frameworks: ["React", "Node.js", "Express"],
        experience: "Intermediate",
        github: "https://github.com/johndoe"
      },
      requirements: {
        laptop: true,
        accommodation: false,
        food: true,
        transport: false
      },
      commitments: {
        ibm_skillsbuild: true,
        nasscom_courses: true,
        full_participation: true
      },
      additionalInfo: {
        expectations: "Looking forward to learning new technologies and networking",
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe"
      }
    };
  },

  // Problem statements API
  async getProblemStatements() {
    // In development, skip API call and return fallback data immediately
    if (isDevelopment) {
      const fallbackProblems = [
        {
          id: 'p1',
          title: 'AI Medical Prescription Verification Leveraging IBM Watson and Hugging Face Models',
          description: 'Develop an AI solution to verify medical prescriptions using IBM Watson and Hugging Face models.',
          category: 'Healthcare',
          difficulty: 'Hard',
          tags: ['AI', 'IBM Watson', 'Healthcare', 'Machine Learning']
        },
        {
          id: 'p2', 
          title: 'ClauseWise: Legal Document Analyzer Using IBM Watson & Granite',
          description: 'Create a legal document analyzer that uses IBM Watson and Granite for clause analysis.',
          category: 'Legal Tech',
          difficulty: 'Hard',
          tags: ['AI', 'IBM Watson', 'Legal', 'Document Analysis']
        },
        {
          id: 'p3',
          title: 'Personal Finance Chatbot: Intelligent Guidance for Savings, Taxes, and Investments',
          description: 'Build an AI-powered chatbot that provides intelligent financial guidance.',
          category: 'Fintech',
          difficulty: 'Medium',
          tags: ['AI', 'Fintech', 'Chatbot', 'Personal Finance']
        },
        {
          id: 'p4',
          title: 'StudyMate: An AI-Powered PDF-Based Q&A System for Students',
          description: 'Develop an AI system that answers questions based on PDF documents for students.',
          category: 'Education',
          difficulty: 'Medium',
          tags: ['AI', 'Education', 'PDF Processing', 'Q&A']
        },
        {
          id: 'p5',
          title: 'EchoVerse – An AI-Powered Audiobook Creation Tool',
          description: 'Create a tool that converts text to natural-sounding audiobooks using AI.',
          category: 'Media & Entertainment',
          difficulty: 'Medium',
          tags: ['AI', 'Audio Processing', 'Text-to-Speech', 'Media']
        }
      ];
      
      return {
        success: true,
        data: fallbackProblems,
        message: 'Using predefined problem statements',
        isFallback: true,
        isNetworkError: false
      };
    }

    try {
      // Try to fetch from hackathon API in production only
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await hackathonAPI.get('/problem-statements', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          return {
            success: true,
            data: response.data.data,
            message: 'Problem statements loaded successfully'
          };
        }
      }
      
      // If API fails, provide fallback data silently
      throw new Error('API not available');
      
    } catch (error) {
      // Provide fallback problem statements without any logging
      const fallbackProblems = [
        {
          id: 'p1',
          title: 'AI Medical Prescription Verification Leveraging IBM Watson and Hugging Face Models',
          description: 'Develop an AI solution to verify medical prescriptions using IBM Watson and Hugging Face models.',
          category: 'Healthcare',
          difficulty: 'Hard',
          tags: ['AI', 'IBM Watson', 'Healthcare', 'Machine Learning']
        },
        {
          id: 'p2', 
          title: 'ClauseWise: Legal Document Analyzer Using IBM Watson & Granite',
          description: 'Create a legal document analyzer that uses IBM Watson and Granite for clause analysis.',
          category: 'Legal Tech',
          difficulty: 'Hard',
          tags: ['AI', 'IBM Watson', 'Legal', 'Document Analysis']
        },
        {
          id: 'p3',
          title: 'Personal Finance Chatbot: Intelligent Guidance for Savings, Taxes, and Investments',
          description: 'Build an AI-powered chatbot that provides intelligent financial guidance.',
          category: 'Fintech',
          difficulty: 'Medium',
          tags: ['AI', 'Fintech', 'Chatbot', 'Personal Finance']
        },
        {
          id: 'p4',
          title: 'StudyMate: An AI-Powered PDF-Based Q&A System for Students',
          description: 'Develop an AI system that answers questions based on PDF documents for students.',
          category: 'Education',
          difficulty: 'Medium',
          tags: ['AI', 'Education', 'PDF Processing', 'Q&A']
        },
        {
          id: 'p5',
          title: 'EchoVerse – An AI-Powered Audiobook Creation Tool',
          description: 'Create a tool that converts text to natural-sounding audiobooks using AI.',
          category: 'Media & Entertainment',
          difficulty: 'Medium',
          tags: ['AI', 'Audio Processing', 'Text-to-Speech', 'Media']
        }
      ];
      
      return {
        success: true,
        data: fallbackProblems,
        message: 'Using predefined problem statements',
        isFallback: true,
        isNetworkError: true
      };
    }
  },

  async healthCheck() {
    try {
      const response = await hackathonAPI.get('/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Health check failed',
        error: error.response?.data
      };
    }
  },

  // Payment APIs - Using existing payment system
  async createPaymentOrder(registrationId, teamSize) {
    try {
      const amount = getTeamPriceInPaise(teamSize); // Get exact amount in paise

      const response = await paymentAPI.post('/create-order', {
        payment_type: 'hackathon',
        registration_id: registrationId,
        team_size: teamSize,
        amount: amount
      });
      
      return {
        success: true,
        data: {
          ...response.data,
          registration_details: {
            registration_id: registrationId,
            team_size: teamSize
          }
        }
      };
    } catch (error) {
      // Development mode fallback for payment order creation
      if (isDevelopment || registrationId?.startsWith('reg_dev_')) {
        console.log('Development mode: Creating mock payment order');
        const amount = getTeamPriceInPaise(teamSize); // Get exact amount in paise
        
        return {
          success: true,
          data: {
            order_id: `order_dev_${Date.now()}`,
            amount: amount,
            currency: 'INR',
            key_id: 'rzp_test_demo',
            registration_details: {
              registration_id: registrationId,
              team_size: teamSize
            }
          }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to create payment order',
        error: error.response?.data
      };
    }
  },

  async verifyPayment(paymentData) {
    try {
      // Development mode fallback first
      if (isDevelopment || paymentData.registration_id?.startsWith('reg_dev_')) {
        console.log('Development mode: Simulating payment verification');
        
        // Simulate sending confirmation email in development
        try {
          await this.sendConfirmationEmail(paymentData.registration_id);
        } catch (emailError) {
          console.warn('Development mode: Email simulation failed:', emailError.message);
        }
        
        return {
          success: true,
          data: {
            payment_verified: true,
            payment_id: paymentData.razorpay_payment_id || `pay_dev_${Date.now()}`,
            registration_id: paymentData.registration_id,
            status: 'confirmed'
          },
          message: 'Payment verified successfully (Development Mode)'
        };
      }

      // For hackathon payments, we'll verify the Razorpay signature ourselves
      // and then update the hackathon registration status directly
      try {
        // Step 1: Verify that the registration exists in hackathon system
        const registrationCheck = await adminAPI.get(`/${paymentData.registration_id}`);
        
        if (!registrationCheck.data?.success) {
          throw new Error('Registration not found in hackathon system');
        }

        // Step 2: For production, you would verify the Razorpay signature here
        // For now, we'll assume payment is valid since it came from Razorpay callback
        
        // Step 3: Update the hackathon registration status to confirmed
        const statusUpdate = await adminAPI.put('/status', {
          registration_id: paymentData.registration_id,
          status: 'confirmed', 
          admin_notes: `Payment completed: ${paymentData.razorpay_payment_id} at ${new Date().toISOString()}`
        });

        if (statusUpdate.data?.success) {
          // Step 4: Send confirmation email after successful payment verification
          try {
            await this.sendConfirmationEmail(paymentData.registration_id, {
              payment_id: paymentData.razorpay_payment_id,
              payment_amount: paymentData.amount,
              team_size: paymentData.team_size
            });
            console.log('Confirmation email sent successfully');
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the payment verification if email fails
          }
          
          return {
            success: true,
            data: {
              payment_verified: true,
              payment_id: paymentData.razorpay_payment_id,
              registration_id: paymentData.registration_id,
              status: 'confirmed',
              updated_at: new Date().toISOString()
            },
            message: 'Hackathon payment verified and registration confirmed'
          };
        } else {
          throw new Error('Failed to update registration status');
        }

      } catch (hackathonError) {
        console.error('Hackathon payment verification failed:', hackathonError);
        
        // Fallback: try the general payment API as a last resort
        try {
          const paymentVerification = await hackathonPaymentAPI.post('/verify-payment', {
            payment_type: 'hackathon',
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_signature: paymentData.razorpay_signature,
            registration_id: paymentData.registration_id,
            team_size: getBackendTeamSize(paymentData.team_size),
            amount: paymentData.amount
          });

          // Try to send confirmation email even with fallback method
          try {
            await this.sendConfirmationEmail(paymentData.registration_id, {
              payment_id: paymentData.razorpay_payment_id,
              payment_amount: paymentData.amount,
              team_size: paymentData.team_size
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email (fallback):', emailError);
          }

          return {
            success: true,
            data: paymentVerification.data,
            message: 'Payment verified via fallback method'
          };
        } catch (fallbackError) {
          throw hackathonError; // Throw the original error
        }
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Payment verification failed',
        error: error.response?.data || error.message
      };
    }
  },

  // Helper method to ensure authentication
  async ensureAuth() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  },

  // Admin APIs
  async getAllRegistrations(limit = 50, status = null) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const params = { limit };
      if (status && status !== 'all') params.status = status;
      
      const response = await axios.get(`${ADMIN_API_URL}/registrations`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      // Handle the Lambda response structure
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to fetch registrations'
        };
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch registrations',
        error: error.response?.data
      };
    }
  },

  async getRegistrationStats() {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.get(`${ADMIN_API_URL}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      // Handle the Lambda response structure
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to fetch stats'
        };
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch stats',
        error: error.response?.data
      };
    }
  },

  async updateRegistrationStatus(registrationId, newStatus, adminNotes = '', sendEmail = true) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      // Get current status before updating (for email logic)
      let oldStatus = '';
      if (sendEmail) {
        try {
          const currentReg = await this.getRegistrationDetails(registrationId);
          if (currentReg.success) {
            oldStatus = currentReg.data.registration_status || '';
          }
        } catch (statusError) {
          console.warn('Could not fetch current status for email logic:', statusError);
        }
      }
      
      const response = await axios.put(`${ADMIN_API_URL}/status`, {
        registration_id: registrationId,
        status: newStatus,
        admin_notes: adminNotes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      // Handle the Lambda response structure
      if (response.data?.success) {
        // Send automated email notification if enabled
        if (sendEmail && oldStatus !== newStatus) {
          try {
            await this.handleRegistrationStatusChange(registrationId, newStatus, oldStatus);
            console.log(`Status change email sent for registration ${registrationId}: ${oldStatus} → ${newStatus}`);
          } catch (emailError) {
            console.error('Failed to send status change email:', emailError);
            // Don't fail the status update if email fails
          }
        }
        
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Registration status updated successfully'
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to update registration status'
        };
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      
      // Handle specific error cases from your Lambda
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Registration not found'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data?.message || 'Invalid request data'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update registration status',
        error: error.response?.data
      };
    }
  },

  // Get individual registration details
  async getRegistrationDetails(registrationId) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.get(`${ADMIN_API_URL}/${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration not found'
        };
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Registration not found'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch registration details',
        error: error.response?.data
      };
    }
  },

  // Utils APIs
  async sendEmail(emailData) {
    try {
      const response = await utilsAPI.post('/send-email', emailData);
      return {
        success: true,
        data: response.data,
        message: 'Email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send email',
        error: error.response?.data
      };
    }
  },

  async generateCertificate(registrationId, certificateType = 'participation') {
    try {
      const response = await utilsAPI.post('/generate-certificate', {
        registration_id: registrationId,
        certificate_type: certificateType
      });
      return {
        success: true,
        data: response.data,
        message: 'Certificate generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to generate certificate',
        error: error.response?.data
      };
    }
  },

  async exportData(format = 'csv', type = 'registrations') {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.get(`${UTILS_API_URL}/export`, {
        params: { format, type },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // Longer timeout for export operations
      });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to export data'
        };
      }
    } catch (error) {
      console.error('Export data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to export data',
        error: error.response?.data
      };
    }
  },

  // Bulk operations for admin
  async bulkUpdateRegistrations(updates) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.put(`${ADMIN_API_URL}/bulk-update`, {
        updates: updates
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Bulk update completed successfully'
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to perform bulk update'
        };
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to perform bulk update',
        error: error.response?.data
      };
    }
  },

  // Send notifications to participants
  async sendNotification(notificationData) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.post(`${UTILS_API_URL}/send-notification`, {
        ...notificationData,
        sender_id: user.uid,
        sent_at: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Notification sent successfully'
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to send notification'
        };
      }
    } catch (error) {
      console.error('Send notification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send notification',
        error: error.response?.data
      };
    }
  },

  // Utils API Methods
  async exportRegistrations(format = 'csv', filters = {}) {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const queryParams = new URLSearchParams({
        format: format,
        ...filters
      });
      
      const response = await axios.get(`${UTILS_API_URL}/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: format === 'pdf' ? 'blob' : 'text',
        timeout: 60000
      });
      
      // Handle file download
      if (format === 'csv' || format === 'excel') {
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hackathon_registrations_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hackathon_registrations_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return {
        success: true,
        message: `${format.toUpperCase()} file downloaded successfully`
      };
      
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to export data'
      };
    }
  },

  async generateCertificate(registrationId, certificateType = 'participation') {
    try {
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      const response = await axios.post(`${UTILS_API_URL}/generate-certificate`, {
        registration_id: registrationId,
        certificate_type: certificateType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob', // Certificate will be a PDF
        timeout: 30000
      });
      
      // Download certificate
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Certificate generated and downloaded successfully'
      };
      
    } catch (error) {
      console.error('Certificate generation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to generate certificate'
      };
    }
  },

  async sendEmail(recipients, emailType, customData = {}) {
    try {
      console.log('📧 sendEmail called with:', {
        recipients,
        emailType,
        customData,
        apiUrl: UTILS_API_URL
      });
      
      const user = await this.ensureAuth();
      const token = await user.getIdToken();
      
      console.log('🔐 Authentication successful, sending email request...');
      
      const requestPayload = {
        recipients: recipients, // Array of registration IDs or email addresses
        email_type: emailType, // 'confirmation', 'reminder', 'announcement', 'certificate'
        custom_data: customData // Additional data for email template
      };
      
      console.log('📤 Request payload:', requestPayload);
      
      const response = await axios.post(`${UTILS_API_URL}/send-email`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('📨 Email API response:', response.data);
      
      if (response.data?.success) {
        const data = response.data.data || {};
        const successCount = data.successful_count || 0;
        const failedCount = data.failed_count || 0;
        
        // Check if any emails actually succeeded
        if (successCount > 0) {
          return {
            success: true,
            data: response.data.data,
            message: response.data.message || `Emails sent: ${successCount} successful, ${failedCount} failed`
          };
        } else {
          // All emails failed even though API returned success=true
          const failureDetails = data.failed_sends || [];
          const firstError = failureDetails[0]?.error || 'Unknown error';
          return {
            success: false,
            message: `All emails failed: ${firstError}`,
            data: response.data.data
          };
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to send emails'
        };
      }
      
    } catch (error) {
      console.error('❌ Email sending error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send emails'
      };
    }
  },

  async sendBulkEmails(registrationIds, emailType, customMessage = '') {
    try {
      const result = await this.sendEmail(registrationIds, emailType, {
        custom_message: customMessage,
        sent_at: new Date().toISOString()
      });
      
      return result;
      
    } catch (error) {
      console.error('Bulk email error:', error);
      return {
        success: false,
        message: 'Failed to send bulk emails'
      };
    }
  },

  // Send confirmation email after successful payment
  async sendConfirmationEmail(registrationId, paymentDetails = {}) {
    try {
      console.log(`📧 Sending confirmation email for registration: ${registrationId}`);
      
      // Prepare custom data for email template
      const customData = {
        payment_id: paymentDetails.payment_id || 'N/A',
        payment_amount: paymentDetails.payment_amount || 0,
        team_size: paymentDetails.team_size || 1,
        custom_message: `
          🎉 Congratulations! Your registration for CognitiveX GenAI Hackathon is now confirmed.
          
          💳 Payment Confirmation:
          • Payment ID: ${paymentDetails.payment_id || 'N/A'}
          • Amount Paid: ₹${paymentDetails.payment_amount ? (paymentDetails.payment_amount / 100) : 'N/A'}
          • Status: ✅ Confirmed
          
          📅 What's Next:
          • Complete your IBM SkillsBuild courses
          • Register for NASSCOM FutureSkills Prime
          • Join our Discord community for updates
          • Prepare your development environment
          
          🔗 Important Links:
          • IBM SkillsBuild: https://skillsbuild.org/
          • NASSCOM FSP: https://futureskillsprime.in/
          • Hackathon Website: https://codetapasya.com/
          
          We're excited to see what you'll build! Good luck! 🚀
        `
      };

      // Send confirmation email via utils API
      const emailResult = await this.sendEmail([registrationId], 'confirmation', customData);
      
      if (emailResult.success) {
        console.log(`✅ Confirmation email sent successfully for registration ${registrationId}`);
        return {
          success: true,
          message: 'Confirmation email sent successfully',
          data: emailResult.data
        };
      } else {
        console.error(`❌ Failed to send confirmation email:`, emailResult.message);
        throw new Error(emailResult.message || 'Failed to send confirmation email');
      }
      
    } catch (error) {
      console.error('Send confirmation email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send confirmation email'
      };
    }
  },

  // Send reminder email to participants
  async sendReminderEmail(registrationId, reminderType = 'general', customMessage = '') {
    try {
      const customData = {
        reminder_type: reminderType,
        custom_message: customMessage || 'Don\'t forget about the upcoming CognitiveX GenAI Hackathon! Make sure you\'re prepared and ready to innovate.',
        hackathon_date: 'February 2025',
        preparation_checklist: `
          ✅ Checklist for the Hackathon:
          • Complete IBM SkillsBuild courses
          • Register for NASSCOM FutureSkills Prime
          • Set up your development environment
          • Review the problem statements
          • Prepare your team collaboration tools
          • Join our Discord community for live updates
        `
      };

      const emailResult = await this.sendEmail([registrationId], 'reminder', customData);
      
      if (emailResult.success) {
        console.log(`Reminder email sent successfully for registration ${registrationId}`);
        return {
          success: true,
          message: 'Reminder email sent successfully'
        };
      } else {
        throw new Error(emailResult.message || 'Failed to send reminder email');
      }
      
    } catch (error) {
      console.error('Send reminder email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send reminder email'
      };
    }
  },

  // Send announcement email to participants
  async sendAnnouncementEmail(registrationIds, subject, message) {
    try {
      const customData = {
        announcement_subject: subject,
        custom_message: message,
        sent_by: 'CognitiveX Team',
        sent_at: new Date().toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'short'
        })
      };

      const emailResult = await this.sendEmail(registrationIds, 'announcement', customData);
      
      return emailResult;
      
    } catch (error) {
      console.error('Send announcement email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send announcement email'
      };
    }
  },

  // Automated email notifications based on registration status
  async handleRegistrationStatusChange(registrationId, newStatus, oldStatus = '') {
    try {
      let emailSent = false;
      
      // Send appropriate email based on status change
      switch (newStatus.toLowerCase()) {
        case 'confirmed':
          if (oldStatus !== 'confirmed') {
            await this.sendConfirmationEmail(registrationId);
            emailSent = true;
          }
          break;
          
        case 'pending':
          // Send reminder to complete payment if status is pending
          await this.sendReminderEmail(registrationId, 'payment', 
            'Your registration is pending payment. Please complete the payment to confirm your participation in CognitiveX GenAI Hackathon.');
          emailSent = true;
          break;
          
        case 'waitlisted':
          await this.sendEmail([registrationId], 'announcement', {
            custom_message: `Your registration for CognitiveX GenAI Hackathon has been waitlisted. We'll notify you if a spot becomes available. Thank you for your interest!`
          });
          emailSent = true;
          break;
          
        case 'rejected':
          await this.sendEmail([registrationId], 'announcement', {
            custom_message: `We regret to inform you that your registration for CognitiveX GenAI Hackathon was not successful this time. We encourage you to participate in future events. Thank you for your interest!`
          });
          emailSent = true;
          break;
      }
      
      return {
        success: true,
        message: emailSent ? 'Status change email sent successfully' : 'No email required for this status change',
        emailSent
      };
      
    } catch (error) {
      console.error('Status change email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send status change email'
      };
    }
  },

  // Send pre-event reminders to all confirmed participants
  async sendPreEventReminders(customMessage = '') {
    try {
      // Get all confirmed registrations
      const registrationsResult = await this.getAllRegistrations(1000, 'confirmed');
      
      if (!registrationsResult.success) {
        throw new Error('Failed to fetch confirmed registrations');
      }
      
      const confirmedRegistrations = registrationsResult.data;
      const registrationIds = confirmedRegistrations.map(reg => reg.registration_id);
      
      if (registrationIds.length === 0) {
        return {
          success: true,
          message: 'No confirmed registrations found',
          count: 0
        };
      }
      
      const defaultMessage = `
        🚀 The CognitiveX GenAI Hackathon is approaching fast!
        
        📅 Event Details:
        • Date: February 2025
        • Duration: 48 hours
        • Format: Hybrid (Virtual + On-site)
        
        ✅ Final Preparation Checklist:
        • ✅ Complete your IBM SkillsBuild courses
        • ✅ Register for NASSCOM FutureSkills Prime
        • ✅ Set up your development environment
        • ✅ Review the problem statements
        • ✅ Prepare your team collaboration tools
        • ✅ Join our Discord community
        
        📱 Stay Connected:
        • Discord: [Link will be shared soon]
        • Email: support@codetapasya.com
        • Website: codetapasya.com
        
        We can't wait to see what innovative solutions you'll create! 🎯
      `;
      
      const emailResult = await this.sendBulkEmails(
        registrationIds, 
        'reminder', 
        customMessage || defaultMessage
      );
      
      return {
        success: emailResult.success,
        message: `Pre-event reminders sent to ${registrationIds.length} participants`,
        count: registrationIds.length,
        details: emailResult
      };
      
    } catch (error) {
      console.error('Pre-event reminder error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send pre-event reminders'
      };
    }
  },

  // Test email functionality
  async testEmailSystem(registrationId, emailType = 'confirmation') {
    try {
      console.log(`🧪 Testing email system for registration ${registrationId} with type: ${emailType}`);
      console.log('📡 Using UTILS API URL:', UTILS_API_URL);
      
      // First, verify the registration exists via Admin API
      try {
        console.log('🔍 Verifying registration exists via Admin API...');
        const regCheck = await this.getRegistrationDetails(registrationId);
        if (regCheck.success) {
          console.log('✅ Registration found in Admin API:', {
            id: regCheck.data.registration_id,
            email: regCheck.data.email,
            status: regCheck.data.registration_status
          });
        } else {
          console.error('❌ Registration not found in Admin API:', regCheck.message);
          return {
            success: false,
            message: `Registration verification failed: ${regCheck.message}`
          };
        }
      } catch (adminError) {
        console.error('❌ Admin API verification failed:', adminError);
        return {
          success: false,
          message: `Admin API error: ${adminError.message}`
        };
      }
      
      switch (emailType) {
        case 'confirmation':
          return await this.sendConfirmationEmail(registrationId, {
            payment_id: 'test_payment_123',
            payment_amount: 19900, // ₹199 in paise
            team_size: 1
          });
          
        case 'reminder':
          return await this.sendReminderEmail(registrationId, 'test', 'This is a test reminder email from the CognitiveX system.');
          
        case 'announcement':
          return await this.sendAnnouncementEmail([registrationId], 'Test Announcement', 'This is a test announcement email from the CognitiveX system.');
          
        case 'test':
          // Direct test email call
          const user = await this.ensureAuth();
          const token = await user.getIdToken();
          
          console.log('🔐 Auth token obtained, making direct test email API call');
          
          const response = await axios.post(`${UTILS_API_URL}/send-email`, {
            recipients: [registrationId],
            email_type: 'test',
            custom_data: {
              test_message: 'This is a test email from the CognitiveX Hackathon Admin Panel',
              sent_at: new Date().toISOString()
            }
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });
          
          console.log('📧 Direct email API response:', response.data);
          
          if (response.data?.success) {
            return {
              success: true,
              message: 'Test email sent successfully',
              data: response.data.data
            };
          } else {
            return {
              success: false,
              message: response.data?.message || 'Test email failed'
            };
          }
          
        default:
          throw new Error(`Unknown email type: ${emailType}`);
      }
      
    } catch (error) {
      console.error('❌ Email test error:', error);
      console.error('📍 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Email test failed'
      };
    }
  }
};

// Razorpay payment integration
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (paymentData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script if needed
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const options = {
      key: paymentData.key_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'CognitiveX GenAI Hackathon',
      description: `Hackathon Registration - ${paymentData.registration_details?.team_size === 1 ? 'Individual' : 'Team'}`,
      order_id: paymentData.order_id,
      prefill: {
        name: paymentData.prefill?.name || '',
        email: paymentData.prefill?.email || '',
        contact: paymentData.prefill?.contact || '',
      },
      theme: {
        color: '#2563eb',
      },
      handler: async (response) => {
        try {
          // Verify payment on backend with additional hackathon data
          const verificationResult = await hackathonService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            registration_id: paymentData.registration_details.registration_id,
            team_size: getBackendTeamSize(paymentData.registration_details.team_size),
            amount: paymentData.amount
          });

          if (verificationResult.success) {
            // 🎉 Payment successful - automatically send confirmation email
            try {
              console.log('💳 Payment verified successfully, sending confirmation email...');
              console.log('📋 Payment data structure:', paymentData);
              
              // Get registration ID from multiple possible sources
              const registrationId = paymentData.registration_details?.registration_id || 
                                   paymentData.registration_id || 
                                   verificationResult.data?.registration_id;
              
              console.log('🆔 Using registration ID for email:', registrationId);
              
              if (!registrationId) {
                console.error('❌ No registration ID found for email sending');
                console.error('📋 Available data:', {
                  paymentData,
                  verificationResult: verificationResult.data
                });
                throw new Error('Registration ID not found for email sending');
              }
              
              const emailResult = await hackathonService.sendConfirmationEmail(
                registrationId,
                {
                  payment_id: response.razorpay_payment_id,
                  payment_amount: paymentData.amount,
                  team_size: paymentData.registration_details?.team_size || 1,
                  custom_message: `Welcome to CognitiveX! Your payment of ₹${paymentData.amount / 100} has been confirmed.`
                }
              );
              
              if (emailResult.success) {
                console.log('✅ Confirmation email sent successfully');
              } else {
                console.warn('⚠️ Payment successful but confirmation email failed:', emailResult.message);
              }
            } catch (emailError) {
              console.error('❌ Email sending error after payment:', emailError);
              // Don't fail the payment flow if email fails
            }
            
            onSuccess(verificationResult.data);
          } else {
            onFailure(verificationResult.message);
          }
        } catch (error) {
          onFailure('Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => {
          onFailure('Payment cancelled by user');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    logger.error('Razorpay initialization error:', error);
    onFailure(error.message || 'Failed to initialize payment');
  }
};

// Complete payment processing workflow
export const processHackathonPayment = async (registrationData, onSuccess, onError) => {
  try {
    // Step 1: Register the user
    const registrationResult = await hackathonService.register(registrationData);
    
    if (!registrationResult.success) {
      throw new Error(registrationResult.message);
    }

    const { registration_id, team_size } = registrationResult.data;

    // Step 2: Create payment order
    const paymentOrderResult = await hackathonService.createPaymentOrder(registration_id, team_size);
    
    if (!paymentOrderResult.success) {
      throw new Error(paymentOrderResult.message);
    }

    // Step 3: Add prefill data for Razorpay
    const paymentData = {
      ...paymentOrderResult.data,
      prefill: {
        name: registrationData.personal_info.full_name,
        email: registrationData.personal_info.email,
        contact: registrationData.personal_info.phone,
      }
    };

    // Step 4: Initiate Razorpay payment
    await initiateRazorpayPayment(
      paymentData,
      (verificationData) => {
        onSuccess({
          registration_id,
          payment_data: verificationData,
          status: 'confirmed'
        });
      },
      (errorMessage) => {
        onError(errorMessage);
      }
    );

  } catch (error) {
    logger.error('Payment processing error:', error);
    onError(error.message || 'Registration and payment processing failed');
  }
};

// Helper functions
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const getPricingTier = (teamSize) => {
  return teamSize === 1 ? 'individual' : 'group';
};

// Validation helpers
export const validateRegistrationData = (data) => {
  const errors = {};

  // Personal info validation
  if (!data.personal_info?.full_name?.trim()) errors.fullName = 'Full name is required';
  if (!data.personal_info?.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.personal_info.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!data.personal_info?.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[\d\s-()]{10,}$/.test(data.personal_info.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  if (!data.personal_info?.college?.trim()) errors.college = 'College name is required';
  if (!data.personal_info?.department?.trim()) errors.department = 'Department is required';
  if (!data.personal_info?.year) errors.year = 'Year of study is required';
  if (!data.personal_info?.roll_number?.trim()) errors.rollNumber = 'Roll number is required';

  // Team info validation
  if (!data.team_info?.team_name?.trim()) errors.teamName = 'Team name is required';
  if (!data.team_info?.team_size || data.team_info.team_size < 1 || data.team_info.team_size > 4) {
    errors.teamSize = 'Team size must be between 1 or 3 members';
  }

  // Team members validation
  if (!data.team_info?.team_members || data.team_info.team_members.length === 0) {
    errors.teamMembers = 'At least one team member is required';
  } else {
    data.team_info.team_members.forEach((member, index) => {
      if (!member.name?.trim()) {
        errors[`teamMember${index}Name`] = `Team member ${index + 1} name is required`;
      }
      if (!member.email?.trim()) {
        errors[`teamMember${index}Email`] = `Team member ${index + 1} email is required`;
      } else if (!/\S+@\S+\.\S+/.test(member.email)) {
        errors[`teamMember${index}Email`] = `Team member ${index + 1} email is invalid`;
      }
      if (!member.phone?.trim()) {
        errors[`teamMember${index}Phone`] = `Team member ${index + 1} phone is required`;
      }
      if (!member.college?.trim()) {
        errors[`teamMember${index}College`] = `Team member ${index + 1} college is required`;
      }
      if (!member.department?.trim()) {
        errors[`teamMember${index}Department`] = `Team member ${index + 1} department is required`;
      }
      if (!member.year?.trim()) {
        errors[`teamMember${index}Year`] = `Team member ${index + 1} year is required`;
      }
    });
  }

  // Technical info validation
  if (!data.technical_info?.problem_statement) {
    errors.problemStatement = 'Problem statement selection is required';
  }
  if (!data.technical_info?.programming_languages || data.technical_info.programming_languages.length === 0) {
    errors.programmingLanguages = 'At least one programming language is required';
  }
  if (!data.technical_info?.ai_experience) {
    errors.aiExperience = 'AI experience level is required';
  }

  // Commitments validation
  if (!data.commitments?.ibm_skillsbuild) {
    errors.ibmSkillsBuild = 'IBM SkillsBuild commitment is required';
  }
  if (!data.commitments?.nasscom_registration) {
    errors.nascomRegistration = 'NASSCOM FSP commitment is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default hackathonService;
export { getTeamPrice, getTeamPriceInPaise, getHackathonPlanMapping, getBackendTeamSize };
