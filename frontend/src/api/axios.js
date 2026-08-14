import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Registered by App.jsx so the interceptor uses React logout instead of a hard reload.
let _onUnauthorized = null;
export function setUnauthorizedHandler(cb) {
  _onUnauthorized = cb;
}

function isAuthRoute(url = "") {
  return url.startsWith("/auth/");
}

// Attach the JWT to every request once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !isAuthRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const silent = error.config?.silentAuth === true;
    if (
      (status === 401 || status === 403) &&
      !isAuthRoute(error.config?.url) &&
      !silent
    ) {
      if (_onUnauthorized) {
        _onUnauthorized();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
