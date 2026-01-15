/**
 * File: src/app/(dashboard)/layout.tsx
 * Purpose: Shared layout for all authenticated dashboard routes.
 *
 * Layout Structure (Silah Design):
 * ┌─────────────────────────────────────────────────────────┐
 * │                    DARK HEADER (h-20)                   │
 * │  [🔶 Silah]     [    Search Bar    ]    [🔔][⚙️][👤]    │
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
      <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-900 selection:bg-[#D97706] selection:text-white">
        {/* Header - Dark navy with Silah branding */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto scroll-smooth">
          <div className="p-8 pb-32 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Floating Navigation Dock - Fixed position, outside main flow */}
        <NavigationDock unreadAlerts={unreadAlerts} />
      </div>
    </WebSocketProvider>
  );
}
