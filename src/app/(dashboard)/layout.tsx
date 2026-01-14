/**
 * File: src/app/(dashboard)/layout.tsx
 * Purpose: Shared layout for all authenticated dashboard routes.
 *
 * Layout Structure (Madar Design):
 * ┌─────────────────────────────────────────────────────────┐
 * │                    DARK HEADER (h-20)                   │
 * │  [🔶 Madar]     [    Search Bar    ]    [🔔][⚙️][👤]    │
 * ├─────────────────────────────────────────────────────────┤
 * │                                                         │
 * │                    MAIN CONTENT                         │
 * │                  (bg-[#f8fafc])                         │
 * │                  (pb-32 for dock clearance)             │
 * │                                                         │
 * └─────────────────────────────────────────────────────────┘
 *               ┌─────────────────────────────────────────────┐
 *               │    FLOATING NAV DOCK            │
 *               │ [📊][📁] ⚖️ [📖][👥][🔔]        │
 *               │    (fixed bottom-8)             │
 *               └─────────────────────────────────┘
 *
 * Routes under this group include:
 *  - /dashboard
 *  - /cases, /cases/[id], /cases/new
 *  - /regulations
 *  - /clients
 *  - /alerts
 *  - /settings
 */

"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { NavigationDock } from "@/components/layout/navigation-dock";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
import { useAlertsStore } from "@/lib/store/alerts-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { unreadAlerts } = useAlertsStore();

  return (
    <WebSocketProvider>
      <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        {/* Header - Dark navy with Madar branding */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-32">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Floating Navigation Dock */}
        <NavigationDock unreadAlerts={unreadAlerts} />
      </div>
    </WebSocketProvider>
  );
}
