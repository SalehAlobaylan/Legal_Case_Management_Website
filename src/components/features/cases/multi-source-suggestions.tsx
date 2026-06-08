"use client";

/*
 * File: src/components/features/cases/multi-source-suggestions.tsx
 * Purpose: Render the four-tier multi-source linked-sources panel —
 *          regulations, judicial decisions, government data, and Tavily
 *          web research — with explicit trust badges and citability cues.
 * Used by: case detail pages.
 *
 * Design notes:
 *   - Trust tier is rendered at the SECTION level (group header) AND the
 *     ITEM level (per source) so lawyers can never confuse a 92%-relevance
 *     blog with a 75%-relevance Royal Decree.
 *   - The "Web Research" group has a hard visual divider (yellow background,
 *     warning icon, persistent "Reference only" text) — not a subtle hover.
 *   - All 4 tiers render simultaneously per the agreed design (no progressive
 *     disclosure).
 */

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Gavel,
  Globe,
  Landmark,
  Loader2,
  Search,
  ScrollText,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MuseumGuard } from "@/components/common/museum-guard";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useMuseumMode } from "@/lib/hooks/use-museum-mode";
import {
  useCaseSources,
  useDismissCaseSourceLink,
  useFindRelatedCaseSources,
  useVerifyCaseSourceLink,
} from "@/lib/hooks/use-case-sources";
import type {
  CaseSourceItem,
  SourceType,
  TrustTier,
} from "@/lib/api/case-sources";

interface MultiSourceSuggestionsProps {
  caseId: number;
  className?: string;
}

const SOURCE_TYPE_META: Record<
  SourceType,
  { label: string; labelAr: string; icon: typeof Landmark; description: string }
> = {
  regulation: {
    label: "Regulations",
    labelAr: "أنظمة وقوانين",
    icon: Landmark,
    description: "Official statutes and royal decrees",
  },
  judicial_decision: {
    label: "Judicial Precedents",
    labelAr: "أحكام قضائية",
    icon: Gavel,
    description: "Saudi court rulings and decisions",
  },
  gov_data: {
    label: "Government Documents",
    labelAr: "وثائق حكومية",
    icon: ScrollText,
    description: "Open data from official Saudi publishers",
  },
  web_source: {
    label: "Web Research",
    labelAr: "بحث على الإنترنت",
    icon: Globe,
    description: "Discovered via Tavily search — verify before citing",
  },
};

const TRUST_TIER_META: Record<
  TrustTier,
  { label: string; tone: "official" | "trusted" | "discovered" | "unverified" }
> = {
  official: { label: "Official", tone: "official" },
  trusted: { label: "Trusted", tone: "trusted" },
  discovered: { label: "Discovered", tone: "discovered" },
  unverified: { label: "Unverified", tone: "unverified" },
};

export function TrustBadge({ tier }: { tier: TrustTier }) {
  const meta = TRUST_TIER_META[tier];
  const tones: Record<typeof meta.tone, string> = {
    official: "bg-emerald-100 text-emerald-800 border-emerald-300",
    trusted: "bg-blue-100 text-blue-800 border-blue-300",
    discovered: "bg-slate-100 text-slate-700 border-slate-300",
    unverified: "bg-amber-100 text-amber-800 border-amber-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[meta.tone]
      )}
    >
      {meta.label}
    </span>
  );
}

export function CitabilityPill({ citable }: { citable: boolean }) {
  if (citable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
        <ShieldCheck className="h-3 w-3" />
        Citable in court
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
      <AlertTriangle className="h-3 w-3" />
      Reference only
    </span>
  );
}

export function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const color =
    pct >= 67 ? "bg-emerald-500" : pct >= 33 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600">{pct}%</span>
    </div>
  );
}

function SourceItemRow({
  item,
  isWebTier,
  onVerify,
  onDismiss,
}: {
  item: CaseSourceItem;
  isWebTier: boolean;
  onVerify: (linkId: number) => void;
  onDismiss: (linkId: number) => void;
}) {
  const score = Number.parseFloat(item.trustWeightedScore ?? "0");
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3 transition-colors",
        isWebTier ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white",
        item.verified && "ring-1 ring-emerald-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <TrustBadge tier={item.trustTier} />
            <CitabilityPill citable={item.isCitableInCourt} />
            <span className="text-xs text-slate-500">{item.sourceAuthority}</span>
            {item.curatorVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
                <ShieldCheck className="h-3 w-3" />
                Curator-verified
              </span>
            )}
          </div>
          <h4 className="mt-1 truncate text-sm font-medium text-slate-900">
            {item.title}
          </h4>
          {item.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
              {item.summary}
            </p>
          )}
        </div>
        <ScoreBar value={score} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open source
          </a>
        )}
        <div className="ml-auto flex items-center gap-1">
          <MuseumGuard>
            <Button
              variant="ghost"
              size="sm"
              disabled={item.verified}
              onClick={() => onVerify(item.linkId)}
              title={item.verified ? "Verified" : "Mark as verified"}
            >
              {item.verified ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <ThumbsUp className="h-3 w-3" />
              )}
            </Button>
          </MuseumGuard>
          <MuseumGuard>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(item.linkId)}
              title="Dismiss"
            >
              <X className="h-3 w-3 text-rose-600" />
            </Button>
          </MuseumGuard>
        </div>
      </div>
    </div>
  );
}

