/**
 * File: src/components/ui/input.tsx
 * Purpose: Text input component with Silah design system styling.
 *
 * Features:
 * - Orange accent focus ring
 * - Consistent height and padding
 * - Dark mode support
 * - Icon support (start/end)
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon to show at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to show at the end of the input */
  endIcon?: React.ReactNode;
  /** Error state styling */
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, ...props }, ref) => {
    // If we have icons, use the wrapper version
    if (startIcon || endIcon) {
      return (
        <div className="relative">
          {startIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-slate-400">{startIcon}</span>
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-lg border bg-white",
              "px-3 py-2 text-sm text-[#0F2942]",
              // Placeholder
              "placeholder:text-slate-400",
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
              "dark:placeholder:text-slate-500",
              "dark:focus-visible:border-[#D97706]",
              // Icon padding
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-slate-400">{endIcon}</span>
            </div>
          )}
        </div>
      );
    }

    // Simple input without icons
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-lg border bg-white",
          "px-3 py-2 text-sm text-[#0F2942]",
          // Placeholder
          "placeholder:text-slate-400",
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
          "dark:placeholder:text-slate-500",
          "dark:focus-visible:border-[#D97706]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

/* =============================================================================
   SEARCH INPUT - Specialized search input with icon
   ============================================================================= */

type SearchInputSize = "sm" | "md" | "lg";

export interface SearchInputProps
  extends Omit<InputProps, "type" | "startIcon" | "size"> {
  /** Size variant for the search input */
  inputSize?: SearchInputSize;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, inputSize = "md", placeholder = "Search...", ...props }, ref) => {
    const sizeClasses: Record<SearchInputSize, string> = {
      sm: "h-8 text-xs",
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    };

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="search"
          className={cn(
            // Base styles
            "flex w-full rounded-full border bg-white",
            "pl-10 pr-4 text-[#0F2942]",
            // Placeholder
            "placeholder:text-slate-400",
            // Border
            "border-slate-200",
            // Focus
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            "focus-visible:ring-[#D97706] focus-visible:border-[#D97706]",
            // Transition
            "transition-colors duration-200",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Dark mode
            "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            "dark:placeholder:text-slate-500",
            // Size
            sizeClasses[inputSize],
            className
          )}
          placeholder={placeholder}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
