"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api-client";
import { usersService } from "@/services/users.service";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id?: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  image?: string;
  roles?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, username?: string, userData?: Partial<UserProfile>) => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchProfileFromApi = useCallback(async () => {
    try {
      const res = await usersService.getResource();
      if (res && res.user) {
        const apiUser = res.user;
        const imageStr =
          typeof apiUser.image === "string"
            ? apiUser.image
            : (apiUser.image?.url as string) || "";
        const roleStr =
          apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : "User";
        const uname = apiUser.email ? apiUser.email.split("@")[0] : "user";

        const updatedUser: UserProfile = {
          id: apiUser.id,
          username: uname,
          name: apiUser.name || uname,
          role: roleStr,
          roles: apiUser.roles || [roleStr],
          email: apiUser.email || "",
          phone: apiUser.phone || "",
          image: imageStr,
        };

        setUser(updatedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_profile", JSON.stringify(updatedUser));
        }
      }
    } catch {
      // Graceful fallback to cached state if API request fails
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // 1. Load cached user profile for instant UI render
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("user_profile");
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            // JSON parse error ignore
          }
        }
      }
      // 2. Asynchronously fetch fresh data from backend API
      fetchProfileFromApi().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfileFromApi]);

  const login = (
    token: string,
    username: string = "user",
    userData?: Partial<UserProfile>
  ) => {
    setAuthToken(token);

    const formattedName = username
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const initialUser: UserProfile = {
      username,
      name: userData?.name || formattedName,
      role: userData?.role || "Administrator",
      email: userData?.email || (username.includes("@") ? username : `${username}@domain.com`),
      ...userData,
    };

    setUser(initialUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_profile", JSON.stringify(initialUser));
    }

    // Trigger async profile sync
    fetchProfileFromApi();
  };

  const logout = () => {
    clearAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_profile");
    }
    setUser(null);
    router.push("/login");
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem("user_profile", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || !!getAuthToken(),
        isLoading,
        login,
        logout,
        updateUser,
        refreshProfile: fetchProfileFromApi,
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
