"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface UserProfile {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setUser({
        username: "admin",
        name: "Admin Sudirman",
        role: "Central Manager",
      });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, username: string = "admin") => {
    setAuthToken(token);
    setUser({
      username,
      name: username === "admin" ? "Admin Sudirman" : username,
      role: "Central Manager",
    });
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || !!getAuthToken(),
        isLoading,
        login,
        logout,
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
