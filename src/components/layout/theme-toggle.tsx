/*
 * File: src/components/layout/theme-toggle.tsx
 * Purpose: Theme toggle button for switching between light/dark modes.
 * Used by: Header and settings page.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";

export function ThemeToggle() {
    const { theme, setTheme } = useUIStore();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}
