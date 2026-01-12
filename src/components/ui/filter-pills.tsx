/**
 * File: src/components/ui/filter-pills.tsx
 * Purpose: Filter pill/button components with Madar design system styling.
 *
 * Features:
 * - Horizontal scrollable container
 * - Active/inactive states
 * - Orange accent for active state
 * - Consistent with Figma design
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   FILTER PILL - Individual filter button
   ============================================================================= */

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this pill is currently active/selected */
  active?: boolean;
  /** Count to show in the pill */
  count?: number;
}

export function FilterPill({
  className,
  active = false,
  count,
  children,
  ...props
}: FilterPillProps) {
  return (
    <button
      type="button"
      className={cn(
        // Base styles
        "inline-flex items-center gap-2",
        "px-4 py-2 rounded-full",
        "text-sm font-bold whitespace-nowrap",
        "transition-all duration-200",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-[#D97706]",
        // Active state
        active && [
          "bg-[#D97706] text-white shadow-md",
          "hover:bg-[#B45309]",
        ],
        // Inactive state
        !active && [
          "bg-white text-slate-600",
          "border border-slate-200",
          "hover:border-[#D97706]/50 hover:bg-orange-50",
        ],
        className
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* =============================================================================
   FILTER PILLS CONTAINER - Horizontal scrollable container
   ============================================================================= */

export interface FilterPillsProps {
  children: React.ReactNode;
  className?: string;
  /** Label for accessibility */
  label?: string;
}

export function FilterPills({
  children,
  className,
  label = "Filter options",
}: FilterPillsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center gap-2 overflow-x-auto",
        "scrollbar-hide",
        "-mx-4 px-4 sm:mx-0 sm:px-0", // Full width scroll on mobile
        className
      )}
    >
      {children}
    </div>
  );
}

/* =============================================================================
   FILTER PILLS WITH STATE - Complete filter component with state management
   ============================================================================= */

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterPillsWithStateProps {
  options: FilterOption[];
  /** Currently selected option ID(s) */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Include "All" option */
  showAll?: boolean;
  /** Custom "All" label */
  allLabel?: string;
  /** Total count for "All" option */
  allCount?: number;
  className?: string;
}

export function FilterPillsWithState({
  options,
  value,
  onChange,
  multiple = false,
  showAll = true,
  allLabel = "All",
  allCount,
  className,
}: FilterPillsWithStateProps) {
  const selectedIds = Array.isArray(value) ? value : [value];
  const isAllSelected = selectedIds.length === 0;

  const handleClick = (optionId: string) => {
    if (optionId === "all") {
      // Select "All" = clear selection
      onChange(multiple ? [] : "");
      return;
    }

    if (multiple) {
      const newValue = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId];
      onChange(newValue);
    } else {
      onChange(optionId);
    }
  };

  return (
    <FilterPills className={className}>
      {showAll && (
        <FilterPill
          active={isAllSelected}
          count={allCount}
          onClick={() => handleClick("all")}
        >
          {allLabel}
        </FilterPill>
      )}
      {options.map((option) => (
        <FilterPill
          key={option.id}
          active={selectedIds.includes(option.id)}
          count={option.count}
          onClick={() => handleClick(option.id)}
        >
          {option.label}
        </FilterPill>
      ))}
    </FilterPills>
  );
}
