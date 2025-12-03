"use client";

/*
 * File: src/lib/hooks/use-websocket.ts
 *
 * High-level problem this solves
 * -------------------------------
 * Without any real-time channel, the dashboard only learns about changes when:
 *  - the user manually refreshes a page, or
 *  - React Query happens to refetch on navigation or a timed interval.
 *
 * For an AI‑assisted case management system this is not ideal, because:
 *  - New regulation versions or updated AI links might appear while a lawyer
 *    is actively reviewing a case.
 *  - Other team members may verify or adjust AI links, and those changes
 *    should be reflected for everyone who is currently viewing the same case.
 *
 * This hook creates a small "real-time bridge" between the Fastify backend
 * and the React Query cache:
 *  - It opens a WebSocket (via socket.io-client) once the user is authenticated.
 *  - It listens for server events like "regulation-updated" and
 *    "case-links-refreshed".
 *  - When an event arrives, it invalidates the relevant React Query caches so
 *    hooks such as useCases(), useCase(), and useAILinks() refetch fresh data.
 *
 * Typical use-cases
 * -----------------
 * 1) Regulation content changes:
 *    - Backend detects a new regulation version and emits "regulation-updated".
 *    - This hook shows a toast and invalidates ["regulations"] and ["ai-links"].
 *    - Any open dashboard that relies on those queries silently refreshes.
 *
 * 2) AI links refreshed for a case:
 *    - Backend recomputes links for a case and emits "case-links-refreshed"
 *      with { case_id }.
 *    - This hook invalidates ["ai-links", caseId], so the Case Detail page
 *      refetches the latest suggested regulations.
 *
 * 3) Multi-user collaboration:
 *    - One user verifies an AI link on a case.
 *    - Backend can emit an event to all users in the same organization.
 *    - Everyone's UI updates automatically without manual reloads.
 *
 * Where to use this hook
 * ----------------------
 * Call `useWebSocket()` once near the top of the authenticated app shell,
 * for example inside the dashboard Header component. You don't need the
 * returned socket instance for most flows; just calling the hook is enough
 * to keep the WebSocket connection and cache syncing alive.
 */

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    // If the user is not authenticated, ensure any existing socket is closed.
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      // In development it is helpful to see if the URL is missing.
      console.warn(
        "[useWebSocket] NEXT_PUBLIC_WS_URL is not set; real-time updates are disabled."
      );
      return;
    }

    const socket = io(wsUrl, {
      transports: ["websocket"],
      query: { token },
    });

    socket.on("connect", () => {
      // Connected successfully; useful for debugging and health checks.
      console.log("[useWebSocket] connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("[useWebSocket] disconnected:", reason);
    });

    // When the backend notifies that some regulation changed, we:
    //  - Show a small toast.
    //  - Invalidate regulations- and AI-link-related queries so data stays fresh.
    socket.on("regulation-updated", () => {
      toast({
        title: "Regulation updated",
        description: "Linked regulations have been refreshed in the background.",
      });

      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
    });

    // When links are regenerated for a specific case, the backend can emit:
    //   { case_id: number }
    // We invalidate only that case's AI links to keep the refresh targeted.
    socket.on("case-links-refreshed", (data: { case_id?: number }) => {
      if (typeof data?.case_id === "number") {
        queryClient.invalidateQueries({
          queryKey: ["ai-links", data.case_id],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, queryClient]);

  return socketRef.current;
}


