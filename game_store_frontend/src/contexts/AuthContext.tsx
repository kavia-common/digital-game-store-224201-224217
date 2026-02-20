"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockLogin, mockSignup, setAuthToken } from "@/lib/apiClient";
import { readJson, writeJson } from "@/lib/storage";

type Role = "GUEST" | "USER" | "ADMIN";

type AuthState = {
  role: Role;
  email: string | null;
};

type AuthContextValue = {
  state: AuthState;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEY = "dgs_auth_state";

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Provides authentication state and actions to the app. */
  const [state, setState] = useState<AuthState>(() =>
    readJson<AuthState>(LS_KEY, { role: "GUEST", email: null })
  );

  const persist = useCallback((next: AuthState) => {
    setState(next);
    writeJson(LS_KEY, next);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await mockLogin(email, password);
    if (!res.ok) return { ok: false as const, error: res.error };
    setAuthToken(res.data.token);
    persist({ role: res.data.role, email });
    return { ok: true as const };
  }, [persist]);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await mockSignup(email, password);
    if (!res.ok) return { ok: false as const, error: res.error };
    setAuthToken(res.data.token);
    persist({ role: "USER", email });
    return { ok: true as const };
  }, [persist]);

  const logout = useCallback(() => {
    setAuthToken(null);
    persist({ role: "GUEST", email: null });
  }, [persist]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      state,
      isAuthed: state.role === "USER" || state.role === "ADMIN",
      login,
      signup,
      logout,
    };
  }, [state, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook to access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
