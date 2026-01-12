"use client";

/*
 * File: src/components/theme-provider.tsx
 * Purpose: Minimal theme provider compatible with the layout usage in the plan.
 * Note: For now it simply renders children; dark/light theme toggling can be
 *       implemented later without changing the layout API.
 */

import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}

















