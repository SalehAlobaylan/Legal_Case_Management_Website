"use client";

import * as React from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  showQuickChips?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, showQuickChips }: ChatInputProps) {
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
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleQuickChip = (text: string) => {
    onSend(text);
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:rounded-b-2xl">
      {/* Quick action chips */}
      {showQuickChips && !value && (
        <div className="flex flex-wrap gap-2 pb-2.5">
          <button
            type="button"
            onClick={() => handleQuickChip(t("chat.quickSummarize"))}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20 font-medium transition-colors"
          >
            {t("chat.quickSummarize")}
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip(t("chat.quickRegulations"))}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20 font-medium transition-colors"
          >
            {t("chat.quickRegulations")}
          </button>
        </div>
      )}

      {/* Input area */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl bg-slate-50 px-3 py-2",
          "border-2 border-transparent",
          "focus-within:border-[#D97706]/40 focus-within:bg-white",
          "transition-all duration-200"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          rows={1}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm outline-none",
            "placeholder:text-slate-400",
            "max-h-[120px]",
            isRTL && "text-right"
          )}
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full",
              "bg-red-500 text-white hover:bg-red-600",
              "flex items-center justify-center",
              "transition-colors"
            )}
            title={t("chat.stop")}
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full",
              "bg-gradient-to-br from-[#D97706] to-[#B45309] text-white",
              "hover:shadow-md hover:shadow-orange-900/20",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              "flex items-center justify-center",
              "transition-all duration-200"
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
