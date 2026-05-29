import React from "react";
import { render, screen } from "@testing-library/react";
import { AIIntelligencePanel } from "../ai-intelligence-panel";
import { useAdminAIIntelligence } from "@/lib/hooks/use-admin-ai-intelligence";
import type { AdminAIIntelligenceSummary } from "@/lib/api/admin";

jest.mock("@/lib/hooks/use-admin-ai-intelligence", () => ({
  useAdminAIIntelligence: jest.fn(),
  useRefreshAdminAIIntelligence: () => ({ mutate: jest.fn(), isPending: false }),
  useRefreshAdminAICaseProfile: () => ({ mutate: jest.fn(), isPending: false }),
  useRunAdminAIEvaluation: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/lib/hooks/use-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: "en", isRTL: false }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// lucide-react ships ESM that jest does not transform; stub every icon.
jest.mock("lucide-react", () => new Proxy({}, { get: () => () => null }));

const mockedUse = useAdminAIIntelligence as unknown as jest.Mock;

const baseSummary: AdminAIIntelligenceSummary = {
  generatedAt: "2026-05-29T10:00:00.000Z",
  needsRefresh: false,
  aiHealth: { ready: true, warmingUp: false, fallbackActive: false, message: null },
  summary: { headline: "12 active cases, 2 critical.", bullets: ["2 critical cases"] },
  aggregateRisk: { critical: 2, high: 3, medium: 4, low: 3, total: 12, averageScore: 41.5 },
  workload: { overloadedLawyers: 1, unassignedCases: 4, documentRiskCases: 2, regulationImpactCases: 1 },
  riskCases: [
    {
      caseId: 9,
      caseNumber: "C-9",
      title: "Big case",
      caseType: "labor",
      status: "open",
      score: 88,
      urgency: "critical",
      confidence: "high",
      signals: ["overdue_hearing", "unassigned"],
      evidence: [
        { signal: "overdue_hearing", label: "Overdue hearing", severity: "critical", contribution: 35, detail: null },
      ],
      recommendedActions: [],
      rationale: "Needs attention now.",
      method: "heuristic_risk_v1",
      generatedAt: "2026-05-29T10:00:00.000Z",
      assignedLawyer: null,
    },
  ],
  reviewQueue: [{ caseId: 9, caseNumber: "C-9", title: "Big case", unverifiedLinks: 5, score: 88, urgency: "critical" }],
  documentIntelligence: [{ caseId: 7, caseNumber: "C-7", title: "Doc case", detail: "Failed extraction" }],
  regulationImpact: [],
  quality: {
    hasRun: true,
    latest: { recallAt5: 0.8, precisionAt5: 0.6, ndcgAt5: 0.7 },
    previous: { recallAt5: 0.7 },
    trend: { recallAt5: 0.1, precisionAt5: null, ndcgAt5: null },
    generatedAt: "2026-05-29T09:00:00.000Z",
  },
  method: "heuristic_org_summary_v1",
  confidence: "medium",
  warnings: [],
};

describe("AIIntelligencePanel", () => {
  it("renders the executive summary, a risk-ranked case, and the quality metrics", () => {
    mockedUse.mockReturnValue({ data: baseSummary, isLoading: false, error: null });

    render(<AIIntelligencePanel />);

    expect(screen.getByText("12 active cases, 2 critical.")).toBeInTheDocument();
    // Risk row + review queue both reference the case.
    expect(screen.getAllByText(/C-9 — Big case/).length).toBeGreaterThan(0);
    expect(screen.getByText("Needs attention now.")).toBeInTheDocument();
    expect(screen.getByText("Overdue hearing")).toBeInTheDocument();
    // recall@5 latest rendered to 2 dp.
    expect(screen.getByText("0.80")).toBeInTheDocument();
  });

  it("shows the needs-refresh empty state when there is no snapshot", () => {
    mockedUse.mockReturnValue({
      data: { ...baseSummary, needsRefresh: true },
      isLoading: false,
      error: null,
    });

    render(<AIIntelligencePanel />);
    expect(screen.getByText("admin.aiIntel.needsRefresh")).toBeInTheDocument();
  });

  it("renders a loading state while fetching", () => {
    mockedUse.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { container } = render(<AIIntelligencePanel />);
    // Loading branch renders a centered placeholder card and no summary content.
    expect(container.querySelector(".p-12")).toBeTruthy();
    expect(screen.queryByText("12 active cases, 2 critical.")).toBeNull();
  });
});
