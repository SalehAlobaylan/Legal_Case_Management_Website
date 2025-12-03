"use client";

/*
 * File: src/app/(dashboard)/cases/page.tsx
 * Purpose: Cases list page (Phase 5.1) showing filters and a responsive grid of CaseCard.
 * Data loading is handled by TanStack Query via useCases(), so no manual useEffect is needed.
 */

import * as React from "react";
import Link from "next/link";
import { useCases } from "@/lib/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { CaseCard } from "@/components/features/cases/case-card";
import {
  CaseFilters,
  type CaseFilterValues,
} from "@/components/features/cases/case-filters";
import { Plus, Loader2 } from "lucide-react";

export default function CasesPage() {
  const { data: cases, isLoading, error } = useCases();
  const [filters, setFilters] = React.useState<CaseFilterValues>({});

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-500">Error loading cases.</p>
      </div>
    );
  }

  const filteredCases =
    cases?.filter((case_) => {
      if (filters.status && case_.status !== filters.status) return false;
      if (filters.caseType && case_.case_type !== filters.caseType) return false;
      if (
        filters.assignedLawyerId &&
        case_.assigned_lawyer_id !== filters.assignedLawyerId
      ) {
        return false;
      }
      return true;
    }) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Cases
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your organization&apos;s legal cases.
          </p>
        </div>
        <Link href="/cases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <CaseFilters onFilterChange={setFilters} />

      {/* Cases Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCases.map((case_) => (
          <CaseCard key={case_.id} case_={case_} />
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No cases found for the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}


