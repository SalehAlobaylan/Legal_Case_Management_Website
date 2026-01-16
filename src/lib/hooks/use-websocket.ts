"use client";

/*
 * File: src/lib/hooks/use-websocket.ts
 * Purpose: WebSocket hook for real-time updates from the backend.
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Query invalidation on server events
 * - Toast notifications for important updates
 * - Connection state management via Zustand store
 * 
 * Events handled:
 * - regulation-updated: Refreshes regulations and AI links
 * - case-links-refreshed: Refreshes AI links for a specific case
 * - case-updated: Refreshes cases list
 * - client-updated: Refreshes clients list
 * - notification: Shows toast and refreshes alerts
 * - document-uploaded: Refreshes documents for a case
 */

import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth-store";
import { useWebSocketStore } from "@/lib/store/websocket-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Reconnection config
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const {
    setStatus,
    setError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    reconnectAttempts,
    setLastEventAt,
  } = useWebSocketStore();

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    return delay;
  }, [reconnectAttempts]);

  // Handle server events
  const setupEventHandlers = useCallback((socket: Socket) => {
    // Connection confirmed
    socket.on("connected", (data?: { orgId?: number }) => {
      console.log("[useWebSocket] Server confirmed connection", data);
    });

    // Regulation updated
    socket.on("regulation-updated", (data?: { regulationId?: number }) => {
      setLastEventAt(new Date());

      toast({
        title: "Regulation Updated",
        description: "A regulation has been updated. Refreshing data...",
      });

      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });

      if (data?.regulationId) {
        queryClient.invalidateQueries({ queryKey: ["regulation", data.regulationId] });
      }
    });

    // AI links generated/refreshed for a case
    socket.on("ai-links.generated", (data?: { caseId?: number }) => {
      setLastEventAt(new Date());

      if (typeof data?.caseId === "number") {
        queryClient.invalidateQueries({
          queryKey: ["ai-links", data.caseId],
        });

        toast({
          title: "AI Suggestions Updated",
          description: "New AI suggestions are available for your case.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      }
    });

    socket.on("case-links-refreshed", (data: { case_id?: number }) => {
      setLastEventAt(new Date());

      if (typeof data?.case_id === "number") {
        queryClient.invalidateQueries({
          queryKey: ["ai-links", data.case_id],
        });

        toast({
          title: "AI Suggestions Updated",
          description: "New AI suggestions are available for your case.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      }
    });

    // AI link verified
    socket.on("ai-links.verified", (data?: { linkId?: number; caseId?: number }) => {
      setLastEventAt(new Date());

      if (data?.caseId) {
        queryClient.invalidateQueries({ queryKey: ["ai-links", data.caseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      }
    });

    // Case updated
    socket.on("case-updated", (data?: { caseId?: number }) => {
      setLastEventAt(new Date());

      queryClient.invalidateQueries({ queryKey: ["cases"] });

      if (data?.caseId) {
        queryClient.invalidateQueries({ queryKey: ["case", data.caseId] });
      }
    });

    // Client updated
    socket.on("client-updated", (data?: { clientId?: number }) => {
      setLastEventAt(new Date());

      queryClient.invalidateQueries({ queryKey: ["clients"] });

      if (data?.clientId) {
        queryClient.invalidateQueries({ queryKey: ["client", data.clientId] });
      }
    });

    // New notification
    socket.on("notification", (data?: { title?: string; message?: string }) => {
      setLastEventAt(new Date());

      queryClient.invalidateQueries({ queryKey: ["alerts"] });

      if (data?.title) {
        toast({
          title: data.title,
          description: data.message,
        });
      }
    });

    // Document uploaded
    socket.on("document-uploaded", (data?: { caseId?: number; fileName?: string }) => {
      setLastEventAt(new Date());

      if (data?.caseId) {
        queryClient.invalidateQueries({ queryKey: ["documents", data.caseId] });

        toast({
          title: "Document Uploaded",
          description: data.fileName
            ? `"${data.fileName}" has been uploaded.`
            : "A new document has been uploaded.",
        });
      }
    });

    // Document deleted
    socket.on("document-deleted", (data?: { caseId?: number }) => {
      setLastEventAt(new Date());

      if (data?.caseId) {
        queryClient.invalidateQueries({ queryKey: ["documents", data.caseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    });

    // Link verified/dismissed
    socket.on("link-updated", (data?: { caseId?: number }) => {
      setLastEventAt(new Date());

      if (data?.caseId) {
        queryClient.invalidateQueries({ queryKey: ["ai-links", data.caseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      }
    });
  }, [queryClient, setLastEventAt]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // If already connected or connecting, don't reconnect
    if (socketRef.current?.connected) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!wsUrl) {
      console.warn(
        "[useWebSocket] NEXT_PUBLIC_WS_URL is not set; real-time updates are disabled."
      );
      return;
    }

    setStatus("connecting");
    setError(null);

    const socket = io(wsUrl, {
      transports: ["websocket"],
      query: { token },
      reconnection: false, // We handle reconnection manually
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("[useWebSocket] Connected");
      setStatus("connected");
      resetReconnectAttempts();
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("[useWebSocket] Disconnected:", reason);
      setStatus("disconnected");

      // Auto-reconnect for non-intentional disconnects
      if (reason !== "io client disconnect" && reason !== "io server disconnect") {
        scheduleReconnect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("[useWebSocket] Connection error:", error.message);
      setStatus("error");
      setError(error.message);
      scheduleReconnect();
    });

    // Setup event handlers
    setupEventHandlers(socket);

    socketRef.current = socket;
  }, [token, setStatus, setError, resetReconnectAttempts, setupEventHandlers]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("[useWebSocket] Max reconnection attempts reached");
      setError("Unable to connect to real-time server. Please refresh the page.");
      return;
    }

    const delay = getReconnectDelay();
    console.log(`[useWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    incrementReconnectAttempts();

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [reconnectAttempts, getReconnectDelay, incrementReconnectAttempts, connect, setError]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus("disconnected");
    resetReconnectAttempts();
  }, [setStatus, resetReconnectAttempts]);

  // Effect to manage connection based on auth state
  useEffect(() => {
    if (!token) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Return socket for advanced usage
  return {
    socket: socketRef.current,
    disconnect,
    reconnect: connect,
  };
}

// Standalone function to get WebSocket URL
export function getWebSocketUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
}
