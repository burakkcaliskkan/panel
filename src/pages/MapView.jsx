import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuthStore } from "../store/authStore";
import { useMapStore } from "../store/mapStore";
import socketService from "../services/socketService";
import { channelService } from "../services/channelService";
import { RiLogoutBoxLine, RiArrowDownSLine, RiSearchLine, RiMenuLine, RiCloseLine } from "@remixicon/react";
import { useNavigate } from "react-router-dom";

// --- Yardımcı Fonksiyonlar ---
const getUserInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return (first + last) || '?';
};

// Leaflet Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Araba İkonu (73x22 viewBox — konum göstergesi rengi: color)
const carIconSvg = (color) => {
    const uid = `car_${Math.random().toString(36).slice(2)}`;
    const svg = `<svg width="100%" height="100%" viewBox="0 0 73 22" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
<circle cx="36.0638" cy="10.8927" r="3.47826" transform="rotate(88.5741 36.0638 10.8927)" fill="${color}" fill-opacity="0.25"/>
<circle cx="36.0638" cy="10.8927" r="2.71635" transform="rotate(88.5741 36.0638 10.8927)" fill="${color}" fill-opacity="0.25"/>
<g filter="url(#filter0_d_${uid})">
<path d="M55.434 15.1918C55.0922 16.7576 53.7246 17.8871 52.1224 17.927L21.8185 18.6813C19.8981 18.7291 18.3025 17.2111 18.2547 15.2907L18.06 7.46704C18.0122 5.54665 19.5302 3.95111 21.4506 3.90331L51.7067 3.1502C53.3309 3.10977 54.7667 4.19911 55.1653 5.77415L55.3726 6.59342C55.4231 6.79321 55.4558 6.9971 55.4703 7.20268L55.7179 10.7236L55.6405 13.9497C55.6352 14.1712 55.6087 14.3917 55.5614 14.6082L55.434 15.1918Z" fill="#E3FD65"/>
<mask id="mask0_${uid}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="3" width="38" height="16">
<path d="M55.434 15.1918C55.0922 16.7576 53.7246 17.8871 52.1224 17.927L21.8185 18.6813C19.8981 18.7291 18.3025 17.2111 18.2547 15.2907L18.06 7.46704C18.0122 5.54665 19.5302 3.95111 21.4506 3.90331L51.7067 3.1502C53.3309 3.10977 54.7667 4.19911 55.1653 5.77415L55.3726 6.59342C55.4231 6.79321 55.4558 6.9971 55.4703 7.20268L55.7179 10.7236L55.6405 13.9497C55.6352 14.1712 55.6087 14.3917 55.5614 14.6082L55.434 15.1918Z" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_${uid})">
<path d="M51.0788 18.2347L54.9412 16.1173L58.3306 16.0329L52.347 19.3132L51.0788 18.2347Z" fill="url(#paint0_linear_${uid})" stroke="black" stroke-opacity="0.05" stroke-width="0.173913"/>
<path d="M18.7286 4.6669C18.7506 4.66635 18.7715 4.675 18.7854 4.69214C18.8914 4.82322 19.321 5.42821 18.7979 6.05691C18.6537 6.23019 18.5819 6.40168 18.5558 6.56194C18.4957 6.93017 18.2488 7.46231 17.8758 7.47159L17.59 7.47871C17.5081 7.48075 17.44 7.41598 17.438 7.33404L17.4062 6.05686C17.3875 5.30785 17.9796 4.68554 18.7286 4.6669Z" fill="#FF3333"/>
<path d="M19.1585 18.0517C19.1806 18.0511 19.201 18.0414 19.214 18.0236C19.3133 17.8874 19.7123 17.2618 19.1586 16.6599C19.006 16.494 18.9257 16.3263 18.8916 16.1676C18.8133 15.8028 18.5402 15.2836 18.1672 15.2929L17.8815 15.3C17.7995 15.302 17.7347 15.3701 17.7368 15.452L17.7686 16.7292C17.7872 17.4782 18.4095 18.0703 19.1585 18.0517Z" fill="#FF3333"/>
<path d="M58.0519 4.8396L54.0889 2.91691L50.6995 3.00127L56.8389 5.97986L58.0519 4.8396Z" fill="url(#paint1_linear_${uid})" stroke="black" stroke-opacity="0.05" stroke-width="0.173913"/>
<path d="M53.0028 13.4683C53.0287 14.5079 52.2851 15.408 51.2593 15.5788L47.1013 16.2713C46.9087 16.3033 46.7125 16.3082 46.5185 16.2858L42.3312 15.801C41.2982 15.6814 40.5108 14.8195 40.4849 13.7798L40.3378 7.87011C40.312 6.83045 41.0555 5.93041 42.0813 5.75957L46.2393 5.06713C46.4319 5.03505 46.6281 5.03017 46.8221 5.05262L51.0094 5.53734C52.0424 5.65693 52.8298 6.51887 52.8557 7.55852L53.0028 13.4683Z" fill="black" fill-opacity="0.15"/>
</g>
<path d="M26.3209 13.993C26.4618 14.7777 25.9488 15.5445 25.1631 15.6801L22.3064 16.1731C21.4698 16.3175 20.7 15.6854 20.6789 14.8367L20.5037 7.79975C20.4826 6.95103 21.22 6.28144 22.0627 6.38402L24.9405 6.73431C25.7319 6.83064 26.2825 7.57092 26.1807 8.36165C26.0689 9.23074 25.9597 10.3293 25.9809 11.1841C26.0022 12.0389 26.166 13.1306 26.3209 13.993Z" fill="#323232"/>
<path d="M36.3244 14.3786C36.3399 15.0026 36.8249 15.5138 37.4472 15.562L44.5767 16.1152C45.0815 16.1543 45.5529 15.8736 45.6959 15.3879C45.9546 14.5091 46.291 12.9144 46.2354 10.6799C46.1798 8.44532 45.7644 6.86935 45.4623 6.00451C45.2953 5.52652 44.8105 5.26962 44.3083 5.33385L37.2152 6.24099C36.596 6.32018 36.1371 6.85483 36.1526 7.47884L36.3244 14.3786Z" fill="#323232"/>
<path d="M44.1335 17.0866C44.1292 16.9143 43.9977 16.7719 43.8263 16.7539L37.0468 16.0406L37.0857 17.6054L43.799 17.4383C43.9884 17.4335 44.1382 17.2761 44.1335 17.0866Z" fill="#323232"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M37.0857 17.6054L37.0468 16.0406L24.6152 17.2487C24.441 17.2656 24.3094 17.4143 24.3138 17.5893C24.3184 17.7736 24.4715 17.9193 24.6558 17.9148L37.0857 17.6054Z" fill="#323232"/>
<path d="M43.8173 4.38576C43.8216 4.55808 43.6974 4.70685 43.5271 4.73339L36.7914 5.78306L36.7524 4.21833L43.4657 4.05123C43.6552 4.04651 43.8126 4.19629 43.8173 4.38576Z" fill="#323232"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M36.7524 4.21833L36.7914 5.78306L24.3152 5.19496C24.1403 5.18672 24.0015 5.04479 23.9971 4.86978C23.9925 4.68546 24.1383 4.53231 24.3226 4.52772L36.7524 4.21833Z" fill="#323232"/>
<path d="M43.7731 2.61151L43.8152 4.30346C43.8339 4.64157 43.4942 4.68251 43.4359 4.34894C43.4222 4.27083 43.4145 4.22645 43.4145 4.22645L43.0249 3.74791C42.9636 3.67254 42.9365 3.57493 42.9504 3.47873L43.0811 2.5706C43.1419 2.14857 43.7625 2.18526 43.7731 2.61151Z" fill="#323232"/>
<path d="M44.1776 18.8609L44.1355 17.1689C44.1373 16.8303 43.7959 16.8063 43.7543 17.1424C43.7445 17.2211 43.7391 17.2658 43.7391 17.2658L43.3738 17.7631C43.3162 17.8414 43.2941 17.9403 43.3127 18.0357L43.4885 18.9362C43.5702 19.3547 44.1882 19.2871 44.1776 18.8609Z" fill="#323232"/>
<path d="M48.5927 18.0148C48.5975 18.2069 48.4457 18.3664 48.2537 18.3712L44.9503 18.4534C44.7583 18.4582 44.5987 18.3064 44.594 18.1144L48.5927 18.0148Z" fill="#111111"/>
<path d="M48.2248 3.23688C48.22 3.04484 48.0604 2.89304 47.8684 2.89782L44.5651 2.98004C44.373 2.98482 44.2212 3.14437 44.226 3.33641L48.2248 3.23688Z" fill="#111111"/>
<path d="M28.425 18.5168C28.4298 18.7088 28.278 18.8684 28.0859 18.8732L24.7826 18.9554C24.5906 18.9602 24.431 18.8084 24.4262 18.6163L28.425 18.5168Z" fill="#111111"/>
<path d="M28.057 3.73883C28.0523 3.54679 27.8927 3.39499 27.7007 3.39977L24.3974 3.48199C24.2053 3.48677 24.0535 3.64633 24.0583 3.83837L28.057 3.73883Z" fill="#111111"/>
<rect x="34.7237" y="12.967" width="1.04348" height="3.65217" rx="0.521739" transform="rotate(178.574 34.7237 12.967)" fill="#836A06"/>
<mask id="mask1_${uid}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="33" y="9" width="2" height="4">
<rect x="34.7225" y="12.9266" width="1.04348" height="3.65217" rx="0.521739" transform="rotate(178.574 34.7225 12.9266)" fill="#836A06"/>
</mask>
<g mask="url(#mask1_${uid})">
<rect x="34.6402" y="9.62341" width="2.95652" height="0.347826" rx="0.173913" transform="rotate(88.5741 34.6402 9.62341)" fill="#DBCE9B"/>
<rect x="33.7278" y="7.90637" width="6.43478" height="0.347826" rx="0.173913" transform="rotate(88.5741 33.7278 7.90637)" fill="black" fill-opacity="0.2"/>
</g>
</g>
<defs>
<filter id="filter0_d_${uid}" x="16.6676" y="0.881036" width="40.4415" height="19.7278" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="0.695652"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_149_627"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_149_627" result="shape"/>
</filter>
<linearGradient id="paint0_linear_${uid}" x1="54.7575" y1="19.2532" x2="54.6796" y2="16.1238" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="0.461538" stop-color="#E8E8E8"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint1_linear_${uid}" x1="54.4284" y1="6.03986" x2="54.3505" y2="2.9104" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="0.461538" stop-color="#E8E8E8"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
</defs>
</svg>`;
    return svg;
};

