"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Compass, Eye, Grid2X2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useMuseumMode } from "@/lib/hooks/use-museum-mode";
import { usePermission } from "@/lib/hooks/use-permission";
import { useCases } from "@/lib/hooks/use-cases";
import { useRegulations } from "@/lib/hooks/use-regulations";
import { useChatStore } from "@/lib/store/chat-store";
import { cn } from "@/lib/utils/cn";
import {
  MUSEUM_TOUR_STORAGE_KEY,
  museumGuidedTourIds,
  museumTourItems,
  type MuseumTourCategory,
  type MuseumTourItem,
  type MuseumTourRouteContext,
} from "@/lib/museum-tour";
import {
  centeredBottom,
  pickPlacement,
  type Rect,
  type TourPlacement,
} from "@/components/common/tour-placement";

const categoryStyles: Record<MuseumTourCategory, string> = {
  core: "bg-blue-50 text-blue-700 border-blue-200",
  ai: "bg-amber-50 text-amber-800 border-amber-200",
  admin: "bg-rose-50 text-rose-700 border-rose-200",
  workflow: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const categoryAccent: Record<MuseumTourCategory, string> = {
  core: "bg-blue-500",
  ai: "bg-amber-500",
  admin: "bg-rose-500",
  workflow: "bg-emerald-500",
};

const categoryAccentSoft: Record<MuseumTourCategory, string> = {
  core: "bg-blue-50 text-blue-700 ring-blue-200/60",
  ai: "bg-amber-50 text-amber-700 ring-amber-200/60",
  admin: "bg-rose-50 text-rose-700 ring-rose-200/60",
  workflow: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
};

// Estimated panel dimensions used by the smart-placement algorithm. The
// real panel can be slightly smaller or larger, but using a fixed estimate
// avoids a feedback loop between measurement and repositioning (which was
// what made the panel jitter when the page scrolled). 360 wide matches
// the panel's `max-w-[360px]` so the algorithm can never be wrong about
// the horizontal extent.
const PANEL_ESTIMATED_WIDTH = 360;
const PANEL_ESTIMATED_HEIGHT = 320;

function readCompleted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUSEUM_TOUR_STORAGE_KEY) === "complete";
}

function markCompleted() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUSEUM_TOUR_STORAGE_KEY, "complete");
}

function getAnchor(item: MuseumTourItem) {
  const direct = document.querySelector<HTMLElement>(`[data-tour-id="${item.anchorId}"]`);
  if (direct) return direct;
  if (item.fallbackAnchorId) {
    return document.querySelector<HTMLElement>(`[data-tour-id="${item.fallbackAnchorId}"]`);
  }
  return null;
}

