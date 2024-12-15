import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ACCESS_TOKEN_KEY = "accessToken";

const setAccessToken = (token: string) => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const getAccessToken = () => {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

const removeAccessToken = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "https://tskd-api.itsarchit.workers.dev/",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to attach access token
  api.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const response = await axios.post("/auth/refresh", {}, { withCredentials: true });
          const { accessToken } = response.data;

          setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const decoded = jwtDecode<User>(token);
          setUser(decoded);
        } catch {
          removeAccessToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password }, { withCredentials: true });
      const { accessToken, user: userData } = response.data;

      setAccessToken(accessToken);
      setUser(userData);
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await api.post("/auth/signup", { email, password, username }, { withCredentials: true });
      const { accessToken, user: userData } = response.data;

      setAccessToken(accessToken);
      setUser(userData);
    } catch (error) {
      throw new Error("Signup failed. Email might already be in use.");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      removeAccessToken();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

