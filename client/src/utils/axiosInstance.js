import axios from "axios";
import { BASE_URL, getBaseUrl } from "./apiPaths";
import { getCookie } from "./helper";

const axiosInstance = axios.create({
  baseURL: getBaseUrl() || BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Tunnel-Skip-Anti-Phishing-Page": "1",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamic baseURL sync in case hostname changes or resolves after load
    if (!config.baseURL) {
      config.baseURL = getBaseUrl() || BASE_URL;
    }

    const accessToken =
      getCookie("token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("praxis_token") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("praxis_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const url = error.config?.url || "";
      const status = error.response.status;

      // Only invalidate and redirect when session validation itself (/api/auth/me) fails with 401
      if (status === 401 && url.includes("/api/auth/me")) {
        localStorage.removeItem("token");
        localStorage.removeItem("praxis_token");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("praxis_token");
        if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
          window.location.href = "/auth";
        }
      } else if (status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please check your backend connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
