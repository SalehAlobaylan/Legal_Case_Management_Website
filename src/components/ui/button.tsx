/**
 * File: src/components/ui/button.tsx
 * Purpose: Reusable button component with Silah design system styling.
 * 
 * Variants:
 * - primary: Orange accent button for primary actions
 * - secondary: Navy button for secondary actions
 * - outline: Bordered button with transparent background
 * - ghost: Minimal button for tertiary actions
 * - destructive: Red button for dangerous actions
 * - link: Text-only button that looks like a link
 * 
 * Sizes: sm, md, lg, icon
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show loading spinner and disable button */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses = cn(
      // Base styles
      "inline-flex items-center justify-center gap-2",
      "font-bold text-sm",
      "rounded-lg",
      // Transitions
      "transition-all duration-200 ease-out",
      // Focus styles
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "focus-visible:ring-[var(--color-brand-accent)]",
      // Disabled styles
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Active press effect
      "active:scale-[0.98]"
    );

    const variantClasses: Record<ButtonVariant, string> = {
      primary: cn(
        // Orange accent button
        "bg-[var(--color-brand-accent)] text-white",
        "hover:bg-[var(--color-brand-accent-hover)]",
        "shadow-md hover:shadow-lg",
        "hover:-translate-y-0.5",
        // Accent shadow on hover
        "hover:shadow-[0_4px_14px_-3px_rgba(217,119,6,0.3)]"
      ),
      secondary: cn(
        // Navy button
        "bg-[var(--color-brand-primary)] text-white",
        "hover:bg-[var(--color-brand-secondary)]",
        "shadow-sm hover:shadow-md"
      ),
      outline: cn(
        // Bordered button
        "border-2 border-[var(--color-border-default)]",
        "bg-transparent text-[var(--color-text-primary)]",
        "hover:border-[var(--color-brand-accent)]",
        "hover:bg-[var(--color-surface-hover)]",
        // Dark mode
        "dark:border-[var(--color-border-default)]",
        "dark:text-[var(--color-text-primary)]",
        "dark:hover:border-[var(--color-brand-accent)]",
        "dark:hover:bg-[var(--color-surface-hover)]"
      ),
      ghost: cn(
        // Minimal button
        "bg-transparent text-[var(--color-text-secondary)]",
        "hover:bg-[var(--color-surface-muted)]",
        "hover:text-[var(--color-text-primary)]"
      ),
      destructive: cn(
        // Red danger button
        "bg-[var(--color-error-text)] text-white",
        "hover:bg-[var(--color-error-text-dark)]",
        "shadow-sm hover:shadow-md"
      ),
      link: cn(
        // Text link button
        "bg-transparent text-[var(--color-brand-accent)]",
        "underline-offset-4 hover:underline",
        "p-0 h-auto"
      ),
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner className="h-4 w-4" />
            <span className="sr-only">Loading...</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Loading spinner component for button loading state
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}