/*
 * File: src/lib/store/auth-store.ts
 * Purpose: Hold authentication state (user, token, isAuthenticated) in a global Zustand store with persistence.
 * Used by: API client, auth hooks, and UI components that need to read or update the current logged-in user.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  organizationId: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) => {
        // Update in-memory + persisted state
        set({ user, token, isAuthenticated: true });
        // Also set a lightweight cookie so Next.js middleware can detect auth
        if (typeof document !== "undefined") {
          const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
          document.cookie = `auth-storage=1; Path=/; Max-Age=${maxAgeSeconds}`;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Clear the auth cookie used by middleware
        if (typeof document !== "undefined") {
          document.cookie =
            "auth-storage=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
