// src/services/github.service.js
import { getGitHubToken } from '../utils/github';

const GITHUB_API = 'https://api.github.com';

export const githubService = {

    // List user's repositories
    async getRepos() {
        const token = await getGitHubToken();
        const response = await fetch(`${GITHUB_API}/user/repos?sort=updated&per_page=100`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch repositories');
        return response.json();
    },

    // Get single repository
    async getRepo(owner, repoName) {
        const token = await getGitHubToken();
        const response = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch repository');
        return response.json();
    },

    // Create new repository
    async createRepo(name, description = '', isPrivate = false) {
        const token = await getGitHubToken();
        const response = await fetch(`${GITHUB_API}/user/repos`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                private: isPrivate,
                auto_init: true // Creates with README
            })
        });
        if (!response.ok) throw new Error('Failed to create repository');
        return response.json();
    },

    // Get repository files (tree)
    async getRepoFiles(owner, repoName, branch = 'main') {
        const token = await getGitHubToken();
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch repository files');
        return response.json();
    },

    // Get file content
    async getFileContent(owner, repoName, path) {
        const token = await getGitHubToken();
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/contents/${path}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch file content');
        const data = await response.json();

        // Decode base64 content
        return {
            content: atob(data.content),
            sha: data.sha // Needed for updates
        };
    },

    // Update file (creates commit automatically)
    async updateFile(owner, repoName, path, content, message, sha) {
        const token = await getGitHubToken();
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    content: btoa(content), // Base64 encode
                    sha // Required for updates
                })
            }
        );
        if (!response.ok) throw new Error('Failed to update file');
        return response.json();
    },

    // Delete file
    async deleteFile(owner, repoName, path, message, sha) {
        const token = await getGitHubToken();
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/contents/${path}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message, sha })
            }
        );
        if (!response.ok) throw new Error('Failed to delete file');
        return response.json();
    },

    // Get commit history
    async getCommits(owner, repoName) {
        const token = await getGitHubToken();
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/commits`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch commits');
        return response.json();
    },

    // Create branch
    async createBranch(owner, repoName, newBranch, fromBranch = 'main') {
        const token = await getGitHubToken();

        // Get base branch SHA
        const baseRef = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/git/refs/heads/${fromBranch}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!baseRef.ok) throw new Error('Failed to get base branch');
        const baseData = await baseRef.json();

        // Create new branch
        const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repoName}/git/refs`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: `refs/heads/${newBranch}`,
                    sha: baseData.object.sha
                })
            }
        );

        if (!response.ok) throw new Error('Failed to create branch');
        return response.json();
    }
};
