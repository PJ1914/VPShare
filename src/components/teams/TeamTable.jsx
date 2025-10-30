// src/components/teams/TeamTable.jsx
import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Edit2,
  Trash2,
  Eye,
  MoreHorizontal,
  Mail,
  MoreVertical,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import "../../styles/TeamTable.css";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: 'bg-emerald-900/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Active',
    },
    submitted: {
      icon: <Clock className="w-4 h-4" />,
      bg: 'bg-amber-900/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Submitted',
    },
    registered: {
      icon: <Clock className="w-4 h-4" />,
      bg: 'bg-blue-900/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      label: 'Registered',
    },
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: 'bg-purple-900/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      label: 'Completed',
    },
    inactive: {
      icon: <XCircle className="w-4 h-4" />,
      bg: 'bg-red-900/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      label: 'Inactive',
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4" />,
      bg: 'bg-amber-900/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Needs Attention',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}
    >
      <span className="mr-1.5">{config.icon}</span>
      {config.label}
    </div>
  );
};

const MemberAvatars = ({ members = [] }) => {
  const visibleMembers = members.slice(0, 3);
  const remainingCount = members.length > 3 ? members.length - 3 : 0;

  return (
    <div className="flex -space-x-2">
      {visibleMembers.map((member, index) => (
        <div
          key={index}
          className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium border-2 border-slate-800"
          title={member.name || `Member ${index + 1}`}
        >
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (member.name || 'U').charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-medium border-2 border-slate-800">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

const statusIcons = {
  active: <CheckCircle size={16} className="text-green-500" />,
  pending: <Clock size={16} className="text-amber-500" />,
  inactive: <XCircle size={16} className="text-gray-400" />,
  completed: <CheckCircle size={16} className="text-blue-500" />,
};

const statusLabels = {
  active: 'Active',
  registered: 'Registered',
  pending: 'Pending',
  inactive: 'Inactive',
  completed: 'Completed',
};

// Helper function to determine team status
const getTeamStatus = (team) => {
  if (team.status) return team.status;
  if (team.payment_id && team.order_id) return 'active';
  if (team.members && team.members.length > 0) return 'registered';
  return 'pending';
};

const TeamTable = ({ teams = [], onEdit, onDelete, onView, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="empty-state">
        <Users className="empty-icon" />
        <h3>No teams found</h3>
        <p>Get started by creating a new team or adjust your search filters.</p>
      </div>
    );
  }

  return (
    <div className="team-table-container">
      <table className="team-table">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Team Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Members
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {teams.map((team) => (
            <tr
              key={team.leaderUid || team.id}
              className="hover:bg-slate-800/30 transition-colors duration-200"
            >
              <td 
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => onView && onView(team)}
              >
                <div>
                  <div className="team-name">{team.teamname || team.team_name}</div>
                  <div className="team-email">
                    <Mail className="h-3 w-3 mr-1" />
                    {team.members?.[0]?.email || team.leader_email || 'No email'}
                  </div>
                </div>
              </td>
              <td 
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => onView && onView(team)}
              >
                <div className="project-name">{team.problem_statement || team.project_name || '—'}</div>
                {team.order_id && (
                  <div className="project-domain">Order: {team.order_id}</div>
                )}
              </td>
              <td 
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => onView && onView(team)}
              >
                <div className="text-sm text-slate-300 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-slate-400" />
                  {team.members?.length || team.teamsize || team.members_count || 0} members
                </div>
              </td>
              <td 
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => onView && onView(team)}
              >
                {(() => {
                  const status = getTeamStatus(team);
                  return (
                    <span className={`status-badge ${
                      status === 'active' ? 'bg-emerald-900/20 text-emerald-400' :
                      status === 'registered' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' :
                      status === 'pending' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' :
                      status === 'completed' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/30' :
                      'bg-slate-800/50 text-slate-400 border border-slate-600/30'
                    }`}>
                      {statusIcons[status] || <Clock size={16} className="text-slate-400" />}
                      <span className="ml-1">{statusLabels[status] || status}</span>
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center justify-end gap-2">

    {/* View Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onView && onView(team);
      }}
      className="action-btn view"
      data-tooltip="View details"
      aria-label="View team details"
    >
      <span className="action-btn-bg"></span>
      <Eye size={16} />
    </button>

    {/* Edit Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit(team);
      }}
      className="action-btn edit"
      data-tooltip="Edit team"
      aria-label="Edit team"
    >
      <span className="action-btn-bg"></span>
      <Edit2 size={16} />
    </button>

    {/* Delete Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(team.id);
      }}
      className="action-btn delete"
      data-tooltip="Delete team"
      aria-label="Delete team"
    >
      <span className="action-btn-bg"></span>
      <Trash2 size={16} />
    </button>

   

  </div>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
