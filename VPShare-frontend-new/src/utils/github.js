// src/utils/github.js
import { auth } from '../config/firebase';

export const getGitHubToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // 1. Try to get token from Firebase Custom Claims (Preferred, secure)
    try {
        const credential = await user.getIdTokenResult();
        const claimToken = credential.claims.github_access_token;
        if (claimToken) return claimToken;
    } catch (e) {
        // Ignore error
    }

    // 2. Fallback to localStorage (Client-side flow)
    const localToken = localStorage.getItem('github_access_token');
    if (localToken) return localToken;

    throw new Error('GitHub not linked. Please sign in with GitHub.');
};

// Check if user has GitHub linked
export const hasGitHubLinked = async () => {
    const user = auth.currentUser;
    if (!user) return false;

    const providers = user.providerData.map(p => p.providerId);
    return providers.includes('github.com');
};
