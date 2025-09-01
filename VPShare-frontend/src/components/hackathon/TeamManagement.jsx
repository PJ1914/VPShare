import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  UserPlus, 
  LogOut, 
  Settings, 
  Copy, 
  Check,
  AlertCircle,
  Info,
  Edit,
  Save,
  X
} from 'lucide-react';
import teamService from '../../services/teamService';
import { NotificationContext } from '../../contexts/NotificationContext';
import './TeamManagement.css';

const TeamManagement = ({ user, teamData, onTeamUpdate }) => {
  const { showNotification } = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [teamCode, setTeamCode] = useState('');
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (teamData) {
      setTeamForm({
        name: teamData.name,
        description: teamData.description || ''
      });
    }
  }, [teamData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await teamService.createTeam(teamForm);
      
      if (result.success) {
        showNotification(result.message, 'success');
        setActiveAction(null);
        onTeamUpdate();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to create team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await teamService.joinTeam(teamCode);
      
      if (result.success) {
        showNotification(result.message, 'success');
        setActiveAction(null);
        setTeamCode('');
        onTeamUpdate();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to join team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await teamService.updateTeam(teamData.id, teamForm);
      
      if (result.success) {
        showNotification(result.message, 'success');
        setEditMode(false);
        onTeamUpdate();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to update team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await teamService.leaveTeam();
      
      if (result.success) {
        showNotification(result.message, 'success');
        onTeamUpdate();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to leave team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyTeamCode = async () => {
    try {
      await navigator.clipboard.writeText(teamData.teamCode);
      setCodeCopied(true);
      showNotification('Team code copied to clipboard!', 'success');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      showNotification('Failed to copy team code', 'error');
    }
  };

  const isTeamLeader = teamData && teamData.leaderId === user?.uid;

  if (!teamData) {
    return (
      <div className="team-management">
        <div className="team-management-header">
          <Users className="team-icon" />
          <h3>Team Management</h3>
          <p>Join an existing team or create your own to participate in CodeKurukshetra</p>
        </div>

        {!activeAction && (
          <div className="team-actions">
            <motion.button
              className="action-button primary"
              onClick={() => setActiveAction('create')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Crown className="button-icon" />
              Create Team
            </motion.button>

            <motion.button
              className="action-button secondary"
              onClick={() => setActiveAction('join')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="button-icon" />
              Join Team
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {activeAction === 'create' && (
            <motion.div
              className="team-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h4>Create New Team</h4>
              <form onSubmit={handleCreateTeam}>
                <div className="form-group">
                  <label>Team Name</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    placeholder="Enter team name..."
                    required
                    minLength={3}
                  />
                </div>

                <div className="form-group">
                  <label>Team Description</label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                    placeholder="Brief description of your team..."
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setActiveAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeAction === 'join' && (
            <motion.div
              className="team-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h4>Join Existing Team</h4>
              <form onSubmit={handleJoinTeam}>
                <div className="form-group">
                  <label>Team Code</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character team code..."
                    maxLength={6}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setActiveAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading || teamCode.length !== 6}
                  >
                    {loading ? 'Joining...' : 'Join Team'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="team-info">
          <div className="info-item">
            <Info className="info-icon" />
            <span>Teams can have up to 4 members maximum</span>
          </div>
          <div className="info-item">
            <AlertCircle className="info-icon" />
            <span>You can only be part of one team at a time</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-management">
      <div className="team-management-header">
        <Users className="team-icon" />
        <div className="team-title">
          {editMode ? (
            <form onSubmit={handleUpdateTeam} className="edit-form">
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                className="edit-input"
                required
              />
              <div className="edit-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  <Save size={16} />
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setEditMode(false);
                    setTeamForm({
                      name: teamData.name,
                      description: teamData.description || ''
                    });
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3>{teamData.name}</h3>
              {isTeamLeader && (
                <button
                  className="edit-button"
                  onClick={() => setEditMode(true)}
                >
                  <Edit size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="team-code-section">
        <div className="team-code">
          <span>Team Code: <strong>{teamData.teamCode}</strong></span>
          <button
            className={`copy-button ${codeCopied ? 'copied' : ''}`}
            onClick={copyTeamCode}
          >
            {codeCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="team-code-info">Share this code with others to invite them to your team</p>
      </div>

      <div className="team-members">
        <h4>Team Members ({teamData.members.length}/{teamData.maxMembers})</h4>
        <div className="members-list">
          {teamData.members.map((member, index) => (
            <motion.div
              key={member.userId}
              className="member-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="member-info">
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-details">
                  <span className="member-name">{member.name}</span>
                  <span className="member-email">{member.email}</span>
                </div>
              </div>
              <div className="member-role">
                {member.role === 'leader' && <Crown className="leader-icon" />}
                <span className={member.role}>{member.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {teamData.description && (
        <div className="team-description">
          <h4>Team Description</h4>
          {editMode ? (
            <textarea
              value={teamForm.description}
              onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
              className="edit-textarea"
              rows={3}
            />
          ) : (
            <p>{teamData.description}</p>
          )}
        </div>
      )}

      <div className="team-actions">
        <motion.button
          className="action-button danger"
          onClick={handleLeaveTeam}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          <LogOut className="button-icon" />
          Leave Team
        </motion.button>
      </div>
    </div>
  );
};

export default TeamManagement;
