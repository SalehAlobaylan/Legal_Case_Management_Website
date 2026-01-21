"use client";

/*
 * File: src/components/ui/use-toast.ts
 * Purpose: Provide a toast() helper with the same API expected by the plan, so hooks can show feedback without errors.
 * Used by: Data hooks and components that want to display success/error notifications (can later be wired to shadcn/toaster UI).
 */

export type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

/**
 * Minimal toast implementation compatible with the planned API.
 * This can later be replaced by the full shadcn/ui toast system.
 */
export function toast(options: ToastOptions) {
  // For now, just log to the console to avoid runtime errors.
  // UI toast renderer will be added in the shadcn/ui setup phase.
  console.log(
    `[toast:${options.variant ?? "default"}]`,
    options.title ?? "",
    options.description ?? ""
  );
}

/**
 * Hook wrapper for toast function to match the common pattern.
 * Returns { toast } so components can destructure it.
 */
export function useToast() {
  return { toast };
}
