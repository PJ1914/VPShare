import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

/**
 * Group Enrollment Verification System
 * 
 * Verification Process:
 * 1. Leader creates group and adds member emails
 * 2. System sends verification emails to all members
 * 3. Each member must verify via unique link (24-hour expiry)
 * 4. Payment unlocks only after minimum 3 verifications
 * 5. All members get enrolled after successful payment
 */

// Generate unique verification token
const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Create group enrollment request
export const createGroupEnrollment = async (groupData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be logged in');
  }

  // Validate minimum group size
  if (groupData.members.length < 2) {
    throw new Error('Group must have at least 3 members including you');
  }

  // Check if leader email is included
  const leaderEmail = user.email;
  const allEmails = [leaderEmail, ...groupData.members.map(m => m.email)];
  
  if (allEmails.length < 3) {
    throw new Error('Group must have minimum 3 students');
  }

  // Check for duplicate emails
  const uniqueEmails = new Set(allEmails);
  if (uniqueEmails.size !== allEmails.length) {
    throw new Error('Duplicate emails found. Each student must have unique email.');
  }

  // Create group document
  const groupRef = await addDoc(collection(db, 'groupEnrollments'), {
    leaderId: user.uid,
    leaderEmail: user.email,
    leaderName: user.displayName || 'Group Leader',
    course: 'live-classes',
    status: 'pending_verification',
    members: allEmails.map((email, index) => ({
      email,
      name: index === 0 ? user.displayName : groupData.members[index - 1].name,
      verified: index === 0, // Leader is auto-verified
      verificationToken: index === 0 ? null : generateVerificationToken(),
      verificationSentAt: serverTimestamp(),
      verificationExpiry: index === 0 ? null : Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      verifiedAt: index === 0 ? serverTimestamp() : null,
    })),
    totalMembers: allEmails.length,
    verifiedCount: 1, // Leader is already verified
    pricePerStudent: 5199,
    totalAmount: allEmails.length * 5199,
    paymentStatus: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days to complete verification
  });

  // Send verification emails to all members (except leader)
  await sendVerificationEmails(groupRef.id, groupData.members);

  return {
    groupId: groupRef.id,
    verificationRequired: groupData.members.length,
    expiresIn: '7 days',
    message: 'Verification emails sent to all members',
  };
};

// Send verification emails
const sendVerificationEmails = async (groupId, members) => {
  const groupDoc = await getDoc(doc(db, 'groupEnrollments', groupId));
  const groupData = groupDoc.data();

  // Get verification links for each member
  const verificationLinks = groupData.members
    .filter(m => !m.verified)
    .map(m => ({
      email: m.email,
      name: m.name,
      link: `${window.location.origin}/verify-group?token=${m.verificationToken}&groupId=${groupId}`,
      expiry: new Date(m.verificationExpiry).toLocaleString(),
    }));

  // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('Verification emails to send:', verificationLinks);

  // For now, store in Firestore for manual email sending or email service integration
  await addDoc(collection(db, 'emailQueue'), {
    type: 'group_verification',
    groupId,
    leaderEmail: groupData.leaderEmail,
    recipients: verificationLinks,
    createdAt: serverTimestamp(),
    processed: false,
  });

  return verificationLinks;
};

// Verify member email
export const verifyGroupMember = async (token, groupId) => {
  const groupRef = doc(db, 'groupEnrollments', groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error('Invalid verification link');
  }

  const groupData = groupDoc.data();

  // Check if group enrollment has expired
  if (groupData.expiresAt < Date.now()) {
    throw new Error('Verification link has expired. Please create a new group enrollment.');
  }

  // Find member with this token
  const memberIndex = groupData.members.findIndex(m => m.verificationToken === token);

  if (memberIndex === -1) {
    throw new Error('Invalid verification token');
  }

  const member = groupData.members[memberIndex];

  // Check if already verified
  if (member.verified) {
    return {
      success: true,
      message: 'Email already verified',
      groupStatus: groupData.status,
    };
  }

  // Check if token has expired
  if (member.verificationExpiry < Date.now()) {
    throw new Error('Verification token has expired. Please request a new one.');
  }

  // Update member verification status
  groupData.members[memberIndex].verified = true;
  groupData.members[memberIndex].verifiedAt = serverTimestamp();
  groupData.verifiedCount += 1;

  // Update group status if minimum verified
  if (groupData.verifiedCount >= 3 && groupData.status === 'pending_verification') {
    groupData.status = 'verified_ready_for_payment';
  }

  await updateDoc(groupRef, {
    members: groupData.members,
    verifiedCount: groupData.verifiedCount,
    status: groupData.status,
  });

  return {
    success: true,
    message: 'Email verified successfully!',
    verifiedCount: groupData.verifiedCount,
    totalMembers: groupData.totalMembers,
    readyForPayment: groupData.verifiedCount >= 3,
    groupStatus: groupData.status,
  };
};

