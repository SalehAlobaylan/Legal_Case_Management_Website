"use client";

/*
 * AI Intelligence panel — the admin "AI Intelligence" tab.
 *
 * Self-fetching (via useAdminAIIntelligence). Renders the executive summary,
 * risk-ranked cases, review queue, document/regulation watch cards, and the
 * model quality + AI service health card. All actions are human-triggered
 * (refresh org, refresh case, run evaluation) and go through confirm dialogs
 * for the heavier operations.
 */

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  FileWarning,
  Gauge,
  Info,
  ListChecks,
  Loader2,
  RefreshCw,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MuseumGuard } from "@/components/common/museum-guard";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import {
  useAdminAIIntelligence,
  useRefreshAdminAICaseProfile,
  useRefreshAdminAIIntelligence,
  useRunAdminAIEvaluation,
} from "@/lib/hooks/use-admin-ai-intelligence";
import type { AdminAICaseProfile } from "@/lib/api/admin";

// Calm, attention-not-alarm palette: orange (not red) for the top band, green
// for the lowest band so a healthy org reads as reassuring.
const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-orange-50 text-orange-700 border-orange-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function AIIntelligencePanel({ enabled = true }: { enabled?: boolean }) {
  const { t } = useI18n();
  const { data, isLoading, error } = useAdminAIIntelligence(enabled);
  const refresh = useRefreshAdminAIIntelligence();
  const runEval = useRunAdminAIEvaluation();
  const refreshCase = useRefreshAdminAICaseProfile();
  const [confirm, setConfirm] = React.useState<"refresh" | "eval" | null>(null);

  const urgencyLabel = (u: string) =>
    t(`admin.aiIntel.urgency${u.charAt(0).toUpperCase()}${u.slice(1)}`);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t("admin.loadFailed")}
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const degraded =
    data.method === "backend_fallback" || (data.warnings ?? []).includes("ai_unavailable");

  return (
    <div data-tour-id="admin-ai-intelligence" className="space-y-6">
      {/* Header + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[#0F2942] flex items-center gap-2">
            <Bot className="h-5 w-5" /> {t("admin.aiIntel.title")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t("admin.aiIntel.subtitle")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                data.aiHealth.ready
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Activity className="h-3 w-3" />
              {data.aiHealth.ready ? t("admin.aiIntel.ready") : t("admin.aiIntel.attention")}
            </span>
            {data.generatedAt ? (
              <span className="text-slate-400">
                {t("admin.aiIntel.lastRefreshed")}: {formatDate(data.generatedAt)}
              </span>
            ) : null}
          </div>
        </div>
        <MuseumGuard>
          <Button
            size="sm"
            disabled={refresh.isPending}
            onClick={() => setConfirm("refresh")}
            className="bg-[#0F2942] hover:bg-[#1E3A56]"
          >
            {refresh.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ms-2">
              {refresh.isPending ? t("admin.aiIntel.refreshing") : t("admin.aiIntel.refresh")}
            </span>
          </Button>
        </MuseumGuard>
      </div>

      {degraded ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 flex items-center gap-2">
          <Info className="h-4 w-4" /> {t("admin.aiIntel.degraded")}
        </div>
      ) : null}

      {data.needsRefresh ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-slate-300" />
            <div className="text-lg font-semibold text-[#0F2942]">
              {t("admin.aiIntel.needsRefresh")}
            </div>
            <p className="text-sm text-slate-500">{t("admin.aiIntel.needsRefreshHelp")}</p>
            <MuseumGuard>
              <Button
                size="sm"
                disabled={refresh.isPending}
                onClick={() => setConfirm("refresh")}
                className="bg-[#0F2942] hover:bg-[#1E3A56]"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="ms-2">{t("admin.aiIntel.refresh")}</span>
              </Button>
            </MuseumGuard>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Executive summary band */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.aiIntel.execSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[#0F2942] font-medium">{data.summary.headline}</p>
              <ul className="list-disc ms-5 space-y-1 text-sm text-slate-600">
                {data.summary.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <Stat label={t("admin.aiIntel.urgencyCritical")} value={data.aggregateRisk.critical} accent="text-orange-700" />
                <Stat label={t("admin.aiIntel.urgencyHigh")} value={data.aggregateRisk.high} accent="text-amber-700" />
                <Stat label={t("admin.aiIntel.urgencyMedium")} value={data.aggregateRisk.medium} accent="text-blue-700" />
                <Stat label={t("admin.aiIntel.urgencyLow")} value={data.aggregateRisk.low} accent="text-emerald-700" />
                <Stat label={t("admin.aiIntel.avgScore")} value={data.aggregateRisk.averageScore} accent="text-[#0F2942]" />
              </div>
            </CardContent>
          </Card>

          {/* Risk-ranked cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="h-4 w-4" /> {t("admin.aiIntel.riskCases")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.riskCases.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">{t("admin.aiIntel.noRiskCases")}</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.riskCases.slice(0, 15).map((c) => (
                    <RiskRow
                      key={c.caseId}
                      profile={c}
                      urgencyLabel={urgencyLabel}
                      t={t}
                      onRefresh={() => refreshCase.mutate(c.caseId)}
                      refreshing={refreshCase.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Review queue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> {t("admin.aiIntel.reviewQueue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.reviewQueue.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">{t("admin.aiIntel.noReviewItems")}</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data.reviewQueue.slice(0, 10).map((r) => (
                      <li key={r.caseId} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#0F2942] truncate">
                            {r.caseNumber} — {r.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.unverifiedLinks} {t("admin.aiIntel.unverifiedLinks")}
                          </div>
                        </div>
                        <Link
                          href={`/cases/${r.caseId}/linking`}
                          className="text-xs text-orange-600 hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          {t("admin.aiIntel.review")} <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Document intelligence */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileWarning className="h-4 w-4" /> {t("admin.aiIntel.documentIntel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.documentIntelligence.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">{t("admin.aiIntel.noDocRisk")}</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data.documentIntelligence.slice(0, 10).map((d) => (
                      <CaseRefRow key={d.caseId} caseId={d.caseId} title={`${d.caseNumber} — ${d.title}`} detail={d.detail} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Regulation impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4" /> {t("admin.aiIntel.regulationImpact")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.regulationImpact.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">{t("admin.aiIntel.noRegImpact")}</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data.regulationImpact.slice(0, 10).map((d) => (
                      <CaseRefRow key={d.caseId} caseId={d.caseId} title={`${d.caseNumber} — ${d.title}`} detail={d.detail} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Model quality + health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> {t("admin.aiIntel.quality")}
                  </span>
                  <MuseumGuard>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={runEval.isPending}
                      onClick={() => setConfirm("eval")}
                    >
                      {runEval.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ms-2">{t("admin.aiIntel.runEvaluation")}</span>
                    </Button>
                  </MuseumGuard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!data.quality || !data.quality.hasRun ? (
                  <p className="text-sm text-slate-400 py-2">{t("admin.aiIntel.noEvalRuns")}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <Metric
                      label={t("admin.aiIntel.recall5")}
                      value={Number(data.quality.latest?.recallAt5 ?? 0)}
                      trend={data.quality.trend?.recallAt5 ?? null}
                    />
                    <Metric
                      label={t("admin.aiIntel.precision5")}
                      value={Number(data.quality.latest?.precisionAt5 ?? 0)}
                      trend={data.quality.trend?.precisionAt5 ?? null}
                    />
                    <Metric
                      label={t("admin.aiIntel.ndcg5")}
                      value={Number(data.quality.latest?.ndcgAt5 ?? 0)}
                      trend={data.quality.trend?.ndcgAt5 ?? null}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "eval" ? t("admin.aiIntel.confirmRunEvalTitle") : t("admin.aiIntel.confirmRefreshTitle")}
        description={confirm === "eval" ? t("admin.aiIntel.confirmRunEvalDesc") : t("admin.aiIntel.confirmRefreshDesc")}
        confirmText={confirm === "eval" ? t("admin.aiIntel.runEvaluation") : t("admin.aiIntel.refresh")}
        cancelText={t("common.cancel")}
        variant="warning"
        onConfirm={() => {
          const which = confirm;
          setConfirm(null);
          if (which === "eval") runEval.mutate(undefined);
          else if (which === "refresh") refresh.mutate();
        }}
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Metric({ label, value, trend }: { label: string; value: number; trend: number | null }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3 text-center">
      <div className="text-xl font-bold text-[#0F2942]">{value.toFixed(2)}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {trend !== null && trend !== 0 ? (
        <div
          className={`text-xs mt-1 inline-flex items-center gap-0.5 ${
            trend > 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend > 0 ? "+" : ""}
          {trend.toFixed(2)}
        </div>
      ) : null}
    </div>
  );
}

function CaseRefRow({ caseId, title, detail }: { caseId: number; title: string; detail: string | null }) {
  return (
    <li className="py-2 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[#0F2942] truncate">{title}</div>
        {detail ? <div className="text-xs text-slate-500 truncate">{detail}</div> : null}
      </div>
      <Link
        href={`/cases/${caseId}`}
        className="text-xs text-orange-600 hover:underline inline-flex items-center gap-1 shrink-0"
      >
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </li>
  );
}

function RiskRow({
  profile,
  urgencyLabel,
  t,
  onRefresh,
  refreshing,
}: {
  profile: AdminAICaseProfile;
  urgencyLabel: (u: string) => string;
  t: (key: string) => string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="py-3 flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
              URGENCY_STYLES[profile.urgency] ?? URGENCY_STYLES.low
            }`}
          >
            {urgencyLabel(profile.urgency)}
          </span>
          <span className="text-sm font-semibold text-[#0F2942] truncate">
            {profile.caseNumber} — {profile.title}
          </span>
          <span className="text-xs text-slate-400">
            {t("admin.aiIntel.score")}: {profile.score}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {profile.evidence.slice(0, 4).map((e, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
              title={e.detail ?? undefined}
            >
              {e.label}
            </span>
          ))}
        </div>
        {profile.rationale ? (
          <p className="mt-1 text-xs text-slate-500">{profile.rationale}</p>
        ) : null}
        <div className="mt-1 text-xs text-slate-400">
          {t("admin.aiIntel.owner")}:{" "}
          {profile.assignedLawyer?.fullName || t("admin.aiIntel.unassigned")}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/cases/${profile.caseId}`}
          className="text-xs text-orange-600 hover:underline inline-flex items-center gap-1"
        >
          {t("admin.aiIntel.openCase")} <ArrowUpRight className="h-3 w-3" />
        </Link>
        <MuseumGuard>
          <Button size="sm" variant="ghost" disabled={refreshing} onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </MuseumGuard>
      </div>
    </div>
  );
}
