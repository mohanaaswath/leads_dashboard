import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

const resolvedApiBaseUrl =
  apiBaseUrl ?? (import.meta.env.DEV ? "http://localhost:5000/api" : undefined);

if (!resolvedApiBaseUrl) {
  throw new Error(
    "VITE_API_URL is not set. Configure the deployed API URL in your environment or GitHub Actions variables.",
  );
}

if (!apiBaseUrl && import.meta.env.DEV) {
  console.warn(
    "VITE_API_URL is not set. Falling back to localhost in development.",
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
