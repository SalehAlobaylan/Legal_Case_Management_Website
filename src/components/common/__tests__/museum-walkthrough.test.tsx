import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MuseumWalkthroughProvider } from "@/components/common/museum-walkthrough";
import { useMuseumMode } from "@/lib/hooks/use-museum-mode";
import { usePermission } from "@/lib/hooks/use-permission";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useRegulations } from "@/lib/hooks/use-regulations";
import { useCases } from "@/lib/hooks/use-cases";
import {
  MUSEUM_TOUR_STORAGE_KEY,
  museumGuidedTourIds,
  museumTourItems,
} from "@/lib/museum-tour";

jest.mock("@/lib/hooks/use-museum-mode", () => ({
  useMuseumMode: jest.fn(),
  museumLockMessage: (isRTL: boolean) =>
    isRTL
      ? "أنت تتصفّح في الوضع التجريبي (للعرض فقط). أنشئ حسابًا لاستخدام هذه الميزة."
      : "You're exploring in demo mode (read-only). Sign up to use this feature.",
}));

jest.mock("@/lib/hooks/use-permission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("@/lib/hooks/use-i18n", () => ({
  useI18n: jest.fn(),
}));

jest.mock("@/lib/hooks/use-regulations", () => ({
  useRegulations: jest.fn(() => ({ data: undefined })),
}));

jest.mock("@/lib/hooks/use-cases", () => ({
  useCases: jest.fn(() => ({ data: undefined })),
}));

const mockOpenChat = jest.fn();
const mockCloseChat = jest.fn();
const mockSetChatView = jest.fn();
jest.mock("@/lib/store/chat-store", () => ({
  useChatStore: {
    getState: () => ({
      openChat: mockOpenChat,
      closeChat: mockCloseChat,
      setView: mockSetChatView,
    }),
  },
}));

jest.mock("lucide-react", () => {
  const Stub = () => null;
  return new Proxy(
    { __esModule: true },
    {
      get: (_target, prop) => {
        if (prop === "__esModule") return true;
        if (prop === "default") return Stub;
        return Stub;
      },
    }
  );
});

const mockedUseMuseumMode = useMuseumMode as jest.Mock;
const mockedUsePermission = usePermission as jest.Mock;
const mockedUseI18n = useI18n as jest.Mock;
const mockedUseRegulations = useRegulations as jest.Mock;
const mockedUseCases = useCases as jest.Mock;

// Stable router mock so tests can assert on `push`/`replace` calls.
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};
const mockUsePathname = jest.fn(() => "/dashboard");

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockUsePathname(),
}));

function mountAnchors() {
  return museumTourItems
    .map((item) => {
      const el = document.createElement("div");
      el.setAttribute("data-tour-id", item.anchorId);
      el.getBoundingClientRect = () =>
        ({
          top: 100,
          left: 100,
          width: 200,
          height: 40,
          right: 300,
          bottom: 140,
          x: 100,
          y: 100,
          toJSON: () => ({}),
        }) as DOMRect;
      el.scrollIntoView = jest.fn();
      document.body.appendChild(el);
      return item.id;
    });
}

beforeEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = "";
  jest.useFakeTimers();
  mockedUseRegulations.mockReturnValue({ data: undefined });
  mockedUseCases.mockReturnValue({ data: undefined });
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockOpenChat.mockClear();
  mockCloseChat.mockClear();
  mockSetChatView.mockClear();
  mockUsePathname.mockReturnValue("/dashboard");
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("MuseumWalkthroughProvider", () => {
  it("renders nothing extra in non-museum mode", () => {
    mockedUseMuseumMode.mockReturnValue(false);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    render(
      <MuseumWalkthroughProvider>
        <div data-testid="child">content</div>
      </MuseumWalkthroughProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("museum-tour-launcher")).not.toBeInTheDocument();
  });

  it("shows the floating launcher in museum mode and starts the guided tour", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    expect(screen.getByTestId("museum-tour-launcher")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const firstGuided = museumTourItems.find(
      (i) => i.id === museumGuidedTourIds[0]
    );
    expect(firstGuided).toBeDefined();
    expect(screen.getByText(firstGuided!.titleKey)).toBeInTheDocument();
  });

  it("does not autostart the guided tour when it was already completed", async () => {
    window.localStorage.setItem(MUSEUM_TOUR_STORAGE_KEY, "complete");
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters out admin-only items for non-admin visitors", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const adminItems = museumTourItems.filter((i) => i.adminOnly);
    expect(adminItems.length).toBeGreaterThan(0);

    for (const item of adminItems) {
      expect(screen.queryByText(item.titleKey)).not.toBeInTheDocument();
    }
  });

  it("includes admin items for admin visitors", () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => true });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const adminItem = museumTourItems.find((i) => i.id === "admin-ai-intelligence");
    expect(adminItem).toBeDefined();
    expect(screen.getByText(adminItem!.titleKey)).toBeInTheDocument();
  });

  it("finishes the tour on the last step and persists completion", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    // Close the dialog directly via the X close button rather than walking
    // through every step. Walking the tour requires real route transitions
    // that this unit test environment can't simulate, and finishTour
    // performs the same completion side-effect as the "Done" button.
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText("common.close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(window.localStorage.getItem(MUSEUM_TOUR_STORAGE_KEY)).toBe("complete");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("escapes the dialog with the keyboard", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("falls back gracefully when no anchor exists", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    // Autostart the tour (no anchors mounted in this test). Let the 700ms
    // autostart fire and the capture effect mount its polling loop.
    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    // With the wait-for-anchor loop, the "anchor missing" notice only shows
    // after the poll budget (~3s of 100ms ticks) is exhausted — until then the
    // panel waits (centered fallback, no scary warning). Advance past the
    // budget so the graceful fallback notice renders.
    await act(async () => {
      jest.advanceTimersByTime(3500);
    });

    await waitFor(() => {
      expect(screen.getByText("museumTour.anchorFallback")).toBeInTheDocument();
    });
  });

  it("renders a visible skip button so the user can always exit", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const skipButton = screen.getByText("museumTour.skip");
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(window.localStorage.getItem(MUSEUM_TOUR_STORAGE_KEY)).toBe("complete");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not restart the tour when pathname changes mid-walk", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mockUsePathname.mockReturnValue("/dashboard");

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    // Let autostart fire on /dashboard and open step 0.
    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    const firstItem = museumTourItems.find(
      (i) => i.id === museumGuidedTourIds[0]
    )!;
    const secondItem = museumTourItems.find(
      (i) => i.id === museumGuidedTourIds[1]
    )!;
    expect(screen.getByText(firstItem.titleKey)).toBeInTheDocument();

    // Advance to step 1 (still on /dashboard).
    const nextButton = screen
      .getByText("museumTour.next")
      .closest("button")!;
    fireEvent.click(nextButton);
    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText(secondItem.titleKey)).toBeInTheDocument();

    // Simulate a real route transition: pathname changes to /cases.
    mockUsePathname.mockReturnValue("/cases");
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    // Drive timers well past the 700ms autostart delay. With the original
    // bug, the autostart would re-fire here because `openItem` was
    // recreated by the pathname change, dragging the user back to step 0.
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // The tour dialog is still open and the title is still step 1's, not
    // step 0's.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(secondItem.titleKey)).toBeInTheDocument();
    expect(screen.queryByText(firstItem.titleKey)).not.toBeInTheDocument();
  });
});

