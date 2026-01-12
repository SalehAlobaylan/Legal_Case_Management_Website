/**
 * File: src/components/ui/select.tsx
 * Purpose: Select dropdown component with Madar design system styling.
 *
 * Features:
 * - Orange accent focus ring
 * - Consistent styling with Input component
 * - Dark mode support
 * - Custom arrow indicator
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Error state styling */
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            // Base styles
            "flex h-10 w-full rounded-lg border bg-white",
            "px-3 py-2 text-sm text-[#0F2942]",
            "appearance-none cursor-pointer",
            // Right padding for arrow
            "pr-10",
            // Border
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-[#D97706]",
            // Focus
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            "focus-visible:border-[#D97706]",
            // Transition
            "transition-colors duration-200",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            // Dark mode
            "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            "dark:focus-visible:border-[#D97706]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {/* Custom arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

/* =============================================================================
   SELECT OPTION - For type safety with options
   ============================================================================= */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectWithOptionsProps extends Omit<SelectProps, "children"> {
  options: SelectOption[];
  placeholder?: string;
}

export const SelectWithOptions = React.forwardRef<
  HTMLSelectElement,
  SelectWithOptionsProps
>(({ options, placeholder, ...props }, ref) => {
  return (
    <Select ref={ref} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </Select>
  );
});

SelectWithOptions.displayName = "SelectWithOptions";