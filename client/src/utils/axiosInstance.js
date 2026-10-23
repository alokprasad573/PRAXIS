import axios from "axios";
import { BASE_URL } from "./apiPaths";
import { getCookie } from "./helper";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || BASE_URL,
  timeout: 80000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken =
      getCookie("token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

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
      const isAuthEndpoint =
        url.includes("/login") || url.includes("/register") || url.includes("/auth");
        
      if (error.response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("praxis_token");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("praxis_token");
        if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
          window.location.href = "/auth";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