export function MuseumWalkthroughProvider({ children }: { children: React.ReactNode }) {
  const isMuseum = useMuseumMode();
  const { isAdmin } = usePermission();
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [anchorMissing, setAnchorMissing] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const items = React.useMemo(
    () => museumTourItems.filter((item) => !item.adminOnly || isAdmin()),
    [isAdmin]
  );
  const guidedItems = React.useMemo(
    () =>
      museumGuidedTourIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MuseumTourItem => Boolean(item)),
    [items]
  );
  const activeItem = items.find((item) => item.id === activeId) ?? null;
  const activeIndex = activeItem
    ? guidedItems.findIndex((item) => item.id === activeItem.id)
    : -1;

  // Stable refs to the latest `openItem` and `guidedItems` so the autostart
  // effect can read them without depending on their identity (which changes
  // on every route change). The autostart must run exactly once per museum
  // session — if it re-ran on navigation it would drag the user back to
  // step 0 every time the tour moved to a new route.
  const openItemRef = React.useRef<(item: MuseumTourItem) => Promise<void>>(
    async () => {}
  );
  const guidedItemsRef = React.useRef<MuseumTourItem[]>(guidedItems);
  React.useEffect(() => {
    guidedItemsRef.current = guidedItems;
  }, [guidedItems]);

  // Inner-page tour steps (regulation analysis, versions, compare) need a
  // real regulation ID to navigate to. Fetch the first one lazily so the
  // tour can resolve dynamic routes. Skipped when museum mode is off so
  // non-museum users don't pay for the network call.
  const { data: regulationsData } = useRegulations(
    isMuseum ? { limit: 1 } : undefined
  );

  // Same idea for case tour steps (case linking, linking studio, case AI
  // analysis, find related) — they all point at a specific case's inner
  // page, not the cases list. The cases list is almost always cached by
  // the time the walkthrough mounts, so the cost is negligible.
  const { data: casesData } = useCases();
  const firstCaseId = Array.isArray(casesData) ? casesData[0]?.id : undefined;

  React.useEffect(() => {
    setMounted(true);
    setCompleted(readCompleted());
  }, []);

  React.useEffect(() => {
    if (!activeItem) return;

    const captureRect = () => {
      const anchor = getAnchor(activeItem);
      if (!anchor) {
        setRect(null);
        setAnchorMissing(true);
        return;
      }
      const next = anchor.getBoundingClientRect();
      setRect({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
      });
      setAnchorMissing(false);
    };

    // 1. Initial capture so the highlight renders on the first paint.
    captureRect();

    // 2. Re-capture after a smooth scroll lands. We re-scroll first, then
    //    schedule the capture on the next animation frame plus a small delay
    //    to let the smooth scroll animation settle. This is the only time
    //    we re-measure mid-step — the rect is NOT re-captured on user
    //    scroll because that made the panel jitter as the anchor slid
    //    through the viewport.
    const anchor = getAnchor(activeItem);
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      window.setTimeout(captureRect, 500);
    }

    // 3. Re-measure on resize so the panel repositions when the window
    //    size changes (e.g. device rotation, browser resize). The scroll
    //    listener that used to live here was removed: capturing on every
    //    scroll event re-positioned the panel on every wheel tick, which
    //    looked broken.
    window.addEventListener("resize", captureRect);
    return () => {
      window.removeEventListener("resize", captureRect);
    };
  }, [activeItem, pathname]);

  React.useEffect(() => {
    if (!activeItem && !showMap) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close any overlays the tour might have opened so the page is
        // left clean when the user dismisses the walkthrough.
        useChatStore.getState().closeChat();
        setActiveId(null);
        setShowMap(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeItem, showMap]);

  const openItem = React.useCallback(
    async (item: MuseumTourItem) => {
      setShowMap(false);
      setActiveId(item.id);
      const routeCtx: MuseumTourRouteContext = {
        firstRegulationId: regulationsData?.regulations?.[0]?.id,
        firstCaseId,
      };
      const fullRoute = item.resolveRoute
        ? item.resolveRoute(routeCtx)
        : item.route;
      const targetPath = fullRoute.split("?")[0];
      if (pathname !== targetPath) {
        router.push(fullRoute);
      } else if (fullRoute.includes("?")) {
        router.replace(fullRoute, { scroll: false });
      }
      // Defer the side effect one tick so the route change has a chance
      // to start before we touch the DOM. The chat panel is in the
      // dashboard layout, so it's already mounted when the user is on a
      // dashboard page; this just covers the navigate-then-activate case.
      if (item.onActivate) {
        window.setTimeout(() => {
          void item.onActivate?.();
        }, 0);
      }
    },
    [pathname, router, regulationsData, firstCaseId]
  );

  // Keep the ref pointing at the latest openItem so the autostart effect
  // (which has stable empty deps) can call the current one.
  React.useEffect(() => {
    openItemRef.current = openItem;
  }, [openItem]);

  // Autostart runs exactly once per session. It must NOT re-run when the
  // user navigates between tour steps — that previously dragged the visitor
  // back to step 0 every time `openItem` was recreated by a route change.
  const autostartFiredRef = React.useRef(false);
  React.useEffect(() => {
    if (!mounted) return;
    if (autostartFiredRef.current) return;
    if (!isMuseum || completed) return;
    if (guidedItemsRef.current.length === 0) return;
    autostartFiredRef.current = true;
    const first = guidedItemsRef.current[0];
    const timer = window.setTimeout(() => {
      void openItemRef.current(first);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [mounted, isMuseum, completed]);

  const finishTour = () => {
    // Close any overlays the tour might have opened (e.g. the chat
    // panel) so the page is left in a clean state when the tour ends.
    useChatStore.getState().closeChat();
    markCompleted();
    setCompleted(true);
    setActiveId(null);
  };

  const next = () => {
    if (activeIndex < 0) {
      // Active item is not part of the guided tour (opened from the feature
      // map). Treat "Next" as a no-op so we don't silently finish the tour
      // when the user is exploring a non-guided feature.
      return;
    }
    if (activeIndex >= guidedItems.length - 1) {
      finishTour();
      return;
    }
    void openItem(guidedItems[activeIndex + 1]);
  };

  const previous = () => {
    if (activeIndex <= 0) return;
    void openItem(guidedItems[activeIndex - 1]);
  };

  if (!isMuseum) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      <button
        type="button"
        onClick={() => setShowMap(true)}
        data-testid="museum-tour-launcher"
        className={cn(
          "fixed z-50 bottom-24 md:bottom-28 rounded-full bg-[#0F2942] px-4 py-3 text-white shadow-2xl",
          "flex items-center gap-2 border border-white/10 hover:bg-[#1E3A56] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]",
          isRTL ? "left-4 md:left-8" : "right-4 md:right-8"
        )}
      >
        <Compass className="h-4 w-4 text-[#D97706]" />
        <span className="text-sm font-bold">{t("museumTour.launcher")}</span>
      </button>

      {activeItem && (
        <TourOverlay
          item={activeItem}
          rect={rect}
          anchorMissing={anchorMissing}
          activeIndex={Math.max(activeIndex, 0)}
          total={guidedItems.length}
          onClose={finishTour}
          onBack={previous}
          onNext={next}
        />
      )}

      {showMap && (
        <FeatureMap
          items={items}
          onClose={() => setShowMap(false)}
          onSelect={(item) => void openItem(item)}
        />
      )}
    </>
  );
}

function TourOverlay({
  item,
  rect,
  anchorMissing,
  activeIndex,
  total,
  onClose,
  onBack,
  onNext,
}: {
  item: MuseumTourItem;
  rect: Rect | null;
  anchorMissing: boolean;
  activeIndex: number;
  total: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { isRTL } = useI18n();

  const placement = React.useMemo(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const panelSize = {
      width: PANEL_ESTIMATED_WIDTH,
      height: PANEL_ESTIMATED_HEIGHT,
    };
    if (!rect) {
      // No anchor rect — use the centered-bottom fallback so the dialog
      // is still on-screen and the anchorFallback warning can render.
      return centeredBottom(viewport, panelSize);
    }
    return pickPlacement({ rect, viewport, panelSize, isRTL });
  }, [rect, isRTL]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Soft dim layer. Pointer events disabled so the page is still visible
          and clickable in the highlighted region. */}
      <div
        className="pointer-events-none absolute inset-0 bg-slate-950/30 transition-opacity"
        aria-hidden="true"
      />

      {/* Highlight ring + soft halo around the anchor. */}
      {rect && (
        <div
          className={cn(
            "pointer-events-none absolute rounded-xl transition-all",
            "ring-4 ring-[#D97706]/70",
            "shadow-[0_0_60px_8px_rgba(217,119,6,0.20)]"
          )}
          style={{
            top: Math.max(8, rect.top - 8),
            left: Math.max(8, rect.left - 8),
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}

      {placement && (
        <TourPanel
          item={item}
          activeIndex={activeIndex}
          total={total}
          anchorMissing={anchorMissing}
          placement={placement.placement}
          top={placement.top}
          left={placement.left}
          onClose={onClose}
          onBack={onBack}
          onNext={onNext}
        />
      )}
    </div>
  );
}

interface TourPanelProps {
  item: MuseumTourItem;
  activeIndex: number;
  total: number;
  anchorMissing: boolean;
  placement: TourPlacement;
  top: number;
  left: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

function TourPanel(props: TourPanelProps) {
  const { placement, top, left, item } = props;
  const { t } = useI18n();
  return (
    <div
      data-testid="museum-tour-dialog"
      data-placement={placement}
      role="dialog"
      aria-modal="false"
      aria-label={t(item.titleKey)}
      className={cn(
        "pointer-events-auto fixed z-[80]",
        "max-w-[360px] w-[calc(100vw-2rem)]",
        "motion-safe:transition-[top,left,opacity] motion-safe:duration-500 motion-safe:ease-out",
        "motion-reduce:transition-none",
        "animate-in fade-in zoom-in-95 duration-200"
      )}
      style={{ top, left }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "border border-slate-200/80 bg-white",
          "shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35),0_0_0_1px_rgba(15,23,42,0.04)]"
        )}
      >
        <TourPanelBody
          item={props.item}
          activeIndex={props.activeIndex}
          total={props.total}
          anchorMissing={props.anchorMissing}
          onClose={props.onClose}
          onBack={props.onBack}
          onNext={props.onNext}
        />
        {placement !== "fallback" && <TourPointer placement={placement} />}
      </div>
    </div>
  );
}

function TourPanelBody({
  item,
  activeIndex,
  total,
  anchorMissing,
  onClose,
  onBack,
  onNext,
}: {
  item: MuseumTourItem;
  activeIndex: number;
  total: number;
  anchorMissing: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t, isRTL } = useI18n();
  const Icon = item.icon;
  const isLast = activeIndex >= total - 1;
  const progressPct = total > 0 ? ((activeIndex + 1) / total) * 100 : 0;

  return (
    <>
      {/* Category-colored accent stripe. Tucked into the rounded corners
          via the parent overflow-hidden. */}
      <div
        className={cn("h-1 w-full", categoryAccent[item.category])}
        aria-hidden="true"
      />

      {/* Thin progress bar (active step / total). */}
      <div className="relative h-1 w-full bg-slate-100" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 bg-[#0F2942] transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                categoryAccentSoft[item.category]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  categoryStyles[item.category]
                )}
              >
                {t(`museumTour.categories.${item.category}`)}
              </span>
              <h2 className="mt-1.5 text-base font-bold text-[#0F2942] leading-snug">
                {t(item.titleKey)}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="museum-tour-close"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-[15px] leading-6 text-slate-600">
          {t(item.bodyKey)}
        </p>

        {anchorMissing && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {t("museumTour.anchorFallback")}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-[#0F2942] hover:underline"
          >
            {t("museumTour.skip")}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-wide text-slate-400">
              {t("museumTour.keyboardHint")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={activeIndex === 0}
            >
              {isRTL ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {t("museumTour.back")}
            </Button>
            <Button type="button" size="sm" onClick={onNext}>
              {isLast ? (
                <Check className="h-4 w-4" />
              ) : isRTL ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {isLast ? t("museumTour.done") : t("museumTour.next")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Decorative tail that points from the panel toward the highlighted anchor.
 * Implemented as a small square rotated 45° on the appropriate edge of the
 * panel. The position is driven by the `data-placement` attribute on the
 * parent, set in `TourPanel`. `aria-hidden` because the relationship is
 * already conveyed by the highlight ring + the body text.
 */
function TourPointer({
  placement,
}: {
  placement: Exclude<TourPlacement, "fallback">;
}) {
  // The square is positioned half inside the panel and half outside, so
  // the half that pokes out forms the visible diamond tip. Drawing a 1px
  // border on all four sides is the simplest way to outline the visible
  // portion: the two edges that sit inside the panel are covered by it
  // and never render against the page.
  const edgeStyles: Record<
    Exclude<TourPlacement, "fallback">,
    string
  > = {
    top: "left-1/2 -translate-x-1/2 -top-1.5",
    bottom: "left-1/2 -translate-x-1/2 -bottom-1.5",
    left: "top-1/2 -translate-y-1/2 -left-1.5",
    right: "top-1/2 -translate-y-1/2 -right-1.5",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute h-3 w-3 rotate-45 bg-white border border-slate-200/80",
        edgeStyles[placement]
      )}
    />
  );
}

function FeatureMap({
  items,
  onClose,
  onSelect,
}: {
  items: MuseumTourItem[];
  onClose: () => void;
  onSelect: (item: MuseumTourItem) => void;
}) {
  const { t, isRTL } = useI18n();
  const grouped = React.useMemo(
    () =>
      items.reduce<Record<MuseumTourCategory, MuseumTourItem[]>>(
        (acc, item) => {
          acc[item.category].push(item);
          return acc;
        },
        { core: [], ai: [], admin: [], workflow: [] }
      ),
    [items]
  );

  return (
    <div className="fixed inset-0 z-[80]" dir={isRTL ? "rtl" : "ltr"}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("common.close")}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("museumTour.mapTitle")}
        className="absolute left-1/2 top-1/2 max-h-[88vh] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F2942] text-white">
              <Grid2X2 className="h-5 w-5 text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2942]">{t("museumTour.mapTitle")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("museumTour.mapSubtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[calc(88vh-6rem)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {(Object.keys(grouped) as MuseumTourCategory[]).map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t(`museumTour.categories.${category}`)}
                </h3>
                <div className="space-y-2">
                  {grouped[category].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-start transition hover:border-[#D97706]/50 hover:bg-amber-50/30"
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F2942]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0F2942]">{t(item.titleKey)}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {t(item.bodyKey)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Eye className="h-4 w-4 shrink-0" />
            <span>{t("museumTour.readOnlyNote")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
