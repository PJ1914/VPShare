import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useCourseStore = create(
    devtools(
        persist(
            (set, get) => ({
                // State
                courses: [],
                loading: false,
                error: null,
                selectedCourse: null,
                userProgress: {},
                
                // Actions
                setCourses: (courses) => set({ courses }),
                
                addCourse: (course) => 
                    set((state) => ({ 
                        courses: [...state.courses, course] 
                    })),
                
                updateCourse: (id, updates) => 
                    set((state) => ({
                        courses: state.courses.map((c) =>
                            (c.id || c._id) === id ? { ...c, ...updates } : c
                        )
                    })),
                
                deleteCourse: (id) => 
                    set((state) => ({
                        courses: state.courses.filter(
                            (c) => (c.id || c._id) !== id
                        )
                    })),
                
                setLoading: (loading) => set({ loading }),
                
                setError: (error) => set({ error }),
                
                setSelectedCourse: (course) => 
                    set({ selectedCourse: course }),
                
                clearError: () => set({ error: null }),
                
                // User progress
                setUserProgress: (courseId, progress) => 
                    set((state) => ({
                        userProgress: {
                            ...state.userProgress,
                            [courseId]: progress
                        }
                    })),
                
                // Computed values
                getCourseById: (id) => {
                    const { courses } = get();
                    return courses.find((c) => (c.id || c._id) === id);
                },
                
                getEnrolledCourses: () => {
                    const { courses, userProgress } = get();
                    return courses.filter((c) => userProgress[c.id || c._id]);
                },
            }),
            {
                name: 'course-storage',
                partialize: (state) => ({ 
                    courses: state.courses,
                    userProgress: state.userProgress
                }),
            }
        ),
        { name: 'CourseStore' }
    )
);

export default useCourseStore;
