// src/components/teams/TeamDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Mail,
  Phone,
  GraduationCap,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  Building2,
  Trophy,
  Trash2,
  Mail as MailIcon,
  Download,
  MoreVertical,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../../styles/TeamDetailModal.css';

const TeamDetailModal = ({ team, isOpen, onClose }) => {
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [direction, setDirection] = useState('right');
  
  useEffect(() => {
    if (!isOpen) return;
    setCurrentMemberIndex(0);
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  const nextMember = () => {
    setDirection('left');
    setCurrentMemberIndex(prev => 
      prev >= (team.members?.length - 1) ? 0 : prev + 1
    );
  };

  const prevMember = () => {
    setDirection('right');
    setCurrentMemberIndex(prev => 
      prev <= 0 ? (team.members?.length - 1) || 0 : prev - 1
    );
  };

  // Auto-rotate members every 5 seconds if there are multiple members
  useEffect(() => {
    if (!team.members || team.members.length <= 1) return;
    
    const timer = setTimeout(() => {
      nextMember();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentMemberIndex, team.members]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'completed':
        return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'registered':
        return <Users className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30';
      case 'completed':
        return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'registered':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default:
        return 'text-amber-400 bg-amber-900/20 border-amber-500/30';
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Technical Lead': 'bg-purple-900/20 text-purple-300 border-purple-500/30',
      'Student Coordinator': 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      'Developer': 'bg-green-900/20 text-green-300 border-green-500/30',
      'Designer': 'bg-pink-900/20 text-pink-300 border-pink-500/30',
      'Volunteer': 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30',
      'Data Scientist': 'bg-indigo-900/20 text-indigo-300 border-indigo-500/30',
      'ML Engineer': 'bg-cyan-900/20 text-cyan-300 border-cyan-500/30',
      'Business Analyst': 'bg-orange-900/20 text-orange-300 border-orange-500/30',
    };
    return colors[role] || 'bg-slate-900/20 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="team-avatar">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="modal-title">{team.teamname || team.name}</h2>
                <div className={`status-badge ${getStatusColor(team.status)}`}>
                  {getStatusIcon(team.status)}
                  <span className="ml-2 font-medium">{team.status || 'Pending'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-button"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Information */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Team Information
                </h3>
                <div className="space-y-4">
                  <div className="info-row">
                    <span className="info-label">Team Size:</span>
                    <span className="info-value font-semibold text-lg">
                      {team.members?.length || team.teamsize || 0} members
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Problem Statement:</span>
                    <span className="info-value leading-relaxed">
                      {team.problem_statement || team.project_name || 'Not specified'}
                    </span>
                  </div>
                  {team.order_id && (
                    <div className="info-row">
                      <span className="info-label">Order ID:</span>
                      <span className="info-value font-mono bg-slate-800/50 px-2 py-1 rounded border">
                        {team.order_id}
                      </span>
                    </div>
                  )}
                  {team.payment_id && (
                    <div className="info-row">
                      <span className="info-label">Payment ID:</span>
                      <span className="info-value font-mono bg-slate-800/50 px-2 py-1 rounded border">
                        {team.payment_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              {(team.order_id || team.payment_id) && (
                <div className="card">
                  <h3 className="section-title">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    Payment Information
                  </h3>
                  <div className="space-y-4">
                    {team.order_id && (
                      <div className="info-row">
                        <span className="info-label">Order Status:</span>
                        <span className="info-value flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-green-400">
                            {team.payment_id ? 'Paid' : 'Pending'}
                          </span>
                        </span>
                      </div>
                    )}
                    {team.payment_id && (
                      <div className="info-row">
                        <span className="info-label">Transaction ID:</span>
                        <span className="info-value font-mono text-sm bg-slate-800/50 px-2 py-1 rounded border">
                          {team.payment_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-6">
              <div className="card relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Team Members ({team.members?.length || 0})
                  </h3>
                </div>
                
                <div className="relative min-h-[320px]">
                  {team.members && team.members.length > 0 ? (
                    <div className="relative h-full">
                      {team.members.map((member, index) => (
                        <div 
                          key={member.id || index}
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            index === currentMemberIndex 
                              ? 'opacity-100 translate-x-0 z-10' 
                              : index < currentMemberIndex 
                                ? '-translate-x-full opacity-0' 
                                : 'translate-x-full opacity-0'
                          }`}
                        >
                          <div className="member-card h-full">
                            <div className="flex flex-col h-full">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="member-avatar w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="member-name text-xl font-semibold text-white truncate">
                                    {member.name || 'Unnamed Member'}
                                  </h4>
                                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(member.role || 'Member')}`}>
                                    {member.role || 'Team Member'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4 flex-1">
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                  <h5 className="text-sm font-medium text-slate-300 mb-2">Contact Information</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                      <Mail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                                      <a 
                                        href={`mailto:${member.email}`} 
                                        className="text-slate-300 hover:text-blue-400 transition-colors break-all"
                                      >
                                        {member.email}
                                      </a>
                                    </div>
                                    {member.phonenumber && (
                                      <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        <a 
                                          href={`tel:${member.phonenumber}`}
                                          className="text-slate-300 hover:text-blue-400 transition-colors"
                                        >
                                          {member.phonenumber}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                  <h5 className="text-sm font-medium text-slate-300 mb-2">Education</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                      <span className="text-slate-300">{member.college || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <GraduationCap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                      <span className="text-slate-300">
                                        {member.year ? `${member.year} Year` : 'Year not specified'}
                                        {member.branch && ` • ${member.branch}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 h-full flex flex-col items-center justify-center">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h4 className="font-medium text-lg">No Team Members</h4>
                      <p className="text-sm opacity-75 mt-1">This team doesn't have any members yet.</p>
                    </div>
                  )}
                </div>
                
                {/* Invisible click areas for navigation */}
                {team.members?.length > 1 && (
                  <>
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1/2 z-20 cursor-pointer"
                      onClick={prevMember}
                    />
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1/2 z-20 cursor-pointer"
                      onClick={nextMember}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;
