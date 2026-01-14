/*
 * File: src/components/providers/websocket-provider.tsx
 * Purpose: Provider component that initializes WebSocket connection.
 * Used by: Dashboard layout to enable real-time updates for authenticated users.
 */

"use client";

import { useWebSocket } from "@/lib/hooks/use-websocket";

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    // Initialize WebSocket connection
    useWebSocket();

    return <>{children}</>;
}
