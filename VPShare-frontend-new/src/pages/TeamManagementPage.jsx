import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import TeamInvitationCard from '../components/hackathon/TeamInvitationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';

const TeamManagementPage = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Forms
    const [teamForm, setTeamForm] = useState({ name: '', tagline: '' });
    const [inviteForm, setInviteForm] = useState({ memberEmail: '', role: '' });

    useEffect(() => {
        loadTeamData();
        loadInvitations();
    }, [id]);

    const loadTeamData = async () => {
        try {
            const registration = await hackathonService.getMyRegistration(id);
            if (registration.teamId) {
                const teamData = await hackathonService.getTeamDetails(id, registration.teamId);
                setTeam(teamData);
            }
        } catch (err) {
            console.error('Error loading team or no team found:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadInvitations = async () => {
        try {
            const data = await hackathonService.getMyInvitations(id);
            setInvitations(data);
        } catch (err) {
            console.error('Error loading invitations:', err);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await hackathonService.createTeam(id, teamForm);
            setShowCreateForm(false);
            await loadTeamData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create team');
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            await hackathonService.sendTeamInvitation(id, {
                teamId: team.id,
                inviteeEmail: inviteForm.memberEmail,
                role: inviteForm.role
            });
            setShowInviteForm(false);
            setInviteForm({ memberEmail: '', role: '' });
            alert('Invitation sent successfully!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send invitation');
        }
    };

    const handleAcceptInvitation = async (invitationId) => {
        try {
            await hackathonService.acceptInvitation(id, invitationId);
            await loadInvitations();
            await loadTeamData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to accept invitation');
        }
    };

    const handleRejectInvitation = async (invitationId) => {
        try {
            await hackathonService.rejectInvitation(id, invitationId);
            await loadInvitations();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reject invitation');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Team Management</h1>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Pending Invitations</h2>
                    <div className="space-y-4">
                        {invitations.map(invitation => (
                            <TeamInvitationCard
                                key={invitation.id}
                                invitation={invitation}
                                onAccept={() => handleAcceptInvitation(invitation.id)}
                                onReject={() => handleRejectInvitation(invitation.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Current Team or Create Team */}
            {team ? (
                <Card className="shadow-lg border-t-4 border-t-purple-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-2xl">{team.name}</CardTitle>
                            {team.tagline && <p className="text-gray-500 mt-1">{team.tagline}</p>}
                        </div>
                        {team.isLeader && (
                            <Button variant="outline" onClick={() => setShowInviteForm(!showInviteForm)}>
                                {showInviteForm ? 'Cancel Invite' : 'Invite Member'}
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent>
                        {/* Invite Member Form in Modal-ish style (inline for simplicity) */}
                        {showInviteForm && (
                            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Invite Team Member</h3>
                                <form onSubmit={handleInviteMember} className="flex flex-col gap-3">
                                    <Input
                                        type="email"
                                        placeholder="Member Email"
                                        value={inviteForm.memberEmail}
                                        onChange={(e) => setInviteForm({ ...inviteForm, memberEmail: e.target.value })}
                                        required
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Role (optional)"
                                        value={inviteForm.role}
                                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                    />
                                    <Button type="submit" className="w-full sm:w-auto">Send Invitation</Button>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4 mt-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Team Members</h3>
                            {team.members.map(member => (
                                <div key={member.userId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                            {member.role && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">{member.role}</span>}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${member.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {member.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    {showCreateForm ? (
                        <div className="max-w-md mx-auto text-left p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                            <h3 className="text-xl font-bold mb-4">Create Your Team</h3>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Team Name</label>
                                    <Input
                                        type="text"
                                        value={teamForm.name}
                                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Team Tagline (Optional)</label>
                                    <Input
                                        type="text"
                                        value={teamForm.tagline}
                                        onChange={(e) => setTeamForm({ ...teamForm, tagline: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" className="flex-1">Create Team</Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} className="flex-1">Cancel</Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">You're not part of a team yet</h2>
                            <p className="text-gray-500 mb-6">Create a team to participate or wait for an invitation.</p>
                            <Button onClick={() => setShowCreateForm(true)}>Create Team</Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamManagementPage;
