/**
 * File: src/components/layout/navigation-dock.tsx
 * Purpose: Floating bottom navigation dock with Madar design system.
 *
 * Features:
 * - Fixed position at bottom center of screen
 * - Glass-morphism effect with backdrop blur
 * - Center action button for quick case creation
 * - Tooltips on hover
 * - Active state highlighting with orange accent
 * - Badge support for notifications
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Scale,
  BookOpen,
  Users,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   NAVIGATION ITEMS CONFIGURATION
   ============================================================================= */

interface NavItem {
  icon: React.ElementType;
  label: string;
  labelAr?: string;
  path?: string;
  isCenter?: boolean;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    path: "/dashboard",
  },
  {
    icon: FileText,
    label: "Cases",
    labelAr: "القضايا",
    path: "/cases",
  },
  {
    icon: Scale,
    label: "New Case",
    labelAr: "قضية جديدة",
    isCenter: true,
  },
  {
    icon: BookOpen,
    label: "Regulations",
    labelAr: "الأنظمة",
    path: "/regulations",
  },
  {
    icon: Users,
    label: "Clients",
    labelAr: "العملاء",
    path: "/clients",
  },
  {
    icon: Bell,
    label: "Alerts",
    labelAr: "التنبيهات",
    path: "/alerts",
    showBadge: true,
  },
];

/* =============================================================================
   DOCK ITEM COMPONENT
   ============================================================================= */

interface DockItemProps {
  icon: React.ElementType;
  label: string;
  path?: string;
  isActive?: boolean;
  showBadge?: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

function DockItem({
  icon: Icon,
  label,
  path,
  isActive,
  showBadge,
  badgeCount = 0,
  onClick,
}: DockItemProps) {
  const content = (
    <div className="relative group">
      {/* Icon Button */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          "w-12 h-12 rounded-xl",
          "transition-all duration-200",
          // Default state
          "text-slate-300",
          // Hover state
          "hover:bg-white/5 hover:text-white",
          // Active state
          isActive && "bg-white/10 text-[#D97706]"
        )}
      >
        <Icon className="h-5 w-5" />

        {/* Badge */}
        {showBadge && badgeCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "min-w-[18px] h-[18px] px-1",
              "flex items-center justify-center",
              "bg-[#D97706] text-white text-[10px] font-bold",
              "rounded-full border-2 border-[#0F2942]"
            )}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </div>

      {/* Tooltip */}
      <span
        className={cn(
          "absolute -top-14 left-1/2 transform -translate-x-1/2",
          "bg-[#0F2942] text-white text-xs py-1.5 px-3 rounded-lg",
          "opacity-0 group-hover:opacity-100",
          "translate-y-2 group-hover:translate-y-0",
          "transition-all duration-200",
          "whitespace-nowrap pointer-events-none",
          "border border-[#1E3A56] font-medium tracking-wide shadow-xl",
          "z-50"
        )}
      >
        {label}
        {/* Arrow */}
        <div
          className={cn(
            "absolute -bottom-1 left-1/2 transform -translate-x-1/2",
            "w-2 h-2 bg-[#0F2942] rotate-45",
            "border-r border-b border-[#1E3A56]"
          )}
        />
      </span>
    </div>
  );

  if (path) {
    return (
      <Link href={path} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] rounded-xl">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] rounded-xl"
    >
      {content}
    </button>
  );
}

/* =============================================================================
   CENTER ACTION BUTTON
   ============================================================================= */

interface CenterButtonProps {
  onClick?: () => void;
  label: string;
}

function CenterButton({ onClick, label }: CenterButtonProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "bg-gradient-to-tr from-[#D97706] to-[#B45309]",
          "hover:from-[#B45309] hover:to-[#92400e]",
          "text-white p-3.5 rounded-xl",
          "shadow-lg shadow-orange-900/30",
          "transition-all duration-200",
          "hover:scale-105 active:scale-95",
          "flex items-center justify-center",
          "border border-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        )}
        aria-label={label}
      >
        <Scale className="h-6 w-6" />
      </button>

      {/* Tooltip */}
      <span
        className={cn(
          "absolute -top-14 left-1/2 transform -translate-x-1/2",
          "bg-[#0F2942] text-white text-xs py-1.5 px-3 rounded-lg",
          "opacity-0 group-hover:opacity-100",
          "translate-y-2 group-hover:translate-y-0",
          "transition-all duration-200",
          "whitespace-nowrap pointer-events-none",
          "border border-[#1E3A56] font-medium tracking-wide shadow-xl",
          "z-50"
        )}
      >
        {label}
        <div
          className={cn(
            "absolute -bottom-1 left-1/2 transform -translate-x-1/2",
            "w-2 h-2 bg-[#0F2942] rotate-45",
            "border-r border-b border-[#1E3A56]"
          )}
        />
      </span>
    </div>
  );
}

/* =============================================================================
   NAVIGATION DOCK
   ============================================================================= */

interface NavigationDockProps {
  /** Number of unread alerts to show on badge */
  unreadAlerts?: number;
  /** Callback when "New Case" button is clicked */
  onNewCase?: () => void;
}

export function NavigationDock({
  unreadAlerts = 0,
  onNewCase,
}: NavigationDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNewCase = () => {
    if (onNewCase) {
      onNewCase();
    } else {
      // Default behavior: navigate to new case page
      router.push("/cases/new");
    }
  };

  return (
    <nav
      className={cn(
        // Position
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
        // Container styling
        "flex items-center gap-1 p-2",
        "bg-[#0F2942]/95 backdrop-blur-xl",
        "border border-[#1E3A56] ring-1 ring-white/10",
        "rounded-2xl shadow-2xl"
      )}
      aria-label="Main navigation"
    >
      {navItems.map((item, index) => {
        // Center action button
        if (item.isCenter) {
          return (
            <CenterButton
              key={item.label}
              label={item.label}
              onClick={handleNewCase}
            />
          );
        }

        // Regular nav item
        const isActive = Boolean(
          item.path === pathname ||
          (item.path && pathname.startsWith(`${item.path}/`))
        );

        return (
          <DockItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive}
            showBadge={item.showBadge}
            badgeCount={item.showBadge ? unreadAlerts : undefined}
          />
        );
      })}
    </nav>
  );
}