const createCustomIcon = (color, isOnline, isMoving) => {
    const w = 65;
    const h = 21;
    return L.divIcon({
        className: 'custom-marker-car',
        html: `<div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;">${carIconSvg(color)}</div>`,
        iconSize: [w, h],
        iconAnchor: [w / 2, h / 2],
    });
};

function MapAutoCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 15);
    }, [center, map]);
    return null;
}

// --- TASARIM BİLEŞENLERİ (Fixed Sizing) ---

const UserAvatar = ({ user, isOnline }) => {
    return (
        <div style={{ width: '38px', height: '38px', position: 'relative', flexShrink: 0, marginLeft: '7px' }}>
            {user?.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="rounded-full"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <div
                    className="rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold"
                    style={{ width: '100%', height: '100%', fontSize: '16px', fontFamily: "'Albert Sans', sans-serif" }}
                >
                    {getUserInitials(user?.firstName, user?.lastName)}
                </div>
            )}
            {/* Online Durum Noktası - Avatar'ın dışında sağ alt köşede */}
            <span
                className="absolute rounded-full border-2 border-white"
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: isOnline ? '#1FC16B' : '#9CA3AF',
                    bottom: '-2px',
                    right: '-2px'
                }}
            />
        </div>
    );
};

const MinimalUserItem = ({ member, isSelected, onClick }) => {
    // Role metinleri ve renkleri (görsele göre: Yöneticisi kırmızı, Yetkilisi turuncu, Sürücü gri)
    let roleText = 'Sürücü';
    let roleColor = '#525866'; // Açık gri

    if (member.role === 'owner') {
        roleText = 'Durak Yöneticisi';
        roleColor = '#DC2626'; // Kırmızı
    } else if (member.role === 'manager' || member.role === 'admin') {
        roleText = 'Durak Yetkilisi';
        roleColor = '#EA580C'; // Turuncu
    }

    const fullName = member.name || 'Bilinmeyen';
    const plateNumber = member.plateNumber || '—';

    return (
        <div
            onClick={() => onClick(member.userId)}
            className="cursor-pointer transition-colors hover:bg-gray-50 box-border flex-none self-stretch"
            style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 32px 16px 32px',
                gap: '12px',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                height: '74px',
                minHeight: '74px',
                background: isSelected ? '#EFF6FF' : '#FFFFFF',
                borderBottom: '1px solid #E0E0E0',
                order: 0,
                flexGrow: 0,
            }}
        >
            {/* Sol: Avatar + İsim + Rol - dar alanda küçülebilir */}
            <div
                className="min-w-0"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 0,
                    gap: '12px',
                    isolation: 'isolate',
                    height: '42px',
                    flex: '1 1 auto',
                    minWidth: 0,
                    order: 0,
                }}
            >
                <UserAvatar user={member} isOnline={member.isOnline} />
                <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                    <div
                        className="text-gray-900 truncate"
                        style={{
                            fontSize: '16px',
                            fontFamily: "'Albert Sans', sans-serif",
                            fontWeight: 600,
                        }}
                    >
                        {fullName}
                    </div>
                    <div
                        className="truncate"
                        style={{
                            fontSize: '13px',
                            fontFamily: "'Albert Sans', sans-serif",
                            fontWeight: 400,
                            color: roleColor,
                        }}
                    >
                        {roleText}
                    </div>
                </div>
            </div>

            {/* Sağ: Plaka - Frame 1437254204 (sağ padding 48px ile kenardan 16px içeride) */}
            <div
                className="flex items-center flex-none overflow-hidden"
                style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 0,
                    width: '135px',
                    height: '36px',
                    border: '2px solid #444444',
                    filter: 'drop-shadow(0px 1.5px 3px rgba(255, 255, 255, 0.03))',
                    borderRadius: '6px',
                    order: 1,
                    flexGrow: 0,
                }}
            >
                {/* Frame 1437254137 - Plaka sol (TR) */}
                <div
                    className="flex-none"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3px 6px',
                        width: '26px',
                        height: '36px',
                        background: '#082EC4',
                        order: 0,
                        flexGrow: 0,
                    }}
                >
                    <span
                        style={{
                            width: '18px',
                            height: '17px',
                            fontFamily: "'Albert Sans', sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 350,
                            fontSize: '13.5px',
                            lineHeight: '16px',
                            textAlign: 'center',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '8px',
                        }}
                    >
                        TR
                    </span>
                </div>
                {/* Frame 1437254135 - Plaka sağ (beyaz alan, numara) */}
                <div
                    className="flex-none border-l border-[#444444]"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 9px',
                        gap: '15px',
                        width: '103.5px',
                        height: '36px',
                        background: '#FFFFFF',
                        order: 1,
                        flexGrow: 1,
                        fontSize: '13px',
                        fontFamily: "'Albert Sans', sans-serif",
                        fontWeight: 600,
                        color: '#000000',
                    }}
                >
                    {plateNumber}
                </div>
            </div>
        </div>
    );
};