export function SourceGroupSection({
  sourceType,
  items,
  onVerify,
  onDismiss,
}: {
  sourceType: SourceType;
  items: CaseSourceItem[];
  onVerify: (linkId: number) => void;
  onDismiss: (linkId: number) => void;
}) {
  const meta = SOURCE_TYPE_META[sourceType];
  const Icon = meta.icon;
  const isWebTier = sourceType === "web_source";
  const anyCitable = items.some((i) => i.isCitableInCourt);

  return (
    <section
      className={cn(
        "rounded-lg border",
        isWebTier
          ? "border-amber-300 bg-amber-50/40"
          : "border-slate-200 bg-slate-50/40"
      )}
    >
      <header className="flex items-center justify-between gap-3 px-3 py-2 border-b border-inherit">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4",
              isWebTier ? "text-amber-700" : "text-slate-700"
            )}
          />
          <h3 className="text-sm font-semibold text-slate-900">{meta.label}</h3>
          <Badge variant="outline" className="text-xs">
            {items.length}
          </Badge>
          {anyCitable ? (
            <span className="text-xs font-medium text-emerald-700">Citable</span>
          ) : (
            <span className="text-xs font-medium text-amber-800">
              Reference only
            </span>
          )}
        </div>
      </header>

      {isWebTier && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-100/60 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Web search results are <strong>not</strong> citable in Saudi courts.
            Treat as background research and verify against official sources
            before relying on them.
          </p>
        </div>
      )}

      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No {meta.label.toLowerCase()} linked yet.
          </p>
        ) : (
          items.map((item) => (
            <SourceItemRow
              key={item.linkId}
              item={item}
              isWebTier={isWebTier}
              onVerify={onVerify}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </section>
  );
}

export { SOURCE_TYPE_META };

export const SOURCE_TYPE_ORDER: SourceType[] = [
  "regulation",
  "judicial_decision",
  "gov_data",
  "web_source",
];

export function MultiSourceSuggestions({
  caseId,
  className,
}: MultiSourceSuggestionsProps) {
  const { t } = useI18n();
  const isMuseum = useMuseumMode();
  const { data, isLoading, error } = useCaseSources(caseId);
  const findRelated = useFindRelatedCaseSources(caseId);
  const verify = useVerifyCaseSourceLink(caseId);
  const dismiss = useDismissCaseSourceLink(caseId);
  const [includeWeb, setIncludeWeb] = useState(true);

  const handleRunFindRelated = () => {
    findRelated.mutate({ includeWebResearch: includeWeb });
  };

  // Build a complete groups map so empty tiers still render headers.
  const groupsByType = new Map<SourceType, CaseSourceItem[]>();
  for (const t of SOURCE_TYPE_ORDER) groupsByType.set(t, []);
  if (data) {
    for (const g of data.groups) {
      if (groupsByType.has(g.sourceType as SourceType)) {
        groupsByType.set(g.sourceType as SourceType, g.items);
      }
    }
  }

  return (
    <Card data-tour-id="find-related" className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Linked Legal Sources
          </CardTitle>
          <p className="mt-1 text-xs text-slate-600">
            Multi-source case linking — regulations, judicial precedents,
            government data, and web research.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={includeWeb}
              onChange={(e) => setIncludeWeb(e.target.checked)}
              className="h-3 w-3"
            />
            Include web research
          </label>
          <MuseumGuard>
            <Button
              size="sm"
              onClick={handleRunFindRelated}
              disabled={findRelated.isPending}
            >
              {findRelated.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Search className="h-3 w-3" />
              )}
              <span className="ml-1">Find related</span>
            </Button>
          </MuseumGuard>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isMuseum && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {t("museumTour.previewNote")}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading linked sources…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Failed to load case sources: {(error as Error).message}
          </div>
        )}

        {findRelated.data?.tavily?.ran && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
            Web research: {findRelated.data.tavily.cached ? "served from cache" : "fresh search"}
            {typeof findRelated.data.tavily.quotaRemaining === "number" &&
              ` · ${findRelated.data.tavily.quotaRemaining} searches remaining today`}
          </div>
        )}

        {SOURCE_TYPE_ORDER.map((sourceType) => (
          <SourceGroupSection
            key={sourceType}
            sourceType={sourceType}
            items={groupsByType.get(sourceType) ?? []}
            onVerify={(linkId) => verify.mutate(linkId)}
            onDismiss={(linkId) => dismiss.mutate({ linkId })}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default MultiSourceSuggestions;
