/*
 * File: src/lib/utils/admin-labels.ts
 * Purpose: Localized display labels for enum-like admin backend values.
 */

type TFunction = (key: string) => string;

function fallbackLabel(value: string | null | undefined, t: TFunction) {
  if (!value) return t("common.unknown");
  return value.replace(/[_-]/g, " ");
}

export function formatAdminCaseStatus(status: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    open: t("cases.statuses.open"),
    in_progress: t("cases.statuses.in_progress"),
    pending_hearing: t("cases.statuses.pending_hearing"),
    closed: t("cases.statuses.closed"),
    archived: t("cases.statuses.archived"),
  };
  return status ? labels[status] ?? fallbackLabel(status, t) : t("common.unknown");
}

export function formatAdminCaseType(caseType: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    general: t("cases.types.general"),
    criminal: t("cases.types.criminal"),
    civil: t("cases.types.civil"),
    personal_status: t("cases.types.personal_status"),
    commercial: t("cases.types.commercial"),
    labor: t("cases.types.labor"),
    administrative: t("cases.types.administrative"),
    enforcement: t("cases.types.enforcement"),
  };
  return caseType ? labels[caseType] ?? fallbackLabel(caseType, t) : t("cases.types.general");
}

export function formatAdminRole(role: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    admin: t("roles.admin"),
    senior_lawyer: t("roles.seniorLawyer"),
    seniorLawyer: t("roles.seniorLawyer"),
    lawyer: t("roles.lawyer"),
    paralegal: t("roles.paralegal"),
    clerk: t("roles.clerk"),
    attorney_at_law: t("roles.attorneyAtLaw"),
    attorneyAtLaw: t("roles.attorneyAtLaw"),
  };
  return role ? labels[role] ?? fallbackLabel(role, t) : t("common.unknown");
}

export function formatAdminActivityAction(action: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    created: t("admin.activityActions.created"),
    updated: t("admin.activityActions.updated"),
    closed: t("admin.activityActions.closed"),
    reviewed: t("admin.activityActions.reviewed"),
    uploaded: t("admin.activityActions.uploaded"),
    deleted: t("admin.activityActions.deleted"),
    assigned: t("admin.activityActions.assigned"),
  };
  return action ? labels[action] ?? fallbackLabel(action, t) : t("common.unknown");
}

export function formatAdminActivityType(type: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    case: t("admin.activityTypes.case"),
    regulation: t("admin.activityTypes.regulation"),
    document: t("admin.activityTypes.document"),
    client: t("admin.activityTypes.client"),
  };
  return type ? labels[type] ?? fallbackLabel(type, t) : t("common.unknown");
}

export function formatAdminAuditAction(action: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    "role.change": t("admin.auditActions.roleChange"),
    "permission.grant": t("admin.auditActions.permissionGrant"),
    "permission.revoke": t("admin.auditActions.permissionRevoke"),
    "org.settings.update": t("admin.auditActions.orgSettingsUpdate"),
    "announcement.create": t("admin.auditActions.announcementCreate"),
    "announcement.retire": t("admin.auditActions.announcementRetire"),
    "announcement.delete": t("admin.auditActions.announcementDelete"),
    "case.assign": t("admin.auditActions.caseAssign"),
    "case.bulk_assign": t("admin.auditActions.caseBulkAssign"),
    "member.leave_toggle": t("admin.auditActions.memberLeaveToggle"),
    "monitor.run": t("admin.auditActions.monitorRun"),
    "admin.dashboard_settings.update": t("admin.auditActions.dashboardSettingsUpdate"),
    "admin.ai_profile.refresh": t("admin.auditActions.aiProfileRefresh"),
    "admin.ai_org_snapshot.refresh": t("admin.auditActions.aiOrgSnapshotRefresh"),
    "admin.ai_evaluation.run": t("admin.auditActions.aiEvaluationRun"),
  };
  return action ? labels[action] ?? fallbackLabel(action, t) : t("common.unknown");
}

export function formatAdminTargetType(type: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    user: t("admin.targetTypes.user"),
    case: t("admin.targetTypes.case"),
    cases: t("admin.targetTypes.cases"),
    organization: t("admin.targetTypes.organization"),
    announcement: t("admin.targetTypes.announcement"),
    regulation_monitor: t("admin.targetTypes.regulationMonitor"),
    admin_dashboard_settings: t("admin.targetTypes.dashboardSettings"),
    ai_evaluation_run: t("admin.targetTypes.aiEvaluationRun"),
  };
  return type ? labels[type] ?? fallbackLabel(type, t) : t("common.unknown");
}

export function formatAdminMonitorStatus(status: string | null | undefined, t: TFunction) {
  const labels: Record<string, string> = {
    completed: t("admin.monitorStatusCompleted"),
    success: t("admin.monitorStatusCompleted"),
    failed: t("admin.monitorStatusFailed"),
    running: t("admin.monitorStatusRunning"),
    pending: t("admin.monitorStatusPending"),
  };
  return status ? labels[status] ?? fallbackLabel(status, t) : t("admin.monitorNoRuns");
}
