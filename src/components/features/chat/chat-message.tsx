"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { ChatCitation } from "@/lib/store/chat-store";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
}

/**
 * Render lightweight markdown: **bold**, *italic*, and numbered lists.
 * Returns React elements — no external dependency needed.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) nodes.push(<br key={`br-${i}`} />);
    const line = lines[i];

    // Split by bold (**...**) and italic (*...*)
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
        nodes.push(
          <em key={`${i}-${j}`}>{part.slice(1, -1)}</em>
        );
      } else {
        nodes.push(part);
      }
    }
  }

  return nodes;
}

export function ChatMessage({ role, content, citations }: ChatMessageProps) {
  const { isRTL } = useI18n();
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2.5",
        isUser
          ? isRTL ? "justify-start flex-row-reverse" : "justify-end"
          : isRTL ? "justify-end flex-row-reverse" : "justify-start"
      )}
    >
      {/* Bot avatar for assistant messages */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#D97706]/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? cn(
                "bg-[#D97706] text-white",
                isRTL ? "rounded-tl-md" : "rounded-tr-md"
              )
            : cn(
                "bg-white text-slate-800 shadow-sm border border-slate-100",
                isRTL
                  ? "border-r-[3px] border-r-[#D97706] rounded-tr-md"
                  : "border-l-[3px] border-l-[#D97706] rounded-tl-md"
              )
        )}
      >
        {/* Message content with markdown rendering */}
        <div className="whitespace-pre-wrap break-words">
          {isUser ? content : renderMarkdown(content)}
        </div>

        {/* Citations */}
        {citations && citations.filter((c) => c.regulation_id && c.regulation_title).length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-1.5 mt-2.5 pt-2.5",
            isUser ? "border-t border-white/20" : "border-t border-slate-100"
          )}>
            {citations.filter((c) => c.regulation_id && c.regulation_title).map((c, i) => (
              <Link
                key={`${c.regulation_id}-${i}`}
                href={`/regulations/${c.regulation_id}`}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
                  "text-[10px] font-medium transition-colors",
                  isUser
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20"
                )}
              >
                <BookOpen className="h-2.5 w-2.5" />
                <span>{c.article_ref || c.regulation_title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
