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
const PAYMENT_API_URL = import.meta.env.VITE_API_BASE_URL;

// Development mode check
const isDevelopment = config.isDevelopment;

// Team pricing configuration with Lambda-compatible plans
const getTeamPrice = (teamSize) => {
  switch (teamSize) {
    case 1:
      return 199; // ₹199 for individual (19900 paise)
    case 2:
    case 3:
      return 549; // ₹549 for 2-3 member team (54900 paise)
    case 4:
      return 699; // ₹699 for 4-member team (69900 paise)
    default:
      return 199; // Default to individual pricing
  }
};

// Map hackathon plans to existing payment plans that Lambda recognizes
const getHackathonPlanMapping = (teamSize) => {
  // Use existing plan names that Lambda already handles
  switch (teamSize) {
    case 1:
      return { plan: 'one-day', amount: 19900 }; // Map to existing one-day plan structure
    case 2:
    case 3:
      return { plan: 'weekly', amount: 54900 }; // Map to existing weekly plan structure
    case 4:
      return { plan: 'monthly', amount: 69900 }; // Map to existing monthly plan structure
    default:
      return { plan: 'one-day', amount: 19900 };
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

const paymentAPI = axios.create({
  baseURL: PAYMENT_API_URL,
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
addAuthInterceptor(paymentAPI);

// Hackathon Service
const hackathonService = {
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
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Step 1: Save user profile to Firestore
      const profileResult = await this.saveUserProfile(registrationData.personal_info);
      if (!profileResult.success) {
        throw new Error(profileResult.message);
      }

      // Step 2: Create team in Firestore
      const teamResult = await this.createTeam(registrationData.team_info, registrationData.personal_info);
      if (!teamResult.success) {
        throw new Error(teamResult.message);
      }

      // Step 3: Register core data in DynamoDB via backend API
      const token = await user.getIdToken();
      
      const coreRegistrationData = {
        user_id: user.uid,
        team_info: {
          team_name: registrationData.team_info.team_name,
          team_size: registrationData.team_info.team_size,
          team_lead_email: registrationData.personal_info.email,
          team_id: teamResult.data.team_id
        },
        technical_info: registrationData.technical_info,
        registration_status: 'pending_payment'
      };

      const response = await hackathonAPI.post('/register', coreRegistrationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Backend registration failed');
      }

      // Step 4: Save commitments to Firestore with registration ID
      const registrationId = response.data.registration_id;
      const commitmentsResult = await this.saveCommitments(
        registrationId, 
        registrationData.commitments, 
        registrationData.additional_info
      );
      
      if (!commitmentsResult.success) {
        logger.warn('Failed to save commitments:', commitmentsResult.message);
      }

      return {
        success: true,
        data: {
          registration_id: registrationId,
          team_id: teamResult.data.team_id,
          team_size: registrationData.team_info.team_size
        },
        message: 'Registration completed successfully'
      };
    } catch (error) {
      // Enhanced error handling for development
      if (isDevelopment) {
        logger.info('Registration API not available, using development mode');
        
        // Return mock data for development
        const mockRegistrationId = `reg_dev_${Date.now()}`;
        const mockTeamId = `team_dev_${Date.now()}`;
        
        // Still save to Firebase in development
        await this.saveCommitments(
          mockRegistrationId, 
          registrationData.commitments, 
          registrationData.additional_info
        );
        
        return {
          success: true,
          data: {
            registration_id: mockRegistrationId,
            team_id: mockTeamId,
            team_size: registrationData.team_info.team_size
          },
          message: 'Registration completed successfully (Development Mode)'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Registration failed',
        error: error,
        isNetworkError: error.code === 'ERR_NETWORK' || error.message.includes('Network Error')
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
      
      const response = await hackathonAPI.get(`/registration/${registrationId}`, { headers });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
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
        amount: amount, // Amount should already be in paise (19900, 54900, 69900)
        team_size: teamSize
      };
      
      const response = await paymentAPI.post('/create-order', paymentData, {
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
            amount: amount * 100, // Razorpay expects amount in paise
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
        plan: `hackathon_${paymentData.team_size === 1 ? 'individual' : 'team'}`,
        amount: paymentData.amount,
        email: user.email
      };
      
      const response = await paymentAPI.post('/verify-payment', verificationData, {
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
          title: 'AI-Powered Healthcare Solution',
          description: 'Develop an AI solution to improve healthcare diagnostics and patient care.',
          category: 'Healthcare',
          difficulty: 'Medium',
          tags: ['AI', 'Machine Learning', 'Healthcare']
        },
        {
          id: 'p2', 
          title: 'Sustainable Smart City Platform',
          description: 'Create a platform to optimize city resources and reduce environmental impact.',
          category: 'Sustainability',
          difficulty: 'Hard',
          tags: ['IoT', 'Sustainability', 'Smart City']
        },
        {
          id: 'p3',
          title: 'Financial Inclusion App',
          description: 'Build an app to provide financial services to underbanked populations.',
          category: 'Fintech',
          difficulty: 'Medium',
          tags: ['Fintech', 'Mobile', 'Inclusion']
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
          title: 'AI-Powered Healthcare Solution',
          description: 'Develop an AI solution to improve healthcare diagnostics and patient care.',
          category: 'Healthcare',
          difficulty: 'Medium',
          tags: ['AI', 'Machine Learning', 'Healthcare']
        },
        {
          id: 'p2', 
          title: 'Sustainable Smart City Platform',
          description: 'Create a platform to optimize city resources and reduce environmental impact.',
          category: 'Sustainability',
          difficulty: 'Hard',
          tags: ['IoT', 'Sustainability', 'Smart City']
        },
        {
          id: 'p3',
          title: 'Financial Inclusion App',
          description: 'Build an app to provide financial services to underbanked populations.',
          category: 'Fintech',
          difficulty: 'Medium',
          tags: ['Fintech', 'Mobile', 'Inclusion']
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
      const amount = getTeamPrice(teamSize) * 100; // Convert to paise
      
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
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to create payment order',
        error: error.response?.data
      };
    }
  },

  async verifyPayment(paymentData) {
    try {
      const response = await paymentAPI.post('/verify-payment', {
        payment_type: 'hackathon',
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
        registration_id: paymentData.registration_id,
        team_size: paymentData.team_size,
        amount: paymentData.amount
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.status || 'Payment verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Payment verification failed',
        error: error.response?.data
      };
    }
  },

  // Admin APIs
  async getAllRegistrations(limit = 50, status = null) {
    try {
      const params = { limit };
      if (status) params.status = status;
      
      const response = await adminAPI.get('/registrations', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch registrations',
        error: error.response?.data
      };
    }
  },

  async getRegistrationStats() {
    try {
      const response = await adminAPI.get('/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch stats',
        error: error.response?.data
      };
    }
  },

  async updateRegistrationStatus(registrationId, newStatus, adminNotes = '') {
    try {
      const response = await adminAPI.put('/status', {
        registration_id: registrationId,
        new_status: newStatus,
        admin_notes: adminNotes
      });
      return {
        success: true,
        data: response.data,
        message: 'Registration status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update registration status',
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
      const response = await utilsAPI.get(`/export`, {
        params: { format, type }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to export data',
        error: error.response?.data
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
            team_size: paymentData.registration_details.team_size,
            amount: paymentData.amount
          });

          if (verificationResult.success) {
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
    errors.teamSize = 'Team size must be between 1-4 members';
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
export { getTeamPrice, getHackathonPlanMapping };
