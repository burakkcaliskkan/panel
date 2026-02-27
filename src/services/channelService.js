/**
 * Channel API service — kanal ve üye bilgileri için
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.dijitalkie.com";

async function request(path, options = {}) {
  const { token, method = "GET" } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const config = { method, headers };
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

export const channelService = {
  /** Frekansa göre kanal üyelerini getir */
  async getChannelMembersByFrequency(frequency, token) {
    return request(`/channels/by-frequency/${frequency}/members`, {
      method: "GET",
      token,
    });
  },
};

export default channelService;
