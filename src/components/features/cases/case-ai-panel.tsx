/*
 * File: src/components/features/cases/case-ai-panel.tsx
 * Purpose: Side panel that presents AI-generated case analysis (summary,
 *          strengths, weaknesses, risks, recommendations) and lets the
 *          lawyer jump into the reader at the matched passage.
 *
 * Backend: calls POST /api/ai/cases/:id/analyze (aiApi.analyzeCase) which
 * already returns { summary, strengths, weaknesses, risks, recommendations,
 * relevantRegulations, suggestedStrategy }.
 */

"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Lightbulb,
  RefreshCw,
  Flag,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useCaseAnalysis,
  useGenerateCaseAnalysis,
} from "@/lib/hooks/use-case-analysis";
import type { HighlightRange } from "../legal-text/legal-text-reader";

export interface CaseAIPanelProps {
  caseId: number;
  /** Raw case description, used to locate a snippet in the reader for jumping. */
  description: string;
  /** Setter called with a highlight range when user clicks "Jump to text". */
  onJumpTo?: (range: HighlightRange) => void;
  className?: string;
}

export function CaseAIPanel({
  caseId,
  description,
  onJumpTo,
  className,
}: CaseAIPanelProps) {
  const { t, formatDate } = useI18n();
  const { data: cached } = useCaseAnalysis(caseId);
  const generate = useGenerateCaseAnalysis(caseId);

  const analysis = cached?.analysis;
  const isGenerating = generate.isPending;
  const hasError = generate.isError;

  // Collapsible: default collapsed to keep the reader front-and-center.
  // Auto-expand when analysis arrives or when generating / errored so the
  // user sees progress and results without an extra click.
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (analysis || isGenerating || hasError) setOpen(true);
  }, [analysis, isGenerating, hasError]);

  const handleJump = (snippet: string) => {
    if (!onJumpTo || !description) return;
    // Try exact match first; fall back to first 40 chars (model paraphrases).
    const norm = snippet.trim().replace(/\s+/g, " ").slice(0, 60);
    let idx = description.indexOf(norm);
    if (idx === -1 && norm.length > 20) {
      idx = description.indexOf(norm.slice(0, 25));
    }
    if (idx === -1) return;
    onJumpTo({
      start: idx,
      end: idx + Math.min(norm.length, 120),
      nonce: Date.now(),
    });
  };

  return (
    <aside
      className={cn(
        "rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-[#0F2942]/[0.02] shadow-sm",
        className
      )}
    >
      {/* Header — clickable to expand/collapse */}
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-3 text-start rounded-lg -m-1 p-1 hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D97706] to-[#b45309] text-white shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#0F2942]">
              {t("cases.aiPanel.title")}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {analysis
                ? cached?.generatedAt
                  ? `${t("cases.aiPanel.generatedAt")}: ${formatDate(cached.generatedAt, { dateStyle: "medium", timeStyle: "short" })}`
                  : t("cases.aiPanel.empty.title")
                : isGenerating
                  ? t("cases.aiPanel.generating")
                  : t("cases.aiPanel.empty.body")}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        {!analysis && !isGenerating && !hasError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
              generate.mutate();
            }}
            disabled={!description.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D97706] to-[#b45309] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("cases.aiPanel.empty.cta")}
          </button>
        )}
        {analysis && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              generate.mutate();
            }}
            disabled={isGenerating}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#0F2942] disabled:opacity-50"
            aria-label={t("cases.aiPanel.regenerate")}
            title={t("cases.aiPanel.regenerate")}
          >
            <RefreshCw
              className={cn("h-4 w-4", isGenerating && "animate-spin")}
            />
          </button>
        )}
      </div>

      {/* Body — only when expanded */}
      {open && (
        <div className="border-t border-slate-100 p-5">
          {isGenerating && !analysis && <LoadingState />}

          {hasError && !analysis && (
            <ErrorState onRetry={() => generate.mutate()} />
          )}

          {analysis && (
            <AnalysisTabs
              analysis={analysis}
              confidence={cached?.confidence}
              onJump={handleJump}
            />
          )}
        </div>
      )}

      {/* Footer — disclaimer */}
      {open && analysis && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-start gap-2 rounded-lg bg-amber-50/60 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-amber-900">
              {t("cases.aiPanel.disclaimer")}
            </p>
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0F2942]"
            onClick={() => {
              // Stub — real endpoint wired in later phase.
              window.alert(t("cases.aiPanel.reportInaccuracy"));
            }}
          >
            <Flag className="h-3 w-3" />
            {t("cases.aiPanel.reportInaccuracy")}
          </button>
        </div>
      )}
    </aside>
  );
}

