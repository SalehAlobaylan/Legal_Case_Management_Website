"use client";

/*
 * File: src/components/features/chat/chat-starter.tsx
 * Purpose: Guided, context-aware empty state for the chat panel.
 *
 * Replaces the "4 generic suggestion cards" pattern with four mini-flows that
 * let the user pick context (a case) and answer 1–3 quick chip/toggle
 * questions, then composes a rich prompt and sends it.
 *
 * The chat input at the bottom of the panel stays available at all times —
 * this component only renders inside the scrollable empty-state area.
 */

import * as React from "react";
import {
  ArrowLeft,
  Sparkles,
  FileSearch,
  BookOpen,
  PenLine,
  GraduationCap,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { CasePicker, type PickedCase } from "./starter/case-picker";
import {
  composeStarterPrompt,
  isStarterComplete,
  type StarterMode,
  type StarterSelection,
} from "./starter/prompt-composer";

interface ChatStarterProps {
  /** Called when the user submits a composed prompt. */
  onSend: (prompt: string, caseId?: number) => void;
}

export function ChatStarter({ onSend }: ChatStarterProps) {
  const { t, isRTL } = useI18n();
  const [mode, setMode] = React.useState<StarterMode | null>(null);
  const [sel, setSel] = React.useState<StarterSelection | null>(null);

  const cardDefs = React.useMemo(
    () => [
      {
        mode: "analyze" as const,
        Icon: FileSearch,
        title: t("chat.starter.analyze.title"),
        desc: t("chat.starter.analyze.desc"),
        color: "text-[#D97706]",
        bg: "bg-[#D97706]/10",
      },
      {
        mode: "regulations" as const,
        Icon: BookOpen,
        title: t("chat.starter.regulations.title"),
        desc: t("chat.starter.regulations.desc"),
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        mode: "draft" as const,
        Icon: PenLine,
        title: t("chat.starter.draft.title"),
        desc: t("chat.starter.draft.desc"),
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        mode: "explain" as const,
        Icon: GraduationCap,
        title: t("chat.starter.explain.title"),
        desc: t("chat.starter.explain.desc"),
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ],
    [t]
  );

  const handlePick = (m: StarterMode) => {
    setMode(m);
    setSel({ mode: m });
  };

  const handleBack = () => {
    setMode(null);
    // Retain sel so choices survive a back/forward
  };

  const handleGenerate = () => {
    if (!sel || !isStarterComplete(sel)) return;
    const prompt = composeStarterPrompt(sel, t);
    onSend(prompt, sel.caseId);
  };

  /* ---------- landing: 4 starter cards ---------- */
  if (!mode) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center pt-6 pb-5">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-[#D97706]/20 blur-xl rounded-full" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-orange-900/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-slate-800">
            {t("chat.emptyGreeting")}
          </h3>
          <p className="text-[12px] text-slate-500 mt-1">
            {t("chat.emptySubtext")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 px-1">
          {cardDefs.map(({ mode: m, Icon, title, desc, color, bg }) => (
            <button
              key={m}
              type="button"
              onClick={() => handlePick(m)}
              className={cn(
                "group rounded-xl border border-slate-200 bg-white p-3",
                "hover:border-[#D97706]/40 hover:shadow-md hover:-translate-y-0.5",
                "transition-all duration-200",
                isRTL ? "text-right" : "text-left"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                  bg
                )}
              >
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="font-semibold text-[12px] text-slate-800 leading-tight">
                {title}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1 leading-snug line-clamp-2">
                {desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- flow view: back arrow + the chosen flow ---------- */
  return (
    <div className="flex flex-col gap-3 pt-1">
      {/* Back + title */}
      <div
        className={cn(
          "flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}
      >
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            "p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          )}
          title={t("chat.starter.back")}
        >
          <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </button>
        <h3 className="text-[13px] font-semibold text-slate-800">
          {t(`chat.starter.${mode}.title`)}
        </h3>
      </div>

      {/* Flow */}
      {sel && mode === "analyze" && (
        <AnalyzeFlow sel={sel} setSel={setSel} isRTL={isRTL} t={t} />
      )}
      {sel && mode === "regulations" && (
        <RegulationsFlow sel={sel} setSel={setSel} isRTL={isRTL} t={t} />
      )}
      {sel && mode === "draft" && (
        <DraftFlow sel={sel} setSel={setSel} isRTL={isRTL} t={t} />
      )}
      {sel && mode === "explain" && (
        <ExplainFlow sel={sel} setSel={setSel} isRTL={isRTL} t={t} />
      )}

      {/* Generate button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!sel || !isStarterComplete(sel)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-semibold text-[13px]",
            "shadow-sm hover:shadow-md hover:shadow-orange-900/20",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
            "transition-all"
          )}
        >
          <Send className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
          <span>{t("chat.starter.generate")}</span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   Flow sub-components
   ================================================================ */

type FlowProps = {
  sel: StarterSelection;
  setSel: React.Dispatch<React.SetStateAction<StarterSelection | null>>;
  isRTL: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

/* ---------- (a) Analyze a case ---------- */
function AnalyzeFlow({ sel, setSel, isRTL, t }: FlowProps) {
  const focusOptions = ["parties", "summary", "weaknesses", "legalPoints", "recommendations"];

  const toggleFocus = (id: string) => {
    setSel((prev) => {
      if (!prev) return prev;
      const cur = prev.focus || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...prev, focus: next };
    });
  };

  const pickCase = (c: PickedCase | null) =>
    setSel((prev) =>
      prev
        ? {
            ...prev,
            caseId: c?.id,
            caseTitle: c?.title,
            caseNumber: c?.caseNumber,
          }
        : prev
    );

  return (
    <div className="space-y-3">
      <Section label={t("chat.starter.stepCase")} required isRTL={isRTL}>
        <CasePicker value={sel.caseId} onChange={pickCase} />
      </Section>
      <Section label={t("chat.starter.stepFocus")} required isRTL={isRTL}>
        <ChipGrid
          options={focusOptions.map((id) => ({
            id,
            label: t(`chat.starter.analyze.focus.${id}`),
          }))}
          selected={sel.focus || []}
          onToggle={toggleFocus}
          isRTL={isRTL}
        />
      </Section>
      <Section label={t("chat.starter.optional")} isRTL={isRTL}>
        <textarea
          value={sel.note || ""}
          onChange={(e) => setSel((p) => (p ? { ...p, note: e.target.value } : p))}
          placeholder={t("chat.starter.notePlaceholder")}
          rows={2}
          className={cn(
            "w-full resize-none rounded-xl border border-slate-200 bg-white",
            "px-3 py-2 text-[12px] outline-none",
            "focus:border-[#D97706]/50 focus:ring-2 focus:ring-[#D97706]/10",
            "placeholder:text-slate-400",
            isRTL && "text-right"
          )}
        />
      </Section>
    </div>
  );
}

/* ---------- (b) Regulations ---------- */
function RegulationsFlow({ sel, setSel, isRTL, t }: FlowProps) {
  const topics = ["labor", "commercial", "criminal", "realestate", "family", "administrative"];

  const pickCase = (c: PickedCase | null) =>
    setSel((prev) =>
      prev
        ? {
            ...prev,
            caseId: c?.id,
            caseTitle: c?.title,
            caseNumber: c?.caseNumber,
          }
        : prev
    );

  return (
    <div className="space-y-3">
      <Section label={t("chat.starter.stepTopic")} required isRTL={isRTL}>
        <ChipGrid
          options={topics.map((id) => ({
            id,
            label: t(`chat.starter.regulations.topic.${id}`),
          }))}
          selected={sel.topic ? [sel.topic] : []}
          onToggle={(id) =>
            setSel((p) => (p ? { ...p, topic: p.topic === id ? undefined : id } : p))
          }
          isRTL={isRTL}
        />
      </Section>

      <Section label={t("chat.starter.stepScope")} required isRTL={isRTL}>
        <ChipGrid
          options={[
            { id: "general", label: t("chat.starter.regulations.scope.general") },
            { id: "caseRelated", label: t("chat.starter.regulations.scope.caseRelated") },
          ]}
          selected={sel.scope ? [sel.scope] : ["general"]}
          onToggle={(id) =>
            setSel((p) =>
              p
                ? {
                    ...p,
                    scope: id as "general" | "caseRelated",
                    ...(id === "general"
                      ? { caseId: undefined, caseTitle: undefined, caseNumber: undefined }
                      : {}),
                  }
                : p
            )
          }
          isRTL={isRTL}
        />
      </Section>

      {sel.scope === "caseRelated" && (
        <Section label={t("chat.starter.stepCase")} required isRTL={isRTL}>
          <CasePicker value={sel.caseId} onChange={pickCase} />
        </Section>
      )}

      <Section label={t("chat.starter.keywordOptional")} isRTL={isRTL}>
        <input
          type="text"
          value={sel.keyword || ""}
          onChange={(e) =>
            setSel((p) => (p ? { ...p, keyword: e.target.value } : p))
          }
          placeholder={t("chat.starter.searchCases") /* reuse search-style */}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white",
            "px-3 py-2 text-[12px] outline-none",
            "focus:border-[#D97706]/50 focus:ring-2 focus:ring-[#D97706]/10",
            "placeholder:text-slate-400",
            isRTL && "text-right"
          )}
        />
      </Section>
    </div>
  );
}

/* ---------- (c) Draft ---------- */
function DraftFlow({ sel, setSel, isRTL, t }: FlowProps) {
  const docTypes = ["reply", "objection", "contract", "notice", "letter"];

  const pickCase = (c: PickedCase | null) =>
    setSel((prev) =>
      prev
        ? {
            ...prev,
            caseId: c?.id,
            caseTitle: c?.title,
            caseNumber: c?.caseNumber,
          }
        : prev
    );

  return (
    <div className="space-y-3">
      <Section label={t("chat.starter.stepDocType")} required isRTL={isRTL}>
        <ChipGrid
          options={docTypes.map((id) => ({
            id,
            label: t(`chat.starter.draft.types.${id}`),
          }))}
          selected={sel.docType ? [sel.docType] : []}
          onToggle={(id) =>
            setSel((p) =>
              p ? { ...p, docType: p.docType === id ? undefined : id } : p
            )
          }
          isRTL={isRTL}
        />
      </Section>

      <Section label={t("chat.starter.stepAttachCase")} isRTL={isRTL}>
        <CasePicker value={sel.caseId} onChange={pickCase} />
      </Section>

      <Section label={t("chat.starter.keyPoints")} required isRTL={isRTL}>
        <textarea
          value={sel.keyPoints || ""}
          onChange={(e) =>
            setSel((p) => (p ? { ...p, keyPoints: e.target.value } : p))
          }
          placeholder={t("chat.starter.keyPointsPlaceholder")}
          rows={3}
          className={cn(
            "w-full resize-none rounded-xl border border-slate-200 bg-white",
            "px-3 py-2 text-[12px] outline-none",
            "focus:border-[#D97706]/50 focus:ring-2 focus:ring-[#D97706]/10",
            "placeholder:text-slate-400",
            isRTL && "text-right"
          )}
        />
      </Section>
    </div>
  );
}

/* ---------- (d) Explain ---------- */
function ExplainFlow({ sel, setSel, isRTL, t }: FlowProps) {
  const depths = ["simple", "detailed", "examples"];

  return (
    <div className="space-y-3">
      <Section label={t("chat.starter.stepTerm")} required isRTL={isRTL}>
        <input
          type="text"
          value={sel.term || ""}
          onChange={(e) => setSel((p) => (p ? { ...p, term: e.target.value } : p))}
          placeholder={t("chat.starter.termPlaceholder")}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white",
            "px-3 py-2 text-[12px] outline-none",
            "focus:border-[#D97706]/50 focus:ring-2 focus:ring-[#D97706]/10",
            "placeholder:text-slate-400",
            isRTL && "text-right"
          )}
          autoFocus
        />
      </Section>

      <Section label={t("chat.starter.stepDepth")} required isRTL={isRTL}>
        <ChipGrid
          options={depths.map((id) => ({
            id,
            label: t(`chat.starter.explain.depth.${id}`),
          }))}
          selected={sel.depth ? [sel.depth] : []}
          onToggle={(id) =>
            setSel((p) =>
              p
                ? {
                    ...p,
                    depth:
                      p.depth === id
                        ? undefined
                        : (id as "simple" | "detailed" | "examples"),
                  }
                : p
            )
          }
          isRTL={isRTL}
        />
      </Section>
    </div>
  );
}

/* ================================================================
   Primitives
   ================================================================ */

function Section({
  label,
  required,
  children,
  isRTL,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5",
          isRTL && "text-right"
        )}
      >
        <span>{label}</span>
        {required && (
          <span className="inline-block mx-1 text-[#D97706]">*</span>
        )}
      </div>
      {children}
    </div>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
  isRTL,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  isRTL: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        isRTL && "flex-row-reverse"
      )}
    >
      {options.map(({ id, label }) => {
        const active = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            aria-pressed={active}
            className={cn(
              "text-[11.5px] px-3 py-1.5 rounded-full font-medium transition-all",
              active
                ? "bg-[#D97706] text-white shadow-sm hover:bg-[#B45309]"
                : "bg-white text-slate-700 border border-slate-200 hover:border-[#D97706]/40 hover:bg-[#D97706]/5"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

