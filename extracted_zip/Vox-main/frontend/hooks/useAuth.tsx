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
      try {
        const user = await api.auth.me();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
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

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error("Logout failed on backend", e);
    }
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    router.push("/");
  };

  const setToken = (token: string) => {
    // Legacy function, no longer used with HttpOnly cookies
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
