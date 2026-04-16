/*
 * File: src/lib/types/case.ts
 * Purpose: Define the core TypeScript enums and interfaces for cases, regulations, and their relationships.
 * Used by: API hooks, UI components, and any code that needs strongly-typed case/regulation data.
 */

export enum CaseType {
  GENERAL = "general",
  CRIMINAL = "criminal",
  PERSONAL_STATUS = "personal_status",
  COMMERCIAL = "commercial",
  LABOR = "labor",
  ADMINISTRATIVE = "administrative",
  ENFORCEMENT = "enforcement",
}

export enum CaseStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  PENDING_HEARING = "pending_hearing",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export interface Case {
  id: number;
  organization_id: number;
  case_number: string;
  title: string;
  description?: string;
  case_type: CaseType;
  status: CaseStatus;
  client_info?: string;
  assigned_lawyer_id?: number;
  court_jurisdiction?: string;
  filing_date?: string;
  next_hearing?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  caseNumber: string;
  title: string;
  description?: string;
  caseType: CaseType;
  status?: CaseStatus;
  clientInfo?: string;
  courtJurisdiction?: string;
  filingDate?: string;
  nextHearing?: string;
}

export interface CaseRegulationLink {
  id: number;
  case_id: number;
  caseId?: number;
  regulation_id: number;
  regulationId?: number;
  similarity_score: number | string;
  similarityScore?: number | string;
  method: "ai" | "manual" | "hybrid";
  verified: boolean;
  isSubscribed?: boolean;
  is_subscribed?: boolean;
  evidenceSources?: LinkEvidence[];
  evidence_sources?: LinkEvidence[];
  matchedRegulationVersionId?: number | null;
  matched_regulation_version_id?: number | null;
  matchExplanation?: LinkMatchExplanation;
  match_explanation?: LinkMatchExplanation;
  matchedWithDocuments?: boolean;
  matched_with_documents?: boolean;
  regulation?: Regulation;
  created_at: string;
  createdAt?: string;
}

export interface LinkEvidence {
  fragment_id: string;
  source: string;
  document_id?: number | null;
  document_name?: string | null;
  score: number;
}

export interface LinkScoreBreakdown {
  semantic_max: number;
  semantic_avg_top3?: number;
  support_coverage: number;
  lexical_overlap: number;
  category_prior: number;
  evidence_quality?: number;
  fallback_penalty?: number;
  final_score: number;
}

export interface LinkLineMatch {
  case_fragment_id: string;
  case_snippet: string;
  regulation_chunk_id?: number | null;
  regulation_snippet: string;
  line_start?: number | null;
  line_end?: number | null;
  article_ref?: string | null;
  pair_score: number;
  contribution: number;
}

export interface LinkMatchExplanation {
  lineMatches?: LinkLineMatch[];
  line_matches?: LinkLineMatch[];
  scoreBreakdown?: LinkScoreBreakdown | null;
  score_breakdown?: LinkScoreBreakdown | null;
  warnings?: string[];
  diagnostics?: {
    raw_similarity_score?: number;
    scoring_profile?: {
      semantic_weight?: number;
      support_weight?: number;
      lexical_weight?: number;
      category_weight?: number;
    };
  };
}

export interface AILinkGenerationMeta {
  docsConsidered: number;
  docsQueued: number;
  docsReady: number;
  docsPending: number;
  docsFailed: number;
  docsUnsupported: number;
  candidateCount?: number;
  droppedByPrecision?: number;
  regulationsIndexed?: number;
  regulationsUnindexed?: number;
  warnings?: string[];
}

export interface Regulation {
  id: number;
  title: string;
  regulation_number?: string;
  regulationNumber?: string;
  category?: string;
  jurisdiction?: string;
  status: string;
  source_url?: string;
  sourceUrl?: string;
  created_at: string;
}
