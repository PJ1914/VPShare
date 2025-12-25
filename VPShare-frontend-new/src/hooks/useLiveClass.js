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

    // 9. Video Progress
    const updateWatchProgress = useCallback(async (id, currentTime, totalDuration) => {
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/progress`, { currentTime, totalDuration });
            return response.data;
        } catch (err) {
            console.error('Failed to update progress', err);
            // Don't throw for background updates
        }
    }, [createAuthApi]);

    const getWatchProgress = useCallback(async (id) => {
        try {
            const api = await createAuthApi();
            const response = await api.get(`/live-classes/${id}/progress`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch progress', err);
            return null;
        }
    }, [createAuthApi]);

    // 10. Bookmarks
    const addBookmark = useCallback(async (id, timestamp, note) => {
        setLoading(true);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/bookmarks`, { timestamp, note });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add bookmark');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    const getBookmarks = useCallback(async (id) => {
        try {
            const api = await createAuthApi();
            const response = await api.get(`/live-classes/${id}/bookmarks`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch bookmarks', err);
            return [];
        }
    }, [createAuthApi]);

    const deleteBookmark = useCallback(async (id, bookmarkId, timestamp) => {
        try {
            const api = await createAuthApi();
            // Note: Query param timestamp required by backend
            const response = await api.delete(`/live-classes/${id}/bookmarks/${bookmarkId}?timestamp=${timestamp}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete bookmark');
            throw err;
        }
    }, [createAuthApi]);

    // 11. Chapters
    const addChapter = useCallback(async (id, chapterData) => {
        setLoading(true);
        try {
            const api = await createAuthApi();
            const response = await api.post(`/live-classes/${id}/chapters`, chapterData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add chapter');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createAuthApi]);

    const getChapters = useCallback(async (id) => {
        try {
            const api = await createAuthApi();
            const response = await api.get(`/live-classes/${id}/chapters`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch chapters', err);
            return [];
        }
    }, [createAuthApi]);

    const deleteChapter = useCallback(async (id, chapterId, startTime) => {
        try {
            const api = await createAuthApi();
            const response = await api.delete(`/live-classes/${id}/chapters/${chapterId}?startTime=${startTime}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete chapter');
            throw err;
        }
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
        getLeaderboard,
        updateWatchProgress,
        getWatchProgress,
        addBookmark,
        getBookmarks,
        deleteBookmark,
        addChapter,
        getChapters,
        deleteChapter
    };
};

