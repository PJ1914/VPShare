import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

// XP Rewards Configuration
export const XP_REWARDS = {
  completedLesson: 50,
  completedModule: 200,
  completedCourse: 1000,
  perfectQuiz: 100,
  dailyStreak: 25,
  projectSubmitted: 300,
  helpedPeer: 50,
  attendedLiveClass: 150
};

// Level Configuration
export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 500, title: "Novice" },
  { level: 3, xpRequired: 1500, title: "Intermediate" },
  { level: 4, xpRequired: 3000, title: "Advanced" },
  { level: 5, xpRequired: 5000, title: "Expert" },
  { level: 6, xpRequired: 8000, title: "Master" },
  { level: 7, xpRequired: 12000, title: "Guru" },
  { level: 8, xpRequired: 17000, title: "Legend" },
  { level: 9, xpRequired: 23000, title: "Elite" },
  { level: 10, xpRequired: 30000, title: "God Mode" }
];

// Calculate level from XP
export const calculateLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

// Check if user is enrolled in Live Classes
export const isEnrolledInLiveClasses = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.enrollments?.liveClasses?.enrolled || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

// Enroll user in Live Classes
export const enrollInLiveClasses = async (userId, paymentDetails) => {
  try {
    const enrollmentData = {
      enrolled: true,
      enrolledAt: serverTimestamp(),
      paymentId: paymentDetails.paymentId,
      startDate: '2025-11-10',
      status: 'active',
      plan: paymentDetails.plan || 'solo',
      amount: paymentDetails.amount || 10199
    };

    // Update user document
    await setDoc(doc(db, 'users', userId), {
      enrollments: {
        liveClasses: enrollmentData
      },
      subscription: {
        type: 'premium',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }, { merge: true });

    // Create enrollment document
    const enrollmentId = `${userId}_liveClasses_${Date.now()}`;
    await setDoc(doc(db, 'enrollments', enrollmentId), {
      userId,
      courseType: 'liveClasses',
      enrolledAt: serverTimestamp(),
      paymentDetails,
      progress: {
        currentModule: 1,
        currentWeek: 1,
        completedWeeks: []
      }
    });

    // Initialize gamification if not exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.data()?.gamification) {
      await initializeGamification(userId);
    }

    return { success: true, enrollmentId };
  } catch (error) {
    console.error('Error enrolling user:', error);
    return { success: false, error: error.message };
  }
};

// Initialize gamification for user
export const initializeGamification = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      gamification: {
        xp: 0,
        level: 1,
        streak: 0,
        bestStreak: 0,
        achievements: [],
        studyTime: 0,
        lastActiveDate: serverTimestamp()
      }
    }, { merge: true });
  } catch (error) {
    console.error('Error initializing gamification:', error);
  }
};

// Award XP to user
export const awardXP = async (userId, xpAmount, reason) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;

    const currentData = userDoc.data();
    const currentXP = currentData.gamification?.xp || 0;
    const currentLevel = currentData.gamification?.level || 1;
    
    const newXP = currentXP + xpAmount;
    const newLevelData = calculateLevel(newXP);

    await updateDoc(doc(db, 'users', userId), {
      'gamification.xp': newXP,
      'gamification.level': newLevelData.level
    });

    return {
      leveledUp: newLevelData.level > currentLevel,
      newLevel: newLevelData,
      xpEarned: xpAmount,
      reason
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return null;
  }
};

// Update user streak
export const updateStreak = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const lastActive = userData.gamification?.lastActiveDate?.toDate();
    const currentStreak = userData.gamification?.streak || 0;
    const bestStreak = userData.gamification?.bestStreak || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = currentStreak;

    if (lastActive) {
      const lastActiveDay = new Date(lastActive);
      lastActiveDay.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

      if (daysDifference === 0) {
        // Same day, no change
        return;
      } else if (daysDifference === 1) {
        // Consecutive day
        newStreak = currentStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newBestStreak = Math.max(bestStreak, newStreak);

    await updateDoc(doc(db, 'users', userId), {
      'gamification.streak': newStreak,
      'gamification.bestStreak': newBestStreak,
      'gamification.lastActiveDate': serverTimestamp()
    });

    // Award streak bonus XP
    if (newStreak > 0) {
      await awardXP(userId, XP_REWARDS.dailyStreak, 'Daily streak bonus');
    }

    return { streak: newStreak, bestStreak: newBestStreak };
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

// Get user gamification data
export const getGamificationData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.gamification || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting gamification data:', error);
    return null;
  }
};

// Unlock achievement
export const unlockAchievement = async (userId, achievementId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return;

    const currentAchievements = userDoc.data()?.gamification?.achievements || [];
    
    if (!currentAchievements.includes(achievementId)) {
      await updateDoc(doc(db, 'users', userId), {
        'gamification.achievements': [...currentAchievements, achievementId]
      });

      // Award XP for achievement
      await awardXP(userId, 100, `Achievement unlocked: ${achievementId}`);

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return false;
  }
};
