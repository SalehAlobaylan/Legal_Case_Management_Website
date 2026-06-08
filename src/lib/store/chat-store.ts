/*
 * File: src/lib/store/chat-store.ts
 * Purpose: Zustand store for chat panel state — open/close, messages, streaming, sessions.
 */

import { create } from "zustand";

export interface ChatCitation {
  regulation_id: number;
  regulation_title: string;
  article_ref?: string | null;
  chunk_id?: number | null;
}

/** Monotonically increasing local ID for React keys (avoids index-based keys). */
let _nextLocalId = 1;

export interface ChatMessage {
  /** Server-assigned ID (from DB) or local-only ID for unsaved messages. */
  id: number;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  createdAt?: string;
}

export interface ChatSession {
  id: number;
  title: string | null;
  caseId?: number | null;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  // Panel visibility
  isOpen: boolean;
  /** Which view the panel is showing. Moved into the store so external
   *  actors (e.g. the museum tour) can switch the view without having to
   *  reach into ChatPanel's local component state. */
  view: "chat" | "history";
  // Active session
  activeSessionId: number | null;
  // Messages in current session
  messages: ChatMessage[];
  // Streaming state
  isStreaming: boolean;
  streamingContent: string;
  streamingCitations: ChatCitation[];
  // Context
  pendingCaseId: number | null;
  pendingMessage: string | null;

  // Actions
  openChat: (initialMessage?: string, caseId?: number, view?: "chat" | "history") => void;
  closeChat: () => void;
  setView: (view: "chat" | "history") => void;
  setActiveSession: (id: number, messages?: ChatMessage[]) => void;
  setSessionId: (id: number) => void;
  clearSession: () => void;
  addUserMessage: (content: string) => void;
  startStreaming: () => void;
  appendStreamToken: (token: string) => void;
  setStreamingCitations: (citations: ChatCitation[]) => void;
  finalizeStream: () => void;
  consumePendingMessage: () => string | null;
  /** Read and clear the pending case ID (one-shot). */
  consumePendingCaseId: () => number | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  view: "chat",
  activeSessionId: null,
  messages: [],
  isStreaming: false,
  streamingContent: "",
  streamingCitations: [],
  pendingCaseId: null,
  pendingMessage: null,

  openChat: (initialMessage?: string, caseId?: number, view?: "chat" | "history") => {
    set({
      isOpen: true,
      pendingMessage: initialMessage || null,
      pendingCaseId: caseId ?? null,
      view: view ?? "chat",
    });
  },

  closeChat: () => {
    set({ isOpen: false });
  },

  setView: (view) => {
    set({ view });
  },

  setActiveSession: (id: number, messages?: ChatMessage[]) => {
    set({
      activeSessionId: id,
      messages: messages || [],
      streamingContent: "",
      streamingCitations: [],
      isStreaming: false,
    });
  },

  setSessionId: (id: number) => {
    set({ activeSessionId: id });
  },

  clearSession: () => {
    set({
      activeSessionId: null,
      messages: [],
      streamingContent: "",
      streamingCitations: [],
      isStreaming: false,
    });
  },

  addUserMessage: (content: string) => {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: _nextLocalId++, role: "user" as const, content, createdAt: new Date().toISOString() },
      ],
    }));
  },

  startStreaming: () => {
    set({ isStreaming: true, streamingContent: "", streamingCitations: [] });
  },

  appendStreamToken: (token: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + token,
    }));
  },

  setStreamingCitations: (citations: ChatCitation[]) => {
    set({ streamingCitations: citations });
  },

  finalizeStream: () => {
    const { streamingContent, streamingCitations, isStreaming } = get();
    // Guard: only finalize once (idempotent)
    if (!isStreaming && !streamingContent) return;
    if (streamingContent) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: _nextLocalId++,
            role: "assistant" as const,
            content: streamingContent,
            citations: streamingCitations,
            createdAt: new Date().toISOString(),
          },
        ],
        isStreaming: false,
        streamingContent: "",
        streamingCitations: [],
      }));
    } else {
      set({ isStreaming: false, streamingContent: "", streamingCitations: [] });
    }
  },

  consumePendingMessage: () => {
    const msg = get().pendingMessage;
    set({ pendingMessage: null });
    return msg;
  },

  consumePendingCaseId: () => {
    const id = get().pendingCaseId;
    if (id !== null) set({ pendingCaseId: null });
    return id;
  },
}));
