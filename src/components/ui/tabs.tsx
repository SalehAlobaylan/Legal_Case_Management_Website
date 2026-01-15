/**
 * File: src/components/ui/tabs.tsx
 * Purpose: Tab components with Silah design system styling.
 *
 * Components:
 * - Tabs: Root container with context
 * - TabsList: Container for tab triggers
 * - TabsTrigger: Individual tab button
 * - TabsContent: Content panel for each tab
 *
 * Features:
 * - Orange accent underline for active tab
 * - Smooth transitions
 * - Keyboard navigation support
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   CONTEXT
   ============================================================================= */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return ctx;
}

/* =============================================================================
   TABS ROOT
   ============================================================================= */

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default active tab value */
  defaultValue: string;
  /** Controlled value */
  value?: string;
  /** Change handler for controlled mode */
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* =============================================================================
   TABS LIST - Underline variant (default from Figma)
   ============================================================================= */

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "underline" | "pills";
}

export function TabsList({
  className,
  variant = "underline",
  ...props
}: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center",
        // Underline variant (Figma default)
        variant === "underline" && [
          "gap-8 border-b border-slate-200",
          "dark:border-slate-700",
        ],
        // Pills variant
        variant === "pills" && [
          "gap-2 p-1 rounded-lg bg-slate-100",
          "dark:bg-slate-800",
        ],
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   TABS TRIGGER
   ============================================================================= */

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tab value - must match TabsContent value */
  value: string;
  /** Visual variant - should match parent TabsList */
  variant?: "underline" | "pills";
}

export function TabsTrigger({
  className,
  value,
  variant = "underline",
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative inline-flex items-center gap-2",
        "text-sm font-bold tracking-wide",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-[#D97706]",
        // Underline variant
        variant === "underline" && [
          "pb-4",
          isActive
            ? "text-[#0F2942] dark:text-white"
            : "text-slate-400 hover:text-[#0F2942] dark:hover:text-slate-200",
        ],
        // Pills variant
        variant === "pills" && [
          "px-3 py-1.5 rounded-md",
          isActive
            ? "bg-white text-[#0F2942] shadow-sm dark:bg-slate-700 dark:text-white"
            : "text-slate-500 hover:text-[#0F2942] dark:text-slate-400 dark:hover:text-white",
        ],
        className
      )}
      {...props}
    >
      {children}
      {/* Active indicator - underline variant */}
      {variant === "underline" && isActive && (
        <span
          className="absolute bottom-0 left-0 w-full h-1 bg-[#D97706] rounded-t-full"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/* =============================================================================
   TABS CONTENT
   ============================================================================= */

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tab value - must match TabsTrigger value */
  value: string;
}

export function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const ctx = useTabsContext();

  if (ctx.value !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn("mt-6 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
