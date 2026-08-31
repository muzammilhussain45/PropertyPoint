import axios from "axios";

// ──────────────────────────────────────────────
//  Environment
// ──────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "";

let _onUnauthorized = null;

/**
 * Register a callback that fires when any API call gets a 401.
 * Pass your `logout()` function from AuthContext here during app init.
 */
export const onUnauthorized = (fn) => {
  _onUnauthorized = fn;
};

// ──────────────────────────────────────────────
//  Axios Instance
// ──────────────────────────────────────────────

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s default — adjust per-call with the 3rd arg
});

// ──────────────────────────────────────────────
//  Request Interceptor — attach auth token
// ──────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────
//  Response Interceptor — normalize errors,
//  handle 401 globally
// ──────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 → trigger logout callback (if registered)
      if (status === 401) {
        localStorage.removeItem("token");
        if (_onUnauthorized) {
          _onUnauthorized();
        } else {
          // Fallback: hard redirect
          window.location.href = "/login";
        }
      }

      // Normalise the rejected value so callers can always
      // read `err.message` regardless of server shape.
      const message =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : `Request failed with status ${status}`);

      return Promise.reject(new Error(message));
    }

    // Network / timeout errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    return Promise.reject(new Error("Network error. Please check your connection."));
  }
);

// ──────────────────────────────────────────────
//  Convenience helpers for common patterns
// ──────────────────────────────────────────────

/**
 * GET — returns `response.data` directly.
 *
 * @example
 *   const properties = await api.get("/property", { params: { city: "Mumbai" } });
 */
export const get = (url, config) => api.get(url, config).then((r) => r.data);

/**
 * POST — returns `response.data` directly.
 */
export const post = (url, data, config) => api.post(url, data, config).then((r) => r.data);

/**
 * PUT — returns `response.data` directly.
 */
export const put = (url, data, config) => api.put(url, data, config).then((r) => r.data);

/**
 * DELETE — returns `response.data` directly.
 */
export const del = (url, config) => api.delete(url, config).then((r) => r.data);

// ──────────────────────────────────────────────
//  Exports
// ──────────────────────────────────────────────

export { API_URL, api as default };
