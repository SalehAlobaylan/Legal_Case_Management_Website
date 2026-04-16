"use client";

import * as React from "react";
import {
  X,
  MessageSquarePlus,
  History,
  ArrowLeft,
  Sparkles,
  Trash2,
  Maximize2,
  Minimize2,
  Search,
  ChevronDown,
  Info,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAiChat, useChatSessions, useDeleteChatSession } from "@/lib/hooks/use-ai";
import { useChatStore } from "@/lib/store/chat-store";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "./chat-message";
import { StreamingMessage } from "./streaming-message";
import { ChatInput } from "./chat-input";
import { ChatStarter } from "./chat-starter";
import { chatSessionsApi } from "@/lib/api/ai";

/**
 * Group sessions by recency bucket (Today, Yesterday, Last 7 days, Older).
 */
type GroupKey = "today" | "yesterday" | "week" | "older";
function groupSessionsByDate<T extends { updatedAt: string }>(sessions: T[]) {
  const groups: Record<GroupKey, T[]> = { today: [], yesterday: [], week: [], older: [] };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 7 * 86_400_000;

  for (const s of sessions) {
    const t = new Date(s.updatedAt).getTime();
    if (t >= todayStart) groups.today.push(s);
    else if (t >= yesterdayStart) groups.yesterday.push(s);
    else if (t >= weekStart) groups.week.push(s);
    else groups.older.push(s);
  }
  return groups;
}

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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<"chat" | "history">("chat");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [historyQuery, setHistoryQuery] = React.useState("");
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);
  const [showDisclaimer, setShowDisclaimer] = React.useState(false);

  const { data: sessions } = useChatSessions();
  const deleteSession = useDeleteChatSession();
  const { toast } = useToast();

  const lastUserMessage = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return null;
  }, [messages]);

  // Auto-scroll to bottom on new content, but only if user is near bottom
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent]);

  // Track scroll position to show "jump to latest" button
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distanceFromBottom > 200);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [view]);

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

  const handleSend = (message: string, caseId?: number) => {
    setView("chat");
    sendMessage(message, caseId);
  };

  const handleNewChat = () => {
    store.clearSession();
    setView("chat");
    setHistoryQuery("");
  };

  const handleRegenerate = () => {
    if (!lastUserMessage || isStreaming) return;
    // Drop the last assistant message, then re-send the last user prompt.
    // Simplest: just re-send. Assistant will append a new reply.
    sendMessage(lastUserMessage);
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
    if (!window.confirm(t("chat.deleteConfirm"))) return;
    deleteSession.mutate(sessionId);
    if (store.activeSessionId === sessionId) {
      store.clearSession();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Active session title (for header context)
  const activeSession = React.useMemo(
    () => sessions?.find((s) => s.id === store.activeSessionId),
    [sessions, store.activeSessionId]
  );

  // Filter and group history sessions
  const filteredSessions = React.useMemo(() => {
    if (!sessions) return [];
    const q = historyQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => (s.title || "").toLowerCase().includes(q));
  }, [sessions, historyQuery]);

  const grouped = React.useMemo(() => groupSessionsByDate(filteredSessions), [filteredSessions]);

  if (!store.isOpen) return null;

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 z-40 bg-black/30 sm:hidden"
        onClick={store.closeChat}
      />

      {/* Panel */}
      <div
        className={cn(
          // Mobile: full screen
          "fixed inset-0 z-50 flex flex-col bg-white",
          // Desktop: floating card positioned above the dock
          "sm:inset-auto sm:bottom-24 sm:max-h-[calc(100vh-7rem)] sm:h-[640px]",
          "sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200/70",
          "sm:overflow-hidden",
          // Width toggles based on expanded state
          isExpanded ? "sm:w-[640px]" : "sm:w-[420px]",
          "transition-[width] duration-300 ease-out",
          // Animation
          "animate-chat-panel-in",
          // Position (RTL-aware)
          isRTL ? "sm:left-6" : "sm:right-6"
        )}
      >
        {/* Header — cleaner, lighter */}
        <div
          className={cn(
            "relative flex items-center justify-between px-3.5 py-2.5",
            "bg-gradient-to-br from-[#0F2942] via-[#14365A] to-[#1E3A56] text-white",
            "border-b border-white/5 flex-shrink-0"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-9 h-9 rounded-xl bg-[#D97706]/20 ring-1 ring-[#D97706]/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              {/* Online pulse dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0F2942]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[13px] font-semibold leading-tight truncate">
                {view === "history"
                  ? t("chat.history")
                  : activeSession?.title || t("chat.title")}
              </h2>
              <p className="text-[10.5px] text-white/60 leading-tight mt-0.5 truncate">
                {view === "history"
                  ? `${sessions?.length ?? 0} ${t("chat.messagesCount")}`
                  : t("chat.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <HeaderIconButton
              onClick={handleNewChat}
              title={t("chat.newChat")}
              icon={<MessageSquarePlus className="h-4 w-4" />}
            />
            <HeaderIconButton
              onClick={() => setView(view === "history" ? "chat" : "history")}
              title={t("chat.history")}
              active={view === "history"}
              icon={<History className="h-4 w-4" />}
            />
            {/* Expand/collapse — desktop only */}
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="hidden sm:flex p-1.5 rounded-md hover:bg-white/10 transition-colors items-center justify-center"
              title={isExpanded ? t("chat.collapse") : t("chat.expand")}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <HeaderIconButton
              onClick={store.closeChat}
              title={t("chat.close")}
              icon={<X className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Content area */}
        {view === "history" ? (
          /* ========== HISTORY VIEW ========== */
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            {/* Back + Search */}
            <div className="px-3 pt-3 pb-2 space-y-2 flex-shrink-0 bg-white border-b border-slate-200/70">
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
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-2",
                  "border border-transparent focus-within:border-[#D97706]/40 focus-within:bg-white",
                  "transition-colors"
                )}
              >
                <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder={t("chat.searchHistory")}
                  className={cn(
                    "flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400",
                    isRTL && "text-right"
                  )}
                />
                {historyQuery && (
                  <button
                    type="button"
                    onClick={() => setHistoryQuery("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Grouped list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
                  <History className="h-10 w-10 mb-3 opacity-25" />
                  <p className="font-medium">{t("chat.noSessions")}</p>
                </div>
              ) : (
                (
                  [
                    { key: "today", label: t("chat.historyToday") },
                    { key: "yesterday", label: t("chat.historyYesterday") },
                    { key: "week", label: t("chat.historyLastWeek") },
                    { key: "older", label: t("chat.historyOlder") },
                  ] as { key: GroupKey; label: string }[]
                ).map(({ key, label }) =>
                  grouped[key].length === 0 ? null : (
                    <div key={key}>
                      <h4
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1.5",
                          isRTL && "text-right"
                        )}
                      >
                        {label}
                      </h4>
                      <div className="space-y-1.5">
                        {grouped[key].map((s) => (
                          <SessionRow
                            key={s.id}
                            session={s}
                            isRTL={isRTL}
                            active={s.id === store.activeSessionId}
                            fallbackTitle={t("chat.title")}
                            onClick={() => handleLoadSession(s.id)}
                            onDelete={(e) => handleDeleteSession(s.id, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        ) : (
          /* ========== CHAT VIEW ========== */
          <>
            {/* Case context chip */}
            {store.pendingCaseId && messages.length === 0 && (
              <div className="flex-shrink-0 px-4 pt-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    "bg-[#D97706]/10 text-[#D97706] text-[11px] font-medium"
                  )}
                >
                  <Briefcase className="h-3 w-3" />
                  <span>
                    {t("chat.contextCase")} #{store.pendingCaseId}
                  </span>
                </div>
              </div>
            )}

            {/* Messages scroll area */}
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-white to-slate-50/40"
            >
              {messages.length === 0 && !isStreaming ? (
                <ChatStarter
                  onSend={(prompt, caseId) => handleSend(prompt, caseId)}
                />
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isLastAssistant =
                      msg.role === "assistant" &&
                      idx === messages.length - 1 &&
                      !isStreaming;
                    return (
                      <ChatMessage
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        citations={msg.citations}
                        onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                      />
                    );
                  })}

                  {isStreaming && streamingContent && (
                    <StreamingMessage content={streamingContent} />
                  )}

                  {isStreaming && !streamingContent && (
                    <div
                      className={cn(
                        "flex items-end gap-2.5",
                        isRTL ? "flex-row-reverse" : ""
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#D97706]/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-[#D97706] animate-pulse" />
                      </div>
                      <div
                        className={cn(
                          "bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm",
                          isRTL ? "rounded-br-md" : "rounded-bl-md"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span
                              className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {t("chat.thinking")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating scroll-to-bottom button */}
            {showScrollBtn && (
              <button
                type="button"
                onClick={scrollToBottom}
                className={cn(
                  "absolute bottom-[108px] z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full",
                  "bg-white border border-slate-200 text-slate-600 text-[11px] font-medium",
                  "shadow-md hover:shadow-lg hover:border-[#D97706]/30 transition-all",
                  isRTL ? "left-4" : "right-4"
                )}
                title={t("chat.scrollToBottom")}
              >
                <ChevronDown className="h-3 w-3" />
                <span>{t("chat.scrollToBottom")}</span>
              </button>
            )}

            {/* Input + footer */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-white">
              <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                showQuickChips={messages.length === 0 && !isStreaming}
              />
              <FooterBar
                isRTL={isRTL}
                t={t}
                showDisclaimer={showDisclaimer}
                onToggleDisclaimer={() => setShowDisclaimer((v) => !v)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ---------- sub-components ---------- */

function HeaderIconButton({
  onClick,
  title,
  icon,
  active,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors flex items-center justify-center",
        active ? "bg-white/20" : "hover:bg-white/10"
      )}
    >
      {icon}
    </button>
  );
}

function SessionRow({
  session,
  active,
  isRTL,
  fallbackTitle,
  onClick,
  onDelete,
}: {
  session: { id: number; title: string | null; updatedAt: string };
  active: boolean;
  isRTL: boolean;
  fallbackTitle: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative w-full rounded-xl border p-2.5 transition-all cursor-pointer",
        isRTL ? "text-right" : "text-left",
        "hover:border-[#D97706]/40 hover:shadow-sm hover:bg-white",
        active
          ? "border-[#D97706]/40 bg-[#D97706]/[0.04] shadow-sm"
          : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageSquarePlus className="h-3 w-3 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[12.5px] truncate text-slate-800 leading-tight">
              {session.title || fallbackTitle}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {new Date(session.updatedAt).toLocaleString(undefined, {
                hour: "numeric",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className={cn(
            "p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50",
            "transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          )}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FooterBar({
  isRTL,
  t,
  showDisclaimer,
  onToggleDisclaimer,
}: {
  isRTL: boolean;
  t: (key: string) => string;
  showDisclaimer: boolean;
  onToggleDisclaimer: () => void;
}) {
  return (
    <div className="px-3 pb-2 pt-0.5 sm:rounded-b-2xl">
      <div
        className={cn(
          "flex items-center justify-between gap-2 text-[10px] text-slate-400",
          isRTL && "flex-row-reverse"
        )}
      >
        <span className="truncate">{t("chat.inputHint")}</span>
        <button
          type="button"
          onClick={onToggleDisclaimer}
          className="flex items-center gap-1 hover:text-slate-600 transition-colors flex-shrink-0"
          title={t("chat.disclaimer")}
        >
          <Info className="h-2.5 w-2.5" />
          <span>{t("chat.disclaimerShort")}</span>
        </button>
      </div>
      {showDisclaimer && (
        <div
          className={cn(
            "mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200/60",
            "text-[10.5px] text-amber-800 leading-relaxed",
            isRTL && "text-right"
          )}
        >
          {t("chat.disclaimer")}
        </div>
      )}
    </div>
  );
}
