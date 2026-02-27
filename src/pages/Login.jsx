import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiLoader4Line } from "@remixicon/react";
import { useAuthStore } from "../store/authStore";
import DijitaksiLogo from "../components/DijitaksiLogo";

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pin, setPin] = useState(["", "", "", "", "", ""]);
    const { login, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    // PIN input handler - Her kutucuk için
    const handlePinChange = (index, value) => {
        // Sadece rakam kabul et
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Otomatik sonraki kutucuğa geç
        if (value && index < 5) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        if (error) clearError();
    };

    // PIN geri silme
    const handlePinKeyDown = (index, e) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Telefon numarası formatla (555 555 55 55)
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
            return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
        }
        return value;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const pinString = pin.join("");
        if (phoneNumber.replace(/\s/g, "").length !== 10) {
            return;
        }
        if (pinString.length !== 6) {
            return;
        }

        try {
            // Telefon numarasını temizle (+90 ekle)
            const cleanPhone = phoneNumber.replace(/\s/g, "");
            const fullPhone = `+90${cleanPhone}`;

            await login(fullPhone, pinString);
            navigate("/map");
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '729.6px',
                height: '729.6px',
                padding: '16px',
                backgroundColor: 'rgb(239, 241, 247)',
                fontFamily: '"Albert Sans", system-ui, -apple-system, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            {/* Frame 1437254718 - beyaz kutucuk */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '32px',
                    gap: '32px',
                    margin: '0 auto',
                    width: '454px',
                    minHeight: '514.6px',
                    background: '#FFFFFF',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
                    borderRadius: '12px',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                }}
            >
                {/* Logo */}
                <div className="flex justify-center">
                    <DijitaksiLogo width={109} height={33} />
                </div>

                {/* Başlık */}
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        Durak Paneline Giriş Yap
                    </h1>
                    <p className="text-sm text-gray-600">
                        Uygulamaya kayıt olduğunuz bilgilerle giriş yapabilirsiniz.
                    </p>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        style={{
                            width: '390px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }}
                    >
                        {/* Telefon Numarası - bayrak (beyaz) + numara (gri) ayrı */}
                        <div style={{ width: '100%' }}>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Telefon Numarası
                            </label>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    minWidth: '294px',
                                    flex: 'none',
                                    order: 1,
                                    flexGrow: 1,
                                    boxSizing: 'border-box',
                                }}
                            >
                                {/* Bayrak + +90 — tc: 88x48, primary/gray/25 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: '12px',
                                        gap: '10px',
                                        width: '88px',
                                        height: '48px',
                                        background: '#FCFCFD',
                                        borderRadius: '8px',
                                        flex: 'none',
                                        order: 0,
                                        flexGrow: 0,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <svg
                                        width="80"
                                        height="50"
                                        viewBox="0 0 88 48"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <rect width="88" height="48" rx="8" fill="#FCFCFD" />
                                        <g clipPath="url(#clip0_phone_flag)">
                                            <path d="M24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36Z" fill="#D80027" />
                                            <path d="M23.5087 21.8051L24.4933 23.1619L26.0879 22.6448L25.1017 24.0004L26.0862 25.3572L24.4922 24.8382L23.5061 26.1938L23.5071 24.5175L21.9131 23.9985L23.5077 23.4815L23.5087 21.8051Z" fill="#F0F0F0" />
                                            <path d="M20.822 27.3906C18.949 27.3906 17.4307 25.8722 17.4307 23.9993C17.4307 22.1263 18.949 20.6079 20.822 20.6079C21.406 20.6079 21.9554 20.7556 22.4351 21.0156C21.6826 20.2795 20.6533 19.8253 19.5176 19.8253C17.2124 19.8253 15.3438 21.694 15.3438 23.9992C15.3438 26.3044 17.2125 28.1731 19.5176 28.1731C20.6534 28.1731 21.6826 27.7188 22.4351 26.9828C21.9554 27.2429 21.406 27.3906 20.822 27.3906Z" fill="#F0F0F0" />
                                        </g>
                                        <path d="M48.4886 28.1364V20.2727H50.2727V28.1364H48.4886ZM45.4489 25.0966V23.3125H53.3125V25.0966H45.4489ZM59.5195 18.2045C60.0763 18.2083 60.618 18.3068 61.1445 18.5C61.6748 18.6894 62.1521 19 62.5763 19.4318C63.0005 19.8598 63.3377 20.4337 63.5877 21.1534C63.8377 21.8731 63.9627 22.7633 63.9627 23.8239C63.9665 24.8239 63.8604 25.7178 63.6445 26.5057C63.4324 27.2898 63.1274 27.9527 62.7297 28.4943C62.332 29.036 61.8528 29.4489 61.2922 29.733C60.7316 30.017 60.1009 30.1591 59.4002 30.1591C58.6653 30.1591 58.0138 30.0152 57.4456 29.7273C56.8812 29.4394 56.4248 29.0455 56.0763 28.5455C55.7278 28.0455 55.5138 27.4735 55.4343 26.8295H57.5081C57.6142 27.2917 57.8301 27.6591 58.1559 27.9318C58.4854 28.2008 58.9002 28.3352 59.4002 28.3352C60.207 28.3352 60.8282 27.9848 61.2638 27.2841C61.6994 26.5833 61.9172 25.6098 61.9172 24.3636H61.8377C61.6521 24.697 61.4115 24.9848 61.1161 25.2273C60.8206 25.4659 60.4854 25.6496 60.1104 25.7784C59.7392 25.9072 59.3452 25.9716 58.9286 25.9716C58.2468 25.9716 57.6331 25.8087 57.0877 25.483C56.546 25.1572 56.1161 24.7102 55.7979 24.142C55.4835 23.5739 55.3244 22.9242 55.3206 22.1932C55.3206 21.4356 55.4949 20.7557 55.8434 20.1534C56.1956 19.5473 56.6862 19.0701 57.3149 18.7216C57.9437 18.3693 58.6786 18.197 59.5195 18.2045ZM59.5252 19.9091C59.1161 19.9091 58.7468 20.0095 58.4172 20.2102C58.0915 20.4072 57.8339 20.6761 57.6445 21.017C57.4589 21.3542 57.3661 21.7311 57.3661 22.1477C57.3699 22.5606 57.4627 22.9356 57.6445 23.2727C57.8301 23.6098 58.082 23.8769 58.4002 24.0739C58.7221 24.2708 59.0896 24.3693 59.5024 24.3693C59.8093 24.3693 60.0952 24.3106 60.3604 24.1932C60.6255 24.0758 60.8566 23.9129 61.0536 23.7045C61.2543 23.4924 61.4096 23.2519 61.5195 22.983C61.6331 22.714 61.688 22.4299 61.6843 22.1307C61.6843 21.733 61.5896 21.3655 61.4002 21.0284C61.2146 20.6913 60.9589 20.4205 60.6331 20.2159C60.3112 20.0114 59.9418 19.9091 59.5252 19.9091ZM69.8359 30.2216C68.9002 30.2216 68.0972 29.9848 67.4268 29.5114C66.7601 29.0341 66.2468 28.3466 65.887 27.4489C65.5309 26.5473 65.3529 25.4621 65.3529 24.1932C65.3567 22.9242 65.5366 21.8447 65.8927 20.9545C66.2525 20.0606 66.7658 19.3788 67.4324 18.9091C68.1029 18.4394 68.904 18.2045 69.8359 18.2045C70.7677 18.2045 71.5688 18.4394 72.2393 18.9091C72.9097 19.3788 73.423 20.0606 73.779 20.9545C74.1389 21.8485 74.3188 22.928 74.3188 24.1932C74.3188 25.4659 74.1389 26.553 73.779 27.4545C73.423 28.3523 72.9097 29.0379 72.2393 29.5114C71.5726 29.9848 70.7715 30.2216 69.8359 30.2216ZM69.8359 28.4432C70.5631 28.4432 71.137 28.0852 71.5574 27.3693C71.9817 26.6496 72.1938 25.5909 72.1938 24.1932C72.1938 23.2689 72.0972 22.4924 71.904 21.8636C71.7109 21.2348 71.4381 20.7614 71.0859 20.4432C70.7336 20.1212 70.3169 19.9602 69.8359 19.9602C69.1124 19.9602 68.5404 20.3201 68.1199 21.0398C67.6995 21.7557 67.4874 22.8068 67.4836 24.1932C67.4798 25.1212 67.5726 25.9015 67.762 26.5341C67.9552 27.1667 68.2279 27.6439 68.5802 27.9659C68.9324 28.2841 69.351 28.4432 69.8359 28.4432Z" fill="#98A2B3" />
                                        <defs>
                                            <clipPath id="clip0_phone_flag">
                                                <rect width="24" height="24" fill="white" transform="translate(12 12)" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                {/* Numarası girme alanı — tc: 294px */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        gap: '10px',
                                        width: '294px',
                                        height: '48px',
                                        background: '#F2F4F7',
                                        borderRadius: '8px',
                                        flex: 'none',
                                        order: 1,
                                        flexGrow: 1,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="555 555 55 55"
                                        className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
                                        style={{ fontSize: '14px' }}
                                        maxLength={14}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PIN Şifresi - Frame 1437254720 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 0,
                                gap: '8px',
                                width: '100%',
                                maxWidth: '390px',
                                height: '91px',
                                marginTop: '40px',
                                flex: 'none',
                                order: 3,
                                flexGrow: 0,
                            }}
                        >
                            <label className="block text-sm font-semibold text-gray-900 w-full text-left">
                                PIN Şifreniz
                            </label>
                            <div className="flex flex-row gap-2" style={{ gap: '8px', width: '100%' }}>
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`pin-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                                        className="text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E121B] focus:border-transparent text-gray-900"
                                        style={{
                                            boxSizing: 'border-box',
                                            padding: '16px 8px',
                                            width: '56.67px',
                                            minWidth: '56.67px',
                                            height: '60px',
                                            flex: 'none',
                                            flexGrow: 1,
                                            order: 0,
                                            background: '#FFFFFF',
                                            border: '1px solid #E1E4EA',
                                            boxShadow: '0px 1px 2px rgba(10, 13, 20, 0.03)',
                                            borderRadius: '10px',
                                            textAlign: 'center',
                                        }}
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error Mesajı */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg w-full" style={{ maxWidth: '390px' }}>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Giriş Butonu - Buttons [1.0], bg/strong-950 */}
                        <button
                            type="submit"
                            disabled={loading || pin.join("").length !== 6}
                            className="bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '8px',
                                gap: '4px',
                                width: '100%',
                                height: '36px',
                                marginTop: '40px',
                                background: '#0a0a0a',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: 600,
                                lineHeight: 1,
                                textAlign: 'center',
                                borderRadius: '8px',
                                flex: 'none',
                                order: 4,
                                alignSelf: 'stretch',
                                flexGrow: 0,
                                border: 'none',
                                outline: 'none',
                            }}
                        >
                            {loading ? (
                                <>
                                    <RiLoader4Line className="w-5 h-5 animate-spin" style={{ color: '#FFFFFF' }} />
                                    <span style={{ color: '#FFFFFF' }}>Giriş Yapılıyor...</span>
                                </>
                            ) : (
                                <span style={{ color: '#FFFFFF' }}>Giriş Yap</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}