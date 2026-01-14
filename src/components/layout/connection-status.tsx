/*
 * File: src/components/layout/connection-status.tsx
 * Purpose: Small indicator showing WebSocket connection status.
 * Used by: Header or footer to show real-time connection health.
 */

"use client";

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useWebSocketStore, type ConnectionStatus } from "@/lib/store/websocket-store";
import { cn } from "@/lib/utils/cn";

interface ConnectionStatusProps {
    className?: string;
    showLabel?: boolean;
}

export function ConnectionStatusIndicator({ className, showLabel = false }: ConnectionStatusProps) {
    const { status, error } = useWebSocketStore();

    const config: Record<ConnectionStatus, { icon: React.ReactNode; color: string; label: string }> = {
        connected: {
            icon: <Wifi className="h-3.5 w-3.5" />,
            color: "text-green-500",
            label: "Connected",
        },
        connecting: {
            icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
            color: "text-yellow-500",
            label: "Connecting...",
        },
        disconnected: {
            icon: <WifiOff className="h-3.5 w-3.5" />,
            color: "text-slate-400",
            label: "Offline",
        },
        error: {
            icon: <WifiOff className="h-3.5 w-3.5" />,
            color: "text-red-500",
            label: "Connection error",
        },
    };

    const { icon, color, label } = config[status];

    return (
        <div
            className={cn("flex items-center gap-1.5", color, className)}
            title={error || label}
        >
            {icon}
            {showLabel && (
                <span className="text-xs font-medium">{label}</span>
            )}
        </div>
    );
}
