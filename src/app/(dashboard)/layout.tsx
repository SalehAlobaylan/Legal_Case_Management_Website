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
import { useUnreadAlertsCount } from "@/lib/hooks/use-alerts";
import { ChatPanel } from "@/components/features/chat/chat-panel";
import { ChatFAB } from "@/components/features/chat/chat-fab";
import { ChatErrorBoundary } from "@/components/features/chat/chat-error-boundary";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: unreadAlerts = 0 } = useUnreadAlertsCount();

  return (
    <WebSocketProvider>
      <div className="flex min-h-screen flex-col bg-[#f9fafb] font-sans text-slate-900 selection:bg-[#D97706] selection:text-white">
        {/* Header - Dark navy with Silah branding */}
        <Header unreadCount={unreadAlerts} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto scroll-smooth">
          <div className="p-4 md:p-6 lg:p-8 pb-32 space-y-8 md:space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Floating Navigation Dock - Fixed position, outside main flow */}
        <NavigationDock unreadAlerts={unreadAlerts} />

        {/* Chat Panel (triggered from search bar AI button) */}
        <ChatErrorBoundary>
          {/* ChatFAB removed — AI chat is now integrated inside the search bar */}
          <ChatPanel />
        </ChatErrorBoundary>
      </div>
    </WebSocketProvider>
  );
}
