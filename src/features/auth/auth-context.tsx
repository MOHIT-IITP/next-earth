"use client";

import * as React from "react";
import { User, MockAuthAdapter, AuthResponse } from "./auth-adapter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

function formatUser(apiUser: any): User {
  const initials =
    apiUser.initials ||
    (apiUser.name || "")
      .split(" ")
      .map((w: string) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "EU";

  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role || "Lead Field Ecologist",
    organization: apiUser.organization || "Global Biosphere Survey",
    avatarUrl:
      apiUser.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials,
    createdAt: apiUser.createdAt
      ? typeof apiUser.createdAt === "string"
        ? apiUser.createdAt.split("T")[0]
        : new Date(apiUser.createdAt).toISOString().split("T")[0]
      : "2024-03-15",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // 1. Hydrate from storage first for instantaneous UI
    const cached = MockAuthAdapter.getSession();
    if (cached) {
      setUser(cached);
    }

    // 2. Verify with server /api/auth/me
    fetch("/api/auth/me")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const formatted = formatUser(data.user);
            setUser(formatted);
            MockAuthAdapter.setSession(formatted);
          }
        }
      })
      .catch(() => {
        // DB or network offline, keep cached session
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        const formatted = formatUser(data.user);
        setUser(formatted);
        MockAuthAdapter.setSession(formatted);
        return { success: true, user: formatted };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return await MockAuthAdapter.login(email, password);
    } catch {
      const fallbackRes = await MockAuthAdapter.login(email, password);
      if (fallbackRes.success && fallbackRes.user) {
        setUser(fallbackRes.user);
      }
      return fallbackRes;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        const formatted = formatUser(data.user);
        setUser(formatted);
        MockAuthAdapter.setSession(formatted);
        return { success: true, user: formatted };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return await MockAuthAdapter.signup(name, email, password);
    } catch {
      const fallbackRes = await MockAuthAdapter.signup(name, email, password);
      if (fallbackRes.success && fallbackRes.user) {
        setUser(fallbackRes.user);
      }
      return fallbackRes;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      MockAuthAdapter.setSession(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        return { success: true };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return MockAuthAdapter.resetPassword(email);
    } catch {
      return MockAuthAdapter.resetPassword(email);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    const updated = MockAuthAdapter.updateUser(updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