export default function MapView() {
    const { user, token, channelFrequency, ownedChannels, selectedChannelFrequency, selectChannel, logout } = useAuthStore();
    const {
        userLocations,
        onlineUsers,
        selectedUserId,
        mapCenter,
        setUserLocations,
        setOnlineUsers,
        updateUserLocation,
        updateOnlineUser,
        setSelectedUser,
        setMapCenter,
    } = useMapStore();
    const navigate = useNavigate();
    const [socketConnected, setSocketConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
    const [apiMembers, setApiMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState("");

    const activeFrequency = selectedChannelFrequency || channelFrequency;

    // Harita marker'ları
    const markers = useMemo(() => {
        return Object.entries(userLocations).map(([userId, location]) => ({
            id: userId,
            lat: location.lat,
            lng: location.lng,
            name: location.name || 'Bilinmeyen',
            isOnline: onlineUsers[userId]?.isOnline || false,
            isMoving: location.isMoving || false,
            plateNumber: location.plateNumber || '',
        }));
    }, [userLocations, onlineUsers]);

    // Socket bağlantısı
    useEffect(() => {
        if (!token || !activeFrequency) return;

        const connectSocket = async () => {
            try {
                await socketService.connect(token, activeFrequency);
                setSocketConnected(true);

                socketService.onFrequencyInitialLocations((data) => {
                    const locations = {};
                    const online = {};
                    data.forEach((user) => {
                        const userId = user.userId || user.id;
                        if (!userId) return;
                        online[userId] = { isOnline: user.isOnline || false };
                        if (user.latitude && user.longitude) {
                            locations[userId] = {
                                lat: user.latitude,
                                lng: user.longitude,
                                name: user.name || 'Bilinmeyen',
                                isMoving: user.isMoving || false,
                                plateNumber: user.plateNumber || '',
                                avatarUrl: user.avatarUrl,
                            };
                        }
                    });
                    setUserLocations(locations);
                    setOnlineUsers(online);
                });

                socketService.onLocationUpdate((data) => {
                    const userId = data.userId || data.id;
                    if (userId && data.latitude && data.longitude) {
                        updateUserLocation(userId, {
                            lat: data.latitude,
                            lng: data.longitude,
                            name: data.name || userLocations[userId]?.name || 'Bilinmeyen',
                            isMoving: data.isMoving || false,
                            plateNumber: data.plateNumber || userLocations[userId]?.plateNumber || '',
                            avatarUrl: data.avatarUrl || userLocations[userId]?.avatarUrl,
                        });
                    }
                });

                socketService.onUserJoined((data) => {
                    const userId = data.userId || data.id;
                    if (userId) {
                        updateOnlineUser(userId, true);
                        if (data.latitude && data.longitude) {
                            updateUserLocation(userId, {
                                lat: data.latitude,
                                lng: data.longitude,
                                name: data.name || 'Bilinmeyen',
                                isMoving: data.isMoving || false,
                                plateNumber: data.plateNumber || '',
                                avatarUrl: data.avatarUrl,
                            });
                        }
                    }
                });

                socketService.onUserOffline((data) => {
                    const userId = data.userId || data.id;
                    if (userId) updateOnlineUser(userId, false);
                });
            } catch (error) {
                console.error('Socket error:', error);
            }
        };

        connectSocket();
        return () => {
            socketService.disconnect();
            setSocketConnected(false);
        };
    }, [token, activeFrequency]);

    // API verisi
    useEffect(() => {
        if (!token || !activeFrequency) return;
        const fetchMembers = async () => {
            try {
                const members = await channelService.getChannelMembersByFrequency(activeFrequency, token);
                if (Array.isArray(members)) setApiMembers(members);
            } catch (error) { }
        };
        fetchMembers();
    }, [token, activeFrequency]);

    const handleUserClick = (userId) => {
        setSelectedUser(userId);
        const location = userLocations[userId];
        if (location) setMapCenter([location.lat, location.lng]);
    };

    const handleChannelSelect = (frequency) => {
        selectChannel(frequency);
        setChannelDropdownOpen(false);
    };

    const handleLogout = () => {
        socketService.disconnect();
        logout();
        navigate("/login");
    };

    const normalizeUserId = (member) => member.userId?._id || member.odaId || member._id || member.userId || member.id;

    // Listeyi hazırlama ve sıralama — panele giriş yapabilen kullanıcı her zaman yönetici sayılır
    const sortedMembers = useMemo(() => {
        const currentUserId = user?.id != null ? String(user.id) : null;
        const membersList = apiMembers.length > 0 ? apiMembers : [];
        let allProcessed = membersList.map((member) => {
            const userId = normalizeUserId(member);
            const socketLocation = userLocations[userId];
            const socketOnlineData = onlineUsers[userId];
            const isOnline = socketOnlineData ? socketOnlineData.isOnline : (member.isOnline || !!socketLocation);
            let role = member.role || member.userId?.role || 'driver';
            if (currentUserId && String(userId) === currentUserId) role = 'owner'; // Panele giriş yapan = Durak Yöneticisi

            return {
                userId,
                name: `${member.userId?.firstName || member.firstName || ''} ${member.userId?.lastName || member.lastName || ''}`.trim() || member.name || 'Bilinmeyen',
                avatarUrl: socketLocation?.avatarUrl || member.userId?.avatarUrl || member.avatarUrl,
                plateNumber: member.userId?.plateNumber || member.plateNumber || '',
                role,
                isOnline,
                hasLocation: !!socketLocation,
                location: socketLocation
            };
        });

        const memberIds = new Set(allProcessed.map(m => m.userId));
        Object.keys(onlineUsers).forEach(userId => {
            if (!memberIds.has(userId)) {
                const loc = userLocations[userId];
                const role = currentUserId && String(userId) === currentUserId ? 'owner' : 'driver';
                allProcessed.push({
                    userId,
                    name: loc?.name || 'Bilinmeyen',
                    avatarUrl: loc?.avatarUrl,
                    plateNumber: loc?.plateNumber || '',
                    role,
                    isOnline: onlineUsers[userId]?.isOnline,
                    hasLocation: !!loc,
                    location: loc
                });
            }
        });

        if (memberSearch.trim()) {
            const searchLower = memberSearch.toLowerCase();
            allProcessed = allProcessed.filter(m =>
                m.name.toLowerCase().includes(searchLower) ||
                m.plateNumber.toLowerCase().includes(searchLower)
            );
        }

        return allProcessed.sort((a, b) => {
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
            const roleScore = { 'owner': 3, 'manager': 2, 'admin': 2, 'driver': 1 };
            const scoreA = roleScore[a.role] || 0;
            const scoreB = roleScore[b.role] || 0;
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.name.localeCompare(b.name);
        });

    }, [apiMembers, onlineUsers, userLocations, memberSearch, user?.id]);

    // Kanaldakiler sayacı: çevrimiçi/toplam (arama filtresi olmadan)
    const { channelOnlineCount, channelTotalCount } = useMemo(() => {
        const membersList = apiMembers.length > 0 ? apiMembers : [];
        let list = membersList.map((member) => {
            const userId = normalizeUserId(member);
            const socketOnlineData = onlineUsers[userId];
            const isOnline = socketOnlineData ? socketOnlineData.isOnline : (member.isOnline || !!userLocations[userId]);
            return { userId, isOnline };
        });
        const memberIds = new Set(list.map(m => m.userId));
        Object.keys(onlineUsers).forEach(userId => {
            if (!memberIds.has(userId)) {
                list.push({ userId, isOnline: onlineUsers[userId]?.isOnline || false });
            }
        });
        return {
            channelOnlineCount: list.filter(m => m.isOnline).length,
            channelTotalCount: list.length,
        };
    }, [apiMembers, onlineUsers, userLocations]);

    const defaultCenter = [41.0082, 28.9784];
    const currentMapCenter = mapCenter || (markers.length > 0 ? [markers[0].lat, markers[0].lng] : defaultCenter);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50 font-sans text-gray-900">
            {/* Sidebar - 440px genişlik */}
            <div
                className={`overflow-hidden transition-all duration-300 bg-white flex flex-col z-20 shadow-xl lg:shadow-none ${sidebarOpen ? '' : 'min-w-0'}`}
                style={{ width: sidebarOpen ? 440 : 0, minWidth: sidebarOpen ? 440 : 0 }}
            >
                {/* Dijitaksi + Kanal seçici (eski Yalı Taksi yeri) */}
                <div
                    className="bg-white flex-none box-border self-stretch"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px 24px 0px 24px',
                        gap: '2px',
                        width: '100%',
                        height: '76px',
                        order: 0,
                        flexGrow: 0,
                    }}
                >
                    {/* Dijitaksi logo - sol üstte, çok az sola */}
                    <div
                        className="flex flex-col items-start flex-none box-border self-center"
                        style={{
                            padding: 0,
                            gap: '2px',
                            width: '100px',
                            height: '19.33px',
                            marginLeft: '-16px',
                        }}
                        aria-label="Dijitaksi"
                    >
                        <svg width="100" height="19.33" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
                            <path d="M33.1589 2.08516C33.1589 3.23676 32.2253 4.17032 31.0737 4.17032C29.9221 4.17032 28.9885 3.23676 28.9885 2.08516C28.9885 0.933558 29.9221 0 31.0737 0C32.2253 0 33.1589 0.933558 33.1589 2.08516Z" fill="black" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M26.2929 17.4414C26.5588 16.4625 26.8009 15.3051 26.8423 15.1048C26.7164 15.6457 26.494 16.5979 26.494 16.5979L26.8485 15.0745C26.8485 15.0745 26.6106 16.0892 26.2929 17.4414Z" fill="black" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M26.2715 17.5193C26.2787 17.4934 26.2858 17.4675 26.2929 17.4414C26.5588 16.4625 26.8009 15.3051 26.8423 15.1048C26.8464 15.085 26.8485 15.0745 26.8485 15.0745L26.2715 17.5193Z" fill="black" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M27.1049 23.1761C28.0529 22.5358 28.814 21.0271 29.2571 20.1521C29.7807 19.1177 30.2624 17.3486 30.4773 16.0145C30.5261 15.7115 30.7297 14.7633 30.9296 13.9076C31.4295 11.7678 31.6383 10.8296 31.8676 9.69388C31.9756 9.15905 32.1362 8.44429 32.2244 8.10557C32.3127 7.76685 32.4429 7.20272 32.5136 6.85195C32.5844 6.50121 32.6569 6.19047 32.6749 6.16138C32.7367 6.06148 32.285 5.9567 31.6704 5.92831C31.1655 5.90497 30.9793 5.92449 30.6364 6.0367C29.3487 6.45794 28.5643 7.43839 28.2032 9.07798C28.1444 9.34539 28.038 9.79757 27.9668 10.0828C27.722 11.0643 27.5717 11.7892 27.5717 11.7892C27.5717 11.7892 26.973 14.5397 26.8485 15.0745L26.8423 15.1048C26.8009 15.3051 26.5588 16.4625 26.2929 17.4414C26.2858 17.4675 26.2787 17.4934 26.2715 17.5193C26.1406 17.9941 25.9517 18.3654 25.8324 18.606C25.4395 19.3992 24.7659 20.4506 23.2622 21.0599C22.4621 21.2422 22.113 21.3147 21.7223 21.3666C21.3289 21.4189 21.0112 21.7176 20.9578 22.1109L20.6801 24.1573C20.6079 24.6892 21.0374 25.1513 21.5712 25.0945C22.4535 25.0006 23.7436 24.8183 24.7915 24.4873C25.6473 24.2169 26.3962 23.7082 27.1049 23.1761Z" fill="black" />
                            <path d="M37.0442 4.17032C38.1958 4.17032 39.1294 3.23676 39.1294 2.08516C39.1294 0.933558 38.1958 0 37.0442 0C35.8926 0 34.959 0.933558 34.959 2.08516C34.959 3.23676 35.8926 4.17032 37.0442 4.17032Z" fill="black" />
                            <path d="M24.2659 4.17032C25.4175 4.17032 26.3511 3.23676 26.3511 2.08516C26.3511 0.933558 25.4175 0 24.2659 0C23.1143 0 22.1807 0.933558 22.1807 2.08516C22.1807 3.23676 23.1143 4.17032 24.2659 4.17032Z" fill="black" />
                            <path d="M32.1965 19.4223L33.3961 14.5235C33.3961 14.5235 33.5264 13.8331 33.5949 13.5835C33.6634 13.3339 33.7806 12.8234 33.855 12.449C33.9295 12.0746 34.0785 11.3891 34.186 10.9256C34.5536 9.34105 34.7556 8.4621 34.8305 8.12111C34.9196 7.71549 35.3464 7.10236 35.8474 6.66031C36.257 6.29884 36.3522 6.24542 36.9342 6.05036C37.3167 5.9222 37.4797 5.90295 37.9715 5.92797C38.4466 5.95216 38.916 6.04216 39.0286 6.13072C39.0394 6.13941 38.987 6.41945 38.912 6.75319C38.7522 7.46506 38.4886 8.62342 38.3607 9.17523C38.3111 9.38916 38.2406 9.72462 38.2039 9.92072C38.1672 10.1168 38.0523 10.6419 37.9483 11.0876C37.8445 11.5333 37.7385 12.0584 37.7128 12.2545C37.6872 12.4506 37.5844 12.9611 37.4844 13.389C37.3843 13.8168 37.2236 14.517 37.1273 14.9448C36.8463 16.1927 36.7311 16.5671 36.4534 17.1337C36.1626 17.727 35.6235 18.3366 35.0636 18.7051C34.7041 18.9418 33.9872 19.2039 33.3665 19.3254C33.1476 19.3683 32.6673 19.4034 32.1965 19.4223Z" fill="black" />
                            <path d="M19.4182 19.4223L20.6178 14.5235C20.6178 14.5235 20.7481 13.8331 20.8166 13.5835C20.8851 13.3339 21.0023 12.8234 21.0767 12.449C21.1512 12.0746 21.3002 11.3891 21.4077 10.9256C21.7754 9.34105 21.9774 8.4621 22.0522 8.12111C22.1413 7.71549 22.5682 7.10236 23.0691 6.66031C23.4787 6.29884 23.5739 6.24542 24.1559 6.05036C24.5384 5.9222 24.7014 5.90295 25.1932 5.92797C25.6683 5.95216 26.1377 6.04216 26.2503 6.13072C26.2612 6.13941 26.2087 6.41945 26.1337 6.75319C25.9739 7.46506 25.7103 8.62342 25.5824 9.17523C25.5328 9.38916 25.4623 9.72462 25.4256 9.92072C25.389 10.1168 25.274 10.6419 25.17 11.0876C25.0662 11.5333 24.9602 12.0584 24.9345 12.2545C24.9089 12.4506 24.8061 12.9611 24.7061 13.389C24.6061 13.8168 24.4453 14.517 24.349 14.9448C24.0681 16.1927 23.9528 16.5671 23.6751 17.1337C23.3844 17.727 22.8452 18.3366 22.2854 18.7051C21.9258 18.9418 21.2089 19.2039 20.5882 19.3254C20.3693 19.3683 19.889 19.4034 19.4182 19.4223Z" fill="black" />
                            <path d="M0.0258734 18.3277L3.13217 3.7137C3.20037 3.39286 3.36976 3.12288 3.64034 2.90377C3.91092 2.68465 4.20221 2.5751 4.51422 2.5751L11.2224 2.5751C14.6945 2.5751 17.0739 3.25591 18.3605 4.61753C19.6568 5.97133 19.9964 8.09985 19.3793 11.0031C18.7639 13.8985 17.5203 16.0231 15.6484 17.3769C13.7846 18.7307 11.1167 19.4076 7.64457 19.4076H0.936367C0.624357 19.4076 0.377973 19.3059 0.197213 19.1024C0.0181161 18.8911 -0.038997 18.6329 0.0258734 18.3277ZM5.02656 16.0857H8.21866C10.3707 16.0857 11.9163 15.7022 12.8553 14.9354C13.7943 14.1685 14.461 12.8577 14.8552 11.0031C15.251 9.14063 15.1425 7.82596 14.5295 7.05907C13.9181 6.28435 12.5364 5.89699 10.3843 5.89699L7.19224 5.89699L5.02656 16.0857Z" fill="black" />
                            <path d="M45.1192 16.6465L46.7931 16.5057H47.2372C47.4532 16.5057 47.615 16.5722 47.7228 16.7052C47.8385 16.8383 47.8739 17.0104 47.829 17.2217L47.562 18.4777C47.5254 18.6499 47.4202 18.8064 47.2462 18.9472C47.0819 19.0803 46.8885 19.1624 46.6658 19.1937C45.8165 19.3502 44.7358 19.4285 43.4238 19.4285C39.9837 19.4285 38.6379 17.6678 39.3864 14.1463L41.7367 3.089C41.7816 2.87771 41.8862 2.70555 42.0505 2.57252C42.2244 2.43167 42.4154 2.36124 42.6234 2.36124L45.3115 2.36124C45.5195 2.36124 45.6765 2.43167 45.7826 2.57252C45.8983 2.70555 45.9337 2.87771 45.8888 3.089L45.0555 7.00954L48.4036 7.00954C48.6116 7.00954 48.7695 7.07605 48.8772 7.20908C48.9929 7.34212 49.0283 7.51428 48.9834 7.72556L48.6865 9.1224C48.6416 9.33369 48.533 9.50585 48.3607 9.63888C48.1965 9.77191 48.0103 9.83843 47.8023 9.83843H44.4542L43.5385 14.1463C43.3689 14.9445 43.4295 15.5627 43.7203 16.0009C44.0129 16.4313 44.4791 16.6465 45.1192 16.6465Z" fill="black" />
                            <path d="M50.0318 18.3486C49.1288 17.6286 48.817 16.6113 49.0964 15.2967C49.3759 13.982 50.1185 12.9725 51.3242 12.2682C52.5379 11.5639 53.9808 11.2118 55.6529 11.2118H59.625C59.8196 10.2962 59.7592 9.65844 59.4437 9.29847C59.1282 8.9385 58.4784 8.75852 57.4944 8.75852C56.5183 8.75852 55.7796 8.99719 55.2781 9.47454C54.7863 9.94407 54.2524 10.1788 53.6764 10.1788H51.8883C51.6723 10.1788 51.5064 10.1123 51.3907 9.97928C51.2846 9.83843 51.2532 9.66627 51.2965 9.46281C51.7739 7.21691 54.1926 6.09396 58.5528 6.09396C60.4568 6.09396 61.8959 6.51262 62.8699 7.34994C63.8456 8.17944 64.1481 9.46672 63.7771 11.2118L62.2327 18.4777C62.1878 18.689 62.0832 18.8611 61.9189 18.9942C61.7546 19.1272 61.5645 19.1937 61.3485 19.1937H59.0324C58.8164 19.1937 58.6545 19.1272 58.5468 18.9942C58.4408 18.8533 58.4093 18.6812 58.4526 18.4777L58.5299 18.1138C57.0779 18.9981 55.5247 19.4363 53.8704 19.4285C52.2223 19.4285 50.9428 19.0685 50.0318 18.3486ZM55.3745 13.8763C54.8145 13.8763 54.3422 14.0094 53.9576 14.2754C53.5811 14.5415 53.3479 14.8858 53.2581 15.3084C53.1682 15.731 53.2622 16.0792 53.54 16.3531C53.8178 16.627 54.2647 16.7639 54.8807 16.7639C56.1128 16.7639 57.3757 16.4118 58.6694 15.7075L59.0586 13.8763H55.3745Z" fill="black" />
                            <path d="M78.169 18.6772C78.0958 19.0216 77.8512 19.1937 77.4352 19.1937L75.1672 19.1937C74.3991 19.1937 73.8653 18.8259 73.5656 18.0903L72.5581 15.6605C72.1233 14.6198 71.2818 14.0994 70.0338 14.0994L69.1032 18.4777C69.0583 18.689 68.9497 18.8611 68.7774 18.9942C68.6131 19.1272 68.4269 19.1937 68.2189 19.1937H65.5309C65.3148 19.1937 65.153 19.1272 65.0453 18.9942C64.9375 18.8611 64.9061 18.689 64.951 18.4777L68.222 3.089C68.2669 2.87771 68.3715 2.70555 68.5358 2.57252C68.7097 2.43167 68.9007 2.36124 69.1087 2.36124L71.7968 2.36124C72.0128 2.36124 72.1738 2.43167 72.2799 2.57252C72.3876 2.70555 72.419 2.87771 72.3741 3.089L70.6027 11.4231C71.9947 11.4231 73.059 10.8949 73.7956 9.83843L75.4566 7.44385C75.6881 7.10736 75.9815 6.83738 76.3368 6.63392C76.692 6.43046 77.0497 6.32873 77.4097 6.32873H79.6778C80.0778 6.32873 80.2453 6.48132 80.1805 6.78651C80.1439 6.95867 80.0333 7.17778 79.8487 7.44385L77.622 10.6366C77.2449 11.1687 76.7876 11.6265 76.2501 12.01C75.7126 12.3934 75.1682 12.6399 74.6169 12.7495C75.5393 13.039 76.2417 13.7433 76.7238 14.8624L78.0778 18.0903C78.1655 18.3173 78.196 18.5129 78.169 18.6772Z" fill="black" />
                            <path d="M80.668 9.88538C81.2053 7.35777 83.558 6.09396 87.7261 6.09396C92.1103 6.09396 94.0637 7.21691 93.5863 9.46281C93.543 9.66627 93.4384 9.83843 93.2725 9.97928C93.1082 10.1123 92.9181 10.1788 92.702 10.1788H90.914C90.338 10.1788 89.9039 9.94407 89.6117 9.47454C89.3211 8.99719 88.5998 8.75852 87.4478 8.75852C85.8637 8.75852 84.9919 9.13414 84.8322 9.88538C84.7573 10.2375 85.003 10.531 85.5691 10.7657C86.1432 11.0005 86.8551 11.2079 87.7049 11.3879C88.5644 11.56 89.409 11.783 90.2388 12.0569C91.0686 12.3308 91.7275 12.769 92.2154 13.3716C92.713 13.9663 92.8645 14.7215 92.6699 15.6371C92.1326 18.1647 89.6639 19.4285 85.2638 19.4285C80.8637 19.4285 78.9015 18.3094 79.3772 16.0714C79.4221 15.8601 79.5267 15.6879 79.691 15.5549C79.8649 15.414 80.0599 15.3436 80.2759 15.3436H82.0639C82.64 15.3436 83.0732 15.5823 83.3638 16.0596C83.656 16.5292 84.3781 16.7639 85.5302 16.7639C87.3622 16.7639 88.3581 16.3883 88.5178 15.6371C88.5926 15.2849 88.343 14.9915 87.7689 14.7567C87.2028 14.5219 86.4908 14.3146 85.633 14.1346C84.7769 13.9468 83.9331 13.7198 83.1017 13.4538C82.2799 13.1799 81.621 12.7417 81.125 12.1391C80.6291 11.5365 80.4768 10.7853 80.668 9.88538Z" fill="black" />
                            <path d="M97.9148 4.20776C99.0664 4.20776 100 3.2742 100 2.1226C100 0.970995 99.0664 0.0374364 97.9148 0.0374364C96.7632 0.0374364 95.8297 0.970995 95.8297 2.1226C95.8297 3.2742 96.7632 4.20776 97.9148 4.20776Z" fill="black" />
                            <path d="M93.0671 19.4597L94.2668 14.5609C94.2668 14.5609 94.397 13.8705 94.4656 13.6209C94.5341 13.3713 94.6512 12.8608 94.7257 12.4864C94.8002 12.1121 94.9491 11.4265 95.0566 10.963C95.4243 9.37848 95.6263 8.49954 95.7012 8.15855C95.7902 7.75292 96.2171 7.1398 96.718 6.69774C97.1276 6.33628 97.2228 6.28286 97.8048 6.0878C98.1873 5.95963 98.3503 5.94039 98.8421 5.96541C99.3172 5.98959 99.7866 6.0796 99.8992 6.16815C99.9101 6.17685 99.8576 6.45689 99.7827 6.79063C99.6228 7.5025 99.3592 8.66086 99.2314 9.21267C99.1818 9.42659 99.1112 9.76206 99.0745 9.95816C99.0379 10.1543 98.9229 10.6794 98.819 11.1251C98.7151 11.5707 98.6091 12.0959 98.5834 12.292C98.5578 12.4881 98.455 12.9986 98.355 13.4264C98.255 13.8543 98.0943 14.5544 97.9979 14.9823C97.717 16.2302 97.6018 16.6045 97.324 17.1711C97.0333 17.7645 96.4941 18.3741 95.9343 18.7426C95.5748 18.9792 94.8578 19.2413 94.2372 19.3628C94.0182 19.4057 93.538 19.4408 93.0671 19.4597Z" fill="black" />
                        </svg>
                    </div>
                    {/* Taksi durağı / Kanal seçici — tasarıma uyumlu */}
                    {ownedChannels && ownedChannels.length > 0 && (
                        <div className="relative flex-none shrink-0" style={{ marginLeft: 'auto', order: 1, flexGrow: 0 }}>
                            <button
                                type="button"
                                onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                                className="flex items-center transition-all duration-200 overflow-hidden min-w-0"
                                style={{
                                    boxSizing: 'border-box',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    gap: '10px',
                                    minWidth: '120px',
                                    maxWidth: '220px',
                                    height: '40px',
                                    background: '#F5F5F5',
                                    borderRadius: '20px',
                                    border: 'none',
                                    outline: 'none',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#EEEEEE'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F5F5'; }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="flex-none shrink-0">
                                    <defs>
                                        <pattern id="durakPattern" patternContentUnits="objectBoundingBox" width="1" height="1">
                                            <use xlinkHref="#durakImage" transform="scale(0.000976562)" />
                                        </pattern>
                                        <image id="durakImage" width="1024" height="1024" preserveAspectRatio="xMidYMid slice" xlinkHref="" />
                                    </defs>
                                    <path d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#E0E0E0" />
                                </svg>
                                <span
                                    className="flex-1 text-left truncate"
                                    style={{
                                        fontFamily: "'Albert Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        lineHeight: '20px',
                                        color: '#1a1a1a',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {ownedChannels.find(ch => ch.frequency === activeFrequency)?.name || ownedChannels[0]?.name || 'Kanal seçin'}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="flex-none shrink-0 opacity-70"
                                    style={{ transform: channelDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                                >
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {channelDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-[998]" onClick={() => setChannelDropdownOpen(false)} aria-hidden="true" />
                                    <div
                                        className="absolute right-0 mt-2 overflow-hidden z-[999] w-full"
                                        style={{
                                            minWidth: '120px',
                                            maxWidth: '220px',
                                            background: '#F5F5F5',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <div className="py-2 max-h-64 overflow-y-auto">
                                            {ownedChannels.map((channel) => {
                                                const isSelected = channel.frequency === activeFrequency;
                                                return (
                                                    <button
                                                        key={channel._id || channel.frequency}
                                                        type="button"
                                                        onClick={() => handleChannelSelect(channel.frequency)}
                                                        className="w-full text-left flex items-center justify-between gap-3 transition-colors"
                                                        style={{
                                                            padding: '10px 12px',
                                                            fontFamily: "'Albert Sans', sans-serif",
                                                            background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) e.currentTarget.style.background = '#F5F5F5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                                                        }}
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="truncate"
                                                                style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: 600,
                                                                    color: isSelected ? '#2563eb' : '#1a1a1a',
                                                                }}
                                                            >
                                                                {channel.name || `Kanal ${channel.frequency}`}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 500,
                                                                    color: '#6B7280',
                                                                    marginTop: '2px',
                                                                }}
                                                            >
                                                                {channel.frequency} MHz
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div
                                                                className="flex-none rounded-full"
                                                                style={{ width: '8px', height: '8px', background: '#2563eb' }}
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Kanaldakiler: Dijitaksi ile aynı sol hizada, arada boşluk, kalın değil */}
                <div className="bg-white" style={{ paddingTop: '16px', paddingBottom: '10px', paddingLeft: '24px', paddingRight: '24px' }}>
                    <div className="flex items-baseline justify-between gap-4" style={{ marginBottom: '16px' }}>
                        <span
                            className="flex-none text-black"
                            style={{
                                fontFamily: "'Albert Sans', sans-serif",
                                fontStyle: 'semibold',
                                fontWeight: 500,
                                fontSize: '20px',
                                lineHeight: '20px',
                                textAlign: 'left',
                                minWidth: '113px',
                                height: '20px',
                                color: '#000000',
                                letterSpacing: '-0.01em',
                                marginLeft: '-4px',
                            }}
                        >
                            Kanaldakiler
                        </span>
                        <span
                            className="flex-none flex items-baseline gap-0"
                            style={{
                                fontFamily: "'Albert Sans', sans-serif",
                                fontSize: '14px',
                                lineHeight: '100%',
                                textAlign: 'right',
                                order: 1,
                                flexGrow: 0,
                                marginRight: '4px',
                            }}
                        >
                            <span style={{ color: '#000000', fontWeight: 600 }}>{channelOnlineCount}</span>
                            <span style={{ color: '#828282', fontWeight: 400 }}>/{channelTotalCount}</span>
                        </span>
                    </div>

                    {/* Frame 1437254783: X kişi Çevrimiçi - yeşil pill, tam genişlik, metin ortada */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '5px 10px',
                                gap: '6px',
                                boxSizing: 'border-box',
                                width: '100%',
                                maxWidth: '376px',
                                height: '22px',
                                background: 'rgba(31, 193, 107, 0.2)',
                                borderRadius: '999px',
                                flex: 'none',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Albert Sans', sans-serif",
                                    fontSize: '12px',
                                    lineHeight: 1,
                                    fontWeight: 500,
                                    color: '#1FC16B',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {channelOnlineCount} kişi Çevrimiçi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Liste Alanı - sol 24px (pill hizası), sağ 16px (plaka taşmasın) */}
                <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ backgroundColor: '#FFFFFF', paddingLeft: '24px', paddingRight: '16px' }}>
                    {sortedMembers.length > 0 ? (
                        <div className="flex flex-col">
                            {/* Çevrimiçi listesi */}
                            {sortedMembers.filter((m) => m.isOnline).map((member) => (
                                <MinimalUserItem
                                    key={member.userId}
                                    member={member}
                                    isSelected={selectedUserId === member.userId}
                                    onClick={handleUserClick}
                                />
                            ))}
                            {/* Açıklama metni */}
                            <p
                                style={{
                                    fontFamily: "'Albert Sans', sans-serif",
                                    fontSize: '12px',
                                    lineHeight: '16px',
                                    color: '#9CA3AF',
                                    padding: '12px 16px 12px 32px',
                                    margin: 0,
                                }}
                            >
                                Takip etmek istediğiniz sürücünün üstüne tıklayarak haritada takip edebilirsiniz.
                            </p>
                            {/* Çevrimdışı rozeti - yeşil pill ile aynı genişlik */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', marginBottom: '8px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '5px 10px',
                                        gap: '6px',
                                        boxSizing: 'border-box',
                                        width: '100%',
                                        maxWidth: '376px',
                                        height: '22px',
                                        background: '#E5E7EB',
                                        borderRadius: '999px',
                                        flex: 'none',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Albert Sans', sans-serif",
                                            fontSize: '12px',
                                            lineHeight: 1,
                                            fontWeight: 500,
                                            color: '#6B7280',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {channelTotalCount - channelOnlineCount} Çevrimdışı
                                    </span>
                                </div>
                            </div>
                            {/* Çevrimdışı listesi - saydam #E0E0E0 örtü, sidebar genişliğinde */}
                            <div
                                style={{
                                    position: 'relative',
                                    marginLeft: '-24px',
                                    marginRight: '-16px',
                                    width: 'calc(100% + 24px + 16px)',
                                }}
                            >
                                <div style={{ opacity: 1, paddingLeft: '24px', paddingRight: '16px' }}>
                                    {sortedMembers.filter((m) => !m.isOnline).map((member) => (
                                        <MinimalUserItem
                                            key={member.userId}
                                            member={member}
                                            isSelected={selectedUserId === member.userId}
                                            onClick={handleUserClick}
                                        />
                                    ))}
                                </div>
                                <div
                                    aria-hidden
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(224, 224, 224, 0.35)',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <span className="text-sm">Kullanıcı bulunamadı</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3" style={{ backgroundColor: '#FFFFFF' }}>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-5 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                        style={{
                            fontFamily: "'Albert Sans', sans-serif",
                            backgroundColor: '#FFFFFF',
                            color: '#DC2626',
                            fontWeight: 500,
                            border: 'none',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                    >
                        <RiLogoutBoxLine className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>

            {/* Harita Konteyner */}
            <div className="flex-1 relative h-full">
                {/* Sidebar Açma Butonu */}
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-4 left-4 z-[1000] p-2.5 bg-white rounded-lg shadow-md text-gray-700 hover:text-blue-600 transition-all border border-gray-100"
                    >
                        <RiMenuLine className="w-5 h-5" />
                    </button>
                )}

                <MapContainer
                    center={currentMapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapAutoCenter center={mapCenter} />
                    {markers.map((marker) => {
                        const iconColor = marker.isOnline ? (marker.isMoving ? '#3b82f6' : '#10b981') : '#9ca3af';
                        return (
                            <Marker
                                key={marker.id}
                                position={[marker.lat, marker.lng]}
                                icon={createCustomIcon(iconColor, marker.isOnline, marker.isMoving)}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[150px]">
                                        <div className="font-bold text-gray-900 text-sm mb-1">{marker.name}</div>
                                        {marker.plateNumber && (
                                            <div className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 border border-gray-200">
                                                {marker.plateNumber}
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500">
                                            {marker.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}