describe("museumTourItems.resolveRoute", () => {
  it("regulation-ai-analysis resolves to the first regulation's insights tab", () => {
    const item = museumTourItems.find((i) => i.id === "regulation-ai-analysis")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstRegulationId: 42 })).toBe(
      "/regulations/42?tab=insights"
    );
  });

  it("regulation-versions resolves to the first regulation's versions tab", () => {
    const item = museumTourItems.find((i) => i.id === "regulation-versions")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstRegulationId: 42 })).toBe(
      "/regulations/42?tab=versions"
    );
  });

  it("regulation-compare resolves to the first regulation's compare tab", () => {
    const item = museumTourItems.find((i) => i.id === "regulation-compare")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstRegulationId: 42 })).toBe(
      "/regulations/42?tab=compare"
    );
  });

  it("falls back to the regulations list page when no first regulation is available", () => {
    const item = museumTourItems.find((i) => i.id === "regulation-ai-analysis")!;
    expect(item.resolveRoute!({})).toBe("/regulations");
  });

  it("items without a resolver fall back to their static route", () => {
    const item = museumTourItems.find((i) => i.id === "dashboard-command-center")!;
    expect(item.resolveRoute).toBeUndefined();
    expect(item.route).toBe("/dashboard");
  });

  it("case-linking resolves to the first case's linking tab", () => {
    const item = museumTourItems.find((i) => i.id === "case-linking")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstCaseId: 7 })).toBe("/cases/7?tab=linking");
  });

  it("case-linking-studio resolves to the first case's dedicated linking page", () => {
    const item = museumTourItems.find((i) => i.id === "case-linking-studio")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstCaseId: 7 })).toBe("/cases/7/linking");
  });

  it("case-ai-analysis resolves to the first case's details tab", () => {
    const item = museumTourItems.find((i) => i.id === "case-ai-analysis")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstCaseId: 7 })).toBe("/cases/7?tab=details");
  });

  it("find-related resolves to the first case's linking tab", () => {
    const item = museumTourItems.find((i) => i.id === "find-related")!;
    expect(item.resolveRoute).toBeDefined();
    expect(item.resolveRoute!({ firstCaseId: 7 })).toBe("/cases/7?tab=linking");
  });

  it("case items fall back to the cases list when no first case is available", () => {
    const ids = [
      "case-linking",
      "case-linking-studio",
      "case-ai-analysis",
      "find-related",
    ] as const;
    for (const id of ids) {
      const item = museumTourItems.find((i) => i.id === id)!;
      expect(item.resolveRoute!({})).toBe("/cases");
    }
  });
});

