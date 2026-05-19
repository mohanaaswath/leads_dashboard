import axios from "axios";

const defaultProductionApiUrl = "https://leads-dashboard-vk47.onrender.com/api";
const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

const resolvedApiBaseUrl =
  apiBaseUrl ??
  (import.meta.env.DEV ? "http://localhost:5000/api" : defaultProductionApiUrl);

if (!apiBaseUrl && import.meta.env.DEV) {
  console.warn(
    "VITE_API_URL is not set. Falling back to localhost in development.",
  );
}

if (!apiBaseUrl && !import.meta.env.DEV) {
  console.warn(
    `VITE_API_URL is not set. Falling back to ${defaultProductionApiUrl} in production.`,
  );
}

const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
