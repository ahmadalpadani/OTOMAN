// api.js

// 1) Tentukan API_BASE dengan fallback yang aman
// - Prioritas: window.API_BASE (kalau kamu set manual) -> env build (kalau ada) -> replace -3000. -> origin + /api
const API_BASE = (() => {
  // kalau suatu saat kamu ingin hardcode lewat global
  if (window.API_BASE && typeof window.API_BASE === "string") return window.API_BASE.replace(/\/$/, "");

  // dukung env jika kamu pakai bundler (tidak akan error kalau tidak ada)
  const envBase =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE) ||
    (typeof process !== "undefined" && process?.env?.API_BASE);

  if (envBase && typeof envBase === "string") return envBase.replace(/\/$/, "");

  const origin = window.location.origin;

  // khusus pattern Codespaces (frontend: -3000., backend: -8000.)
  if (origin.includes("-3000.")) {
    return `${origin.replace("-3000.", "-8000.")}/api`;
  }

  // fallback umum: tetap pakai origin yang sama + /api
  return `${origin}/api`;
})();

function saveAuth(data) {
  localStorage.setItem("otoman_token", data.token);
  localStorage.setItem("otoman_user", JSON.stringify(data.user));
}

function getToken() {
  return localStorage.getItem("otoman_token");
}

function getUser() {
  const raw = localStorage.getItem("otoman_user");
  return raw ? JSON.parse(raw) : null;
}

function clearAuth() {
  localStorage.removeItem("otoman_token");
  localStorage.removeItem("otoman_user");
}

// Helper: parse response jadi JSON kalau memungkinkan, kalau tidak ambil text mentah
async function readResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  if (contentType.includes("application/json")) {
    try {
      return { data: JSON.parse(raw), raw, contentType };
    } catch {
      return { data: {}, raw, contentType };
    }
  }

  return { data: {}, raw, contentType };
}

async function apiPost(path, payload, opts = { auth: true }) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json", // penting agar Laravel kirim JSON untuk error/validasi
  };

  if (opts.auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload ?? {}),
  });

  const { data, raw, contentType } = await readResponse(res);

  if (!res.ok) {
    // Ambil pesan error terbaik: message -> errors -> raw text
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : null) ||
      (raw ? raw.slice(0, 500) : null) ||
      "Request gagal";

    // Log detail untuk debugging (lihat di console)
    console.error("API POST ERROR:", {
      url,
      status: res.status,
      contentType,
      raw: raw?.slice(0, 1500), // batasi biar tidak kepanjangan
    });

    throw new Error(msg);
  }

  return data;
}

async function apiGet(path) {
  const headers = {
    "Accept": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  };

  const url = `${API_BASE}${path}`;

  const res = await fetch(url, { headers });

  const { data, raw, contentType } = await readResponse(res);

  if (!res.ok) {
    const msg = data?.message || (raw ? raw.slice(0, 500) : null) || "Request gagal";

    console.error("API GET ERROR:", {
      url,
      status: res.status,
      contentType,
      raw: raw?.slice(0, 1500),
    });

    throw new Error(msg);
  }

  return data;
}
