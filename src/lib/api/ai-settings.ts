/*
 * File: src/lib/api/ai-settings.ts
 * Purpose: API module for AI pipeline settings (admin-only).
 */

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface AISettings {
  llmVerificationEnabled: boolean;
  crossEncoderEnabled: boolean;
  hydeEnabled: boolean;
  colbertEnabled: boolean;
  agenticRetrievalEnabled: boolean;
  semanticWeight: number;
  supportWeight: number;
  lexicalWeight: number;
  categoryWeight: number;
  minFinalScore: number;
  minPairScore: number;
  geminiModel: string;
  crossEncoderTopN: number;
  colbertTopN: number;
  geminiTopNCandidates: number;
  agenticMaxRounds: number;
}

export type UpdateAISettings = Partial<AISettings>;

export const aiSettingsApi = {
  async getSettings(): Promise<AISettings> {
    const { data } = await apiClient.get<AISettings>(endpoints.settings.ai);
    return data;
  },

  async updateSettings(settings: UpdateAISettings): Promise<AISettings> {
    const { data } = await apiClient.put<AISettings>(
      endpoints.settings.ai,
      settings
    );
    return data;
  },
};
