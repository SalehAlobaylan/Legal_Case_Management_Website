import {
  pickPlacement,
  type PanelSize,
  type PlacementInput,
  type ViewportSize,
} from "@/components/common/tour-placement";

const VIEWPORT: ViewportSize = { width: 1280, height: 800 };
const PANEL: PanelSize = { width: 360, height: 320 };

function place(overrides: Partial<PlacementInput> = {}) {
  return pickPlacement({
    rect: { top: 200, left: 400, width: 300, height: 100 },
    viewport: VIEWPORT,
    panelSize: PANEL,
    ...overrides,
  });
}

describe("pickPlacement", () => {
  it("prefers below the anchor when the anchor is in the top half of the viewport", () => {
    const result = place({
      rect: { top: 50, left: 400, width: 300, height: 100 },
    });
    expect(result.placement).toBe("bottom");
  });

  it("prefers above the anchor when the anchor sits in the bottom half", () => {
    const result = place({
      rect: { top: 600, left: 400, width: 300, height: 100 },
    });
    expect(result.placement).toBe("top");
  });

  it("prefers right of the anchor when the anchor sits on the left side", () => {
    const result = place({
      rect: { top: 300, left: 50, width: 200, height: 100 },
    });
    expect(result.placement).toBe("right");
  });

  it("prefers left of the anchor when the anchor sits on the right side", () => {
    const result = place({
      rect: { top: 300, left: 1000, width: 200, height: 100 },
    });
    expect(result.placement).toBe("left");
  });

  it("skips a side that does not have enough room for the panel", () => {
    // Anchor flush with the right edge — `right` side has almost no room
    // and must not be picked even if it has the most positive available
    // space after the others.
    const result = place({
      rect: { top: 300, left: 1080, width: 180, height: 100 },
    });
    expect(result.placement).not.toBe("right");
  });

  it("falls back to a centered-bottom position when no side has enough room", () => {
    // Tiny viewport, big anchor in the middle — none of the four sides
    // can fit a 360x320 panel.
    const result = place({
      rect: { top: 100, left: 100, width: 200, height: 100 },
      viewport: { width: 480, height: 360 },
    });
    expect(result.placement).toBe("fallback");
    // The fallback must be a real, on-screen position.
    expect(result.top).toBeGreaterThanOrEqual(24);
    expect(result.left).toBeGreaterThanOrEqual(24);
    expect(result.top + PANEL.height).toBeLessThanOrEqual(360);
    expect(result.left + PANEL.width).toBeLessThanOrEqual(480);
  });

  it("never returns a position that escapes the viewport (with safety margin)", () => {
    // Anchor in the extreme top-left corner.
    const result = place({
      rect: { top: 0, left: 0, width: 100, height: 100 },
    });
    expect(result.top).toBeGreaterThanOrEqual(24);
    expect(result.left).toBeGreaterThanOrEqual(24);
    expect(result.top + PANEL.height).toBeLessThanOrEqual(800 - 24);
    expect(result.left + PANEL.width).toBeLessThanOrEqual(1280 - 24);
  });

  it("swaps left/right when running in RTL", () => {
    // Anchor on the left side of the viewport. In LTR the panel should go to
    // the right; in RTL it should go to the left (the visual "right" side).
    const ltr = place({ rect: { top: 300, left: 50, width: 200, height: 100 } });
    const rtl = place({
      rect: { top: 300, left: 50, width: 200, height: 100 },
      isRTL: true,
    });
    expect(ltr.placement).toBe("right");
    expect(rtl.placement).toBe("left");
  });
});
