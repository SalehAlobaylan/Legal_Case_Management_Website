/*
 * File: src/lib/store/websocket-store.ts
 * Purpose: Zustand store for WebSocket connection state.
 * Used by: WebSocket hook and UI components that need to display connection status.
 */

import { create } from "zustand";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface WebSocketState {
  // Connection status
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  
  // Last error message
  error: string | null;
  setError: (error: string | null) => void;
  
  // Reconnection attempts
  reconnectAttempts: number;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  
  // Last event received timestamp
  lastEventAt: Date | null;
  setLastEventAt: (date: Date) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: "disconnected",
  setStatus: (status) => set({ status }),
  
  error: null,
  setError: (error) => set({ error }),
  
  reconnectAttempts: 0,
  incrementReconnectAttempts: () => 
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
  
  lastEventAt: null,
  setLastEventAt: (date) => set({ lastEventAt: date }),
}));
