"use client";

/*
 * File: src/components/features/chat/starter/case-picker.tsx
 * Purpose: Minimal searchable case picker, scoped to the chat-starter flow.
 *
 * Uses `useCases()` (TanStack Query) and filters client-side. Intentionally
 * not a generic Combobox — only the chat starter needs this UI right now.
 */

import * as React from "react";
import { Search, X, Check, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useCases } from "@/lib/hooks/use-cases";

export interface PickedCase {
  id: number;
  title: string;
  caseNumber: string;
}

interface CasePickerProps {
  /** Currently selected case id, or undefined */
  value?: number;
  onChange: (picked: PickedCase | null) => void;
  /** Maximum visible rows in the scrollable list */
  maxRows?: number;
}

export function CasePicker({ value, onChange, maxRows = 6 }: CasePickerProps) {
  const { t, isRTL } = useI18n();
  const { data: cases, isLoading, isError } = useCases();
  const [query, setQuery] = React.useState("");

  const selectedCase = React.useMemo(
    () => cases?.find((c) => c.id === value),
    [cases, value]
  );

  // When a case is selected, show a chip instead of the list
  if (selectedCase) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[#D97706]/40 bg-[#D97706]/5 px-3 py-2",
          isRTL && "flex-row-reverse"
        )}
      >
        <div className="w-7 h-7 rounded-lg bg-[#D97706]/15 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-3.5 w-3.5 text-[#D97706]" />
        </div>
        <div className={cn("flex-1 min-w-0", isRTL ? "text-right" : "text-left")}>
          <div className="text-[12px] font-semibold text-slate-800 truncate leading-tight">
            {selectedCase.title}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
            #{selectedCase.case_number}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          title={t("common.remove")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const filtered = React.useMemo(() => {
    if (!cases) return [];
    const q = query.trim().toLowerCase();
    if (!q) return cases.slice(0, 200);
    return cases
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.case_number?.toLowerCase().includes(q)
      )
      .slice(0, 200);
  }, [cases, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Search */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 border-b border-slate-200",
          "bg-slate-50/60",
          isRTL && "flex-row-reverse"
        )}
      >
        <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chat.starter.searchCases")}
          className={cn(
            "flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-400",
            isRTL && "text-right"
          )}
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: `${maxRows * 52}px` }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{t("chat.starter.loadingCases")}</span>
          </div>
        ) : isError || !cases || filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-6 text-[12px] text-slate-400">
            <Briefcase className="h-5 w-5 opacity-40" />
            <span>{t("chat.starter.noCases")}</span>
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                onChange({
                  id: c.id,
                  title: c.title,
                  caseNumber: c.case_number,
                })
              }
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 transition-colors",
                "hover:bg-[#D97706]/5",
                "border-b border-slate-100 last:border-b-0",
                isRTL ? "text-right flex-row-reverse" : "text-left"
              )}
            >
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-3 w-3 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-slate-800 truncate leading-tight">
                  {c.title}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  #{c.case_number}
                </div>
              </div>
              {c.id === value && (
                <Check className="h-3.5 w-3.5 text-[#D97706] flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
