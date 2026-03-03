/**
 * File: src/components/ui/select.tsx
 * Purpose: Select dropdown component with Silah design system styling.
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
            "flex h-10 w-full rounded-lg border bg-[var(--color-surface-card)]",
            "px-3 py-2 text-sm text-[var(--color-text-primary)]",
            "appearance-none cursor-pointer",
            "pr-10",
            error
              ? "border-[var(--color-error-border)] focus-visible:ring-[var(--color-error-text)] focus-visible:border-[var(--color-error-text)]"
              : "border-[var(--color-border-default)] focus-visible:ring-[var(--color-brand-accent)] focus-visible:border-[var(--color-brand-accent)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            "transition-colors duration-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-[var(--color-text-light)]"
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
