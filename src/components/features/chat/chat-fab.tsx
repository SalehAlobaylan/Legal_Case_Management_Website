"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useChatStore } from "@/lib/store/chat-store";

/**
 * Floating action button for chat — visible on MOBILE only.
 * On desktop the AI button is integrated into the header search bar.
 */
export function ChatFAB() {
  const { isRTL } = useI18n();
  const { isOpen, openChat, closeChat, isStreaming } = useChatStore();

  return (
    <button
      type="button"
      onClick={() => (isOpen ? closeChat() : openChat())}
      className={cn(
        // Mobile only — hidden on md+ where the search bar has the AI button
        "fixed z-[55] w-12 h-12 rounded-full md:hidden",
        "bg-gradient-to-br from-[#D97706] to-[#B45309]",
        "text-white shadow-lg shadow-orange-900/30",
        "flex items-center justify-center",
        "hover:scale-105 active:scale-95 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2",
        // Hide when chat is open (full-screen on mobile)
        isOpen && "hidden",
        // Position — above the dock
        "bottom-24",
        isRTL ? "left-4" : "right-4"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {/* Activity indicator when streaming and panel is closed */}
      {isStreaming && !isOpen && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-[#D97706] animate-pulse-subtle" />
      )}

      <Sparkles className="h-5 w-5" />
    </button>
  );
}
