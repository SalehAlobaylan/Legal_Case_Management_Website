export type Rect = Pick<DOMRect, "top" | "left" | "width" | "height">;

export type TourPlacement = "top" | "bottom" | "left" | "right" | "fallback";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PlacementInput {
  rect: Rect;
  viewport: ViewportSize;
  panelSize: PanelSize;
  isRTL?: boolean;
}

export interface PlacementResult {
  placement: TourPlacement;
  top: number;
  left: number;
}

/** Gap (in px) between the anchor and the panel on the placement axis. */
const PANEL_GAP = 14;
/** Safety margin (in px) kept between the panel and the viewport edge. */
const VIEWPORT_MARGIN = 24;
/**
 * A side is only eligible if it has at least this fraction of the panel's
 * perpendicular dimension available. Sides that can't fully fit the panel
 * are skipped so the panel never lands in a position where the clamp has
 * to push it back across the screen.
 */
const MIN_FIT_RATIO = 0.6;

interface Candidate {
  placement: Exclude<TourPlacement, "fallback">;
  availableSpace: number;
  top: number;
  left: number;
}

/**
 * Pick the best side of the anchor to place the panel on, and compute the
 * panel's absolute top/left in viewport coordinates.
 *
 * The algorithm scores each of the four sides by the space available between
 * the anchor and the nearest viewport edge along the placement axis. The
 * side with the most room wins, but a side is only eligible if its
 * available space is at least MIN_FIT_RATIO of the panel's perpendicular
 * dimension — otherwise the panel would have to be clamped across the
 * screen and end up far from the anchor. Ties break toward the user's
 * natural reading order (bottom → right → top → left). In RTL the
 * left/right candidates are swapped before scoring.
 *
 * If no side has enough room (a very small viewport with a large anchor),
 * the algorithm returns `placement: "fallback"` with a centered-bottom
 * position. This is the same position the panel used to have before the
 * smart-placement work: always visible, always in the same place, no
 * awkward clamping.
 */
export function pickPlacement(input: PlacementInput): PlacementResult {
  const { rect, viewport, panelSize } = input;
  const isRTL = input.isRTL ?? false;

  const order: Array<Exclude<TourPlacement, "fallback">> = isRTL
    ? ["bottom", "left", "top", "right"]
    : ["bottom", "right", "top", "left"];

  const candidates = buildCandidates(rect, viewport, panelSize, isRTL);

  const eligible = candidates.filter((c) =>
    fitsOnPlacementAxis(c, panelSize)
  );

  // If no side has enough room for the panel to fit cleanly, fall back to
  // a centered-bottom position so the panel is always on-screen at a
  // predictable place rather than being clamped across the screen.
  if (eligible.length === 0) {
    return centeredBottom(viewport, panelSize);
  }

  const sorted = [...eligible].sort((a, b) => {
    if (b.availableSpace !== a.availableSpace) {
      return b.availableSpace - a.availableSpace;
    }
    return order.indexOf(a.placement) - order.indexOf(b.placement);
  });

  return clampToViewport(sorted[0], viewport, panelSize);
}

function buildCandidates(
  rect: Rect,
  viewport: ViewportSize,
  panel: PanelSize,
  isRTL: boolean
): Candidate[] {
  const anchorCenterX = rect.left + rect.width / 2;
  const anchorCenterY = rect.top + rect.height / 2;

  const below: Candidate = {
    placement: "bottom",
    availableSpace: viewport.height - (rect.top + rect.height) - VIEWPORT_MARGIN,
    top: rect.top + rect.height + PANEL_GAP,
    left: anchorCenterX - panel.width / 2,
  };

  const above: Candidate = {
    placement: "top",
    availableSpace: rect.top - VIEWPORT_MARGIN,
    top: rect.top - panel.height - PANEL_GAP,
    left: anchorCenterX - panel.width / 2,
  };

  const right: Candidate = {
    placement: "right",
    availableSpace: viewport.width - (rect.left + rect.width) - VIEWPORT_MARGIN,
    top: anchorCenterY - panel.height / 2,
    left: rect.left + rect.width + PANEL_GAP,
  };

  const left: Candidate = {
    placement: "left",
    availableSpace: rect.left - VIEWPORT_MARGIN,
    top: anchorCenterY - panel.height / 2,
    left: rect.left - panel.width - PANEL_GAP,
  };

  // The horizontal-axis swap in RTL: in a right-to-left reading flow the
  // visual "right" is the left side of the screen. We rename the candidates
  // accordingly so the CSS tail picks the matching side.
  return isRTL
    ? [
        { ...below },
        { ...left, placement: "right" },
        { ...above },
        { ...right, placement: "left" },
      ]
    : [below, right, above, left];
}

function fitsOnPlacementAxis(
  candidate: Candidate,
  panel: PanelSize
): boolean {
  // Each candidate measures space along the axis the panel extends across:
  // top/bottom move the panel vertically, left/right horizontally.
  const required =
    candidate.placement === "top" || candidate.placement === "bottom"
      ? panel.height
      : panel.width;
  return candidate.availableSpace >= required * MIN_FIT_RATIO;
}

function clampToViewport(
  candidate: Candidate,
  viewport: ViewportSize,
  panel: PanelSize
): PlacementResult {
  const minLeft = VIEWPORT_MARGIN;
  const maxLeft = viewport.width - panel.width - VIEWPORT_MARGIN;
  const minTop = VIEWPORT_MARGIN;
  const maxTop = viewport.height - panel.height - VIEWPORT_MARGIN;

  return {
    placement: candidate.placement,
    top: Math.max(minTop, Math.min(candidate.top, maxTop)),
    left: Math.max(minLeft, Math.min(candidate.left, maxLeft)),
  };
}

export function centeredBottom(
  viewport: ViewportSize,
  panel: PanelSize
): PlacementResult {
  return {
    placement: "fallback",
    top: Math.max(VIEWPORT_MARGIN, viewport.height - panel.height - 32),
    left: Math.max(
      VIEWPORT_MARGIN,
      (viewport.width - panel.width) / 2
    ),
  };
}
