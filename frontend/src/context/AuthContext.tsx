"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
  UserProfile,
} from "@/services/authService";

const TOKEN_KEY = "campaigns_hub_token";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name?: string,
    organization?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    data: Parameters<typeof apiUpdateProfile>[1]
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistToken = (t: string) => {
    setToken(t);
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
  };

  const clearToken = () => {
    setToken(null);
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  };

  const refreshUser = useCallback(async (t?: string) => {
    const tk = t ?? token;
    if (!tk) return;
    try {
      const me = await getMe(tk);
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    }
  }, [token]);

  // Bootstrap: check stored token on mount
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;
    if (stored) {
      setToken(stored);
      getMe(stored)
        .then((me) => setUser(me))
        .catch(() => {
          clearToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const { access_token } = await apiLogin(email, password);
    persistToken(access_token);
    const me = await getMe(access_token);
    setUser(me);
  };

  const register = async (
    email: string,
    password: string,
    full_name?: string,
    organization?: string
  ) => {
    await apiRegister(email, password, full_name, organization);
    // Auto-login after register
    await login(email, password);
  };

  const logout = async () => {
    if (token) {
      await apiLogout(token).catch(() => {});
    }
    clearToken();
    setUser(null);
  };

  const updateProfile = async (
    data: Parameters<typeof apiUpdateProfile>[1]
  ) => {
    if (!token) throw new Error("Not authenticated");
    const updated = await apiUpdateProfile(token, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Redirect to /login if not authenticated (use inside page components) */
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  return { isAuthenticated, isLoading };
}
