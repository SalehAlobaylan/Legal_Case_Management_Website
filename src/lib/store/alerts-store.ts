/**
 * File: src/lib/store/alerts-store.ts
 * Purpose: Zustand store for managing alerts/notifications state.
 */

import { create } from "zustand";

interface Alert {
  id: number;
  type: "ai" | "regulation" | "case" | "system";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

interface AlertsStore {
  alerts: Alert[];
  unreadAlerts: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addAlert: (alert: Omit<Alert, "id" | "timestamp" | "read">) => void;
}

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  alerts: [
    {
      id: 1,
      type: "ai",
      title: "New Regulation Match Found",
      description: "AI discovered relevant articles for Case #C-2024-089.",
      timestamp: new Date(),
      read: false,
    },
    {
      id: 2,
      type: "regulation",
      title: "Labor Law Amendment",
      description: "Article 77 of Saudi Labor Law has been amended.",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: 3,
      type: "case",
      title: "Case Status Updated",
      description: "Case #C-2024-085 moved to Pending Hearing.",
      timestamp: new Date(Date.now() - 7200000),
      read: false,
    },
  ],
  unreadAlerts: 3,
  markAsRead: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      );
      return {
        alerts,
        unreadAlerts: alerts.filter((a) => !a.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadAlerts: 0,
    })),
  addAlert: (alert) =>
    set((state) => {
      const newAlert: Alert = {
        ...alert,
        id: Date.now(),
        timestamp: new Date(),
        read: false,
      };
      return {
        alerts: [newAlert, ...state.alerts],
        unreadAlerts: state.unreadAlerts + 1,
      };
    }),
}));
