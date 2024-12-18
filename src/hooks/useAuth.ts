import { useState, useCallback, useEffect } from "react";
import * as bcrypt from "bcrypt-ts";

interface UserData {
  id: string;
  email: string;
  username?: string;
}

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.PROD
  ? "https://tskd.us.kg/api"
  : "http://localhost:3000/api";

const TOKEN_CONFIG = {
  accessTokenExpiry: 60 * 60 * 1000, // 1 hour
  refreshTokenExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  refreshInterval: 55 * 60 * 1000, // 55 minutes
  maxSessionDuration: 90 * 24 * 60 * 60 * 1000, // 90 days
};

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Token refresh logic
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const { user: userData } = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(
        refreshToken,
        TOKEN_CONFIG.refreshInterval,
      );
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, refreshToken]);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const saltResponse = await fetch(`${API_URL}/auth/salt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!saltResponse.ok) {
        throw new Error("Invalid credentials");
      }

      const { salt } = await saltResponse.json();
      const hashedPassword = await bcrypt.hash(password, salt);

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, hashedPassword }),
      });

      if (!loginResponse.ok) {
        throw new Error("Invalid credentials");
      }

      const { user: userData } = await loginResponse.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const saltResponse = await fetch(`${API_URL}/auth/generate-salt`);
        const { salt } = await saltResponse.json();

        const hashedPassword = await bcrypt.hash(password, salt);

        const registerResponse = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, hashedPassword, salt, username }),
        });

        if (!registerResponse.ok) {
          throw new Error("Registration failed");
        }

        const { user: userData } = await registerResponse.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to request password reset");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        });

        if (!response.ok) {
          throw new Error("Failed to reset password");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    isAuthenticated,
    user,
    isLoading,
    error,
  };
};
