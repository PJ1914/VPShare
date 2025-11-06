import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import './AdminBadge.css';

const AdminBadge = ({ user }) => {
  if (!user?.isAdmin) return null;

  return (
    <motion.div
      className="admin-badge-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-badge">
        <Shield size={20} className="admin-icon" />
        <div className="admin-content">
          <h3>Admin Access Granted</h3>
          <div className="admin-perks">
            <div className="perk-item">
              <Check size={16} />
              <span>Full Subscription Access</span>
            </div>
            <div className="perk-item">
              <Check size={16} />
              <span>All Courses Unlocked</span>
            </div>
            <div className="perk-item">
              <Check size={16} />
              <span>Private Routes Available</span>
            </div>
            <div className="perk-item">
              <Check size={16} />
              <span>Testing & Development</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminBadge;