// Check if group is ready for payment
export const checkGroupPaymentEligibility = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groupEnrollments', groupId));

  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const groupData = groupDoc.data();

  return {
    eligible: groupData.verifiedCount >= 3,
    verifiedCount: groupData.verifiedCount,
    totalMembers: groupData.totalMembers,
    pricePerStudent: groupData.pricePerStudent,
    totalAmount: groupData.totalAmount,
    status: groupData.status,
    pendingVerifications: groupData.members.filter(m => !m.verified).map(m => ({
      email: m.email,
      name: m.name,
    })),
  };
};

// Process group payment after successful transaction
export const processGroupPayment = async (groupId, paymentDetails) => {
  const groupRef = doc(db, 'groupEnrollments', groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const groupData = groupDoc.data();

  // Verify minimum members are verified
  if (groupData.verifiedCount < 3) {
    throw new Error('Minimum 3 verified members required for payment');
  }

  // Update group payment status
  await updateDoc(groupRef, {
    paymentStatus: 'completed',
    paymentDetails: {
      ...paymentDetails,
      paidAt: serverTimestamp(),
    },
    status: 'enrolled',
  });

  // Enroll all verified members
  const enrollmentPromises = groupData.members
    .filter(m => m.verified)
    .map(async (member) => {
      // Create individual enrollment for each member
      return await addDoc(collection(db, 'liveClassesEnrollments'), {
        email: member.email,
        name: member.name,
        enrollmentType: 'group',
        groupId: groupId,
        pricePerStudent: groupData.pricePerStudent,
        enrolledAt: serverTimestamp(),
        paymentStatus: 'completed',
        groupLeader: groupData.leaderEmail,
        gamification: {
          xp: 500, // Initial bonus XP
          level: 1,
          streak: 0,
          bestStreak: 0,
          studyTime: 0,
          achievements: [{
            id: 'group_enrollment',
            name: 'Team Player',
            description: 'Enrolled in Live Classes with a group',
            unlockedAt: serverTimestamp(),
            icon: '👥'
          }]
        }
      });
    });

  await Promise.all(enrollmentPromises);

  return {
    success: true,
    enrolledMembers: groupData.verifiedCount,
    message: 'All verified members have been enrolled successfully!',
  };
};

// Get group enrollment status
export const getGroupEnrollmentStatus = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groupEnrollments', groupId));

  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const groupData = groupDoc.data();

  return {
    groupId,
    status: groupData.status,
    leaderId: groupData.leaderId,
    leaderEmail: groupData.leaderEmail,
    totalMembers: groupData.totalMembers,
    verifiedCount: groupData.verifiedCount,
    pricePerStudent: groupData.pricePerStudent,
    totalAmount: groupData.totalAmount,
    paymentStatus: groupData.paymentStatus,
    members: groupData.members.map(m => ({
      email: m.email,
      name: m.name,
      verified: m.verified,
      verifiedAt: m.verifiedAt,
    })),
    createdAt: groupData.createdAt,
    expiresAt: groupData.expiresAt,
  };
};

// Resend verification email
export const resendVerificationEmail = async (groupId, memberEmail) => {
  const groupRef = doc(db, 'groupEnrollments', groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const groupData = groupDoc.data();
  const memberIndex = groupData.members.findIndex(m => m.email === memberEmail);

  if (memberIndex === -1) {
    throw new Error('Member not found in group');
  }

  if (groupData.members[memberIndex].verified) {
    throw new Error('Member already verified');
  }

  // Generate new token and expiry
  const newToken = generateVerificationToken();
  const newExpiry = Date.now() + (24 * 60 * 60 * 1000);

  groupData.members[memberIndex].verificationToken = newToken;
  groupData.members[memberIndex].verificationExpiry = newExpiry;
  groupData.members[memberIndex].verificationSentAt = serverTimestamp();

  await updateDoc(groupRef, {
    members: groupData.members,
  });

  // Send new verification email
  await sendVerificationEmails(groupId, [groupData.members[memberIndex]]);

  return {
    success: true,
    message: 'Verification email resent successfully',
  };
};

export default {
  createGroupEnrollment,
  verifyGroupMember,
  checkGroupPaymentEligibility,
  processGroupPayment,
  getGroupEnrollmentStatus,
  resendVerificationEmail,
};
