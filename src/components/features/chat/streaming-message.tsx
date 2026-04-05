"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";

interface StreamingMessageProps {
  content: string;
}

/**
 * Render lightweight markdown for streaming content: **bold** and *italic*.
 */
function renderStreamingMarkdown(text: string): React.ReactNode[] {
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

export function StreamingMessage({ content }: StreamingMessageProps) {
  const { isRTL } = useI18n();

  return (
    <div className={cn(
      "flex w-full gap-2.5",
      isRTL ? "justify-end flex-row-reverse" : "justify-start"
    )}>
      {/* Bot avatar */}
      <div className="w-7 h-7 rounded-full bg-[#D97706]/10 flex items-center justify-center flex-shrink-0 mt-1">
        <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
      </div>

      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        "bg-white text-slate-800 shadow-sm border border-slate-100",
        isRTL
          ? "border-r-[3px] border-r-[#D97706] rounded-tr-md"
          : "border-l-[3px] border-l-[#D97706] rounded-tl-md"
      )}>
        <div className="whitespace-pre-wrap break-words">
          {renderStreamingMarkdown(content)}
          {/* Animated cursor */}
          <span className={cn(
            "inline-block w-0.5 h-4 bg-[#D97706] align-text-bottom animate-pulse",
            isRTL ? "mr-0.5" : "ml-0.5"
          )} />
        </div>
      </div>
    </div>
  );
}
