/*
 * File: src/lib/api/case-sources.ts
 * Purpose: API client for the multi-source case linking endpoints — regulations,
 *          judicial decisions, government data, and Tavily-discovered web sources.
 * Used by: src/lib/hooks/use-case-sources.ts and the multi-source linked-sources UI.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// ---------------------------------------------------------------------------
// Types — mirror the backend's case-source schema
// ---------------------------------------------------------------------------

export type SourceType =
  | "regulation"
  | "judicial_decision"
  | "gov_data"
  | "web_source";

export type TrustTier = "official" | "trusted" | "discovered" | "unverified";

export interface CaseSourceItem {
  linkId: number;
  legalSourceId: number;
  sourceType: SourceType;
  trustTier: TrustTier;
  sourceAuthority: string;
  isCitableInCourt: boolean;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  relevanceScore: string | null;
  trustWeightedScore: string | null;
  method: string;
  verified: boolean;
  dismissed: boolean;
  curatorVerified: boolean;
  publishedDate: string | null;
}

export interface CaseSourceGroup {
  sourceType: SourceType;
  count: number;
  anyCitable: boolean;
  items: CaseSourceItem[];
}

export interface CaseSourcesResponse {
  caseId: number;
  groups: CaseSourceGroup[];
}

export interface FindRelatedRequest {
  includeWebResearch?: boolean;
  topKPerGroup?: number;
  minRelevance?: number;
}

export interface FindRelatedMatch {
  legal_source_id: number;
  source_type: SourceType;
  trust_tier: TrustTier;
  source_authority: string;
  title: string;
  source_url: string | null;
  is_citable_in_court: boolean;
  relevance_score: number;
  trust_weighted_score: number;
  best_chunk: {
    chunk_index: number;
    section_ref: string | null;
    excerpt: string;
    relevance: number;
  } | null;
}

export interface FindRelatedGroup {
  source_type: SourceType;
  count: number;
  any_citable: boolean;
  matches: FindRelatedMatch[];
}

export interface FindRelatedResponse {
  caseId: number;
  tavily: { ran: boolean; cached?: boolean; quotaRemaining?: number | null };
  totalSourcesEvaluated: number;
  groups: FindRelatedGroup[];
  warning?: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export interface WebResearchResult {
  legalSourceId: number;
  title: string;
  url: string;
  snippet: string;
  tavilyScore: number;
  trustTier: TrustTier;
  isCitableInCourt: boolean;
  publishedDate: string | null;
}

export interface WebResearchResponse {
  query: string;
  cached: boolean;
  quotaRemaining: number | null;
  results: WebResearchResult[];
}

export async function getCaseSources(caseId: number): Promise<CaseSourcesResponse> {
  const res = await apiClient.get<CaseSourcesResponse>(
    endpoints.caseSources.list(caseId)
  );
  return res.data;
}

export async function findRelatedCaseSources(
  caseId: number,
  body?: FindRelatedRequest
): Promise<FindRelatedResponse> {
  const res = await apiClient.post<FindRelatedResponse>(
    endpoints.caseSources.findRelated(caseId),
    body ?? {}
  );
  return res.data;
}

export async function runWebResearch(
  caseId: number,
  body?: { query?: string; maxResults?: number; searchDepth?: "basic" | "advanced" }
): Promise<WebResearchResponse> {
  const res = await apiClient.post<WebResearchResponse>(
    endpoints.caseSources.webResearch(caseId),
    body ?? {}
  );
  return res.data;
}

export async function verifyCaseSourceLink(
  linkId: number
): Promise<{ ok: true; linkId: number }> {
  const res = await apiClient.post<{ ok: true; linkId: number }>(
    endpoints.caseSources.verifyLink(linkId),
    {}
  );
  return res.data;
}

export async function dismissCaseSourceLink(
  linkId: number,
  reason?: string
): Promise<{ ok: true; linkId: number }> {
  const res = await apiClient.post<{ ok: true; linkId: number }>(
    endpoints.caseSources.dismissLink(linkId),
    { reason }
  );
  return res.data;
}
