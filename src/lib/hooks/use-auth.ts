"use client";

/*
 * File: src/lib/hooks/use-auth.ts
 * Purpose: Provide authentication hooks (login, register, logout) that talk to the Fastify backend
 *          and keep the global Zustand auth store in sync.
 * Backend contract (from Fastify plan):
 *  - POST /api/auth/login    -> { user, token }
 *  - POST /api/auth/register -> { user, token }
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth-store";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInputBase {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

interface RegisterInputJoin extends RegisterInputBase {
  organizationId: number;
  registrationType: "join";
}

interface RegisterInputCreate extends RegisterInputBase {
  organizationName: string;
  subscriptionTier?: string;
  registrationType: "create";
}

type RegisterInput = RegisterInputJoin | RegisterInputCreate;

interface AuthResponse<User = unknown> {
  user: User;
  token: string;
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<AuthResponse>("/api/auth/login", input);
      return data;
    },
    onSuccess: (data) => {
      // Persist auth state and navigate to dashboard
      setUser(
        data.user as {
          id: number;
          email: string;
          fullName: string;
          role: string;
          organizationId: number;
        },
        data.token
      );
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/api/auth/register",
        input
      );
      return data;
    },
    onSuccess: (data) => {
      setUser(
        data.user as {
          id: number;
          email: string;
          fullName: string;
          role: string;
          organizationId: number;
        },
        data.token
      );
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    router.push("/login");
  };
}


