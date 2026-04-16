import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface AIEvaluationLabel {
  id: number;
  caseId: number;
  regulationId: number;
  createdAt: string;
}

export interface AIEvaluationRun {
  id: number;
  status: "queued" | "running" | "completed" | "failed";
  summaryJson: Record<string, unknown>;
  configJson: Record<string, unknown>;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface AIEvaluationRunCaseRow {
  id: number;
  runId: number;
  caseId: number;
  totalRelevant: number;
  recallAt1: number;
  recallAt3: number;
  recallAt5: number;
  precisionAt1: number;
  precisionAt3: number;
  precisionAt5: number;
  reciprocalRank: number;
  ndcgAt5: number;
  top5ScoreStddev: number;
  diagnosticsJson: {
    rankedRegulationIds?: number[];
    rankedScores?: number[];
    relevantRegulationIds?: number[];
    pipeline?: string | null;
    pipelineWarnings?: string[];
    [key: string]: unknown;
  };
}

export const aiEvaluationApi = {
  async listLabels() {
    const { data } = await apiClient.get<{ labels: AIEvaluationLabel[] }>(
      endpoints.aiEvaluation.labels
    );
    return data.labels;
  },

  async createLabel(input: { caseId: number; regulationId: number }) {
    const { data } = await apiClient.post<{ success: boolean }>(
      endpoints.aiEvaluation.labels,
      input
    );
    return data;
  },

  async deleteLabel(id: number) {
    const { data } = await apiClient.delete<{ success: boolean }>(
      endpoints.aiEvaluation.deleteLabel(id)
    );
    return data;
  },

  async run(input?: { caseIds?: number[]; topK?: number }) {
    const { data } = await apiClient.post<{ run: AIEvaluationRun }>(
      endpoints.aiEvaluation.run,
      input || {}
    );
    return data.run;
  },

  async listRuns() {
    const { data } = await apiClient.get<{ runs: AIEvaluationRun[] }>(
      endpoints.aiEvaluation.runs
    );
    return data.runs;
  },

  async getRun(id: number) {
    const { data } = await apiClient.get<{ run: AIEvaluationRun; cases: AIEvaluationRunCaseRow[] }>(
      endpoints.aiEvaluation.runById(id)
    );
    return data;
  },

  async getCaseSummary(caseId: number) {
    const { data } = await apiClient.get<{ summary: AIEvaluationRunCaseRow | null; runId?: number }>(
      endpoints.aiEvaluation.caseSummary(caseId)
    );
    return data;
  },
};