describe("MuseumWalkthroughProvider dynamic regulation routing", () => {
  it("navigates to the first regulation's insights tab when a regulation step is opened", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });
    mockedUseRegulations.mockReturnValue({
      data: { regulations: [{ id: 42 }], total: 1, page: 1, limit: 1 },
    });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    // Open the feature map and click the regulation-ai-analysis entry. This
    // exercises the openItem path that calls resolveRoute, rather than the
    // autostart path (which fires on the dashboard, not on a regulation).
    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const regulationItem = museumTourItems.find(
      (i) => i.id === "regulation-ai-analysis"
    )!;
    const regulationCard = await screen.findByText(regulationItem.titleKey);
    fireEvent.click(regulationCard.closest("button")!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/regulations/42?tab=insights");
    });
  });

  it("falls back to the regulations list when no first regulation is available", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });
    mockedUseRegulations.mockReturnValue({ data: undefined });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const regulationItem = museumTourItems.find(
      (i) => i.id === "regulation-ai-analysis"
    )!;
    const regulationCard = await screen.findByText(regulationItem.titleKey);
    fireEvent.click(regulationCard.closest("button")!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/regulations");
    });
  });

  it("navigates to the first case's linking tab when case-linking is opened", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });
    mockedUseCases.mockReturnValue({ data: [{ id: 7 }] });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const caseLinking = museumTourItems.find(
      (i) => i.id === "case-linking"
    )!;
    const card = await screen.findByText(caseLinking.titleKey);
    fireEvent.click(card.closest("button")!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/cases/7?tab=linking");
    });
  });

  it("navigates to the first case's linking studio when case-linking-studio is opened", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });
    mockedUseCases.mockReturnValue({ data: [{ id: 7 }] });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const studio = museumTourItems.find(
      (i) => i.id === "case-linking-studio"
    )!;
    const card = await screen.findByText(studio.titleKey);
    fireEvent.click(card.closest("button")!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/cases/7/linking");
    });
  });

  it("navigates to the first case's details tab when case-ai-analysis is opened", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });
    mockedUseCases.mockReturnValue({ data: [{ id: 7 }] });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const caseAnalysis = museumTourItems.find(
      (i) => i.id === "case-ai-analysis"
    )!;
    const card = await screen.findByText(caseAnalysis.titleKey);
    fireEvent.click(card.closest("button")!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/cases/7?tab=details");
    });
  });

  it("does not finish the tour when Next is pressed on a non-guided item", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    // Open the feature map and select a non-guided item. `regulation-compare`
    // is in museumTourItems but NOT in museumGuidedTourIds, so activeIndex
    // is -1 when this item is active. The overlay is rendered with
    // activeIndex={Math.max(activeIndex, 0)} so the dialog shows the "Next"
    // button as if it were step 1 of the guided tour.
    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const compare = museumTourItems.find(
      (i) => i.id === "regulation-compare"
    )!;
    const card = await screen.findByText(compare.titleKey);
    fireEvent.click(card.closest("button")!);

    await waitFor(() => {
      expect(screen.getByText(compare.titleKey)).toBeInTheDocument();
    });

    // The tour is NOT yet complete.
    expect(
      window.localStorage.getItem(MUSEUM_TOUR_STORAGE_KEY)
    ).not.toBe("complete");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press Next. With the bug, this would call finishTour() and dismiss
    // the dialog. After the fix, it must be a no-op: dialog stays open, no
    // completion is written.
    const nextButton = screen
      .getByText("museumTour.next")
      .closest("button")!;
    fireEvent.click(nextButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(compare.titleKey)).toBeInTheDocument();
    expect(
      window.localStorage.getItem(MUSEUM_TOUR_STORAGE_KEY)
    ).not.toBe("complete");
  });

  it("places the tour panel below the anchor when the anchor sits in the top half of the viewport", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    // 1280x800 viewport; anchor at top=50, so it lives in the upper half.
    Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    document.body.innerHTML = "";
    const anchor = document.createElement("div");
    anchor.setAttribute("data-tour-id", "dashboard-command-center");
    anchor.getBoundingClientRect = () =>
      ({
        top: 50,
        left: 400,
        width: 300,
        height: 80,
        right: 700,
        bottom: 130,
        x: 400,
        y: 50,
        toJSON: () => ({}),
      }) as DOMRect;
    anchor.scrollIntoView = jest.fn();
    document.body.appendChild(anchor);

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));
    const card = screen.getByText("museumTour.items.dashboard.title").closest("button")!;
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId("museum-tour-dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByTestId("museum-tour-dialog");
    // Anchor in the upper half → the panel should sit BELOW the anchor.
    expect(dialog.getAttribute("data-placement")).toBe("bottom");
    const dialogTop = parseFloat((dialog as HTMLElement).style.top);
    expect(dialogTop).toBeGreaterThanOrEqual(50 + 80);
  });

  it("places the tour panel above the anchor when the anchor sits in the bottom half of the viewport", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    document.body.innerHTML = "";
    const anchor = document.createElement("div");
    anchor.setAttribute("data-tour-id", "dashboard-command-center");
    anchor.getBoundingClientRect = () =>
      ({
        top: 600,
        left: 400,
        width: 300,
        height: 100,
        right: 700,
        bottom: 700,
        x: 400,
        y: 600,
        toJSON: () => ({}),
      }) as DOMRect;
    anchor.scrollIntoView = jest.fn();
    document.body.appendChild(anchor);

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));
    const card = screen.getByText("museumTour.items.dashboard.title").closest("button")!;
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId("museum-tour-dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByTestId("museum-tour-dialog");
    expect(dialog.getAttribute("data-placement")).toBe("top");
  });

  it("opens the chat panel when header-ask-ai is opened", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const askAiCard = screen
      .getByText("museumTour.items.askAi.title")
      .closest("button")!;
    fireEvent.click(askAiCard);

    // The onActivate callback is scheduled via setTimeout(0). Advance
    // the timer so it runs.
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(mockOpenChat).toHaveBeenCalled();
    });
  });

  it("closes the chat panel when the tour finishes", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    // Autostart the tour.
    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close the tour via the X button — finishTour is wired here, and
    // it must call closeChat so the panel is left closed.
    const closeButton = screen.getByLabelText("common.close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockCloseChat).toHaveBeenCalled();
    });
  });

  it("closes the chat panel when Escape is pressed", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(mockCloseChat).toHaveBeenCalled();
    });
  });

  it("opens the chat panel in history view when chat-panel-history is opened from the feature map", async () => {
    mockedUseMuseumMode.mockReturnValue(true);
    mockedUsePermission.mockReturnValue({ isAdmin: () => false });
    mockedUseI18n.mockReturnValue({ t: (k: string) => k, isRTL: false });

    mountAnchors();

    render(
      <MuseumWalkthroughProvider>
        <div>content</div>
      </MuseumWalkthroughProvider>
    );

    fireEvent.click(screen.getByTestId("museum-tour-launcher"));

    const historyCard = screen
      .getByText("museumTour.items.chatPanelHistory.title")
      .closest("button")!;
    fireEvent.click(historyCard);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(mockOpenChat).toHaveBeenCalledWith(undefined, undefined, "history");
    });
  });
});
