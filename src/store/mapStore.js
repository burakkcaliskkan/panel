import { create } from "zustand";

export const useMapStore = create((set, get) => ({
    // Kullanıcı konumları
    userLocations: {}, // { userId: { lat, lng, name, isMoving } }

    // Online durumları
    onlineUsers: {}, // { userId: { isOnline } }

    // Seçili kullanıcı (sidebar'dan tıklanınca)
    selectedUserId: null,

    // Harita merkezi
    mapCenter: [41.0082, 28.9784], // İstanbul default

    // Actions
    setUserLocations: (locations) => set({ userLocations: locations }),
    updateUserLocation: (userId, location) => set((state) => ({
        userLocations: {
            ...state.userLocations,
            [userId]: location,
        },
    })),

    setOnlineUsers: (users) => set({ onlineUsers: users }),
    updateOnlineUser: (userId, isOnline) => set((state) => ({
        onlineUsers: {
            ...state.onlineUsers,
            [userId]: { isOnline },
        },
    })),

    setSelectedUser: (userId) => {
        const state = get();
        const userLocation = state.userLocations[userId];
        if (userLocation) {
            set({
                selectedUserId: userId,
                mapCenter: [userLocation.lat, userLocation.lng],
            });
        } else {
            set({ selectedUserId: userId });
        }
    },

    setMapCenter: (center) => set({ mapCenter: center }),

    clearSelectedUser: () => set({ selectedUserId: null }),
}));