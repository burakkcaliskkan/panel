import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.dijitalkie.com";
const SOCKET_URL = `${API_BASE_URL}/location`;

class SocketService {
    constructor() {
        this.socket = null;
        this.currentFrequency = null;
        this._callbacks = {};
    }

    // Socket bağlantısı kur
    connect(token, frequency) {
        if (this.socket?.connected) {
            console.log('✅ Socket zaten bağlı');
            return Promise.resolve();
        }

        if (!token) {
            return Promise.reject(new Error('Token gerekli'));
        }

        return new Promise((resolve, reject) => {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }

            console.log('🔄 Socket bağlantısı kuruluyor...', SOCKET_URL);

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket bağlandı:', this.socket.id);
                this.socket.emit('authenticate', token);

                // Viewer olarak kanala katıl
                if (frequency) {
                    this.currentFrequency = frequency;
                    this.socket.emit('viewer-connected', { frequency });
                }

                resolve();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket bağlantısı kesildi:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Bağlantı hatası:', error);
                reject(error);
            });

            // initial-locations event - Auth başarılı
            this.socket.on('initial-locations', (data) => {
                console.log('✅ Auth başarılı - initial-locations:', data);
                if (this._callbacks.onInitialLocations) {
                    this._callbacks.onInitialLocations(data);
                }
            });

            // frequency-initial-locations - Kanal üyeleri
            this.socket.on('frequency-initial-locations', (data) => {
                console.log('📍 frequency-initial-locations:', data);
                if (this._callbacks.onFrequencyInitialLocations) {
                    this._callbacks.onFrequencyInitialLocations(data);
                }
            });

            // frequency-location-update - Konum güncellemesi
            this.socket.on('frequency-location-update', (data) => {
                if (this._callbacks.onLocationUpdate) {
                    this._callbacks.onLocationUpdate(data);
                }
            });

            // frequency-user-joined - Yeni kullanıcı katıldı
            this.socket.on('frequency-user-joined', (data) => {
                if (this._callbacks.onUserJoined) {
                    this._callbacks.onUserJoined(data);
                }
            });

            // frequency-user-offline - Kullanıcı çıktı
            this.socket.on('frequency-user-offline', (data) => {
                if (this._callbacks.onUserOffline) {
                    this._callbacks.onUserOffline(data);
                }
            });
        });
    }

    // Callback'leri kaydet
    onInitialLocations(callback) {
        this._callbacks.onInitialLocations = callback;
    }

    onFrequencyInitialLocations(callback) {
        this._callbacks.onFrequencyInitialLocations = callback;
    }

    onLocationUpdate(callback) {
        this._callbacks.onLocationUpdate = callback;
    }

    onUserJoined(callback) {
        this._callbacks.onUserJoined = callback;
    }

    onUserOffline(callback) {
        this._callbacks.onUserOffline = callback;
    }

    // Bağlantıyı kes
    disconnect() {
        if (this.socket) {
            this.socket.emit('leave-frequency');
            this.socket.disconnect();
            this.socket = null;
            this.currentFrequency = null;
        }
    }

    // Bağlı mı kontrol et
    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();