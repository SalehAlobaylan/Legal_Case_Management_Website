/**
 * File: src/lib/utils/cn.ts
 * Purpose: Utility for merging Tailwind CSS classes with proper conflict resolution.
 * 
 * Uses clsx for conditional class composition and tailwind-merge for
 * intelligent Tailwind class conflict resolution.
 * 
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
 * // Returns: "py-2 px-6" (px-6 overrides px-4, bg-blue-500 included if isActive)
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS class conflict resolution.
 * 
 * @param inputs - Class values (strings, objects, arrays, or conditional expressions)
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
