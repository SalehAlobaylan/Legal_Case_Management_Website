"use client";

/*
 * File: src/components/features/cases/case-filters.tsx
 * Purpose: Simple, client-side filters for cases list (status, type, assigned to me).
 * Optimized to:
 *  - Avoid extra network fetches (filtering happens on the already-cached list).
 *  - Avoid useEffect; we compute and emit filters directly in event handlers.
 */

import * as React from "react";
import { CaseStatus, CaseType } from "@/lib/types/case";
import { useAuthStore } from "@/lib/store/auth-store";

export type CaseFilterValues = {
  status?: CaseStatus;
  caseType?: CaseType;
  assignedLawyerId?: number;
};

interface CaseFiltersProps {
  onFilterChange: (filters: CaseFilterValues) => void;
}

export function CaseFilters({ onFilterChange }: CaseFiltersProps) {
  const [status, setStatus] = React.useState<string>("");
  const [caseType, setCaseType] = React.useState<string>("");
  const [assignedToMe, setAssignedToMe] = React.useState(false);
  const userId = useAuthStore((s) => s.user?.id);

  const emitFilters = React.useCallback(
    (nextStatus: string, nextCaseType: string, nextAssignedToMe: boolean) => {
      const filters: CaseFilterValues = {};

      if (nextStatus) {
        filters.status = nextStatus as CaseStatus;
      }
      if (nextCaseType) {
        filters.caseType = nextCaseType as CaseType;
      }
      if (nextAssignedToMe && userId) {
        filters.assignedLawyerId = userId;
      }

      onFilterChange(filters);
    },
    [onFilterChange, userId]
  );

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setStatus(value);
    emitFilters(value, caseType, assignedToMe);
  };

  const handleCaseTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setCaseType(value);
    emitFilters(status, value, assignedToMe);
  };

  const handleAssignedToMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setAssignedToMe(checked);
    emitFilters(status, caseType, checked);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 text-xs shadow-sm md:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-1">
        <label className="block text-[0.7rem] font-medium text-gray-600 dark:text-gray-300">
          Status
        </label>
        <select
          value={status}
          onChange={handleStatusChange}
          className="h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All</option>
          <option value={CaseStatus.OPEN}>Open</option>
          <option value={CaseStatus.IN_PROGRESS}>In Progress</option>
          <option value={CaseStatus.PENDING_HEARING}>Pending Hearing</option>
          <option value={CaseStatus.CLOSED}>Closed</option>
          <option value={CaseStatus.ARCHIVED}>Archived</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-[0.7rem] font-medium text-gray-600 dark:text-gray-300">
          Type
        </label>
        <select
          value={caseType}
          onChange={handleCaseTypeChange}
          className="h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All</option>
          <option value={CaseType.CRIMINAL}>Criminal</option>
          <option value={CaseType.CIVIL}>Civil</option>
          <option value={CaseType.COMMERCIAL}>Commercial</option>
          <option value={CaseType.LABOR}>Labor</option>
          <option value={CaseType.FAMILY}>Family</option>
          <option value={CaseType.ADMINISTRATIVE}>Administrative</option>
        </select>
      </div>

      <div className="space-y-1">
        <span className="block text-[0.7rem] font-medium text-gray-600 dark:text-gray-300">
          Assignment
        </span>
        <label className="inline-flex items-center gap-2 text-[0.75rem] text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
            checked={assignedToMe}
            onChange={handleAssignedToMeChange}
          />
          <span>Only my cases</span>
        </label>
      </div>
    </div>
  );
}


