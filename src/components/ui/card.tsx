/**
 * File: src/components/ui/card.tsx
 * Purpose: Card layout primitives with Silah design system styling.
 *
 * Features:
 * - Consistent rounded corners (rounded-2xl by default)
 * - Subtle shadows with hover states
 * - Border styling that works in light/dark modes
 * - Flexible composition with Header, Title, Description, Content, Footer
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   CARD ROOT
   ============================================================================= */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply hover effect with shadow and border color change */
  hoverable?: boolean;
  /** Use active/selected state styling */
  active?: boolean;
}

export function Card({
  className,
  hoverable = false,
  active = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        "rounded-2xl border bg-white text-[#0F2942]",
        "shadow-sm",
        // Default border
        "border-slate-200",
        // Dark mode
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800",
        // Hover state (optional)
        hoverable && [
          "transition-all duration-300",
          "hover:shadow-lg hover:border-[#D97706]/50",
          "cursor-pointer",
        ],
        // Active state (optional)
        active && [
          "bg-[#0F2942] text-white border-[#0F2942]",
          "dark:bg-[#0F2942] dark:border-[#0F2942]",
        ],
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CARD HEADER
   ============================================================================= */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add bottom border separator */
  bordered?: boolean;
}

export function CardHeader({
  className,
  bordered = false,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        bordered && "border-b border-slate-100 dark:border-slate-800",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CARD TITLE
   ============================================================================= */

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Use serif font (Playfair Display) for decorative titles */
  serif?: boolean;
}

export function CardTitle({ className, serif = false, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-bold leading-none tracking-tight",
        "text-[#0F2942] dark:text-slate-100",
        serif && "font-serif",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CARD DESCRIPTION
   ============================================================================= */

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CARD CONTENT
   ============================================================================= */

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

/* =============================================================================
   CARD FOOTER
   ============================================================================= */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add top border separator */
  bordered?: boolean;
}

export function CardFooter({
  className,
  bordered = false,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center p-6 pt-0",
        bordered && "border-t border-slate-100 dark:border-slate-800 pt-6",
        className
      )}
      {...props}
    />
  );
}
