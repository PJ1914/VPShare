import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useAssignmentStore = create(
    devtools(
        persist(
            (set, get) => ({
                // State
                assignments: [],
                loading: true,
                error: null,
                selectedAssignment: null,

                // Actions
                fetchAssignments: async (api) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await api.get('/assignments');
                        const data = response.data || [];
                        set({ assignments: data, loading: false });
                        return data;
                    } catch (error) {
                        set({ error: error.message, loading: false });
                        // Don't throw if we want to handle UI gracefully
                    }
                },
                setAssignments: (assignments) => set({ assignments }),

                addAssignment: (assignment) =>
                    set((state) => ({
                        assignments: [...state.assignments, assignment]
                    })),

                updateAssignment: (id, updates) =>
                    set((state) => ({
                        assignments: state.assignments.map((a) =>
                            (a.id || a._id) === id ? { ...a, ...updates } : a
                        )
                    })),

                deleteAssignment: (id) =>
                    set((state) => ({
                        assignments: state.assignments.filter(
                            (a) => (a.id || a._id) !== id
                        )
                    })),

                setLoading: (loading) => set({ loading }),

                setError: (error) => set({ error }),

                setSelectedAssignment: (assignment) =>
                    set({ selectedAssignment: assignment }),

                clearError: () => set({ error: null }),

                // Computed values
                getAssignmentById: (id) => {
                    const { assignments } = get();
                    return assignments.find((a) => (a.id || a._id) === id);
                },

                getAssignmentsByStatus: (status) => {
                    const { assignments } = get();
                    return assignments.filter((a) => a.status === status);
                },
            }),
            {
                name: 'assignment-storage',
                partialize: (state) => ({
                    assignments: state.assignments
                }),
            }
        ),
        { name: 'AssignmentStore' }
    )
);

export default useAssignmentStore;
