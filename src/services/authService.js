/**
 * Frontend auth service — backend AuthService (NestJS) ile uyumlu.
 * Panel: loginForPanel, logout (source: panel), refreshToken.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.dijitalkie.com";

async function request(path, options = {}) {
  const { token, body, method = "GET" } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const config = { method, headers };
  if (body && method !== "GET") config.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE_URL}${path}`, config);
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Geçersiz sunucu yanıtı");
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authService = {
  /** Panel girişi — sadece station_manager (backend: loginForPanel) */
  async loginForPanel(phoneNumber, pin) {
    return request("/auth/panel-login", {
      method: "POST",
      body: { phoneNumber, pin },
    });
  },

  /** Mobil giriş (backend: loginWithPin) — panel dışı kullanım için */
  async loginWithPin(phoneNumber, pin) {
    return request("/auth/login", {
      method: "POST",
      body: { phoneNumber, pin },
    });
  },

  /** OTP gönder */
  async sendOtp(phoneNumber) {
    return request("/auth/send-otp", {
      method: "POST",
      body: { phoneNumber },
    });
  },

  /** OTP doğrula */
  async verifyOtp(phoneNumber, code) {
    return request("/auth/verify-otp", {
      method: "POST",
      body: { phoneNumber, code },
    });
  },

  /** Telefon kayıtlı mı kontrol et */
  async checkPhoneExists(phoneNumber) {
    return request("/auth/check-phone", {
      method: "POST",
      body: { phoneNumber },
    });
  },

  /** PIN sıfırlama: OTP doğrula, resetToken al */
  async verifyOtpForReset(phoneNumber, code) {
    return request("/auth/verify-otp-reset", {
      method: "POST",
      body: { phoneNumber, code },
    });
  },

  /** PIN sıfırlama: yeni PIN onayla */
  async confirmResetPin(phoneNumber, resetToken, newPin) {
    return request("/auth/confirm-reset-pin", {
      method: "POST",
      body: { phoneNumber, resetToken, newPin },
    });
  },

  /** Çıkış — Redis session silinir (userId JWT'den alınır, source: 'panel' | 'mobile') */
  async logout(token, source = "panel") {
    return request("/auth/logout", {
      method: "POST",
      token,
      body: { source },
    });
  },

  /** Token yenile — JWT + Redis session TTL güncellenir (userId JWT'den alınır) */
  async refreshToken(token, source = "panel") {
    return request("/auth/refresh-token", {
      method: "POST",
      token,
      body: { source },
    });
  },
};

export default authService;
