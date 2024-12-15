import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  // Add other user properties as needed
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Secure token storage utilities
const TOKEN_STORAGE_KEY = "auth_tokens";

const setTokens = (tokens: AuthTokens) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

const getTokens = (): AuthTokens | null => {
  const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
  return tokens ? JSON.parse(tokens) : null;
};

const removeTokens = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup axios instance with interceptors
  const api = axios.create({
    baseURL: import.meta.env.PROD
      ? "https://tskd.onrender.com"
      : "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to add token to requests
  api.interceptors.request.use(
    (config) => {
      const tokens = getTokens();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const tokens = getTokens();
          if (!tokens?.refreshToken)
            throw new Error(
              "No refresh token. You likely entered your email or password wrong.",
            );

          const response = await axios.post("/api/auth/refresh", {
            refreshToken: tokens.refreshToken,
          });

          const newTokens: AuthTokens = response.data;
          setTokens(newTokens);

          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout user
          logout();
          throw refreshError;
        }
      }

      return Promise.reject(error);
    },
  );

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = getTokens();
        if (tokens?.accessToken) {
          const decoded = jwtDecode<User>(tokens.accessToken);
          setUser(decoded);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        removeTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ tokens: AuthTokens; user: User }>(
        "/auth/login",
        {
          email,
          password,
        },
      );

      const { tokens, user: userData } = response.data;
      setTokens(tokens);
      setUser(userData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await api.post<{ tokens: AuthTokens; user: User }>(
        "/auth/signup",
        {
          email,
          password,
          username,
        },
      );

      const { tokens, user: userData } = response.data;
      setTokens(tokens);
      setUser(userData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Signup failed. This is likely due to an already existing account with the same email.",
        );
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Attempt to invalidate the refresh token on the server
      const tokens = getTokens();
      if (tokens?.refreshToken) {
        await api.post("/auth/logout", { refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      removeTokens();
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
