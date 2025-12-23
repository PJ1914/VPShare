import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useLiveClassStore = create(
    devtools(
        (set, get) => ({
            // State
            liveClasses: [],
            leaderboard: [],
            loading: true,
            error: null,
            filters: {
                status: 'all', // 'upcoming', 'recorded', 'leaderboard'
                category: 'all',
            },

            // Actions
            setLiveClasses: (classes) => set({ liveClasses: classes }),
            setLeaderboard: (data) => set({ leaderboard: data }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            // Async Actions
            fetchClasses: async (api) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/live-classes/all');
                    // Ensure robust empty array if null
                    const data = response.data || [];
                    set({ liveClasses: data, loading: false });
                    return data;
                } catch (error) {
                    const msg = error.response?.data?.error || error.message;
                    set({ error: msg, loading: false });
                    throw error;
                }
            },

            fetchLeaderboard: async (api) => {
                // Don't set global loading true if we want background update, 
                // but commonly we do initially.
                try {
                    const response = await api.get('/leaderboard/global');
                    const data = response.data || [];
                    set({ leaderboard: data });
                    return data;
                } catch (error) {
                    console.error('Failed to fetch leaderboard in store', error);
                    // Don't fail the whole view for leaderboard failure
                }
            },

            addClass: (newClass) => set((state) => ({
                liveClasses: [...state.liveClasses, newClass]
            })),

            updateClass: (updatedClass) => set((state) => ({
                liveClasses: state.liveClasses.map((c) =>
                    c.id === updatedClass.id ? updatedClass : c
                )
            })),

            deleteClass: (classId) => set((state) => ({
                liveClasses: state.liveClasses.filter((c) => c.id !== classId)
            })),
        }),
        { name: 'LiveClassStore' }
    )
);

export default useLiveClassStore;
