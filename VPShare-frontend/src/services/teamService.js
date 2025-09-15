import { auth } from '../config/firebase';
import { 
  fetchUserTeamData, 
  fetchAllTeams, 
  updateTeamRegistration,
  checkRegistrationConfirmation 
} from './hackathonService';

class TeamService {
  constructor() {
    // Using API instead of Firestore for CodeKurukshetra
  }

  // Get user's team using the new API
  async getUserTeam() {
    try {
      const result = await fetchUserTeamData();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          data: null
        };
      }

      return {
        success: true,
        data: result.teamData,
        message: result.registered ? 'Team data retrieved' : 'No team found'
      };

    } catch (error) {
      console.error('Get user team error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Get team registration confirmation status
  async getTeamConfirmationStatus() {
    try {
      const result = await checkRegistrationConfirmation();
      
      return {
        success: result.success,
        confirmed: result.confirmed,
        teamData: result.teamData,
        registrationStatus: result.registrationStatus,
        error: result.error
      };

    } catch (error) {
      console.error('Get confirmation status error:', error);
      return {
        success: false,
        confirmed: false,
        error: error.message
      };
    }
  }

  // Create a new team (legacy method - keeping for compatibility)
  async createTeam(teamData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate team data
      if (!teamData.name || teamData.name.length < 3) {
        throw new Error('Team name must be at least 3 characters long');
      }

      if (teamData.members && teamData.members.length > 4) {
        throw new Error('Maximum team size is 4 members');
      }

      // Check if user is already in a team
      const existingTeam = await this.getUserTeam();
      if (existingTeam.success && existingTeam.data) {
        throw new Error('You are already part of a team');
      }

      // Generate unique team code
      const teamCode = this.generateTeamCode();

      const team = {
        name: teamData.name,
        description: teamData.description || '',
        teamCode,
        leaderId: user.uid,
        leaderEmail: user.email,
        leaderName: user.displayName || user.email.split('@')[0],
        members: [{
          userId: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'leader',
          joinedAt: new Date(),
          status: 'active'
        }],
        invitations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        maxMembers: 4,
        registrationStatus: 'pending',
        submissions: []
      };

      const teamRef = await addDoc(collection(this.db, 'hackathon_teams'), team);

      // Update user's team reference
      await this.updateUserTeamReference(user.uid, teamRef.id);

      return {
        success: true,
        data: {
          teamId: teamRef.id,
          ...team
        },
        message: 'Team created successfully!'
      };

    } catch (error) {
      console.error('Team creation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create team'
      };
    }
  }

  // Join a team using team code
  async joinTeam(teamCode) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is already in a team
      const existingTeam = await this.getUserTeam();
      if (existingTeam.success && existingTeam.data) {
        throw new Error('You are already part of a team');
      }

      // Find team by code
      const teamsQuery = query(
        collection(this.db, 'hackathon_teams'),
        where('teamCode', '==', teamCode.toUpperCase()),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(teamsQuery);
      
      if (snapshot.empty) {
        throw new Error('Invalid team code');
      }

      const teamDoc = snapshot.docs[0];
      const team = teamDoc.data();

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        throw new Error('Team is already full');
      }

      // Check if user is already a member
      const isAlreadyMember = team.members.some(member => member.userId === user.uid);
      if (isAlreadyMember) {
        throw new Error('You are already a member of this team');
      }

      // Add user to team
      const newMember = {
        userId: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: 'member',
        joinedAt: new Date(),
        status: 'active'
      };

      await updateDoc(doc(this.db, 'hackathon_teams', teamDoc.id), {
        members: arrayUnion(newMember),
        updatedAt: serverTimestamp()
      });

      // Update user's team reference
      await this.updateUserTeamReference(user.uid, teamDoc.id);

      return {
        success: true,
        data: {
          teamId: teamDoc.id,
          teamName: team.name,
          memberCount: team.members.length + 1
        },
        message: `Successfully joined team "${team.name}"!`
      };

    } catch (error) {
      console.error('Join team error:', error);
      return {
        success: false,
        message: error.message || 'Failed to join team'
      };
    }
  }

  // Get user's current team
  async getUserTeam() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const teamsQuery = query(
        collection(this.db, 'hackathon_teams'),
        where('members', 'array-contains-any', [{
          userId: user.uid
        }]),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(teamsQuery);
      
      if (snapshot.empty) {
        return {
          success: true,
          data: null,
          message: 'No team found'
        };
      }

      const teamDoc = snapshot.docs[0];
      const team = {
        id: teamDoc.id,
        ...teamDoc.data(),
        createdAt: teamDoc.data().createdAt?.toDate(),
        updatedAt: teamDoc.data().updatedAt?.toDate(),
        members: teamDoc.data().members.map(member => ({
          ...member,
          joinedAt: member.joinedAt instanceof Date ? member.joinedAt : member.joinedAt?.toDate()
        }))
      };

      return {
        success: true,
        data: team
      };

    } catch (error) {
      console.error('Error fetching user team:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch team',
        data: null
      };
    }
  }

  // Leave team
  async leaveTeam() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const teamResult = await this.getUserTeam();
      if (!teamResult.success || !teamResult.data) {
        throw new Error('You are not part of any team');
      }

      const team = teamResult.data;
      const teamRef = doc(this.db, 'hackathon_teams', team.id);

      // Check if user is the leader
      if (team.leaderId === user.uid) {
        // If leader is leaving and there are other members, transfer leadership
        if (team.members.length > 1) {
          const newLeader = team.members.find(member => member.userId !== user.uid);
          const updatedMembers = team.members.filter(member => member.userId !== user.uid)
            .map(member => ({
              ...member,
              role: member.userId === newLeader.userId ? 'leader' : 'member'
            }));

          await updateDoc(teamRef, {
            leaderId: newLeader.userId,
            leaderEmail: newLeader.email,
            leaderName: newLeader.name,
            members: updatedMembers,
            updatedAt: serverTimestamp()
          });
        } else {
          // If leader is the only member, deactivate the team
          await updateDoc(teamRef, {
            isActive: false,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Remove member from team
        const updatedMembers = team.members.filter(member => member.userId !== user.uid);
        await updateDoc(teamRef, {
          members: updatedMembers,
          updatedAt: serverTimestamp()
        });
      }

      // Remove user's team reference
      await this.removeUserTeamReference(user.uid);

      return {
        success: true,
        message: 'Successfully left the team'
      };

    } catch (error) {
      console.error('Leave team error:', error);
      return {
        success: false,
        message: error.message || 'Failed to leave team'
      };
    }
  }

  // Update team information
  async updateTeam(teamId, updateData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const teamRef = doc(this.db, 'hackathon_teams', teamId);
      const teamDoc = await getDoc(teamRef);

      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }

      const team = teamDoc.data();

      // Check if user is the team leader
      if (team.leaderId !== user.uid) {
        throw new Error('Only team leader can update team information');
      }

      const allowedUpdates = ['name', 'description'];
      const updates = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      updates.updatedAt = serverTimestamp();

      await updateDoc(teamRef, updates);

      return {
        success: true,
        message: 'Team information updated successfully'
      };

    } catch (error) {
      console.error('Update team error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update team'
      };
    }
  }

  // Generate unique team code
  generateTeamCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Update user's team reference
  async updateUserTeamReference(userId, teamId) {
    try {
      await setDoc(doc(this.db, 'user_teams', userId), {
        teamId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user team reference:', error);
    }
  }

  // Remove user's team reference
  async removeUserTeamReference(userId) {
    try {
      await deleteDoc(doc(this.db, 'user_teams', userId));
    } catch (error) {
      console.error('Error removing user team reference:', error);
    }
  }

  // Get team statistics
  async getTeamStats() {
    try {
      const teamsQuery = query(
        collection(this.db, 'hackathon_teams'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(teamsQuery);
      let totalTeams = 0;
      let totalMembers = 0;
      let teamSizeDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };

      snapshot.forEach(doc => {
        const team = doc.data();
        totalTeams++;
        totalMembers += team.members.length;
        teamSizeDistribution[team.members.length]++;
      });

      return {
        success: true,
        data: {
          totalTeams,
          totalMembers,
          averageTeamSize: totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : 0,
          teamSizeDistribution
        }
      };

    } catch (error) {
      console.error('Error fetching team stats:', error);
      return {
        success: false,
        message: 'Failed to fetch team statistics'
      };
    }
  }

  // Check if user can form a team (registration requirements)
  async canUserFormTeam() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { canForm: false, reason: 'User not authenticated' };
      }

      // Check if user is already in a team
      const existingTeam = await this.getUserTeam();
      if (existingTeam.success && existingTeam.data) {
        return { canForm: false, reason: 'Already part of a team' };
      }

      // Add any additional checks here (e.g., registration status, payment, etc.)
      return { canForm: true };

    } catch (error) {
      return { canForm: false, reason: 'Error checking eligibility' };
    }
  }

  // Get all teams (for admin purposes)
  async getAllTeams() {
    try {
      const teamsQuery = query(
        collection(this.db, 'hackathon_teams'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(teamsQuery);
      const teams = [];

      snapshot.forEach(doc => {
        teams.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      });

      return {
        success: true,
        data: teams
      };

    } catch (error) {
      console.error('Error fetching all teams:', error);
      return {
        success: false,
        message: 'Failed to fetch teams',
        data: []
      };
    }
  }
}

export default new TeamService();
