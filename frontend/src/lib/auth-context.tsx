"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { login, register, getCurrentUser } from "./api-client";
import { AuthContextType, User } from "@/types/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const response = await login({ email, password });
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(response.user);
  };

  const handleRegister = async (
    email: string,
    firstname: string,
    lastname: string,
    password: string,
    role: string,
  ) => {
    const response = await register({
      email,
      firstname,
      lastname,
      password,
      role,
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(response.user);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}