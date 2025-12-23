import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUIStore = create(
    devtools(
        (set) => ({
            // State
            sidebarOpen: false,
            modalOpen: false,
            modalContent: null,
            notifications: [],
            toast: null,
            
            // Actions
            toggleSidebar: () => 
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            
            openModal: (content) => 
                set({ modalOpen: true, modalContent: content }),
            
            closeModal: () => 
                set({ modalOpen: false, modalContent: null }),
            
            addNotification: (notification) => 
                set((state) => ({
                    notifications: [
                        ...state.notifications,
                        { ...notification, id: Date.now() }
                    ]
                })),
            
            removeNotification: (id) => 
                set((state) => ({
                    notifications: state.notifications.filter(
                        (n) => n.id !== id
                    )
                })),
            
            clearNotifications: () => set({ notifications: [] }),
            
            showToast: (message, type = 'info', duration = 3000) => {
                set({ toast: { message, type, duration } });
                setTimeout(() => set({ toast: null }), duration);
            },
            
            hideToast: () => set({ toast: null }),
        }),
        { name: 'UIStore' }
    )
);

export default useUIStore;
