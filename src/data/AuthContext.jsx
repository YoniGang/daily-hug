import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" while there is a token to validate; otherwise we already
  // know the user is unauthenticated and can render immediately.
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("dailyhug_token")
  );

  // Validate stored token on mount
  useEffect(() => {
    if (!localStorage.getItem("dailyhug_token")) return;
    api
      .getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("dailyhug_token"))
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (email, password, name) => {
    const { token, user: u } = await api.authRegister(email, password, name);
    localStorage.setItem("dailyhug_token", token);
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.authLogin(email, password);
    localStorage.setItem("dailyhug_token", token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("dailyhug_token");
    setUser(null);
  }, []);

  const pair = useCallback(async (partnerEmail) => {
    const updated = await api.pairPartner(partnerEmail);
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await api.getMe();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, pair, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
