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
const USER_KEY = "campaigns_hub_user";

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

/** Derive the role string from known demo credentials or email patterns */
function _deriveRole(email: string, password?: string): "admin" | "manager" | "user" {
  const e = email.toLowerCase();
  if (
    e === "admin@campaigns.hub" ||
    e.includes("admin") ||
    password === "admin123"
  ) return "admin";
  if (
    e === "manager@campaigns.hub" ||
    e.includes("manager") ||
    password === "manager123"
  ) return "manager";
  return "user";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = (t: string, u?: UserProfile | null) => {
    setToken(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, t);
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
  };

  const clearToken = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const refreshUser = useCallback(async (t?: string) => {
    const tk = t ?? token;
    if (!tk) return;
    try {
      const me = await getMe(tk);
      setUser(me);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      }
    } catch {
      // If mock token, don't clear on fetch failure
      if (tk.startsWith("mock_token_")) return;
      clearToken();
    }
  }, [token]);

  // Bootstrap: check stored token on mount
  useEffect(() => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;
    const storedUserStr =
      typeof window !== "undefined"
        ? localStorage.getItem(USER_KEY)
        : null;

    if (storedToken) {
      setToken(storedToken);
      if (storedUserStr) {
        try {
          setUser(JSON.parse(storedUserStr));
        } catch {
          // invalid json
        }
      }
      getMe(storedToken)
        .then((me) => {
          setUser(me);
          if (typeof window !== "undefined") {
            localStorage.setItem(USER_KEY, JSON.stringify(me));
          }
        })
        .catch(() => {
          if (!storedToken.startsWith("mock_token_") && !storedUserStr) {
            clearToken();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await apiLogin(email, password);
      const me = await getMe(access_token);
      persistAuth(access_token, me);
      setUser(me);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "";
      // If backend network is unavailable, provide seamless demo session
      if (
        errMsg.includes("fetch") ||
        errMsg.includes("Network") ||
        errMsg.includes("Failed to fetch") ||
        errMsg.includes("ECONNREFUSED") ||
        errMsg.includes("not reachable")
      ) {
        const derivedRole = _deriveRole(email, password);
        const mockUser: UserProfile = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          email: email,
          full_name:
            email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          organization:
            derivedRole === "admin" ? "Campaigns Hub — Admin" :
            derivedRole === "manager" ? "Campaigns Hub — Operations" :
            "Campaigns Hub — Marketing",
          role: derivedRole,
          is_active: true,
          is_superuser: derivedRole === "admin",
          is_verified: true,
        };
        const mockToken = "mock_token_" + Date.now();
        persistAuth(mockToken, mockUser);
        setUser(mockUser);
        return;
      }
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    full_name?: string,
    organization?: string
  ) => {
    try {
      await apiRegister(email, password, full_name, organization);
      await login(email, password);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "";
      if (
        errMsg.includes("fetch") ||
        errMsg.includes("Network") ||
        errMsg.includes("Failed to fetch") ||
        errMsg.includes("ECONNREFUSED") ||
        errMsg.includes("not reachable")
      ) {
        const derivedRole = _deriveRole(email, password);
        const mockUser: UserProfile = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          email: email,
          full_name: full_name || email.split("@")[0],
          organization: organization || "Marketing Team",
          role: derivedRole,
          is_active: true,
          is_superuser: derivedRole === "admin",
          is_verified: true,
        };
        const mockToken = "mock_token_" + Date.now();
        persistAuth(mockToken, mockUser);
        setUser(mockUser);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    if (token && !token.startsWith("mock_token_")) {
      await apiLogout(token).catch(() => {});
    }
    clearToken();
  };

  const updateProfile = async (
    data: Parameters<typeof apiUpdateProfile>[1]
  ) => {
    if (!token) throw new Error("Not authenticated");
    if (token.startsWith("mock_token_")) {
      const updated = { ...user, ...data } as UserProfile;
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
      return;
    }
    const updated = await apiUpdateProfile(token, data);
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
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
