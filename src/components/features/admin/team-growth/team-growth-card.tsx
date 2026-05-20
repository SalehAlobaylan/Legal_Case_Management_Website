/**
 * File: src/components/features/admin/team-growth/team-growth-card.tsx
 * Purpose: Team growth admin card — pending invitations list + quick-invite
 *          form. Extracted from src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import {
  Loader2,
  RefreshCw,
  Send,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
  useInviteTeamMember,
  useResendInvitation,
  useRevokeInvitation,
  useTeamInvitations,
} from "@/lib/hooks/use-team";

export function TeamGrowthCard() {
  const { t } = useI18n();
  const { data, isLoading } = useTeamInvitations();
  const invite = useInviteTeamMember();
  const revoke = useRevokeInvitation();
  const resend = useResendInvitation();

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("lawyer");
  const [lastCode, setLastCode] = React.useState<string | null>(null);

  // Show pending only (active growth surface) — accepted/revoked go in settings audit.
  const pending = (data?.invitations ?? []).filter((i) => i.status === "pending");

  const submitInvite = () => {
    if (!email.trim()) return;
    invite.mutate(
      { email: email.trim(), role },
      {
        onSuccess: (resp) => {
          setLastCode(resp.invitationCode || null);
          setEmail("");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> {t("admin.teamGrowthTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick invite */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              type="email"
              placeholder={t("settings.emailPlaceholder") || "user@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="md:w-40"
            >
              <option value="admin">{t("roles.admin")}</option>
              <option value="senior_lawyer">{t("roles.seniorLawyer")}</option>
              <option value="lawyer">{t("roles.lawyer")}</option>
              <option value="paralegal">{t("roles.paralegal")}</option>
              <option value="clerk">{t("roles.clerk")}</option>
            </Select>
            <Button
              onClick={submitInvite}
              disabled={!email.trim() || invite.isPending}
              className="bg-[#0F2942] hover:bg-[#1E3A56]"
            >
              {invite.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ms-2">{t("settings.inviteMember") || "Invite"}</span>
            </Button>
          </div>
          {lastCode && (
            <p className="text-xs text-slate-600">
              {t("settings.invitationCodeLabel") || "Code:"}{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded select-all">
                {lastCode}
              </code>
            </p>
          )}
        </div>

        {/* Pending list */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">
            {t("settings.pendingInvitations")} ({pending.length})
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : pending.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t("settings.noPendingInvitations")}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((inv) => (
                <li
                  key={inv.id}
                  className="py-2 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#0F2942] truncate">
                      {inv.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      <Badge variant="outline">{inv.role}</Badge>
                      <span className="ms-2">
                        exp {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resend.isPending}
                      onClick={() => resend.mutate(inv.id)}
                      title={t("settings.invitationResent")}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="ms-1 hidden md:inline">
                        {t("settings.resendInvite")}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(inv.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="ms-1 hidden md:inline">
                        {t("settings.revokeInvite")}
                      </span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
