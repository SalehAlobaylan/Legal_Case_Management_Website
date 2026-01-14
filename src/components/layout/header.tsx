/**
 * File: src/components/layout/header.tsx
 * Purpose: Dark navy header with Madar branding for the dashboard.
 *
 * Features:
 * - Dark navy background (#0F2942)
 * - Madar brand logo with orange accent
 * - Centered search bar with glass effect
 * - Notification bell with badge
 * - User profile section
 * - Sticky positioning
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Search, Bell, Settings, ChevronDown, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLogout } from "@/lib/hooks/use-auth";
import { useWebSocket } from "@/lib/hooks/use-websocket";
import { cn } from "@/lib/utils/cn";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ConnectionStatusIndicator } from "@/components/layout/connection-status";

/* =============================================================================
   HEADER COMPONENT
   ============================================================================= */

interface HeaderProps {
  /** Number of unread notifications */
  unreadCount?: number;
  /** Search input change handler */
  onSearch?: (query: string) => void;
  /** Click handler for notifications */
  onNotificationsClick?: () => void;
  /** Click handler for settings */
  onSettingsClick?: () => void;
}

export function Header({
  unreadCount = 0,
  onSearch,
  onNotificationsClick,
  onSettingsClick,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Establish WebSocket connection for real-time updates
  useWebSocket();

  // Get user initials for avatar
  const userInitials = React.useMemo(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  const userName = user?.fullName || "User";
  const userRole = user?.role || "Lawyer";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNotifications = () => {
    if (onNotificationsClick) {
      onNotificationsClick();
    } else {
      router.push("/alerts");
    }
  };

  const handleSettings = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push("/settings");
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header
      className={cn(
        "h-20 sticky top-0 z-40",
        "bg-[#0F2942] border-b border-[#1E3A56]",
        "flex items-center justify-between px-4 sm:px-6 lg:px-8",
        "shadow-md"
      )}
    >
      {/* Left: Brand Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] rounded-lg"
      >
        <div
          className={cn(
            "bg-[#D97706] p-2 rounded-lg",
            "shadow-lg shadow-orange-900/20",
            "group-hover:bg-white transition-all duration-300"
          )}
        >
          <Scale
            className={cn(
              "h-5 w-5 text-white",
              "group-hover:text-[#D97706] transition-colors duration-300"
            )}
          />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-wide text-white">
            Madar
          </h1>
          <p className="text-[10px] text-blue-200/80 font-medium tracking-widest uppercase">
            Case Management
          </p>
        </div>
      </Link>

      {/* Center: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          "hidden md:flex items-center",
          "bg-[#1E3A56] rounded-full px-4 py-2.5 w-96",
          "border border-[#2A4D70]",
          "focus-within:border-[#D97706] focus-within:bg-[#152e46]",
          "transition-all duration-200 group"
        )}
      >
        <Search
          className={cn(
            "h-4 w-4 text-blue-300 mr-2 flex-shrink-0",
            "group-focus-within:text-[#D97706] transition-colors"
          )}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search cases, regulations, or documents..."
          className={cn(
            "bg-transparent border-none outline-none",
            "text-sm w-full text-white",
            "placeholder:text-blue-300/50"
          )}
        />
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Connection Status */}
          <div className="hidden md:flex mr-2">
            <ConnectionStatusIndicator />
          </div>

          {/* Language Toggle */}
          <LanguageToggle variant="icon" />

          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotifications}
            className={cn(
              "relative p-2 rounded-full",
              "text-blue-200 hover:text-white",
              "hover:bg-[#1E3A56]",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute top-1.5 right-1.5",
                  "w-2.5 h-2.5 bg-[#D97706] rounded-full",
                  "border-2 border-[#0F2942]"
                )}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={handleSettings}
            className={cn(
              "p-2 rounded-full",
              "text-blue-200 hover:text-white",
              "hover:bg-[#1E3A56]",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-[#1E3A56]" />

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "flex items-center gap-2 sm:gap-3 cursor-pointer",
              "p-1.5 pr-2 sm:pr-3 rounded-full",
              "border border-transparent",
              "hover:bg-[#1E3A56] hover:border-[#2A4D70]",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            )}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-9 h-9 rounded-full",
                "bg-white text-[#0F2942]",
                "flex items-center justify-center",
                "font-bold text-sm",
                "shadow-md ring-2 ring-[#D97706]/20"
              )}
            >
              {userInitials}
            </div>

            {/* User Info - Hidden on small screens */}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-white leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-blue-200 font-medium mt-1">
                {userRole}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={cn(
                "hidden sm:block h-4 w-4 text-blue-200",
                "transition-transform duration-200",
                showUserMenu && "rotate-180"
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Menu */}
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 z-50",
                  "w-56 py-2",
                  "bg-white rounded-xl shadow-2xl",
                  "border border-slate-200",
                  "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-[#0F2942]">{userName}</p>
                  <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2",
                      "text-sm text-slate-700",
                      "hover:bg-slate-50 hover:text-[#0F2942]",
                      "transition-colors"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 w-full",
                      "text-sm text-red-600",
                      "hover:bg-red-50",
                      "transition-colors"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
