/*
 * File: src/components/features/legal-text/legal-text-reader.tsx
 * Purpose: Readable, segmented rendering of long legal text — Saudi court
 *          filings (`kind="case-filing"`) and MOJ regulations
 *          (`kind="regulation"`) — with a sticky TOC, reading controls, and
 *          highlight-range anchoring for AI jump-to-text and URL deep-links.
 *
 * This component was previously `CaseDescriptionReader` and lived under
 * `features/cases/`. It was always kind-agnostic — the rename reflects that.
 *
 * Props:
 *   - title:          section heading (localized, e.g. "Case Description" /
 *                     "Regulation Content").
 *   - text:           raw text (may be a 10–50k-char wall of Arabic).
 *   - kind:           which marker tier the segmenter should use.
 *                     Defaults to "case-filing".
 *   - highlightRange: optional { start, end } offsets to briefly pulse +
 *                     scroll into view (used by AI panels & hash deep-links).
 *   - focusMode/onFocusModeChange: optional controlled focus state so the
 *                     parent page can react (slim chrome, hide side panels…).
 */

"use client";

import * as React from "react";
import { AlignLeft, Copy, Check, Focus, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
  splitLegalText,
  estimateReadingTime,
  type LegalSegment,
  type LegalTextKind,
} from "@/lib/utils/text-segmentation";

export interface HighlightRange {
  start: number;
  end: number;
  /** Bumped by the caller each time the same range should re-trigger animation. */
  nonce?: number;
}

export interface LegalTextReaderProps {
  title: string;
  text: string;
  /** Which marker tier the segmenter should use. Defaults to "case-filing". */
  kind?: LegalTextKind;
  highlightRange?: HighlightRange | null;
  className?: string;
  /** Optional override for the empty-state message. */
  emptyLabel?: string;
  /**
   * Controlled focus mode. When provided, the reader defers focus state to
   * the parent so the page chrome (side panels, header) can react to it.
   * Leave undefined for standalone usage.
   */
  focusMode?: boolean;
  onFocusModeChange?: (next: boolean) => void;
}

type FontStep = 0 | 1 | 2; // small / medium / large

const FONT_STEP_KEY = "silah:reader:fontSize";

const FONT_CLASSES_AR: Record<FontStep, string> = {
  0: "text-[15px] leading-[1.9]",
  1: "text-[17px] leading-[2]",
  2: "text-[19px] leading-[2.1]",
};

const FONT_CLASSES_EN: Record<FontStep, string> = {
  0: "text-[15px] leading-[1.7]",
  1: "text-base leading-[1.8]",
  2: "text-[18px] leading-[1.85]",
};

