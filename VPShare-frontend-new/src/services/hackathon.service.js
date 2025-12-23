import apiClient from './api';

const HACKATHON_ENDPOINT = '/hackathons';

export const hackathonService = {
    // Public endpoints
    getAllHackathons: async (status = '') => {
        const url = status
            ? `${HACKATHON_ENDPOINT}?status=${status}`
            : HACKATHON_ENDPOINT;
        const response = await apiClient.get(url);
        return response.data;
    },

    getHackathonById: async (id) => {
        const response = await apiClient.get(`${HACKATHON_ENDPOINT}/${id}`);
        return response.data;
    },

    getSubmissions: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions`
        );
        return response.data;
    },

    getReviews: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/reviews`
        );
        return response.data;
    },

    getTestimonials: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/testimonials`
        );
        return response.data;
    },

    // Authenticated user endpoints
    register: async (hackathonId, registrationData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/register`,
            registrationData
        );
        return response.data;
    },

    getMyRegistration: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/my-registration`
        );
        return response.data;
    },

    cancelRegistration: async (hackathonId) => {
        const response = await apiClient.delete(
            `${HACKATHON_ENDPOINT}/${hackathonId}/register`
        );
        return response.data;
    },

    // Team management
    createTeam: async (hackathonId, teamData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/teams`,
            teamData
        );
        return response.data;
    },

    getTeams: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/teams`
        );
        return response.data;
    },

    getTeamDetails: async (hackathonId, teamId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/teams/${teamId}`
        );
        return response.data;
    },

    addTeamMember: async (hackathonId, teamId, memberEmail) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/teams/${teamId}/members`,
            { memberEmail }
        );
        return response.data;
    },

    // Team invitations (Phase 1)
    sendTeamInvitation: async (hackathonId, invitationData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/invitations/send`,
            invitationData
        );
        return response.data;
    },

    getMyInvitations: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/invitations/my-invitations`
        );
        return response.data;
    },

    acceptInvitation: async (hackathonId, invitationId) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/invitations/${invitationId}/accept`
        );
        return response.data;
    },

    rejectInvitation: async (hackathonId, invitationId) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/invitations/${invitationId}/reject`
        );
        return response.data;
    },

    // Submission management
    createSubmission: async (hackathonId, submissionData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions`,
            submissionData
        );
        return response.data;
    },

    updateSubmission: async (hackathonId, submissionId, submissionData) => {
        const response = await apiClient.put(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions/${submissionId}`,
            submissionData
        );
        return response.data;
    },

    finalizeSubmission: async (hackathonId, submissionId) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions/${submissionId}/finalize`
        );
        return response.data;
    },

    getSubmissionDetails: async (hackathonId, submissionId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions/${submissionId}`
        );
        return response.data;
    },

    // Reviews and testimonials
    addReview: async (hackathonId, reviewData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/reviews`,
            reviewData
        );
        return response.data;
    },

    addTestimonial: async (hackathonId, testimonialData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/testimonials`,
            testimonialData
        );
        return response.data;
    },

    // Admin endpoints
    createHackathon: async (hackathonData) => {
        const response = await apiClient.post(HACKATHON_ENDPOINT, hackathonData);
        return response.data;
    },

    updateHackathon: async (hackathonId, hackathonData) => {
        const response = await apiClient.put(
            `${HACKATHON_ENDPOINT}/${hackathonId}`,
            hackathonData
        );
        return response.data;
    },

    deleteHackathon: async (hackathonId) => {
        const response = await apiClient.delete(
            `${HACKATHON_ENDPOINT}/${hackathonId}`
        );
        return response.data;
    },

    getAllRegistrations: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/registrations`
        );
        return response.data;
    },

    // Judging endpoints (Phase 1)
    scoreSubmission: async (hackathonId, submissionId, scoreData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/submissions/${submissionId}/score`,
            scoreData
        );
        return response.data;
    },

    getLeaderboard: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/leaderboard`
        );
        return response.data;
    },

    announceWinners: async (hackathonId, winnerData) => {
        const response = await apiClient.post(
            `${HACKATHON_ENDPOINT}/${hackathonId}/winners/announce`,
            winnerData
        );
        return response.data;
    },

    getWinners: async (hackathonId) => {
        const response = await apiClient.get(
            `${HACKATHON_ENDPOINT}/${hackathonId}/winners`
        );
        return response.data;
    }
};
