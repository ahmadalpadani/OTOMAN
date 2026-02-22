// api.js (no import.meta, plain script)

// ---------- API BASE ----------
function stripTrailingSlash(s) {
  return String(s || "").replace(/\/$/, "");
}

function normalizePath(path) {
  const p = String(path || "");
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function resolveApiBase() {
  // 1) window.API_BASE (runtime override)
  if (typeof window !== "undefined") {
    const wBase = window.API_BASE;
    if (typeof wBase === "string" && wBase.trim()) {
      return stripTrailingSlash(wBase.trim());
    }
  }

  // 2) Optional: <meta name="api-base" content="http://localhost:8000/api">
  // (kalau kamu mau set dari HTML tanpa module bundler)
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="api-base"]');
    const m = meta?.getAttribute("content");
    if (m && m.trim()) return stripTrailingSlash(m.trim());
  }

  // 3) Fallback: paksa ke backend docker kamu
  // Frontend: http://localhost:3000
  // Backend:  http://localhost:8000
  if (typeof window !== "undefined") {
    return "http://localhost:8000/api";
  }

  return "";
}

const API_BASE = resolveApiBase();

// ---------- AUTH STORAGE ----------
const TOKEN_KEY = "otoman_token";
const USER_KEY = "otoman_user";

function saveAuth(data) {
  if (!data || typeof data !== "object") return;
  if (data.token) localStorage.setItem(TOKEN_KEY, String(data.token));
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear any cached data
  delete window.inspectionsData;

  // Optional: Clear all localStorage (uncomment if you want to clear everything)
  // localStorage.clear();
}

// ---------- RESPONSE HELPERS ----------
async function readResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();

  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
  }

  return { data, raw, contentType };
}

function extractErrorMessage({ data, raw }) {
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;

    if (data.errors && typeof data.errors === "object") {
      const flat = Object.values(data.errors).flat().filter(Boolean);
      if (flat.length) return flat.join(", ");
    }
  }

  if (raw && String(raw).trim()) return String(raw).slice(0, 500);
  return "Request gagal";
}

function withTimeout(timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, clear: () => clearTimeout(id) };
}

function buildUrl(path) {
  const p = normalizePath(path);
  if (!API_BASE) return p;
  return `${API_BASE}${p}`;
}

// ---------- CORE REQUEST ----------
async function request(method, path, payload, opts = {}) {
  const { auth = true, timeout = 20000, headers: extraHeaders = {}, onUnauthorized } = opts;

  const headers = { Accept: "application/json", ...extraHeaders };

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let body;
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload ?? {});
  }

  const url = buildUrl(path);
  const { controller, clear } = withTimeout(timeout);

  let res;
  try {
    res = await fetch(url, { method, headers, body, signal: controller.signal });
  } catch (err) {
    clear();
    if (err?.name === "AbortError") throw new Error("Request timeout. Coba lagi.");
    throw err;
  } finally {
    clear();
  }

  const parsed = await readResponse(res);

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      if (typeof onUnauthorized === "function") onUnauthorized();
    }

    const msg = extractErrorMessage(parsed);

    console.error(`API ${method} ERROR:`, {
      url,
      status: res.status,
      contentType: parsed.contentType,
      raw: parsed.raw?.slice(0, 1500),
    });

    throw new Error(msg);
  }

  return parsed.data;
}

// ---------- PUBLIC API ----------
async function apiGet(path, opts = {}) {
  return request("GET", path, undefined, opts);
}
async function apiPost(path, payload, opts = {}) {
  return request("POST", path, payload, opts);
}
async function apiPut(path, payload, opts = {}) {
  return request("PUT", path, payload, opts);
}
async function apiPatch(path, payload, opts = {}) {
  return request("PATCH", path, payload, opts);
}
async function apiDelete(path, payload, opts = {}) {
  return request("DELETE", path, payload, opts);
}

// ---------- EXPOSE ----------
if (typeof window !== "undefined") {
  window.API_BASE_RESOLVED = API_BASE;
  window.clearAuth = clearAuth;
  window.saveAuth = saveAuth;
  window.getToken = getToken;
  window.getUser = getUser;
  window.apiGet = apiGet;
  window.apiPost = apiPost;
  window.apiPut = apiPut;
  window.apiPatch = apiPatch;
  window.apiDelete = apiDelete;

  console.log("api.js EXPOSED ✅", { API_BASE, apiPost: typeof window.apiPost });
}