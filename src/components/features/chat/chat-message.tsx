"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Copy, Check, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { ChatCitation } from "@/lib/store/chat-store";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  onRegenerate?: () => void;
}

/**
 * Render lightweight markdown: **bold**, *italic*, and numbered lists.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) nodes.push(<br key={`br-${i}`} />);
    const line = lines[i];

    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      if (part.startsWith("**") && part.endsWith("**")) {
        nodes.push(
          <strong key={`${i}-${j}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        nodes.push(<em key={`${i}-${j}`}>{part.slice(1, -1)}</em>);
      } else {
        nodes.push(part);
      }
    }
  }

  return nodes;
}

export function ChatMessage({
  role,
  content,
  citations,
  onRegenerate,
}: ChatMessageProps) {
  const { t, isRTL } = useI18n();
  const [copied, setCopied] = React.useState(false);
  const isUser = role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard not available — silently ignore
    }
  };

  const validCitations = citations?.filter(
    (c) => c.regulation_id && c.regulation_title
  );
  const hasCitations = validCitations && validCitations.length > 0;

  return (
    <div
      className={cn(
        "group flex w-full gap-2",
        isUser
          ? isRTL
            ? "justify-start flex-row-reverse"
            : "justify-end"
          : isRTL
            ? "justify-end flex-row-reverse"
            : "justify-start"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser ? "bg-slate-200" : "bg-[#D97706]/10"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
        )}
      </div>

      {/* Message body */}
      <div className={cn("max-w-[82%] flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isUser
              ? cn(
                  "bg-gradient-to-br from-[#D97706] to-[#B45309] text-white shadow-sm",
                  isRTL ? "rounded-tl-md" : "rounded-tr-md"
                )
              : cn(
                  "bg-white text-slate-800 shadow-sm border border-slate-200/80",
                  isRTL ? "rounded-tr-md" : "rounded-tl-md"
                )
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {isUser ? content : renderMarkdown(content)}
          </div>

          {/* Citations */}
          {hasCitations && (
            <div
              className={cn(
                "flex flex-wrap gap-1.5 mt-2.5 pt-2.5",
                isUser ? "border-t border-white/20" : "border-t border-slate-100"
              )}
            >
              {validCitations!.map((c, i) => (
                <Link
                  key={`${c.regulation_id}-${i}`}
                  href={`/regulations/${c.regulation_id}`}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                    "text-[10px] font-medium transition-colors",
                    isUser
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20"
                  )}
                >
                  <BookOpen className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[140px]">
                    {c.article_ref || c.regulation_title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action bar — visible on hover */}
        <div
          className={cn(
            "flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100",
            "transition-opacity duration-150",
            isUser ? (isRTL ? "flex-row-reverse" : "flex-row-reverse") : ""
          )}
        >
          <MessageActionButton
            onClick={handleCopy}
            title={copied ? t("chat.copied") : t("chat.copy")}
            icon={
              copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )
            }
          />
          {onRegenerate && (
            <MessageActionButton
              onClick={onRegenerate}
              title={t("chat.regenerate")}
              icon={<RefreshCw className="h-3 w-3" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageActionButton({
  onClick,
  title,
  icon,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100",
        "transition-colors flex items-center justify-center"
      )}
    >
      {icon}
    </button>
  );
}
