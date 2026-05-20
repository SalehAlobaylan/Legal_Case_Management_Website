"use client";

import * as React from "react";
import {
  Check,
  Edit2,
  Loader2,
  MoreVertical,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { CaseStatus } from "@/lib/types/case";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useAssignCase } from "@/lib/hooks/use-cases";

interface CaseActionsMenuProps {
  caseStatus: string;
  formatStatus: (status: string) => string;
  isBusy?: boolean;
  align?: "left" | "right";
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  /** Case primary key — required for the reassign/unassign actions */
  caseId?: number;
  /** Current assignee — drives the "Unassign me" visibility */
  assignedLawyerId?: string | null;
}

export function CaseActionsMenu({
  caseStatus,
  formatStatus,
  isBusy = false,
  align = "right",
  onEdit,
  onDelete,
  onStatusChange,
  caseId,
  assignedLawyerId,
}: CaseActionsMenuProps) {
  const { t, isRTL } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [reassignMode, setReassignMode] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { can } = usePermission();
  const canAssign = can("delegated.cases.assign");
  const currentUserId = useAuthStore((s) => s.user?.id);
  const canUnassignSelf =
    Boolean(assignedLawyerId) && assignedLawyerId === currentUserId;
  const showAssignSection = Boolean(caseId) && (canAssign || canUnassignSelf);

  const { data: teamData } = useTeamMembers();
  const teamMembers = teamData?.members ?? [];
  const assignCase = useAssignCase();

  React.useEffect(() => {
    if (!open) {
      setReassignMode(false);
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleStatusSelect = (status: string) => {
    setOpen(false);
    if (status !== caseStatus) {
      onStatusChange(status);
    }
  };

  const handleEdit = () => {
    setOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", open && "z-[60]")}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={isBusy}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("cases.moreActions")}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all",
          "hover:border-[#D97706]/40 hover:bg-amber-50/60 hover:text-[#D97706]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/25",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className={cn(
              "absolute top-full mt-2 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10",
              "animate-in fade-in slide-in-from-top-2 duration-150",
              align === "left"
                ? "left-0"
                : isRTL
                  ? "left-0"
                  : "right-0"
            )}
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-[#0F2942]">
                {t("cases.quickActions")}
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleEdit}
                disabled={isBusy}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Edit2 className="h-4 w-4 text-slate-400" />
                {t("cases.editCase")}
              </button>
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {t("cases.changeStatus")}
              </p>
            </div>

            <div className="px-2 pb-2">
              {Object.values(CaseStatus).map((status) => {
                const isActive = status === caseStatus;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusSelect(status)}
                    disabled={isBusy}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-amber-50 text-[#0F2942]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#0F2942]",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    <span className="font-medium">{formatStatus(status)}</span>
                    <span className="flex h-5 w-5 items-center justify-center">
                      {isActive ? (
                        <Check className="h-4 w-4 text-[#D97706]" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {showAssignSection && (
              <>
                <div className="border-t border-slate-100 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {t("cases.assignment") || "Assignment"}
                  </p>
                </div>
                <div className="px-2 pb-2 space-y-1">
                  {canAssign && !reassignMode && (
                    <button
                      type="button"
                      onClick={() => setReassignMode(true)}
                      disabled={isBusy}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      {t("cases.reassign") || "Reassign…"}
                    </button>
                  )}
                  {canAssign && reassignMode && (
                    <div className="px-3 py-2 space-y-2">
                      <select
                        defaultValue=""
                        disabled={assignCase.isPending}
                        onChange={(e) => {
                          const lawyerId = e.target.value;
                          if (!lawyerId || !caseId) return;
                          assignCase.mutate(
                            { id: caseId, assignedLawyerId: lawyerId },
                            { onSettled: () => setOpen(false) }
                          );
                        }}
                        className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm"
                      >
                        <option value="">
                          {t("cases.selectLawyer") || "Select lawyer…"}
                        </option>
                        {teamMembers.map(
                          (m: { id: string; fullName?: string | null; email: string }) => (
                            <option key={m.id} value={m.id}>
                              {m.fullName || m.email}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
                  {canUnassignSelf && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!caseId) return;
                        assignCase.mutate(
                          { id: caseId, assignedLawyerId: null },
                          { onSettled: () => setOpen(false) }
                        );
                      }}
                      disabled={isBusy || assignCase.isPending}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserMinus className="h-4 w-4 text-slate-400" />
                      {t("cases.unassignMe") || "Unassign me"}
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {t("cases.deleteCase")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