export function LegalTextReader({
  title,
  text,
  kind = "case-filing",
  highlightRange,
  className,
  emptyLabel,
  focusMode: focusModeProp,
  onFocusModeChange,
}: LegalTextReaderProps) {
  const { t, locale, isRTL } = useI18n();

  // Font size, persisted across reloads.
  const [fontStep, setFontStep] = React.useState<FontStep>(1);
  const [focusModeInternal, setFocusModeInternal] = React.useState(false);
  const focusMode =
    focusModeProp !== undefined ? focusModeProp : focusModeInternal;
  const setFocusMode = (next: boolean) => {
    if (onFocusModeChange) onFocusModeChange(next);
    if (focusModeProp === undefined) setFocusModeInternal(next);
  };
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Hydrate font size from localStorage on mount.
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FONT_STEP_KEY);
      if (saved === "0" || saved === "1" || saved === "2") {
        setFontStep(Number(saved) as FontStep);
      }
    } catch {
      /* ignore SSR / disabled storage */
    }
  }, []);

  const updateFontStep = React.useCallback((next: FontStep) => {
    setFontStep(next);
    try {
      window.localStorage.setItem(FONT_STEP_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const segments = React.useMemo<LegalSegment[]>(
    () => splitLegalText(text, locale === "ar" ? "ar" : "en", kind),
    [text, locale, kind]
  );

  // Only top-level structural segments appear in the TOC. Enumerative
  // ordinals (أولاً، ثانياً…) stay as inline subheadings in the body so nested
  // memoranda don't pollute the TOC with repeating "first, second, third…".
  const tocSegments = React.useMemo(
    () => segments.filter((s) => s.level === "section"),
    [segments]
  );

  const readingMinutes = React.useMemo(
    () => estimateReadingTime(text, locale === "ar" ? "ar" : "en"),
    [text, locale]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  // Track the section currently in view for TOC highlighting.
  React.useEffect(() => {
    if (segments.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-segment-id");
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [segments]);

  // Scroll the segment containing the highlight range into view + pulse it.
  const [pulseId, setPulseId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!highlightRange) return;
    const target = segments.find(
      (s) =>
        highlightRange.start >= s.offset &&
        highlightRange.start < s.offset + s.body.length + 50
    );
    if (!target) return;
    const el = sectionRefs.current.get(target.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPulseId(target.id);
      const id = window.setTimeout(() => setPulseId(null), 2200);
      return () => window.clearTimeout(id);
    }
  }, [highlightRange, segments]);

  const handleJumpTo = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPulseId(id);
      window.setTimeout(() => setPulseId(null), 1500);
    }
  };

  const handleCopy = async (id: string, body: string, heading?: string) => {
    try {
      const payload = heading ? `${heading}\n\n${body}` : body;
      await navigator.clipboard.writeText(payload);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const fontClasses =
    locale === "ar" ? FONT_CLASSES_AR[fontStep] : FONT_CLASSES_EN[fontStep];

  if (!text.trim()) {
    return (
      <section
        className={cn(
          "rounded-2xl bg-white border border-slate-100 p-6",
          className
        )}
      >
        <h3 className="text-xl font-bold text-[#0F2942] mb-2">{title}</h3>
        <p className="text-slate-500">
          {emptyLabel || t("reader.noContent")}
        </p>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "rounded-2xl bg-white border border-slate-100 shadow-sm",
        className
      )}
    >
      {/* Header bar: title + reading controls */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2942]/5 text-[#0F2942]">
            <AlignLeft className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0F2942]">{title}</h3>
            <p className="text-xs text-slate-500">
              {readingMinutes} {t("reader.readingTime")} · {segments.length}{" "}
              {tocSegments.length > 1 ? "·" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              updateFontStep(Math.max(0, fontStep - 1) as FontStep)
            }
            disabled={fontStep === 0}
            aria-label={t("reader.fontSmaller")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 tabular-nums w-6 text-center">
            {fontStep === 0 ? "A-" : fontStep === 1 ? "A" : "A+"}
          </span>
          <button
            type="button"
            onClick={() =>
              updateFontStep(Math.min(2, fontStep + 1) as FontStep)
            }
            disabled={fontStep === 2}
            aria-label={t("reader.fontLarger")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-2 h-6 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            aria-pressed={focusMode}
            aria-label={t("reader.focusMode")}
            title={t("reader.focusMode")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              focusMode
                ? "bg-[#D97706] text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Focus className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Body: TOC (if multi-section) + content */}
      <div
        className={cn(
          "grid gap-6 p-5 md:p-6",
          tocSegments.length > 1 && "lg:grid-cols-[180px_minmax(0,1fr)]"
        )}
      >
        {tocSegments.length > 1 && (
          <>
            {/* Mobile / tablet: collapsible TOC (sticky side nav kicks in at lg) */}
            <details className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-bold text-[#0F2942]">
                {t("reader.tableOfContents")}
              </summary>
              <TocList
                segments={tocSegments}
                activeId={activeId}
                onJump={handleJumpTo}
                introLabel={t("reader.intro")}
              />
            </details>

            {/* Desktop: sticky TOC */}
            <aside className="hidden lg:block">
              <div
                className="sticky top-24 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                aria-label={t("reader.tableOfContents")}
              >
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t("reader.tableOfContents")}
                </h4>
                <TocList
                  segments={tocSegments}
                  activeId={activeId}
                  onJump={handleJumpTo}
                  introLabel={t("reader.intro")}
                />
              </div>
            </aside>
          </>
        )}

        {/* Content */}
        <article
          className={cn(
            "min-w-0 w-full",
            locale === "ar" && "font-arabic-reader"
          )}
        >
          {segments.map((seg, idx) => {
            const dimmed =
              focusMode && activeId !== null && activeId !== seg.id;
            const pulse = pulseId === seg.id;
            const isItem = seg.level === "item";
            return (
              <div
                key={seg.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(seg.id, el);
                  else sectionRefs.current.delete(seg.id);
                }}
                data-segment-id={seg.id}
                className={cn(
                  "group scroll-mt-24 transition-opacity duration-300",
                  idx > 0 &&
                    (isItem
                      ? "mt-6"
                      : "mt-10 pt-6 border-t border-slate-100"),
                  dimmed && "opacity-30"
                )}
              >
                {seg.heading && (
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4
                      className={cn(
                        "font-bold text-[#0F2942]",
                        isItem ? "text-base text-slate-700" : "text-lg"
                      )}
                    >
                      {seg.heading}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(seg.id, seg.body, seg.heading)
                      }
                      aria-label={t("reader.copySection")}
                      title={t("reader.copySection")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                    >
                      {copiedId === seg.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
                <SegmentBody
                  segment={seg}
                  highlight={highlightRange || null}
                  fontClasses={fontClasses}
                  pulse={pulse}
                />
              </div>
            );
          })}
        </article>
      </div>
    </section>
  );
}

/* =============================================================================
   TOC list
   ============================================================================= */

/**
 * Short navigable label for an unheaded segment — first sentence of the body,
 * capped at ~60 chars. Falls back to "#N" only if the body is empty (rare).
 * Strips leading list markers ("1.", "أ-", "•", etc.) so the preview starts
 * with actual content.
 */
function previewFromBody(body: string, idx: number): string {
  const cleaned = (body ?? "")
    .replace(/\s+/g, " ")
    .replace(/^\s*(?:[\u0660-\u06690-9]+[.)\-:]|[\u0623-\u064A][.)\-:]|[•·\-*])\s+/u, "")
    .trim();
  if (!cleaned) return `#${idx + 1}`;
  // Cut at the first sentence boundary if it comes early, otherwise hard-cap.
  const sentenceEnd = cleaned.search(/[.؟!?]\s|$/);
  const end = sentenceEnd > 0 && sentenceEnd < 60 ? sentenceEnd : 60;
  const slice = cleaned.slice(0, end).trim();
  return slice.length < cleaned.length ? `${slice}…` : slice;
}

function TocList({
  segments,
  activeId,
  onJump,
  introLabel,
}: {
  segments: LegalSegment[];
  activeId: string | null;
  onJump: (id: string) => void;
  introLabel: string;
}) {
  return (
    <ol className="space-y-1 text-sm">
      {segments.map((seg, idx) => {
        // Prefer the explicit heading. When the segmenter falls back to
        // sentence-chunked prose (typical for free-form case descriptions
        // that don't use "الوقائع:" / "الطلبات:" markers), seg.heading is
        // undefined. Previously we rendered "#1 #2 #3…" which is useless
        // for navigation — derive a short preview from the body instead so
        // each TOC entry shows the reader what's actually in that chunk.
        const label =
          seg.heading ||
          (idx === 0 ? introLabel : previewFromBody(seg.body, idx));
        const isActive = activeId === seg.id;
        return (
          <li key={seg.id}>
            <button
              type="button"
              onClick={() => onJump(seg.id)}
              className={cn(
                "block w-full whitespace-normal break-words rounded-md px-3 py-1.5 text-start leading-snug transition-colors",
                isActive
                  ? "bg-[#D97706]/10 text-[#0F2942] font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* =============================================================================
   Segment body: renders body text with optional <mark> highlight range and
   a "show more" collapse for very long segments without headings.
   ============================================================================= */

const COLLAPSE_LIMIT = 1800;

function SegmentBody({
  segment,
  highlight,
  fontClasses,
  pulse,
}: {
  segment: LegalSegment;
  highlight: HighlightRange | null;
  fontClasses: string;
  pulse: boolean;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = React.useState(false);

  const needsCollapse = segment.body.length > COLLAPSE_LIMIT && !segment.heading;
  const visible =
    needsCollapse && !expanded
      ? segment.body.slice(0, COLLAPSE_LIMIT) + "…"
      : segment.body;

  // Build paragraph blocks from the visible text: split on double-space or
  // newline runs, fallback to single chunk.
  const paragraphs = React.useMemo(() => {
    return visible
      .split(/\n{2,}|\.\s{2,}|؟\s{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [visible]);

  const renderWithHighlight = (paragraph: string, pIdx: number) => {
    if (!highlight) {
      return <p key={pIdx} className="mb-5">{paragraph}</p>;
    }
    // Translate highlight range to this paragraph's local offset.
    const pStart = segment.offset + segment.body.indexOf(paragraph);
    const pEnd = pStart + paragraph.length;
    if (highlight.end <= pStart || highlight.start >= pEnd) {
      return <p key={pIdx} className="mb-5">{paragraph}</p>;
    }
    const localStart = Math.max(0, highlight.start - pStart);
    const localEnd = Math.min(paragraph.length, highlight.end - pStart);
    return (
      <p key={pIdx} className="mb-5">
        {paragraph.slice(0, localStart)}
        <mark className="rounded bg-amber-200/70 px-1 py-0.5 text-[#0F2942]">
          {paragraph.slice(localStart, localEnd)}
        </mark>
        {paragraph.slice(localEnd)}
      </p>
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl text-slate-800 transition-colors",
        fontClasses,
        pulse && "bg-amber-50 ring-2 ring-amber-300/60"
      )}
    >
      {paragraphs.map(renderWithHighlight)}
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#0F2942]/5 px-4 py-1.5 text-sm font-semibold text-[#0F2942] hover:bg-[#0F2942]/10"
        >
          {expanded ? t("reader.showLess") : t("reader.showMore")}
        </button>
      )}
    </div>
  );
}
