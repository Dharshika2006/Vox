"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("vox_token");
      if (!token) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const user = await api.auth.me();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error("Auth failed:", err);
        localStorage.removeItem("vox_token");
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Session expired",
        });
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      const { url } = await api.auth.login();
      window.location.href = url;
    } catch (err) {
      console.error("Login failed", err);
      setState((s) => ({ ...s, error: "Failed to initiate login" }));
    }
  };

  const logout = () => {
    localStorage.removeItem("vox_token");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    router.push("/");
  };

  const setToken = (token: string) => {
    localStorage.setItem("vox_token", token);
    // Reload to fetch user profile
    window.location.href = "/dashboard";
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
