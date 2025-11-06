import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Clock } from 'lucide-react';
import { LEVELS } from '../../services/enrollmentService';
import '../../styles/GamificationStats.css';

const GamificationStats = ({ gamificationData }) => {
  if (!gamificationData) return null;

  const { xp, level, streak, bestStreak, studyTime } = gamificationData;
  
  const currentLevel = LEVELS.find(l => l.level === level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === level + 1);
  
  const progressToNextLevel = nextLevel 
    ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  const formatStudyTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="gamification-stats">
      {/* XP & Level Card */}
      <motion.div
        className="stat-card xp-card"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="stat-icon">
          <Zap size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">XP Points</div>
          <div className="stat-value">{xp.toLocaleString()} XP</div>
          <div className="stat-subtitle">Level {level} • {currentLevel.title}</div>
          
          {nextLevel && (
            <div className="xp-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="progress-text">
                {nextLevel.xpRequired - xp} XP to Level {level + 1}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        className="stat-card streak-card"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="stat-icon fire-icon">
          <Flame size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Study Streak</div>
          <div className="stat-value">
            {streak} Days
            {streak > 0 && <span className="fire-emoji">🔥</span>}
          </div>
          <div className="stat-subtitle">Best: {bestStreak} days</div>
        </div>
      </motion.div>

      {/* Study Time Card */}
      <motion.div
        className="stat-card time-card"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="stat-icon">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Study Time</div>
          <div className="stat-value">{formatStudyTime(studyTime || 0)}</div>
          <div className="stat-subtitle">This week</div>
        </div>
      </motion.div>

      {/* Achievements Card */}
      <motion.div
        className="stat-card achievements-card"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="stat-icon">
          <Trophy size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Achievements</div>
          <div className="stat-value">{gamificationData.achievements?.length || 0}</div>
          <div className="stat-subtitle">Unlocked</div>
        </div>
      </motion.div>
    </div>
  );
};

export default GamificationStats;
