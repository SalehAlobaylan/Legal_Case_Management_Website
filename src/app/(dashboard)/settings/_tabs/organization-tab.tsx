"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";
import {
  useAcceptTeamInvitation,
  useCreateOrganizationAndSwitch,
  useInviteTeamMember,
  useLeaveOrganization,
  useRemoveTeamMember,
  useTeamMembers,
  useUpdateTeamMemberRole,
} from "@/lib/hooks/use-team";
import { GRANTABLE_PERMISSIONS } from "@/lib/types/auth";
import { organizationSettingsApi, teamApi } from "@/lib/api/team";
import { useAdminStats } from "@/lib/hooks/use-admin-stats";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { NajizLockOverlay } from "@/components/features/dashboard/najiz-lock-overlay";
import { LicenseBadgeCard } from "@/components/features/dashboard/najiz-placeholders";

type OrgPrivacyShape = {
  documents?: boolean;
  clients?: boolean;
  teamDirectory?: boolean;
  adminClosureRequired?: boolean;
};

export function OrganizationTab({
  t,
  isRTL,
  teamData,
}: {
  t: (key: string) => string;
  isRTL: boolean;
  teamData?: {
    members: any[];
    total: number;
    organization?: {
      id: number;
      name: string;
      isPersonal: boolean;
      contactInfo?: string | null;
      restrictCaseVisibility?: boolean;
      settings?: { privacy?: OrgPrivacyShape; [k: string]: unknown };
    };
  };
}) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("lawyer");
  const [joinCode, setJoinCode] = React.useState("");
  const [newOrgName, setNewOrgName] = React.useState("");
  const [lastCode, setLastCode] = React.useState<string | null>(null);

  const inviteMember = useInviteTeamMember();
  const acceptInvite = useAcceptTeamInvitation();
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();
  const leaveOrg = useLeaveOrganization();
  const createOrg = useCreateOrganizationAndSwitch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const org = teamData?.organization;
  const members = teamData?.members || [];
  const isPersonalWorkspace = Boolean(org?.isPersonal);

  // Admin: privacy toggles. The "case visibility" lives on a dedicated org column;
  // the four privacy.* flags live in the `settings` jsonb. We mirror both into
  // one local state object + a generic toggler so the UI is one card with five rows.
  type PrivacyKey =
    | "caseVisibility"
    | "documents"
    | "clients"
    | "teamDirectory"
    | "adminClosureRequired";

  const initialPolicy = {
    caseVisibility: Boolean(org?.restrictCaseVisibility),
    documents: Boolean(org?.settings?.privacy?.documents),
    clients: Boolean(org?.settings?.privacy?.clients),
    teamDirectory: Boolean(org?.settings?.privacy?.teamDirectory),
    adminClosureRequired: Boolean(org?.settings?.privacy?.adminClosureRequired),
  };
  const [policy, setPolicy] = React.useState(initialPolicy);
  const [savingKey, setSavingKey] = React.useState<PrivacyKey | null>(null);

  // Refresh from server when teamData updates (e.g. after invalidation).
  React.useEffect(() => {
    setPolicy({
      caseVisibility: Boolean(org?.restrictCaseVisibility),
      documents: Boolean(org?.settings?.privacy?.documents),
      clients: Boolean(org?.settings?.privacy?.clients),
      teamDirectory: Boolean(org?.settings?.privacy?.teamDirectory),
      adminClosureRequired: Boolean(org?.settings?.privacy?.adminClosureRequired),
    });
  }, [
    org?.restrictCaseVisibility,
    org?.settings?.privacy?.documents,
    org?.settings?.privacy?.clients,
    org?.settings?.privacy?.teamDirectory,
    org?.settings?.privacy?.adminClosureRequired,
  ]);

  const onTogglePolicy = async (key: PrivacyKey, next: boolean) => {
    // Optimistic flip
    setPolicy((p) => ({ ...p, [key]: next }));
    setSavingKey(key);
    try {
      const patch =
        key === "caseVisibility"
          ? { restrictCaseVisibility: next }
          : { settings: { privacy: { [key]: next } as OrgPrivacyShape } };
      await organizationSettingsApi.updateOrganization(patch);
      await queryClient.invalidateQueries({ queryKey: ["team-members"] });
      await queryClient.invalidateQueries({ queryKey: ["cases"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: t("settings.privacySaved") || "Setting updated" });
    } catch (err: any) {
      setPolicy((p) => ({ ...p, [key]: !next }));
      toast({
        title: t("common.error") || "Error",
        description: err?.response?.data?.message || "Failed to update",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  // Admin: workload at a glance
  const { data: adminStats } = useAdminStats(isAdmin && !isPersonalWorkspace);

  // Per-member permission management
  const [permsMember, setPermsMember] = React.useState<{ id: string; fullName: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-[#0F2942] rounded-2xl p-4 md:p-6 text-white shadow-lg">
        <h4 className="text-lg md:text-xl font-bold">{org?.name || t("settings.organization")}</h4>
        <p className="text-slate-200 text-xs md:text-sm mt-1">
          {isPersonalWorkspace ? t("settings.personalWorkspace") : t("settings.teamWorkspace")} • {members.length} {t("settings.members")}
        </p>
      </div>

      {/* Lawyer License — Najiz-verified (locked until integration is live) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NajizLockOverlay>
          <LicenseBadgeCard />
        </NajizLockOverlay>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-center">
          <h4 className="font-bold text-[#0F2942] mb-1">
            {t("settings.barLicenseTitle")}
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("settings.barLicenseDesc")}
          </p>
        </div>
      </div>

      {isPersonalWorkspace && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="font-bold text-[#0F2942]">{t("settings.createOrganization")}</h4>
            <Input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder={t("settings.orgNamePlaceholder")}
              className="h-11"
            />
            <Button
              className="bg-[#0F2942] hover:bg-[#1E3A56]"
              disabled={!newOrgName.trim() || createOrg.isPending}
              onClick={() => createOrg.mutate({ name: newOrgName.trim() })}
            >
              {createOrg.isPending ? t("common.creating") : t("settings.createAndSwitch")}
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="font-bold text-[#0F2942]">{t("settings.joinByCode")}</h4>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={t("settings.pasteCodePlaceholder")}
              className="h-11"
            />
            <Button
              className="bg-[#D97706] hover:bg-[#B45309]"
              disabled={!joinCode.trim() || acceptInvite.isPending}
              onClick={() => acceptInvite.mutate(joinCode.trim())}
            >
              {acceptInvite.isPending ? t("common.joining") : t("settings.joinOrganization")}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h4 className="font-bold text-[#0F2942]">{t("settings.inviteMember")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t("settings.emailPlaceholder")}
              className="h-11 md:col-span-2"
            />
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-11"
            >
              <option value="admin">{t("roles.admin")}</option>
              <option value="senior_lawyer">{t("roles.seniorLawyer")}</option>
              <option value="lawyer">{t("roles.lawyer")}</option>
              <option value="paralegal">{t("roles.paralegal")}</option>
              <option value="clerk">{t("roles.clerk")}</option>
            </Select>
          </div>
          <Button
            className="bg-[#D97706] hover:bg-[#B45309]"
            disabled={!inviteEmail.trim() || inviteMember.isPending}
            onClick={() =>
              inviteMember.mutate(
                { email: inviteEmail.trim(), role: inviteRole },
                {
                  onSuccess: (data) => {
                    setLastCode(data.invitationCode || null);
                    setInviteEmail("");
                  },
                }
              )
            }
          >
            <Plus size={14} className={cn(isRTL ? "ml-2" : "mr-2")} />
            {inviteMember.isPending ? t("common.inviting") : t("settings.inviteMember")}
          </Button>
          {lastCode && (
            <p className="text-xs text-slate-600">
              {t("settings.invitationCodeLabel")} <code className="bg-slate-100 px-1 py-0.5 rounded">{lastCode}</code>
            </p>
          )}
        </div>
      )}

      {isAdmin && !isPersonalWorkspace && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <h4 className="font-bold text-[#0F2942]">
              {t("settings.privacyTitle") || "Privacy & sharing"}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {t("settings.privacySubtitle") ||
                "Org-wide policies. Admins and members with override permissions are unaffected."}
            </p>
          </div>

          {(
            [
              {
                key: "caseVisibility" as const,
                title:
                  t("settings.restrictCaseVisibility") ||
                  "Restrict case visibility to assignee",
                help:
                  t("settings.restrictCaseVisibilityHelp") ||
                  "Lawyers see only cases they are assigned to.",
              },
              {
                key: "documents" as const,
                title:
                  t("settings.privacyDocsTitle") ||
                  "Restrict document sharing",
                help:
                  t("settings.privacyDocsHelp") ||
                  "Lawyers can only open documents on cases assigned to them.",
              },
              {
                key: "clients" as const,
                title:
                  t("settings.privacyClientsTitle") ||
                  "Restrict client sharing",
                help:
                  t("settings.privacyClientsHelp") ||
                  "Lawyers see only clients tied to a case they're assigned to.",
              },
              {
                key: "teamDirectory" as const,
                title:
                  t("settings.privacyDirectoryTitle") ||
                  "Hide team directory",
                help:
                  t("settings.privacyDirectoryHelp") ||
                  "Only admins can browse the team member list.",
              },
              {
                key: "adminClosureRequired" as const,
                title:
                  t("settings.privacyClosureTitle") ||
                  "Require admin approval to close cases",
                help:
                  t("settings.privacyClosureHelp") ||
                  "Lawyers can update cases freely but cannot mark them closed.",
              },
            ] as Array<{ key: PrivacyKey; title: string; help: string }>
          ).map((row) => (
            <div
              key={row.key}
              className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100 first:border-t-0 first:pt-0"
            >
              <div className="flex-1">
                <div className="font-medium text-[#0F2942]">{row.title}</div>
                <div className="text-xs text-slate-500 mt-1">{row.help}</div>
              </div>
              <Switch
                checked={policy[row.key]}
                onCheckedChange={(next) => onTogglePolicy(row.key, next)}
                disabled={savingKey === row.key}
                aria-label={row.title}
              />
            </div>
          ))}
        </div>
      )}

      {isAdmin && !isPersonalWorkspace && adminStats && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-[#0F2942]">
              {t("settings.workloadGlance") || "Workload at a glance"}
            </h4>
            <a
              href="/admin/dashboard"
              className="text-xs text-orange-600 hover:underline"
            >
              {t("settings.openAdminDashboard") || "Open admin dashboard"} →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">
                    {t("settings.name") || "Name"}
                  </th>
                  <th className="py-2 pr-4 font-medium">
                    {t("settings.role") || "Role"}
                  </th>
                  <th className="py-2 pr-4 font-medium">
                    {t("settings.openCases") || "Open cases"}
                  </th>
                  <th className="py-2 font-medium">
                    {t("settings.totalCases") || "Total cases"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminStats.workload.slice(0, 5).map((row) => (
                  <tr key={row.lawyerId} className="border-t border-slate-100">
                    <td className="py-2 pr-4 text-[#0F2942] font-medium">
                      {row.fullName || row.email}
                    </td>
                    <td className="py-2 pr-4">
                      <RoleBadge role={row.role} />
                    </td>
                    <td className="py-2 pr-4">{row.openCases}</td>
                    <td className="py-2">{row.totalCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-[#0F2942]">{t("settings.teamMembers")}</h4>
          {!isPersonalWorkspace && (
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={leaveOrg.isPending}
              onClick={() => leaveOrg.mutate()}
            >
              {leaveOrg.isPending ? t("common.leaving") : t("settings.leaveOrganization")}
            </Button>
          )}
        </div>

        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">{t("settings.name")}</th>
                <th className="px-6 py-4 font-bold">{t("settings.role")}</th>
                <th className="px-6 py-4 font-bold">{t("table.status")}</th>
                <th className={`px-6 py-4 font-bold ${isRTL ? "text-left" : "text-right"}`}>{t("settings.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member: any) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0F2942]">{member.fullName}</div>
                    <div className="text-xs text-slate-400">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot status={member.status} />
                  </td>
                  <td className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"} space-x-2`}>
                    {isAdmin && user?.id !== member.id && (
                      <>
                        <div className="inline-block min-w-[9rem] align-middle">
                          <Select
                            defaultValue={member.role}
                            className="h-8 min-w-[9rem] rounded-md px-2 py-1 text-xs"
                            onChange={(e) =>
                              updateRole.mutate({
                                memberId: member.id,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value="admin">{t("roles.admin")}</option>
                            <option value="senior_lawyer">{t("roles.seniorLawyer")}</option>
                            <option value="lawyer">{t("roles.lawyer")}</option>
                            <option value="paralegal">{t("roles.paralegal")}</option>
                            <option value="clerk">{t("roles.clerk")}</option>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPermsMember({
                              id: member.id,
                              fullName: member.fullName || member.email,
                            })
                          }
                        >
                          {t("settings.permissions") || "Permissions"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => removeMember.mutate(member.id)}
                        >
                          {t("settings.removeMember")}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 p-4">
          {members.map((member: any) => (
            <div key={member.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div>
                <div className="font-bold text-[#0F2942]">{member.fullName}</div>
                <div className="text-xs text-slate-400">{member.email}</div>
              </div>
              <div className="flex items-center gap-4">
                <RoleBadge role={member.role} />
                <StatusDot status={member.status} />
              </div>
              {isAdmin && user?.id !== member.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPermsMember({
                      id: member.id,
                      fullName: member.fullName || member.email,
                    })
                  }
                >
                  {t("settings.permissions") || "Permissions"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {permsMember && (
        <MemberPermissionsDialog
          member={permsMember}
          open={Boolean(permsMember)}
          onOpenChange={(open) => !open && setPermsMember(null)}
          t={t}
        />
      )}
    </div>
  );
}

/* =============================================================================
   MEMBER PERMISSIONS DIALOG
   ============================================================================= */

function MemberPermissionsDialog({
  member,
  open,
  onOpenChange,
  t,
}: {
  member: { id: string; fullName: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pendingPerm, setPendingPerm] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teamApi
      .getMemberPermissions(member.id)
      .then((r) => {
        if (!cancelled) setPermissions(r.permissions);
      })
      .catch(() => {
        if (!cancelled) setPermissions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [member.id]);

  const togglePermission = async (perm: string, next: boolean) => {
    setPendingPerm(perm);
    try {
      const res = next
        ? await teamApi.grantMemberPermission(member.id, perm)
        : await teamApi.revokeMemberPermission(member.id, perm);
      setPermissions(res.permissions);
      toast({
        title: next
          ? t("settings.permissionGranted") || "Permission granted"
          : t("settings.permissionRevoked") || "Permission revoked",
      });
    } catch (err: any) {
      toast({
        title: t("common.error") || "Error",
        description: err?.response?.data?.message || "Failed to update",
        variant: "destructive",
      });
    } finally {
      setPendingPerm(null);
    }
  };

  const labels: Record<string, { title: string; description: string }> = {
    "delegated.cases.assign": {
      title: t("settings.permCasesAssignTitle") || "Assign cases",
      description:
        t("settings.permCasesAssignDesc") ||
        "Reassign cases to other lawyers in the organization.",
    },
    "delegated.cases.viewAll": {
      title: t("settings.permCasesViewAllTitle") || "View all cases",
      description:
        t("settings.permCasesViewAllDesc") ||
        "Bypass the org's restrict-case-visibility setting.",
    },
    "delegated.cases.close": {
      title: t("settings.permCasesCloseTitle") || "Close cases",
      description:
        t("settings.permCasesCloseDesc") ||
        "Allow this user to close cases when admin-only closure is enabled.",
    },
    "delegated.documents.viewAll": {
      title: t("settings.permDocsViewAllTitle") || "View all documents",
      description:
        t("settings.permDocsViewAllDesc") ||
        "Bypass the org's restrict-document-sharing setting.",
    },
    "delegated.clients.viewAll": {
      title: t("settings.permClientsViewAllTitle") || "View all clients",
      description:
        t("settings.permClientsViewAllDesc") ||
        "Bypass the org's restrict-client-sharing setting.",
    },
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-[#0F2942]">
              {t("settings.memberPermissions") || "Member permissions"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{member.fullName}</p>
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">{t("common.loading") || "Loading…"}</div>
          ) : (
            <ul className="space-y-3">
              {GRANTABLE_PERMISSIONS.map((perm) => {
                const enabled = permissions.includes(perm);
                const l = labels[perm];
                return (
                  <li key={perm} className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-[#0F2942] text-sm">
                        {l.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {l.description}
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(next) => togglePermission(perm, next)}
                      disabled={pendingPerm === perm}
                      aria-label={l.title}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t("common.close") || "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-100",
    senior_lawyer: "bg-indigo-50 text-indigo-700 border-indigo-100",
    lawyer: "bg-slate-100 text-slate-700 border-slate-200",
    paralegal: "bg-green-50 text-green-700 border-green-100",
    clerk: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("px-2 py-1 rounded text-xs font-bold border", styles[role] || styles.clerk)}>
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", normalized === "active" ? "bg-green-500" : "bg-amber-500")} />
      <span className="text-slate-600 font-medium">{status}</span>
    </div>
  );
}
