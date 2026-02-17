"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { login, register, getCurrentUser } from "./api-client";
import { AuthContextType, User } from "@/types";

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
    setUser(response.user);
  };

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
    role: string,
  ) => {
    const response = await register({ email, username, password, role });
    setUser(response.user);
  };

  const handleLogout = () => {
    setUser(null);
    //TODO: Implement logout API call
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
