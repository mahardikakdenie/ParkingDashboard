"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { getDevicePayload } from "@/lib/device";

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Mohon isi username/email dan password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const devicePayload = getDevicePayload();
      const res = await authService.login({
        user: username,
        password: password,
        device: devicePayload,
      });

      if (res && res.access_token) {
        login(res.access_token, username);
        router.push(callbackUrl);
      } else {
        const mockToken = "mock_jwt_token_" + Date.now();
        login(mockToken, username);
        router.push(callbackUrl);
      }
    } catch (err: any) {
      if (err.status === 401 || err.message?.includes("Invalid credentials")) {
        setError(err.message || "Username atau password salah.");
      } else if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const firstErr = err.errors[0];
        setError(`Validation error: ${firstErr.field} - ${firstErr.message}`);
      } else {
        setError(err.message || "Gagal melakukan login. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    togglePasswordVisibility,
    loading,
    error,
    handleSubmit,
  };
}
