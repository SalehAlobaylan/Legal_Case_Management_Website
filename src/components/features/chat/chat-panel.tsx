"use client";

import * as React from "react";
import { X, MessageSquarePlus, History, ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAiChat, useChatSessions, useDeleteChatSession } from "@/lib/hooks/use-ai";
import { useChatStore } from "@/lib/store/chat-store";
import { useToast } from "@/components/ui/use-toast";
import { ChatDisclaimer } from "./chat-disclaimer";
import { ChatMessage } from "./chat-message";
import { StreamingMessage } from "./streaming-message";
import { ChatInput } from "./chat-input";
import { chatSessionsApi } from "@/lib/api/ai";

export function ChatPanel() {
  const { t, isRTL } = useI18n();
  const store = useChatStore();
  const {
    sendMessage,
    stopStreaming,
    messages,
    isStreaming,
    streamingContent,
  } = useAiChat();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<"chat" | "history">("chat");
  const { data: sessions } = useChatSessions();
  const deleteSession = useDeleteChatSession();
  const { toast } = useToast();

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // ESC key closes the chat panel
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && store.isOpen) store.closeChat();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [store]);

  // Handle pending message (from search bar or "Ask about case")
  React.useEffect(() => {
    if (store.isOpen) {
      const pending = store.consumePendingMessage();
      if (pending) {
        setView("chat");
        sendMessage(pending);
      }
    }
  }, [store.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (message: string) => {
    setView("chat");
    sendMessage(message);
  };

  const handleNewChat = () => {
    store.clearSession();
    setView("chat");
  };

  const handleLoadSession = async (sessionId: number) => {
    try {
      const session = await chatSessionsApi.get(sessionId);
      const msgs = (session.messages || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        citations: m.citations,
        createdAt: m.createdAt,
      }));
      store.setActiveSession(sessionId, msgs);
      setView("chat");
    } catch {
      toast({
        title: t("chat.title"),
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession.mutate(sessionId);
    if (store.activeSessionId === sessionId) {
      store.clearSession();
    }
  };

  if (!store.isOpen) return null;

  return (
    <>
      {/* Backdrop — mobile only (full-screen). Desktop has NO backdrop so user can still interact with dashboard */}
      <div
        className="fixed inset-0 z-40 bg-black/30 sm:hidden"
        onClick={store.closeChat}
      />

      {/* Panel */}
      <div
        className={cn(
          // Mobile: full screen
          "fixed inset-0 z-50 flex flex-col bg-[#f9fafb]",
          // Desktop: floating card — positioned ABOVE the dock (bottom-24 = 6rem)
          "sm:inset-auto sm:bottom-24 sm:w-[420px] sm:max-h-[calc(100vh-7rem)] sm:h-[580px]",
          "sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200/60",
          // Animation
          "animate-chat-panel-in",
          // Position (RTL-aware)
          isRTL ? "sm:left-6" : "sm:right-6"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3",
          "bg-gradient-to-r from-[#0F2942] to-[#1E3A56] text-white",
          "sm:rounded-t-2xl flex-shrink-0"
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D97706]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight">{t("chat.title")}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNewChat}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={t("chat.newChat")}
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView(view === "history" ? "chat" : "history")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                view === "history" ? "bg-white/20" : "hover:bg-white/10"
              )}
              title={t("chat.history")}
            >
              <History className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={store.closeChat}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content area — either chat or history */}
        {view === "history" ? (
          /* Session History View */
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-3 pb-2">
              <button
                type="button"
                onClick={() => setView("chat")}
                className={cn(
                  "flex items-center gap-1.5 text-xs text-[#D97706] font-medium hover:underline",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ArrowLeft className={cn("h-3 w-3", isRTL && "rotate-180")} />
                {t("chat.backToChat")}
              </button>
            </div>
            {(!sessions || sessions.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
                <History className="h-8 w-8 mb-2 opacity-30" />
                <p>{t("chat.noSessions")}</p>
              </div>
            ) : (
              <div className="px-3 pb-4 space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleLoadSession(s.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 transition-all",
                      isRTL ? "text-right" : "text-left",
                      "hover:border-[#D97706]/30 hover:shadow-sm",
                      s.id === store.activeSessionId
                        ? "border-[#D97706]/40 bg-[#D97706]/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-slate-800">
                          {s.title || t("chat.title")}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat Messages View */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                  <div className="w-14 h-14 rounded-full bg-[#D97706]/10 flex items-center justify-center mb-3">
                    <Sparkles className="h-7 w-7 text-[#D97706]/40" />
                  </div>
                  <p className="font-medium text-slate-500">{t("chat.title")}</p>
                  <p className="text-xs mt-1 text-slate-400">{t("chat.placeholder")}</p>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  citations={msg.citations}
                />
              ))}

              {isStreaming && streamingContent && (
                <StreamingMessage content={streamingContent} />
              )}

              {isStreaming && !streamingContent && (
                <div className={cn("flex items-end gap-2.5", isRTL ? "flex-row-reverse" : "")}>
                  <div className="w-7 h-7 rounded-full bg-[#D97706]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                  </div>
                  <div className={cn(
                    "bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm",
                    isRTL ? "rounded-br-md" : "rounded-bl-md"
                  )}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer + Input */}
            <div className="flex-shrink-0">
              <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                showQuickChips={messages.length === 0 && !isStreaming}
              />
              <ChatDisclaimer />
            </div>
          </>
        )}
      </div>
    </>
  );
}
