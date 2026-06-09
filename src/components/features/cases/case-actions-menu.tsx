"use client";

import * as React from "react";
import {
  Check,
  Edit2,
  Loader2,
  MoreVertical,
  Sparkles,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { CaseStatus } from "@/lib/types/case";
import { useI18n } from "@/lib/hooks/use-i18n";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useAssignCase } from "@/lib/hooks/use-cases";

interface CaseActionsMenuProps {
  caseStatus: string;
  formatStatus: (status: string) => string;
  isBusy?: boolean;
  align?: "start" | "end";
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLinkStudio?: () => void;
  onStatusChange: (status: string) => void;
  caseId?: number;
  assignedLawyerId?: string | null;
}

export function CaseActionsMenu({
  caseStatus,
  formatStatus,
  isBusy = false,
  align = "end",
  onView,
  onEdit,
  onDelete,
  onLinkStudio,
  onStatusChange,
  caseId,
  assignedLawyerId,
}: CaseActionsMenuProps) {
  const { t } = useI18n();
  const [reassignMode, setReassignMode] = React.useState(false);
  const { can } = usePermission();
  const canAssign = can("delegated.cases.assign");
  const currentUserId = useAuthStore((s) => s.user?.id);
  const canUnassignSelf =
    Boolean(assignedLawyerId) && assignedLawyerId === currentUserId;
  const showAssignSection = Boolean(caseId) && (canAssign || canUnassignSelf);
  const { data: teamData } = useTeamMembers();
  const teamMembers = teamData?.members ?? [];
  const assignCase = useAssignCase();

  const handleStatusChange = (status: CaseStatus) => {
    if (status !== caseStatus) {
      onStatusChange(status);
    }
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isBusy}
            aria-label={t("cases.moreActions")}
            className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-500 hover:border-[#D97706]/40 hover:bg-amber-50/60 hover:text-[#D97706]"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-72">
          <DropdownMenuLabel>{t("cases.quickActions")}</DropdownMenuLabel>
          {onView ? (
            <DropdownMenuItem onClick={onView}>
              <Check className="h-4 w-4 text-slate-400" />
              {t("cases.openCase") || "Open case"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={onEdit} disabled={isBusy}>
            <Edit2 className="h-4 w-4 text-slate-400" />
            {t("cases.editCase")}
          </DropdownMenuItem>
          {onLinkStudio ? (
            <DropdownMenuItem onClick={onLinkStudio} disabled={isBusy}>
              <Sparkles className="h-4 w-4 text-slate-400" />
              {t("cases.linkStudio") || "Link Studio"}
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("cases.changeStatus")}</DropdownMenuLabel>
          {Object.values(CaseStatus).map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={status === caseStatus}
              onClick={() => handleStatusChange(status)}
              disabled={isBusy}
            >
              {formatStatus(status)}
            </DropdownMenuCheckboxItem>
          ))}

          {showAssignSection ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                {t("cases.assignment") || "Assignment"}
              </DropdownMenuLabel>
              {canAssign && !reassignMode ? (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    setReassignMode(true);
                  }}
                  disabled={isBusy}
                >
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  {t("cases.reassign") || "Reassign..."}
                </DropdownMenuItem>
              ) : null}
              {canAssign && reassignMode ? (
                <div className="px-2 py-2">
                  <Select
                    defaultValue=""
                    disabled={assignCase.isPending}
                    onChange={(event) => {
                      const lawyerId = event.target.value;
                      if (!lawyerId || !caseId) return;
                      assignCase.mutate({ id: caseId, assignedLawyerId: lawyerId });
                    }}
                  >
                    <option value="">
                      {t("cases.selectLawyer") || "Select lawyer..."}
                    </option>
                    {teamMembers.map(
                      (member: {
                        id: string;
                        fullName?: string | null;
                        email: string;
                      }) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName || member.email}
                        </option>
                      )
                    )}
                  </Select>
                </div>
              ) : null}
              {canUnassignSelf ? (
                <DropdownMenuItem
                  onClick={() => {
                    if (!caseId) return;
                    assignCase.mutate({ id: caseId, assignedLawyerId: null });
                  }}
                  disabled={isBusy || assignCase.isPending}
                >
                  <UserMinus className="h-4 w-4 text-slate-400" />
                  {t("cases.unassignMe") || "Unassign me"}
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={onDelete} disabled={isBusy}>
            <Trash2 className="h-4 w-4" />
            {t("cases.deleteCase")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
