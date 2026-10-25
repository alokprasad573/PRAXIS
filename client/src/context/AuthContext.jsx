import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../utils/apiService";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("praxis_token");
      localStorage.removeItem("user");
      localStorage.removeItem("praxis_user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("praxis_token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("praxis_user");
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      window.location.href = "/";
    }
  }, []);

  // 2. Initial check on app load
  useEffect(() => {
    const initializeAuth = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("praxis_token") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("praxis_token");
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("praxis_user") ||
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("praxis_user");

      if (token) {
        setIsAuthenticated(true);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
        // Unblock UI immediately so dashboard renders without waiting for network round-trip
        setLoading(false);

        // Verify token in background against live backend
        authApi
          .getMe()
          .then((res) => {
            if (res?.success && res?.data?.user) {
              setUser(res.data.user);
              setIsAuthenticated(true);
              const storage = sessionStorage.getItem("token")
                ? sessionStorage
                : localStorage;
              storage.setItem("user", JSON.stringify(res.data.user));
            }
          })
          .catch((err) => {
            // Only force logout on genuine 401 Invalid Token, not transient network errors
            if (err.response?.status === 401) {
              logout();
            }
          });
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  // 3. Login function
  const login = useCallback((token, userData, remember = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("praxis_token");
    localStorage.removeItem("user");
    localStorage.removeItem("praxis_user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("praxis_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("praxis_user");
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("praxis_token", token);
    if (userData) {
      storage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  // 4. Update user locally (Profile edit)
  const updateUser = useCallback((updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      const storage = sessionStorage.getItem("token") ? sessionStorage : localStorage;
      storage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
