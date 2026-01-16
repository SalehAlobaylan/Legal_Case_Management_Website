/*
 * File: src/lib/store/ui-store.ts
 * Purpose: Zustand store for UI preferences (theme, locale, sidebar state).
 * Used by: Layout components, theme toggle, locale switcher.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type Locale = "ar" | "en";

interface NotificationPreferences {
  caseUpdates: boolean;
  aiSuggestions: boolean;
  regulationUpdates: boolean;
  documentUploads: boolean;
}

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Layout
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Notification preferences
  notifications: NotificationPreferences;
  setNotifications: (notifications: Partial<NotificationPreferences>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Defaults - Arabic is the default locale for Saudi Arabian legal practice
      theme: "system",
      locale: "ar", // Arabic default for RTL support
      sidebarCollapsed: false,
      notifications: {
        caseUpdates: true,
        aiSuggestions: true,
        regulationUpdates: true,
        documentUploads: true,
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to DOM
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          if (theme === "dark") {
            root.classList.add("dark");
          } else if (theme === "light") {
            root.classList.remove("dark");
          } else {
            // System preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", prefersDark);
          }
        }
      },

      // Locale actions
      setLocale: (locale) => {
        set({ locale });
        // Update document direction and lang
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
          document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
        }
      },

      // Sidebar actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

      // Notification preferences
      setNotifications: (updates) =>
        set({
          notifications: { ...get().notifications, ...updates },
        }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
      }),
    }
  )
);

// Initialize theme and locale on app load (call this in root layout)
export function initializeUI() {
  if (typeof document === "undefined") return;

  const state = useUIStore.getState();

  // Apply theme
  state.setTheme(state.theme);

  // Apply locale
  state.setLocale(state.locale);
}
