import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    const token = localStorage.getItem("dailyhug_token");
    if (!token) {
      setLoading(false);
      return;
    }
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
