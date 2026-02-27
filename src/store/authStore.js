import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            channelFrequency: null, // İlk kanal (backward compatibility)
            ownedChannels: [], // Tüm sahip olunan kanallar
            selectedChannelFrequency: null, // Seçilen kanal frequency (dropdown'dan)

            // Panel girişi — backend loginForPanel (sadece station_manager)
            login: async (phoneNumber, pin) => {
                set({ loading: true, error: null });

                try {
                    const data = await authService.loginForPanel(phoneNumber, pin);

                    if (!data.success) {
                        throw new Error(data.error || "Giriş başarısız");
                    }

                    const user = {
                        id: data.id,
                        phoneNumber: data.phoneNumber,
                        firstName: data.firstName,
                        name: data.firstName,
                        avatarUrl: data.avatarUrl,
                        plateNumber: data.plateNumber,
                        channelFrequency: data.channelFrequency ?? null,
                        isChannelManager: data.isChannelManager ?? false,
                    };

                    // ownedChannels array'ini al (yeni backend response)
                    const ownedChannels = data.ownedChannels || [];
                    console.log('🔐 Login Response - ownedChannels:', ownedChannels);
                    console.log('🔐 Login Response - ownedChannels.length:', ownedChannels.length);
                    console.log('🔐 Login Response - data keys:', Object.keys(data));
                    console.log('🔐 Login Response - data.ownedChannels:', data.ownedChannels);
                    console.log('🔐 Login Response - Full data object:', JSON.stringify(data, null, 2));
                    // İlk kanalı varsayılan seçili yap (backward compatibility)
                    const defaultFrequency = data.channelFrequency ?? (ownedChannels[0]?.frequency ?? null);

                    set({
                        user,
                        token: data.token,
                        isAuthenticated: true,
                        channelFrequency: data.channelFrequency ?? null, // Backward compatibility
                        ownedChannels,
                        selectedChannelFrequency: defaultFrequency, // Dropdown için seçili kanal
                        loading: false,
                        error: null,
                    });

                    return user;
                } catch (error) {
                    const message =
                        error?.data?.message ||
                        error?.data?.error ||
                        error?.message ||
                        "Giriş başarısız";
                    set({
                        loading: false,
                        error: message,
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            // Logout — önce backend session silinir, sonra local state
            logout: async () => {
                const { token } = get();
                if (token) {
                    try {
                        await authService.logout(token, "panel");
                    } catch (_) {
                        // Ağ hatası / süresi dolmuş token — yine de local temizle
                    }
                }
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    channelFrequency: null,
                    ownedChannels: [],
                    selectedChannelFrequency: null,
                });
            },

            clearError: () => set({ error: null }),

            // Kanal seçimi (dropdown için)
            selectChannel: (frequency) => {
                set({ selectedChannelFrequency: frequency });
            },
        }),
        {
            name: 'panel-auth-storage',
        }
    )
);