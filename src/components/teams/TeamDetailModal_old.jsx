// src/components/teams/TeamDetailModal.jsx
import React from 'react';
import {
  X,
  Users,
  Mail,
  Phone,
  GraduationCap,
  CreditCard,
  CheckCircle,
  Clock,
  Building2,
  Trophy,
  Download,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import '../../styles/TeamDetailModal.css';

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

            {/* Team Members - Scrollable List */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Team Members ({team.members?.length || 0})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2">
                  {team.members && team.members.length > 0 ? (
                    team.members.map((member, index) => (
                      <div
                        key={member.id || index}
                        className="member-card p-4 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="member-avatar flex-shrink-0">
                              </h4>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRoleColor(member.role || 'Member')}`}>
                                {member.role || 'Member'}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2 text-sm">
                              <div className="flex items-start">
                                <Mail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0 mr-2" />
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-slate-300 hover:text-blue-400 transition-colors break-all"
                                >
                                  {member.email}
                                </a>
                              </div>

                              {member.phonenumber && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mr-2" />
                                  <a
                                    href={`tel:${member.phonenumber}`}
                                    className="text-slate-300 hover:text-blue-400 transition-colors"
                                  >
                                    {member.phonenumber}
                                  </a>
                                </div>
                              )}

                              <div className="pt-2 mt-2 border-t border-slate-700/50">
                                <div className="flex items-center">
                                  <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0 mr-2" />
                                  <span className="text-slate-300">{member.college || 'Not specified'}</span>
                                </div>
                                  <GraduationCap className="w-4 h-4 text-purple-400 flex-shrink-0 mr-2" />
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No team members found</p>
                      <p className="text-sm opacity-75 mt-1">This team doesn't have any registered members yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="more-options">
            <button className="more-options-btn" onClick={(e) => {
              e.stopPropagation();
              const actions = document.getElementById('more-actions');
              if (actions) actions.classList.toggle('hidden');
            }}>
              <MoreVertical className="w-5 h-5" />
            </button>
            <div id="more-actions" className="more-options-dropdown hidden">
              <button className="more-options-item">
                <Download className="btn-icon" />
                Export as PDF
              </button>
              <button className="more-options-item">
                <MailIcon className="btn-icon" />
                Email Team
              </button>
              <button className="more-options-item">
                <UserPlus className="btn-icon" />
                Add Member
              </button>
              <div className="more-options-divider"></div>
              <button className="more-options-item text-red-500 hover:text-red-600">
                <Trash2 className="btn-icon" />
                Delete Team
              </button>
            </div>
          </div>

          <button
            className="action-btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </button>

          <button
            className="action-btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              // Handle save changes
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;