function LoadingState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#D97706]" />
      <p className="text-sm font-medium text-slate-600">
        {t("cases.aiPanel.generating")}
      </p>
      <div className="mt-5 w-full space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200/70" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200/70" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-slate-200/70" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="mb-4 text-sm text-slate-700">{t("cases.aiPanel.error")}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0F2942] hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4" />
        {t("cases.aiPanel.retry")}
      </button>
    </div>
  );
}

/* =============================================================================
   Tabs: summary / strengths / weaknesses / risks / recommendations
   ============================================================================= */

function AnalysisTabs({
  analysis,
  confidence,
  onJump,
}: {
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    recommendations: string[];
    suggestedStrategy?: string;
  };
  confidence?: number;
  onJump: (snippet: string) => void;
}) {
  const { t } = useI18n();

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList variant="pills" className="mb-4 w-full overflow-x-auto">
        <TabsTrigger variant="pills" value="summary">
          {t("cases.aiPanel.tabs.summary")}
        </TabsTrigger>
        <TabsTrigger variant="pills" value="strengths">
          {t("cases.aiPanel.tabs.strengths")}
        </TabsTrigger>
        <TabsTrigger variant="pills" value="weaknesses">
          {t("cases.aiPanel.tabs.weaknesses")}
        </TabsTrigger>
        <TabsTrigger variant="pills" value="risks">
          {t("cases.aiPanel.tabs.risks")}
        </TabsTrigger>
        <TabsTrigger variant="pills" value="recs">
          {t("cases.aiPanel.tabs.recommendations")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <div className="space-y-3">
          {typeof confidence === "number" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">
                {t("cases.aiPanel.confidence")}:
              </span>
              <span className="font-bold text-[#0F2942]">
                {Math.round(confidence * 100)}%
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#D97706] to-[#b45309]"
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm leading-[1.9] text-slate-800">
            {analysis.summary}
          </p>
          {analysis.suggestedStrategy && (
            <div className="rounded-xl border border-[#0F2942]/10 bg-[#0F2942]/[0.03] p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#0F2942]/70">
                {t("cases.aiPanel.tabs.recommendations")}
              </p>
              <p className="text-sm leading-relaxed text-slate-800">
                {analysis.suggestedStrategy}
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="strengths">
        <BulletList
          items={analysis.strengths}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          tone="green"
          onJump={onJump}
        />
      </TabsContent>

      <TabsContent value="weaknesses">
        <BulletList
          items={analysis.weaknesses}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          tone="amber"
          onJump={onJump}
        />
      </TabsContent>

      <TabsContent value="risks">
        <BulletList
          items={analysis.risks}
          icon={<ShieldAlert className="h-4 w-4 text-red-600" />}
          tone="red"
          onJump={onJump}
        />
      </TabsContent>

      <TabsContent value="recs">
        <BulletList
          items={analysis.recommendations}
          icon={<Lightbulb className="h-4 w-4 text-[#D97706]" />}
          tone="orange"
          onJump={onJump}
        />
      </TabsContent>
    </Tabs>
  );
}

function BulletList({
  items,
  icon,
  tone,
  onJump,
}: {
  items: string[];
  icon: React.ReactNode;
  tone: "green" | "amber" | "red" | "orange";
  onJump: (snippet: string) => void;
}) {
  const { t } = useI18n();
  if (!items || items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">—</p>
    );
  }
  const bg =
    tone === "green"
      ? "bg-green-50/60"
      : tone === "amber"
      ? "bg-amber-50/60"
      : tone === "red"
      ? "bg-red-50/60"
      : "bg-[#D97706]/5";
  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li
          key={idx}
          className={cn(
            "group flex items-start gap-3 rounded-xl p-3 transition-colors",
            bg
          )}
        >
          <span className="mt-0.5 shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-slate-800">{item}</p>
            <button
              type="button"
              onClick={() => onJump(item)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F2942]/70 opacity-0 transition-opacity hover:text-[#D97706] group-hover:opacity-100"
            >
              <ArrowRight className="h-3 w-3" />
              {t("cases.aiPanel.jumpToText")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
