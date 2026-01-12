/**
 * File: src/components/features/dashboard/stat-card.tsx
 * Purpose: Statistics card component for dashboard with Madar design system.
 *
 * Features:
 * - Active/inactive states with navy background
 * - Serif font for stat values
 * - Trend badge support
 * - Icon container with dynamic styling
 * - Hover animations
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  /** The main statistic value to display */
  value: string | number;
  /** Title/label for the statistic */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Trend indicator (e.g., "+12%", "Active") */
  trend?: string;
  /** Whether this card is in active/selected state */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

export function StatCard({
  value,
  title,
  subtitle,
  icon: Icon,
  trend,
  active = false,
  onClick,
  className,
}: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        // Base styles
        "p-6 rounded-2xl shadow-sm border",
        "transition-all duration-300",
        // Interactive states
        isClickable && "cursor-pointer",
        // Default (inactive) styles
        !active && [
          "bg-white border-slate-200",
          "hover:border-[#D97706]/50 hover:shadow-lg",
        ],
        // Active styles
        active && [
          "bg-[#0F2942] border-[#0F2942] text-white",
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Header with icon and trend */}
      <div className="flex justify-between items-start mb-4">
        {/* Icon container */}
        <div
          className={cn(
            "p-3 rounded-xl",
            active ? "bg-white/10" : "bg-slate-50"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              active ? "text-white" : "text-[#0F2942]"
            )}
          />
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md",
              active
                ? "bg-[#D97706] text-white"
                : "bg-green-100 text-green-700"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <h3
        className={cn(
          "text-4xl font-bold mb-2 font-serif",
          active ? "text-white" : "text-[#0F2942]"
        )}
      >
        {value}
      </h3>

      {/* Title */}
      <p
        className={cn(
          "text-sm font-bold",
          active ? "text-blue-200" : "text-slate-700"
        )}
      >
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={cn(
            "text-xs mt-1",
            active ? "text-blue-300" : "text-slate-400"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =============================================================================
   STAT CARD SKELETON - Loading placeholder
   ============================================================================= */

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl shadow-sm border border-slate-200 bg-white",
        "animate-pulse",
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
        <div className="w-16 h-6 bg-slate-200 rounded-md" />
      </div>

      {/* Value */}
      <div className="w-20 h-10 bg-slate-200 rounded-md mb-2" />

      {/* Title */}
      <div className="w-32 h-4 bg-slate-200 rounded-md mb-1" />

      {/* Subtitle */}
      <div className="w-24 h-3 bg-slate-200 rounded-md" />
    </div>
  );
}

/* =============================================================================
   STAT CARDS GRID - Container for stat cards
   ============================================================================= */

export interface StatCardsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatCardsGrid({ children, className }: StatCardsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
