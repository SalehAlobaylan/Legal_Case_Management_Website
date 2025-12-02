/*
 * File: src/lib/types/case.ts
 * Purpose: Define the core TypeScript enums and interfaces for cases, regulations, and their relationships.
 * Used by: API hooks, UI components, and any code that needs strongly-typed case/regulation data.
 */

export enum CaseType {
  CRIMINAL = "criminal",
  CIVIL = "civil",
  COMMERCIAL = "commercial",
  LABOR = "labor",
  FAMILY = "family",
  ADMINISTRATIVE = "administrative",
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
  regulation_id: number;
  similarity_score: number;
  method: "ai" | "manual" | "hybrid";
  verified: boolean;
  regulation?: Regulation;
  created_at: string;
}

export interface Regulation {
  id: number;
  title: string;
  regulation_number?: string;
  category?: string;
  jurisdiction?: string;
  status: string;
  created_at: string;
}
