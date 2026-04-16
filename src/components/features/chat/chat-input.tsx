"use client";

import * as React from "react";
import { Send, Square, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  showQuickChips?: boolean;
}

const MAX_CHARS = 2000;

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  showQuickChips,
}: ChatInputProps) {
  const { t, isRTL } = useI18n();
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, MAX_CHARS);
    setValue(next);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleQuickChip = (text: string) => {
    onSend(text);
  };

  const nearLimit = value.length >= MAX_CHARS - 200;
  const atLimit = value.length >= MAX_CHARS;

  return (
    <div className="px-3 pt-2.5 pb-1.5">
      {/* Quick action chips */}
      {showQuickChips && !value && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          <QuickChip onClick={() => handleQuickChip(t("chat.quickSummarize"))}>
            {t("chat.quickSummarize")}
          </QuickChip>
          <QuickChip onClick={() => handleQuickChip(t("chat.quickRegulations"))}>
            {t("chat.quickRegulations")}
          </QuickChip>
        </div>
      )}

      {/* Input area */}
      <div
        className={cn(
          "flex items-end gap-1.5 rounded-2xl bg-slate-50 px-2.5 py-1.5",
          "border border-slate-200",
          "focus-within:border-[#D97706]/50 focus-within:bg-white focus-within:shadow-sm",
          "transition-all duration-200"
        )}
      >
        {/* Attach (placeholder for future file support) */}
        <button
          type="button"
          disabled
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-md text-slate-400",
            "hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed",
            "flex items-center justify-center transition-colors mb-0.5"
          )}
          title="Attach (coming soon)"
          tabIndex={-1}
        >
          <Paperclip className="h-3.5 w-3.5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          rows={1}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none bg-transparent text-[13px] outline-none py-1.5",
            "placeholder:text-slate-400",
            "max-h-[140px] leading-relaxed",
            isRTL && "text-right"
          )}
        />

        {/* Character counter near the limit */}
        {nearLimit && (
          <span
            className={cn(
              "text-[10px] self-end mb-2.5 tabular-nums flex-shrink-0",
              atLimit ? "text-red-500 font-medium" : "text-slate-400"
            )}
          >
            {value.length}/{MAX_CHARS}
          </span>
        )}

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg",
              "bg-red-500 text-white hover:bg-red-600",
              "flex items-center justify-center",
              "transition-colors mb-0.5 shadow-sm"
            )}
            title={t("chat.stop")}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg",
              "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white",
              "hover:shadow-md hover:shadow-orange-900/20 hover:scale-105",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100",
              "flex items-center justify-center",
              "transition-all duration-150 mb-0.5"
            )}
            title={t("chat.send")}
          >
            <Send className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
          </button>
        )}
      </div>
    </div>
  );
}

function QuickChip({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[11px] px-3 py-1.5 rounded-full font-medium transition-all",
        "bg-white border border-slate-200 text-slate-700",
        "hover:border-[#D97706]/40 hover:bg-[#D97706]/5 hover:text-[#D97706]"
      )}
    >
      {children}
    </button>
  );
}
