/**
 * Admin Utilities
 * Handles admin user verification and permissions
 */

// List of admin emails with full access
const ADMIN_EMAILS = [
  'pranay.jumbarthi1905@gmail.com',
  'vishnutej49@gmail.com',
  'javajiharshithapriya@gmail.com',
  'nadukulahemanth3@gmail.com',
  'saandeepsaiturpu@gmail.com',
  'charanpagadala2004@gmail.com',
];

/**
 * Check if an email is an admin
 * @param {string} email - User email to check
 * @returns {boolean} - True if user is admin
 */
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Check if current user is admin
 * @param {object} user - Firebase user object
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  if (!user || !user.email) return false;
  return isAdminEmail(user.email);
};

/**
 * Get admin subscription data (unlimited access)
 * @returns {object} - Admin subscription data
 */
export const getAdminSubscription = () => {
  return {
    hasSubscription: true,
    plan: 'admin',
    status: 'active',
    expiresAt: new Date('2099-12-31'), // Far future date
    isAdmin: true,
    loading: false
  };
};

/**
 * Check if user has admin access to a specific feature
 * @param {object} user - Firebase user object
 * @param {string} feature - Feature to check (optional)
 * @returns {boolean} - True if user has access
 */
export const hasAdminAccess = (user, feature = null) => {
  if (!isAdmin(user)) return false;
  
  // Admin has access to all features
  // You can add feature-specific logic here if needed
  return true;
};

export default {
  isAdminEmail,
  isAdmin,
  getAdminSubscription,
  hasAdminAccess,
  ADMIN_EMAILS
};
