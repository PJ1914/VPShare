import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useLiveClassStore } from '../store';

export const useLiveClass = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create axios instance with auth
    const createAuthApi = useCallback(async () => {
        const api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        });

        if (user) {
            const token = await user.getIdToken();
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        return api;
    }, [user]);

    // 1. Fetch all classes (Delegated to Store)
    const fetchClasses = useCallback(async () => {
        const api = await createAuthApi();
        return useLiveClassStore.getState().fetchClasses(api);
    }, [createAuthApi]);

    // 2. Mark attendance
    const markAttendance = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/attendance`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to mark attendance');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    // 3. Save note (auto-save)
    const saveNote = useCallback(async (id, content) => {
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/notes`, { content });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save note');
            throw err;
        }
    }, [createAuthApi]);

    // 4. Get notes
    const getNote = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.get(`/live-classes/${id}/notes`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch note');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    // 5. Ask question
    const askQuestion = useCallback(async (id, text) => {
        setLoading(true);
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/questions`, { text });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to post question');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    // 6. Get questions
    const getQuestions = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.get(`/live-classes/${id}/questions`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch questions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    // 7. Submit feedback
    const submitFeedback = useCallback(async (id, rating, comment) => {
        setLoading(true);
        setError(null);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/feedback`, { rating, comment });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit feedback');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    // 8. Get leaderboard (Delegated to Store)
    const getLeaderboard = useCallback(async () => {
        const api = await createAuthApi();
        return useLiveClassStore.getState().fetchLeaderboard(api);
    }, [createAuthApi]);

    return {
        loading,
        error,
        fetchClasses,
        markAttendance,
        saveNote,
        getNote,
        askQuestion,
        getQuestions,
        submitFeedback,
        getLeaderboard
    };
};
