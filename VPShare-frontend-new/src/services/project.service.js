// src/services/project.service.js
import apiClient from './api'; // Your axios instance

export const projectService = {

    // Add project to tracking (sync from GitHub)
    async trackProject(githubRepo) {
        const response = await apiClient.post('/projects', {
            repoId: githubRepo.id.toString(),
            repoName: githubRepo.name,
            repoUrl: githubRepo.html_url,
            description: githubRepo.description,
            defaultBranch: githubRepo.default_branch,
            language: githubRepo.language,
            stars: githubRepo.stargazers_count,
            forks: githubRepo.forks_count,
            tags: [] // Can extract from topics
        });
        return response.data;
    },

    // Get user's tracked projects
    async getMyProjects() {
        const response = await apiClient.get('/projects/my-projects');
        return response.data;
    },

    // Update project metadata
    async updateProject(repoId, updates) {
        const response = await apiClient.put(`/projects/${repoId}`, updates);
        return response.data;
    },

    // Remove from tracking
    async untrackProject(repoId) {
        const response = await apiClient.delete(`/projects/${repoId}`);
        return response.data;
    },

    // Get featured projects (public showcase)
    async getFeaturedProjects(limit = 20) {
        const response = await apiClient.get(`/projects/showcase/featured?limit=${limit}`);
        return response.data;
    },

    // Get projects by tag
    async getProjectsByTag(tag) {
        const response = await apiClient.get(`/projects/showcase/tag/${tag}`);
        return response.data;
    },

    // Like project
    async likeProject(repoId, projectOwnerId) {
        const response = await apiClient.post(`/projects/${repoId}/like`, {
            projectOwnerId
        });
        return response.data;
    },

    // Unlike project
    async unlikeProject(repoId, projectOwnerId) {
        const response = await apiClient.delete(`/projects/${repoId}/like`, {
            data: { projectOwnerId }
        });
        return response.data;
    },

    // Sync stats from GitHub
    async syncStats(repoId, githubRepo) {
        const response = await apiClient.post(`/projects/${repoId}/sync`, {
            stars: githubRepo.stargazers_count,
            forks: githubRepo.forks_count,
            language: githubRepo.language
        });
        return response.data;
    }
};
