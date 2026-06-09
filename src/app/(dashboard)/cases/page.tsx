"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  AlertCircle,
  Briefcase,
  Clock,
  FileText,
  Plus,
  Scale,
  Users,
} from "lucide-react";
import {
  useBulkAssignCases,
  useBulkDeleteCases,
  useBulkUpdateCaseStatus,
  useCases,
  useDeleteCase,
  usePatchCase,
} from "@/lib/hooks/use-cases";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { usePermission } from "@/lib/hooks/use-permission";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MuseumGuard } from "@/components/common/museum-guard";
import {
  CasesToolbar,
  type CasesSortDir,
  type CasesSortKey,
  type CasesViewMode,
} from "@/components/features/cases/cases-toolbar";
import { CaseWorkspaceCard } from "@/components/features/cases/case-workspace-card";
import { CasesDataTable } from "@/components/features/cases/cases-data-table";
import { BulkCaseActionsBar } from "@/components/features/cases/bulk-case-actions-bar";
import type { Case } from "@/lib/types/case";
import { CaseStatus } from "@/lib/types/case";

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: unknown; message?: unknown } } }).response?.data?.error === "string"
  ) {
    return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

function CasesPageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-44 rounded-2xl" />
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#0F2942]">{value}</p>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CasesPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { toast } = useToast();
  const { can } = usePermission();
  const { data: cases, isLoading, error, refetch } = useCases();
  const { data: teamData } = useTeamMembers();
  const patchCase = usePatchCase();
  const deleteCase = useDeleteCase();
  const bulkAssignCases = useBulkAssignCases();
  const bulkUpdateStatus = useBulkUpdateCaseStatus();
  const bulkDeleteCases = useBulkDeleteCases();

  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<CasesViewMode>("cards");
  const [sortKey, setSortKey] = React.useState<CasesSortKey>("updated");
  const [sortDir, setSortDir] = React.useState<CasesSortDir>("desc");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [activeCaseId, setActiveCaseId] = React.useState<number | null>(null);
  const [pendingDeleteCase, setPendingDeleteCase] = React.useState<Case | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = React.useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] = React.useState<CaseStatus | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const allCases = React.useMemo(() => cases ?? [], [cases]);
  const teamMembers = teamData?.members ?? [];
  const canAssign = can("delegated.cases.assign");

  const formatStatus = React.useCallback(
    (status: string) => {
      const map: Record<string, string> = {
        open: t("cases.statuses.open"),
        in_progress: t("cases.statuses.in_progress"),
        pending_hearing: t("cases.statuses.pending_hearing"),
        closed: t("cases.statuses.closed"),
        archived: t("cases.statuses.archived"),
      };
      return map[status] || status;
    },
    [t]
  );

  const formatCaseType = React.useCallback(
    (caseType: string) => {
      const map: Record<string, string> = {
        general: t("cases.types.general"),
        criminal: t("cases.types.criminal"),
        personal_status: t("cases.types.personal_status"),
        commercial: t("cases.types.commercial"),
        labor: t("cases.types.labor"),
        administrative: t("cases.types.administrative"),
        enforcement: t("cases.types.enforcement"),
      };
      return map[caseType] || caseType?.replace(/_/g, " ") || t("cases.types.general");
    },
    [t]
  );

  const counts = React.useMemo(() => {
    return {
      all: allCases.length,
      open: allCases.filter((case_) => case_.status === CaseStatus.OPEN).length,
      in_progress: allCases.filter((case_) => case_.status === CaseStatus.IN_PROGRESS).length,
      pending_hearing: allCases.filter((case_) => case_.status === CaseStatus.PENDING_HEARING).length,
      closed: allCases.filter((case_) => case_.status === CaseStatus.CLOSED).length,
      archived: allCases.filter((case_) => case_.status === CaseStatus.ARCHIVED).length,
    };
  }, [allCases]);

  const filteredCases = React.useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    const result = allCases.filter((case_) => {
      if (statusFilter !== "all" && case_.status !== statusFilter) return false;
      if (typeFilter !== "all" && case_.case_type !== typeFilter) return false;
      if (!search) return true;

      return [
        case_.title,
        case_.case_number,
        case_.description,
        case_.client_info,
        case_.court_jurisdiction,
        case_.assignedLawyer?.fullName,
      ].some((value) => value?.toLowerCase().includes(search));
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "updated") {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortKey === "created") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortKey === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortKey === "status") {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDir === "desc" ? -comparison : comparison;
    });

    return result;
  }, [allCases, debouncedSearch, sortDir, sortKey, statusFilter, typeFilter]);

  const selectedIds = React.useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => Number(id))
        .filter(Number.isFinite),
    [rowSelection]
  );

  const clearSelection = React.useCallback(() => setRowSelection({}), []);

  const toggleCaseSelected = React.useCallback((caseId: number, checked: boolean) => {
    setRowSelection((current) => {
      const next = { ...current };
      if (checked) {
        next[String(caseId)] = true;
      } else {
        delete next[String(caseId)];
      }
      return next;
    });
  }, []);

  const handleStatusChange = React.useCallback(
    (caseId: number, status: string) => {
      setActiveCaseId(caseId);
      patchCase.mutate(
        { id: caseId, updates: { status: status as CaseStatus } },
        {
          onError: (mutationError) => {
            toast({
              title: t("common.error"),
              description: getErrorMessage(mutationError, t("cases.statusUpdateFailed")),
              variant: "destructive",
            });
          },
          onSettled: () => setActiveCaseId(null),
        }
      );
    },
    [patchCase, t, toast]
  );

  const handleConfirmDelete = React.useCallback(() => {
    if (!pendingDeleteCase) return;

    setActiveCaseId(pendingDeleteCase.id);
    deleteCase.mutate(pendingDeleteCase.id, {
      onError: (mutationError) => {
        toast({
          title: t("common.error"),
          description: getErrorMessage(mutationError, t("cases.deleteFailed")),
          variant: "destructive",
        });
      },
      onSettled: () => {
        setActiveCaseId(null);
        setPendingDeleteCase(null);
      },
    });
  }, [deleteCase, pendingDeleteCase, t, toast]);

  const handleBulkAssign = React.useCallback(
    (assignedLawyerId: string | null) => {
      if (!selectedIds.length) return;
      bulkAssignCases.mutate(
        { caseIds: selectedIds, assignedLawyerId },
        {
          onSuccess: clearSelection,
          onError: (mutationError) => {
            toast({
              title: t("common.error"),
              description: getErrorMessage(mutationError, t("cases.bulkAssignFailed")),
              variant: "destructive",
            });
          },
        }
      );
    },
    [bulkAssignCases, clearSelection, selectedIds, t, toast]
  );

  const handleBulkStatusConfirm = React.useCallback(() => {
    if (!pendingBulkStatus || !selectedIds.length) return;
    bulkUpdateStatus.mutate(
      { caseIds: selectedIds, status: pendingBulkStatus },
      {
        onSuccess: clearSelection,
        onError: (mutationError) => {
          toast({
            title: t("common.error"),
            description: getErrorMessage(mutationError, t("cases.bulkStatusFailed")),
            variant: "destructive",
          });
        },
        onSettled: () => setPendingBulkStatus(null),
      }
    );
  }, [bulkUpdateStatus, clearSelection, pendingBulkStatus, selectedIds, t, toast]);

  const handleBulkDeleteConfirm = React.useCallback(() => {
    if (!selectedIds.length) return;
    bulkDeleteCases.mutate(selectedIds, {
      onSuccess: clearSelection,
      onError: (mutationError) => {
        toast({
          title: t("common.error"),
          description: getErrorMessage(mutationError, t("cases.bulkDeleteFailed")),
          variant: "destructive",
        });
      },
      onSettled: () => setPendingBulkDelete(false),
    });
  }, [bulkDeleteCases, clearSelection, selectedIds, t, toast]);

  const clearFilters = React.useCallback(() => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchTerm("");
  }, []);

  const labels = React.useMemo(
    () => ({
      all: t("cases.filters.all"),
      search: t("cases.searchCases"),
      type: t("cases.type"),
      allTypes: t("cases.bulk.allTypes"),
      sortBy: t("cases.bulk.sortBy"),
      updated: t("cases.lastUpdated"),
      created: t("cases.bulk.created"),
      title: t("cases.bulk.title"),
      status: t("cases.status"),
      cards: t("cases.bulk.cardsView"),
      table: t("cases.bulk.tableView"),
      clear: t("cases.bulk.clearFilters"),
      selectCase: t("cases.bulk.selectCase"),
      selectAll: t("cases.bulk.selectAll"),
      case: t("cases.bulk.case"),
      client: t("cases.clientLabel"),
      lawyer: t("cases.bulk.lawyer"),
      actions: t("cases.action"),
      linkStudio: t("cases.linkStudio"),
      noResults: t("cases.noResultsFound"),
      selected: t("cases.bulk.selected"),
      previous: t("cases.bulk.previous"),
      next: t("cases.bulk.next"),
      unassigned: t("cases.unassigned"),
      open: t("cases.openCase"),
      bulkAssign: t("cases.bulk.assign"),
      bulkUnassign: t("cases.bulk.unassign"),
      selectLawyer: t("cases.selectLawyer"),
      changeStatus: t("cases.changeStatus"),
      delete: t("common.delete"),
      selectedCount: t("cases.bulk.selectedCount"),
    }),
    [t]
  );

  const isBulkBusy =
    bulkAssignCases.isPending || bulkUpdateStatus.isPending || bulkDeleteCases.isPending;

  if (isLoading) {
    return <CasesPageSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("cases.unableToLoad")}
        variant="error"
        action={{ label: t("common.retry"), onClick: () => refetch() }}
      />
    );
  }

  return (
    <div data-tour-id="cases-workspace" className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D97706]/20 bg-[#D97706]/10 px-3 py-1 text-xs font-bold text-[#B45309]">
            <Scale className="h-3.5 w-3.5" />
            {t("cases.bulk.workspace")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2942]">
            {t("cases.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            {t("cases.subtitle")}
          </p>
        </div>
        <MuseumGuard>
          <Button
            type="button"
            onClick={() => router.push("/cases/new")}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t("cases.newCase")}
          </Button>
        </MuseumGuard>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label={t("cases.bulk.totalCases")}
          value={counts.all}
          tone="bg-slate-100 text-[#0F2942]"
        />
        <StatCard
          icon={Clock}
          label={formatStatus(CaseStatus.PENDING_HEARING)}
          value={counts.pending_hearing}
          tone="bg-orange-50 text-orange-700"
        />
        <StatCard
          icon={Users}
          label={t("cases.bulk.activeCases")}
          value={counts.open + counts.in_progress + counts.pending_hearing}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={FileText}
          label={formatStatus(CaseStatus.CLOSED)}
          value={counts.closed}
          tone="bg-slate-100 text-slate-600"
        />
      </div>

      <CasesToolbar
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        searchTerm={searchTerm}
        viewMode={viewMode}
        sortKey={sortKey}
        sortDir={sortDir}
        counts={counts}
        isRTL={isRTL}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onSearchChange={setSearchTerm}
        onViewModeChange={setViewMode}
        onSortKeyChange={setSortKey}
        onToggleSortDir={() => setSortDir((current) => (current === "desc" ? "asc" : "desc"))}
        onClearFilters={clearFilters}
        formatStatus={formatStatus}
        formatCaseType={formatCaseType}
        labels={labels}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {t("cases.bulk.results").replace(
            "{{count}}",
            String(filteredCases.length)
          )}
        </p>
        {selectedIds.length ? (
          <Button type="button" variant="ghost" onClick={clearSelection}>
            {labels.clear}
          </Button>
        ) : null}
      </div>

      {filteredCases.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <CardTitle>{debouncedSearch ? t("cases.noResultsFound") : t("cases.noCases")}</CardTitle>
            <CardDescription>
              {debouncedSearch ? t("cases.adjustFilters") : t("cases.noCasesDesc")}
            </CardDescription>
          </CardHeader>
          {!debouncedSearch ? (
            <CardContent className="flex justify-center">
              <Button type="button" onClick={() => router.push("/cases/new")}>
                <Plus className="h-4 w-4" />
                {t("cases.createCase")}
              </Button>
            </CardContent>
          ) : null}
        </Card>
      ) : viewMode === "table" ? (
        <div className="hidden md:block">
          <CasesDataTable
            cases={filteredCases}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            formatStatus={formatStatus}
            formatCaseType={formatCaseType}
            onView={(case_) => router.push(`/cases/${case_.id}`)}
            onEdit={(case_) => router.push(`/cases/${case_.id}/edit`)}
            onLinkStudio={(case_) => router.push(`/cases/${case_.id}/linking`)}
            onDelete={setPendingDeleteCase}
            onStatusChange={(case_, status) => handleStatusChange(case_.id, status)}
            activeCaseId={activeCaseId}
            labels={labels}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((case_) => (
            <CaseWorkspaceCard
              key={case_.id}
              case_={case_}
              selected={Boolean(rowSelection[String(case_.id)])}
              isBusy={activeCaseId === case_.id}
              isRTL={isRTL}
              formatStatus={formatStatus}
              formatCaseType={formatCaseType}
              onToggleSelected={(checked) => toggleCaseSelected(case_.id, checked)}
              onView={() => router.push(`/cases/${case_.id}`)}
              onEdit={() => router.push(`/cases/${case_.id}/edit`)}
              onLinkStudio={() => router.push(`/cases/${case_.id}/linking`)}
              onDelete={() => setPendingDeleteCase(case_)}
              onStatusChange={(status) => handleStatusChange(case_.id, status)}
              labels={labels}
            />
          ))}
        </div>
      )}

      {viewMode === "table" ? (
        <div className="space-y-3 md:hidden">
          {filteredCases.map((case_) => (
            <CaseWorkspaceCard
              key={case_.id}
              case_={case_}
              selected={Boolean(rowSelection[String(case_.id)])}
              isBusy={activeCaseId === case_.id}
              isRTL={isRTL}
              formatStatus={formatStatus}
              formatCaseType={formatCaseType}
              onToggleSelected={(checked) => toggleCaseSelected(case_.id, checked)}
              onView={() => router.push(`/cases/${case_.id}`)}
              onEdit={() => router.push(`/cases/${case_.id}/edit`)}
              onLinkStudio={() => router.push(`/cases/${case_.id}/linking`)}
              onDelete={() => setPendingDeleteCase(case_)}
              onStatusChange={(status) => handleStatusChange(case_.id, status)}
              labels={labels}
            />
          ))}
        </div>
      ) : null}

      <BulkCaseActionsBar
        selectedCount={selectedIds.length}
        canAssign={canAssign}
        teamMembers={teamMembers}
        isBusy={isBulkBusy}
        isRTL={isRTL}
        onClear={clearSelection}
        onAssign={handleBulkAssign}
        onStatusChange={setPendingBulkStatus}
        onDelete={() => setPendingBulkDelete(true)}
        formatStatus={formatStatus}
        labels={{
          selected: labels.selectedCount,
          clear: labels.clear,
          assign: labels.bulkAssign,
          unassign: labels.bulkUnassign,
          selectLawyer: labels.selectLawyer,
          changeStatus: labels.changeStatus,
          delete: labels.delete,
        }}
      />

      <ConfirmDialog
        open={pendingDeleteCase !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteCase(null);
        }}
        title={t("cases.confirmDeleteTitle")}
        description={
          pendingDeleteCase
            ? t("cases.confirmDeleteDesc", { title: pendingDeleteCase.title })
            : t("cases.confirmDelete")
        }
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={pendingBulkDelete}
        onOpenChange={setPendingBulkDelete}
        title={t("cases.bulk.confirmDeleteTitle")}
        description={t("cases.bulk.confirmDeleteDesc").replace(
          "{{count}}",
          String(selectedIds.length)
        )}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
      />

      <ConfirmDialog
        open={pendingBulkStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingBulkStatus(null);
        }}
        title={t("cases.bulk.confirmStatusTitle")}
        description={t("cases.bulk.confirmStatusDesc").replace(
          "{{count}}",
          String(selectedIds.length)
        ).replace("{{status}}", pendingBulkStatus ? formatStatus(pendingBulkStatus) : "")}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onConfirm={handleBulkStatusConfirm}
      />
    </div>
  );
}
