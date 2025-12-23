import axios from 'axios';
import { auth } from '../config/firebase'; // Ensure this path matches your firebase config location

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        // Check if user is logged in via Firebase
        const user = auth.currentUser;
        if (user) {
            // Get the ID token (forceRefresh = false)
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Handle unauthorized globally, but avoid redirect loops
            // window.location.href = '/login'; 
            console.warn('Unauthorized request');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
