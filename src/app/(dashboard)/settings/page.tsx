/**
 * File: src/app/(dashboard)/settings/page.tsx
 * Purpose: Settings page with Silah design system.
 *
 * Layout:
 * - Left sidebar with tab navigation
 * - Right content area with active tab content
 * - RBAC simulator at bottom of sidebar
 *
 * Tabs:
 * - Profile, Organization (admin), Notifications, Security, Integrations, Billing (admin)
 */

"use client";

import * as React from "react";
import {
  User,
  Building,
  Bell,
  Lock,
  Link as LinkIcon,
  // CreditCard, // [HIDDEN FOR GRADUATION PRESENTATION]
  CheckCircle,
  Plus,
  Smartphone,
  MapPin,
  Zap,
  Shield,
  Mail,
  Scale,
  UploadCloud,
  Settings as SettingsIcon,
  Moon,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
// [HIDDEN FOR GRADUATION PRESENTATION] import { useBillingInfo, useSubscribeToPlan, useCancelSubscription, useDownloadInvoicePDF } from "@/lib/hooks/use-billing";
import { useUpdateProfile } from "@/lib/hooks/use-profile";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/lib/hooks/use-notification-settings";
import { useLoginActivity, useChangePassword } from "@/lib/hooks/use-security-settings";
import { useAISettings, useUpdateAISettings } from "@/lib/hooks/use-ai-settings";
import type { AISettings } from "@/lib/api/ai-settings";

type TabId = "profile" | "org" | "notifications" | "security" | "integrations" | "ai"; // "billing" hidden for graduation presentation

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("profile");
  const { user } = useAuthStore();
  const { t, isRTL } = useI18n();

  const { data: teamData } = useTeamMembers();
  // [HIDDEN FOR GRADUATION PRESENTATION] const { data: billingData } = useBillingInfo();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const TABS = [
    { id: "profile" as TabId, label: t("settings.myProfile"), icon: <User size={18} /> },
    { id: "org" as TabId, label: t("settings.organization"), icon: <Building size={18} />, adminOnly: true },
    { id: "notifications" as TabId, label: t("settings.notifications"), icon: <Bell size={18} /> },
    { id: "security" as TabId, label: t("settings.security"), icon: <Lock size={18} /> },
    { id: "integrations" as TabId, label: t("settings.integrations"), icon: <LinkIcon size={18} /> },
    { id: "ai" as TabId, label: t("settings.aiSettings"), icon: <Cpu size={18} />, adminOnly: true },
    // [HIDDEN FOR GRADUATION PRESENTATION] { id: "billing" as TabId, label: t("settings.billing"), icon: <CreditCard size={18} />, adminOnly: true },
  ];

  const isAdmin = user?.role === "admin";
  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className={`flex flex-col md:flex-row overflow-hidden ${isRTL ? 'md:flex-row-reverse' : ''}`}>
      {/* Mobile Tab Selector */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3">
        <Select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabId)}
          className="h-11 bg-[var(--color-surface-bg)]"
        >
          {visibleTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Sidebar */}
      <div className={`hidden md:flex w-full md:w-64 bg-white flex flex-col ${isRTL ? 'border-l border-slate-200' : 'border-r border-slate-200'}`}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#0F2942] font-serif">{t("settings.title")}</h2>
          <p className="text-xs text-slate-500 mt-1">{t("settings.subtitle")}</p>
        </div>

        {/* Tab Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                "text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-[#0F2942] text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0F2942]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              {t("settings.currentRole")}
            </p>
            <div className="text-xs font-bold text-[#0F2942]">
              {user?.role ? t(`roles.${user.role === 'senior_lawyer' ? 'seniorLawyer' : user.role}`) : t("roles.lawyer")}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          {/* Tab Header */}
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#0F2942]">
              {visibleTabs.find((t) => t.id === activeTab)?.label}
            </h3>
            {activeTab === "profile" && (
              <Button className="bg-[#0F2942] hover:bg-[#1E3A56]">
                {t("settings.saveChanges")}
              </Button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && <ProfileTab t={t} isRTL={isRTL} />}
          {activeTab === "org" && <OrganizationTab t={t} isRTL={isRTL} teamData={teamData} />}
          {activeTab === "notifications" && <NotificationsTab t={t} isRTL={isRTL} />}
          {activeTab === "security" && <SecurityTab t={t} isRTL={isRTL} />}
          {activeTab === "integrations" && <IntegrationsTab t={t} />}
          {activeTab === "ai" && <AISettingsTab t={t} isRTL={isRTL} />}
          {/* [HIDDEN FOR GRADUATION PRESENTATION] {activeTab === "billing" && <BillingTab t={t} isRTL={isRTL} billingData={billingData} />} */}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   PROFILE TAB
   ============================================================================= */

function ProfileTab({ t, isRTL }: { t: (key: string) => string; isRTL: boolean }) {
  const { user } = useAuthStore();
  const { mutate: updateProfile } = useUpdateProfile();

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "AL";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 md:gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0F2942] text-white flex items-center justify-center text-xl md:text-2xl font-bold ring-4 ring-slate-100 flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base md:text-lg font-bold text-[#0F2942] truncate">{user?.fullName || t("common.loading")}</h4>
          <p className="text-sm text-slate-500 mb-2 md:mb-3">{user?.role ? t(`roles.${user.role === 'senior_lawyer' ? 'seniorLawyer' : user.role}`) : t("settings.userLabel")}</p>
          <button className="text-xs font-bold text-[#D97706] border border-[#D97706] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap">
            {t("settings.changeAvatar")}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FormField label={t("auth.fullName")} defaultValue={user?.fullName || ""} />
          <FormField label={t("auth.emailAddress")} type="email" defaultValue={user?.email || ""} disabled />
          <FormField label={t("auth.role")} defaultValue={user?.role || ""} disabled />
          <FormField label={t("auth.email")} type="tel" defaultValue={user?.phone || ""} />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h5 className="font-bold text-[#0F2942] mb-4">{t("settings.regionalSettings")}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label>{t("settings.language")}</Label>
              <Select className="h-11 bg-[var(--color-surface-bg)]">
                <option value="en">English</option>
                <option value="ar">Arabic (العربية)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.timezone")}</Label>
              <Select className="h-11 bg-[var(--color-surface-bg)]">
                <option>Riyadh (GMT+3)</option>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =============================================================================
   ORGANIZATION TAB
   ============================================================================= */

function OrganizationTab({ t, isRTL, teamData }: { t: (key: string) => string; isRTL: boolean; teamData?: { members: any[]; total: number; organization?: { id: number; name: string; isPersonal: boolean; contactInfo?: string | null } } }) {
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

  const org = teamData?.organization;
  const members = teamData?.members || [];
  const isPersonalWorkspace = Boolean(org?.isPersonal);

  return (
    <div className="space-y-6">
      <div className="bg-[#0F2942] rounded-2xl p-4 md:p-6 text-white shadow-lg">
        <h4 className="text-lg md:text-xl font-bold">{org?.name || t("settings.organization")}</h4>
        <p className="text-slate-200 text-xs md:text-sm mt-1">
          {isPersonalWorkspace ? t("settings.personalWorkspace") : t("settings.teamWorkspace")} • {members.length} {t("settings.members")}
        </p>
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
            <Plus size={14} className="mr-2" />
            {inviteMember.isPending ? t("common.inviting") : t("settings.inviteMember")}
          </Button>
          {lastCode && (
            <p className="text-xs text-slate-600">
              {t("settings.invitationCodeLabel")} <code className="bg-slate-100 px-1 py-0.5 rounded">{lastCode}</code>
            </p>
          )}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   NOTIFICATIONS TAB
   ============================================================================= */

function NotificationsTab({ t, isRTL }: { t: (key: string) => string; isRTL: boolean }) {
  const { data: prefs, isLoading } = useNotificationSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateNotificationSettings();
  const [localPrefs, setLocalPrefs] = React.useState<Record<string, any>>({});
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync local state when server data loads
  React.useEffect(() => {
    if (prefs) {
      setLocalPrefs({
        emailAlerts: prefs.emailAlerts,
        pushNotifications: prefs.pushNotifications,
        aiSuggestions: prefs.aiSuggestions,
        regulationUpdates: prefs.regulationUpdates,
        caseUpdates: prefs.caseUpdates,
        systemAlerts: prefs.systemAlerts,
        quietHoursEnabled: prefs.quietHoursEnabled,
        quietHoursStart: prefs.quietHoursStart,
        quietHoursEnd: prefs.quietHoursEnd,
        digestEnabled: prefs.digestEnabled,
        digestFrequency: prefs.digestFrequency,
      });
    }
  }, [prefs]);

  const toggleLocal = (key: string) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setLocal = (key: string, value: any) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setFeedback(null);
    updateSettings(localPrefs, {
      onSuccess: () => {
        setFeedback({ type: "success", message: t("settings.settingsSaved") });
        setTimeout(() => setFeedback(null), 3000);
      },
      onError: () => {
        setFeedback({ type: "error", message: t("settings.settingsError") });
        setTimeout(() => setFeedback(null), 4000);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#D97706] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "p-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          {feedback.type === "success" ? <CheckCircle size={16} /> : <Bell size={16} />}
          {feedback.message}
        </div>
      )}

      {/* 1. Notification Channels */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="mb-4">
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <Mail size={20} className="text-[#D97706]" />
            {t("settings.notifChannels")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.notifChannelsDesc")}</p>
        </div>
        <NotificationToggle
          title={t("settings.emailAlertsTitle")}
          description={t("settings.emailAlertsDesc")}
          checked={localPrefs.emailAlerts ?? true}
          onToggle={() => toggleLocal("emailAlerts")}
          isRTL={isRTL}
        />
        <NotificationToggle
          title={t("settings.pushNotificationsTitle")}
          description={t("settings.pushNotificationsDesc")}
          checked={localPrefs.pushNotifications ?? true}
          onToggle={() => toggleLocal("pushNotifications")}
          isRTL={isRTL}
        />
      </div>

      {/* 2. Notification Categories */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="mb-4">
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <Bell size={20} className="text-[#D97706]" />
            {t("settings.notifCategories")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.notifCategoriesDesc")}</p>
        </div>
        <NotificationToggle
          title={t("settings.aiRecommendations")}
          description={t("settings.aiRecommendationsDesc")}
          checked={localPrefs.aiSuggestions ?? true}
          onToggle={() => toggleLocal("aiSuggestions")}
          isRTL={isRTL}
        />
        <NotificationToggle
          title={t("settings.regulationUpdates")}
          description={t("settings.regulationUpdatesDesc")}
          checked={localPrefs.regulationUpdates ?? true}
          onToggle={() => toggleLocal("regulationUpdates")}
          isRTL={isRTL}
        />
        <NotificationToggle
          title={t("settings.caseUpdates")}
          description={t("settings.caseUpdatesDesc")}
          checked={localPrefs.caseUpdates ?? true}
          onToggle={() => toggleLocal("caseUpdates")}
          isRTL={isRTL}
        />
        <NotificationToggle
          title={t("settings.systemAlerts")}
          description={t("settings.systemAlertsDesc")}
          checked={localPrefs.systemAlerts ?? true}
          onToggle={() => toggleLocal("systemAlerts")}
          isRTL={isRTL}
        />
      </div>

      {/* 3. Quiet Hours */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <Moon size={20} className="text-[#D97706]" />
            {t("settings.quietHours")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.quietHoursDesc")}</p>
        </div>
        <NotificationToggle
          title={t("settings.quietHoursEnabled")}
          description=""
          checked={localPrefs.quietHoursEnabled ?? false}
          onToggle={() => toggleLocal("quietHoursEnabled")}
          isRTL={isRTL}
        />
        {localPrefs.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2 pl-2 animate-in fade-in duration-200">
            <div className="space-y-2">
              <Label>{t("settings.quietHoursStart")}</Label>
              <Input
                type="time"
                value={localPrefs.quietHoursStart || "22:00"}
                onChange={(e) => setLocal("quietHoursStart", e.target.value)}
                className="h-11 bg-[var(--color-surface-bg)]"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.quietHoursEnd")}</Label>
              <Input
                type="time"
                value={localPrefs.quietHoursEnd || "07:00"}
                onChange={(e) => setLocal("quietHoursEnd", e.target.value)}
                className="h-11 bg-[var(--color-surface-bg)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Digest Settings */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <SettingsIcon size={20} className="text-[#D97706]" />
            {t("settings.digestSettings")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.digestSettingsDesc")}</p>
        </div>
        <NotificationToggle
          title={t("settings.digestEnabled")}
          description=""
          checked={localPrefs.digestEnabled ?? false}
          onToggle={() => toggleLocal("digestEnabled")}
          isRTL={isRTL}
        />
        {localPrefs.digestEnabled && (
          <div className="pt-2 pl-2 animate-in fade-in duration-200">
            <Label className="mb-2 block">{t("settings.digestFrequency")}</Label>
            <div className="flex gap-3">
              {(["daily", "weekly"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setLocal("digestFrequency", freq)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    localPrefs.digestFrequency === freq
                      ? "bg-[#0F2942] text-white border-[#0F2942] shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#D97706] hover:text-[#D97706]"
                  )}
                >
                  {t(`settings.digest${freq.charAt(0).toUpperCase() + freq.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#0F2942] hover:bg-[#1E3A56] px-8 py-3 text-sm font-bold"
        >
          {isSaving ? t("settings.saving") : t("settings.saveNotificationSettings")}
        </Button>
      </div>
    </div>
  );
}

/* =============================================================================
   SECURITY TAB
   ============================================================================= */

function SecurityTab({ t, isRTL }: { t: (key: string) => string; isRTL: boolean }) {
  const { data: activityData, isLoading: activityLoading } = useLoginActivity(10);
  const { mutate: changePassword, isPending: isChanging } = useChangePassword();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password strength calculator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: t("settings.passwordWeak"), color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: t("settings.passwordFair"), color: "bg-orange-400" };
    if (score <= 3) return { level: 3, label: t("settings.passwordGood"), color: "bg-yellow-400" };
    return { level: 4, label: t("settings.passwordStrong"), color: "bg-green-500" };
  };

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword === "" || newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword && !isChanging;

  const handleChangePassword = () => {
    setFeedback(null);
    changePassword(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: t("settings.passwordUpdated") });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => setFeedback(null), 3000);
        },
        onError: () => {
          setFeedback({ type: "error", message: t("settings.passwordError") });
          setTimeout(() => setFeedback(null), 4000);
        },
      }
    );
  };

  // Format relative time
  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return t("settings.now");
    if (diffHrs < 24) return `${diffHrs} ${t("settings.hoursAgo")}`;
    if (diffHrs < 48) return t("settings.yesterday");
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "p-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          {feedback.type === "success" ? <CheckCircle size={16} /> : <Shield size={16} />}
          {feedback.message}
        </div>
      )}

      {/* 2FA Status */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="bg-green-100 p-2 rounded-lg text-green-700">
            <Shield size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-[#0F2942] text-sm md:text-base">{t("settings.strongSecurity")}</h5>
            <p className="text-xs md:text-sm text-slate-500">{t("settings.strongSecurityDesc")}</p>
          </div>
          <button className={`${isRTL ? 'ml-auto sm:mr-auto' : 'mr-auto sm:ml-auto'} text-xs font-bold text-[#D97706] border border-[#D97706] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap`}>
            {t("settings.configure2FA")}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <Lock size={20} className="text-[#D97706]" />
            {t("settings.changePassword")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.changePasswordDesc")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            type="password"
            placeholder={t("settings.currentPassword")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-11 bg-[var(--color-surface-bg)]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={t("settings.newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 bg-[var(--color-surface-bg)]"
              />
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="text-xs text-red-500">{t("settings.passwordMinLength")}</p>
              )}
              {/* Strength Meter */}
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          i <= strength.level ? strength.color : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("text-xs font-medium", strength.level <= 1 ? "text-red-500" : strength.level <= 2 ? "text-orange-500" : strength.level <= 3 ? "text-yellow-600" : "text-green-600")}>
                    {t("settings.passwordStrength")}: {strength.label}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={t("auth.confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!passwordsMatch}
                className={cn(
                  "h-11 bg-[var(--color-surface-bg)]"
                )}
              />
              {!passwordsMatch && (
                <p className="text-xs text-red-500">{t("settings.passwordsDoNotMatch")}</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={!canSubmit}
            className="w-full sm:w-fit bg-[#0F2942] hover:bg-[#1E3A56] disabled:opacity-50"
          >
            {isChanging ? t("settings.updatingPassword") : t("settings.updatePassword")}
          </Button>
        </div>
      </div>

      {/* Login Activity */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-5">
          <h5 className="font-bold text-[#0F2942] text-lg flex items-center gap-2">
            <Smartphone size={20} className="text-[#D97706]" />
            {t("settings.loginActivity")}
          </h5>
          <p className="text-sm text-slate-500 mt-1">{t("settings.loginActivityDesc")}</p>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-[#D97706] rounded-full animate-spin" />
          </div>
        ) : activityData?.activity && activityData.activity.length > 0 ? (
          <div className="space-y-3">
            {activityData.activity.map((log, idx) => (
              <div key={log.id} className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-2 text-sm p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-600 flex-shrink-0">
                    {log.device?.toLowerCase().includes("iphone") || log.device?.toLowerCase().includes("android") ? <Smartphone size={14} /> : <Zap size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0F2942] text-sm">{log.device}{log.browser ? ` - ${log.browser}` : ""}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {log.location || "Unknown"} • {log.ip}
                    </p>
                  </div>
                </div>
                <span className={cn("text-xs font-bold whitespace-nowrap", idx === 0 ? "text-green-600" : "text-slate-400")}>
                  {formatTime(log.loginAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">{t("settings.noLoginActivity")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
   INTEGRATIONS TAB
   ============================================================================= */

function IntegrationsTab({ t }: { t: (key: string) => string }) {
  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h5 className="font-bold text-[#0F2942] text-base md:text-lg">{t("settings.connectedApps")}</h5>
          <p className="text-xs md:text-sm text-slate-500 mt-1">{t("settings.connectedAppsDesc")}</p>
        </div>
        <Button className="bg-[#D97706] hover:bg-[#B45309] w-full sm:w-auto">
          {t("settings.browseMarketplace")}
        </Button>
      </div>

      <div className="space-y-4">
        <IntegrationCard
          icon={<Scale className="text-[#0F2942]" size={24} />}
          name={t("settings.mojNajiz")}
          description={t("settings.mojNajizDesc")}
          connected
          connectedLabel={t("settings.connected")}
          connectLabel={t("common.connect")}
        />
        <IntegrationCard
          icon={<Mail className="text-slate-700" size={24} />}
          name={t("settings.outlookCalendar")}
          description={t("settings.outlookCalendarDesc")}
          iconBg="bg-slate-100 border-slate-200"
          connectedLabel={t("settings.connected")}
          connectLabel={t("common.connect")}
        />
        <IntegrationCard
          icon={<UploadCloud className="text-yellow-600" size={24} />}
          name={t("settings.cloudStorage")}
          description={t("settings.cloudStorageDesc")}
          iconBg="bg-yellow-50 border-yellow-100"
          hasToggle
          connectedLabel={t("settings.connected")}
          connectLabel={t("common.connect")}
        />
      </div>
    </div>
  );
}

/* =============================================================================
   AI SETTINGS TAB
   ============================================================================= */

function AISettingsTab({ t, isRTL }: { t: (key: string) => string; isRTL: boolean }) {
  const { data: settings, isLoading, isError } = useAISettings();
  const { mutate: updateSettings, isPending } = useUpdateAISettings();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  type NumericSettingKey =
    | "semanticWeight"
    | "supportWeight"
    | "lexicalWeight"
    | "categoryWeight"
    | "minFinalScore"
    | "minPairScore";

  type BooleanSettingKey =
    | "llmVerificationEnabled"
    | "crossEncoderEnabled"
    | "hydeEnabled"
    | "colbertEnabled"
    | "agenticRetrievalEnabled";

  const [draft, setDraft] = React.useState<Partial<Record<NumericSettingKey, number>>>({});
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (settings) setDraft({});
  }, [settings]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleToggle = (key: BooleanSettingKey, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleNumber = (key: keyof AISettings, value: number | string) => {
    updateSettings({ [key]: value });
  };

  const handleSlider = (key: NumericSettingKey, rawValue: string) => {
    const num = parseFloat(rawValue);
    if (isNaN(num) || num < 0 || num > 1) return;
    const rounded = Math.round(num * 100) / 100;
    setDraft((prev) => ({ ...prev, [key]: rounded }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSettings({ [key]: rounded });
    }, 400);
  };

  const val = (key: NumericSettingKey, fallback: number): number => {
    if (draft[key] !== undefined) return draft[key] as number;
    if (settings && typeof settings[key] === "number") return settings[key] as number;
    return fallback;
  };

  const applyFlowPreset = (preset: "fast" | "balanced" | "strict") => {
    if (preset === "fast") {
      updateSettings({
        llmVerificationEnabled: false,
        crossEncoderEnabled: false,
        hydeEnabled: false,
        colbertEnabled: false,
        agenticRetrievalEnabled: false,
        minFinalScore: 0.35,
        minPairScore: 0.3,
      });
      return;
    }

    if (preset === "balanced") {
      updateSettings({
        llmVerificationEnabled: true,
        crossEncoderEnabled: true,
        hydeEnabled: false,
        colbertEnabled: false,
        agenticRetrievalEnabled: false,
        minFinalScore: 0.45,
        minPairScore: 0.4,
      });
      return;
    }

    updateSettings({
      llmVerificationEnabled: true,
      crossEncoderEnabled: true,
      hydeEnabled: true,
      colbertEnabled: true,
      agenticRetrievalEnabled: true,
      minFinalScore: 0.6,
      minPairScore: 0.55,
    });
  };

  const applyStrictness = (level: "broad" | "standard" | "focused") => {
    if (level === "broad") {
      updateSettings({ minFinalScore: 0.35, minPairScore: 0.3 });
      return;
    }
    if (level === "standard") {
      updateSettings({ minFinalScore: 0.45, minPairScore: 0.4 });
      return;
    }
    updateSettings({ minFinalScore: 0.6, minPairScore: 0.55 });
  };

  const currentStrictness: "broad" | "standard" | "focused" =
    val("minFinalScore", 0.45) >= 0.56 || val("minPairScore", 0.4) >= 0.51
      ? "focused"
      : val("minFinalScore", 0.45) <= 0.38 || val("minPairScore", 0.4) <= 0.33
        ? "broad"
        : "standard";

  const handleResetDefaults = () => {
    updateSettings({
      llmVerificationEnabled: false,
      crossEncoderEnabled: false,
      hydeEnabled: false,
      colbertEnabled: false,
      agenticRetrievalEnabled: false,
      semanticWeight: 0.55,
      supportWeight: 0.20,
      lexicalWeight: 0.15,
      categoryWeight: 0.10,
      minFinalScore: 0.45,
      minPairScore: 0.40,
      geminiModel: "gemini-2.0-flash",
      crossEncoderTopN: 15,
      colbertTopN: 15,
      geminiTopNCandidates: 15,
      agenticMaxRounds: 2,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{t("settings.aiSettingsError") || "Failed to load AI settings. Please try again."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-500 hover:text-red-700 underline"
        >
          {t("common.retry") || "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-[#D97706]">
          <div className="w-3 h-3 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
          {t("settings.saving") || "Saving..."}
        </div>
      )}

      {/* Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-slate-900">{t("settings.aiPipelineFeatures")}</h4>
          <p className="text-sm text-slate-500 mt-1">{t("settings.aiPipelineFeaturesDesc")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PresetButton
            title={isRTL ? "سريع" : "Fast"}
            description={isRTL ? "نتائج أسرع بمراجعة أقل" : "Faster results with lighter checks"}
            onClick={() => applyFlowPreset("fast")}
            active={
              !settings?.llmVerificationEnabled &&
              !settings?.crossEncoderEnabled &&
              !settings?.hydeEnabled &&
              !settings?.colbertEnabled &&
              !settings?.agenticRetrievalEnabled
            }
          />
          <PresetButton
            title={isRTL ? "متوازن" : "Balanced"}
            description={isRTL ? "أفضل خيار يومي" : "Best default for daily legal work"}
            onClick={() => applyFlowPreset("balanced")}
            active={
              !!settings?.llmVerificationEnabled &&
              !!settings?.crossEncoderEnabled &&
              !settings?.hydeEnabled &&
              !settings?.colbertEnabled &&
              !settings?.agenticRetrievalEnabled
            }
            recommended={t("settings.recommended")}
          />
          <PresetButton
            title={isRTL ? "دقيق" : "Strict"}
            description={isRTL ? "دقة أعلى على حساب السرعة" : "Higher precision with slower processing"}
            onClick={() => applyFlowPreset("strict")}
            active={
              !!settings?.llmVerificationEnabled &&
              !!settings?.crossEncoderEnabled &&
              !!settings?.hydeEnabled &&
              !!settings?.colbertEnabled &&
              !!settings?.agenticRetrievalEnabled
            }
          />
        </div>
      </div>

      {/* Core toggles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-slate-900">{isRTL ? "خيارات الجودة الأساسية" : "Core Quality Controls"}</h4>
          <p className="text-sm text-slate-500 mt-1">{isRTL ? "اختر ما تريد تفعيله في اقتراحات الأنظمة." : "Choose the checks you want in regulation suggestions."}</p>
        </div>
        <div className="space-y-2">
          <FeatureToggleCard
            label={t("settings.llmVerification")}
            description={t("settings.llmVerificationDesc")}
            checked={settings?.llmVerificationEnabled ?? false}
            onChange={(v) => handleToggle("llmVerificationEnabled", v)}
            isRTL={isRTL}
          />
          <FeatureToggleCard
            label={t("settings.crossEncoder")}
            description={t("settings.crossEncoderDesc")}
            checked={settings?.crossEncoderEnabled ?? false}
            onChange={(v) => handleToggle("crossEncoderEnabled", v)}
            isRTL={isRTL}
          />
          <FeatureToggleCard
            label={t("settings.agenticRetrieval")}
            description={t("settings.agenticRetrievalDesc")}
            checked={settings?.agenticRetrievalEnabled ?? false}
            onChange={(v) => handleToggle("agenticRetrievalEnabled", v)}
            isRTL={isRTL}
          />
        </div>
      </div>

      {/* Strictness selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-slate-900">{t("settings.thresholds")}</h4>
          <p className="text-sm text-slate-500 mt-1">{t("settings.thresholdsDesc")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PresetButton
            title={isRTL ? "شامل" : "Broad"}
            description={isRTL ? "نتائج أكثر" : "More results"}
            onClick={() => applyStrictness("broad")}
            active={currentStrictness === "broad"}
          />
          <PresetButton
            title={isRTL ? "قياسي" : "Standard"}
            description={isRTL ? "توازن بين الشمول والدقة" : "Balanced relevance and coverage"}
            onClick={() => applyStrictness("standard")}
            active={currentStrictness === "standard"}
            recommended={t("settings.recommended")}
          />
          <PresetButton
            title={isRTL ? "مركز" : "Focused"}
            description={isRTL ? "نتائج أدق وأقل" : "Fewer but stricter matches"}
            onClick={() => applyStrictness("focused")}
            active={currentStrictness === "focused"}
          />
        </div>
      </div>

      {/* Match factors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-slate-900">{t("settings.scoringWeights")}</h4>
          <p className="text-sm text-slate-500 mt-1">{t("settings.scoringWeightsDesc")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <WeightSlider
            label={t("settings.semanticWeight")}
            value={val("semanticWeight", 0.55)}
            onChange={(v) => handleSlider("semanticWeight", v)}
            color="bg-orange-500"
            isRTL={isRTL}
          />
          <WeightSlider
            label={t("settings.supportWeight")}
            value={val("supportWeight", 0.20)}
            onChange={(v) => handleSlider("supportWeight", v)}
            color="bg-emerald-500"
            isRTL={isRTL}
          />
          <WeightSlider
            label={t("settings.lexicalWeight")}
            value={val("lexicalWeight", 0.15)}
            onChange={(v) => handleSlider("lexicalWeight", v)}
            color="bg-violet-500"
            isRTL={isRTL}
          />
          <WeightSlider
            label={t("settings.categoryWeight")}
            value={val("categoryWeight", 0.10)}
            onChange={(v) => handleSlider("categoryWeight", v)}
            color="bg-amber-500"
            isRTL={isRTL}
          />
        </div>

        {/* Weight sum indicator */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <WeightSumBar
            t={t}
            semantic={val("semanticWeight", 0.55)}
            support={val("supportWeight", 0.20)}
            lexical={val("lexicalWeight", 0.15)}
            category={val("categoryWeight", 0.10)}
            isRTL={isRTL}
          />
        </div>
      </div>

      {/* Advanced Tuning — only show controls relevant to enabled features */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
          <h4 className="text-lg font-bold text-slate-900">{t("settings.advancedTuning")}</h4>
            <p className="text-sm text-slate-500 mt-1">{t("settings.advancedTuningDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {showAdvanced
              ? isRTL
                ? "إخفاء الخيارات"
                : "Hide options"
              : isRTL
                ? "إظهار الخيارات"
                : "Show options"}
          </button>
        </div>
        {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureToggleCard
            label={t("settings.hyde")}
            description={t("settings.hydeDesc")}
            checked={settings?.hydeEnabled ?? false}
            onChange={(v) => handleToggle("hydeEnabled", v)}
            compact
            isRTL={isRTL}
          />
          <FeatureToggleCard
            label={t("settings.colbert")}
            description={t("settings.colbertDesc")}
            checked={settings?.colbertEnabled ?? false}
            onChange={(v) => handleToggle("colbertEnabled", v)}
            badge={t("settings.experimental")}
            compact
            isRTL={isRTL}
          />

          {/* Gemini model — show when LLM verification or HyDE or agentic is on */}
          {(settings?.llmVerificationEnabled || settings?.hydeEnabled || settings?.agenticRetrievalEnabled) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("settings.geminiModel")}
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                value={settings?.geminiModel ?? "gemini-2.0-flash"}
                onChange={(e) => updateSettings({ geminiModel: e.target.value })}
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
          )}

          {/* Gemini top N — show when LLM verification is on */}
          {settings?.llmVerificationEnabled && (
            <NumberInput
              label={t("settings.geminiTopNCandidates")}
              value={settings?.geminiTopNCandidates ?? 15}
              min={1}
              max={100}
              onChange={(v) => handleNumber("geminiTopNCandidates", v)}
            />
          )}

          {/* Cross-encoder top N — show when cross-encoder is on */}
          {settings?.crossEncoderEnabled && (
            <NumberInput
              label={t("settings.crossEncoderTopN")}
              value={settings?.crossEncoderTopN ?? 15}
              min={1}
              max={100}
              onChange={(v) => handleNumber("crossEncoderTopN", v)}
            />
          )}

          {/* ColBERT top N — show when ColBERT is on */}
          {settings?.colbertEnabled && (
            <NumberInput
              label={t("settings.colbertTopN")}
              value={settings?.colbertTopN ?? 15}
              min={1}
              max={100}
              onChange={(v) => handleNumber("colbertTopN", v)}
            />
          )}

          {/* Agentic max rounds — show when agentic is on */}
          {settings?.agenticRetrievalEnabled && (
            <NumberInput
              label={t("settings.agenticMaxRounds")}
              value={settings?.agenticMaxRounds ?? 2}
              min={1}
              max={10}
              onChange={(v) => handleNumber("agenticMaxRounds", v)}
            />
          )}

          {/* Hint when nothing is enabled */}
          {!settings?.llmVerificationEnabled && !settings?.crossEncoderEnabled &&
           !settings?.hydeEnabled && !settings?.colbertEnabled && !settings?.agenticRetrievalEnabled && (
            <p className="col-span-full text-sm text-slate-400 italic py-2">
              {t("settings.enableFeatureHint") || "Enable a pipeline feature above to see its tuning options."}
            </p>
          )}
        </div>
        )}
      </div>

      {/* Reset to Defaults */}
      <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors underline underline-offset-2"
        >
          {t("settings.resetDefaults") || "Reset to defaults"}
        </button>
      </div>
    </div>
  );
}

/* -- AI Settings helper components -- */

function PresetButton({
  title,
  description,
  onClick,
  active,
  recommended,
}: {
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
  recommended?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2",
        active
          ? "border-[#D97706] bg-[#D97706] text-white shadow-md"
          : "border-slate-200 bg-white hover:border-[#D97706] hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-bold text-sm">{title}</span>
        {recommended && (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
            )}
          >
            {recommended}
          </span>
        )}
      </div>
      <p className={cn("text-xs", active ? "text-white/80" : "text-slate-500")}>{description}</p>
    </button>
  );
}

function FeatureToggleCard({
  label,
  description,
  checked,
  onChange,
  badge,
  compact,
  isRTL,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  badge?: string;
  compact?: boolean;
  isRTL?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        compact ? "p-3" : "p-3.5",
        checked ? "border-[#D97706]/40 bg-orange-50/60" : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{label}</span>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2",
            checked ? "bg-[#D97706]" : "bg-slate-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
              checked
                ? isRTL
                  ? "-translate-x-5"
                  : "translate-x-5"
                : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function WeightSlider({
  label,
  value,
  onChange,
  color = "bg-orange-500",
  isRTL,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  color?: string;
  isRTL?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-sm font-mono font-bold text-slate-900">
          {value.toFixed(2)}
        </span>
      </div>
      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-150", color)}
          style={isRTL ? { width: `${value * 100}%`, left: "auto", right: 0 } : { width: `${value * 100}%` }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ accentColor: "#D97706" }}
        className="w-full h-2 mt-[-8px] relative z-10 cursor-pointer appearance-none bg-transparent focus-visible:outline-none focus-visible:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97706] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#D97706]"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
      />
    </div>
  );
}

function WeightSumBar({
  t,
  semantic,
  support,
  lexical,
  category,
  isRTL,
}: {
  t: (key: string) => string;
  semantic: number;
  support: number;
  lexical: number;
  category: number;
  isRTL?: boolean;
}) {
  const total = semantic + support + lexical + category;
  const isBalanced = Math.abs(total - 1.0) < 0.01;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{t("settings.weightDistribution")}</span>
        <span
          className={cn(
            "text-xs font-bold",
            isBalanced ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {(total * 100).toFixed(0)}% {isBalanced ? "\u2713" : "(auto-normalized)"}
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
        <div
          className="bg-orange-500 transition-all duration-300"
          style={{ width: `${(semantic / Math.max(total, 0.01)) * 100}%` }}
          title={`${t("settings.semanticWeight")}: ${(semantic * 100).toFixed(0)}%`}
        />
        <div
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${(support / Math.max(total, 0.01)) * 100}%` }}
          title={`${t("settings.supportWeight")}: ${(support * 100).toFixed(0)}%`}
        />
        <div
          className="bg-violet-500 transition-all duration-300"
          style={{ width: `${(lexical / Math.max(total, 0.01)) * 100}%` }}
          title={`${t("settings.lexicalWeight")}: ${(lexical * 100).toFixed(0)}%`}
        />
        <div
          className="bg-amber-500 transition-all duration-300"
          style={{ width: `${(category / Math.max(total, 0.01)) * 100}%` }}
          title={`${t("settings.categoryWeight")}: ${(category * 100).toFixed(0)}%`}
        />
      </div>
      <div className={cn("flex gap-4 mt-2", isRTL ? "flex-row-reverse" : "") }>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> {t("settings.semanticWeight")}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("settings.supportWeight")}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-violet-500" /> {t("settings.lexicalWeight")}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> {t("settings.categoryWeight")}
        </span>
      </div>
    </div>
  );
}

/* =============================================================================
   BILLING TAB — [HIDDEN FOR GRADUATION PRESENTATION] re-enable when payment is ready
   =============================================================================

function BillingTab({ t, isRTL, billingData }: { t: (key: string) => string; isRTL: boolean; billingData?: any }) {
  // ... full billing tab implementation ...
}

*/

/* =============================================================================
   HELPER COMPONENTS
   ============================================================================= */

function FormField({ label, type = "text", defaultValue, disabled }: { label: string; type?: string; defaultValue: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="h-11 bg-[var(--color-surface-bg)]"
      />
    </div>
  );
}

function StatBox({ title, value, max, progress, color }: { title: string; value: string; max: string; progress: number; color: "orange" | "green" }) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200">
      <h5 className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">{title}</h5>
      <div className="flex items-end gap-1 md:gap-2 mt-2">
        <span className="text-xl md:text-2xl font-bold text-[#0F2942]">{value}</span>
        <span className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">/ {max}</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full mt-2 overflow-hidden">
        <div className={cn("h-full", color === "orange" ? "bg-[#D97706]" : "bg-green-500")} style={{ width: `${progress}%` }} />
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

function NotificationToggle({
  title,
  description,
  checked,
  onToggle,
  isRTL,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  isRTL?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="min-w-0">
        <h5 className="font-bold text-[#0F2942] text-base md:text-lg">{title}</h5>
        {description && <p className="text-xs md:text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-[#D97706]" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
          checked
            ? isRTL
              ? "-translate-x-7"
              : "translate-x-7"
            : "translate-x-1"
        )} />
      </button>
    </div>
  );
}

function IntegrationCard({ icon, name, description, iconBg = "bg-white border-slate-200", connected = false, hasToggle = false, connectedLabel, connectLabel }: {
  icon: React.ReactNode;
  name: string;
  description: string;
  iconBg?: string;
  connected?: boolean;
  hasToggle?: boolean;
  connectedLabel?: string;
  connectLabel?: string;
}) {
  const [enabled, setEnabled] = React.useState(false);
  const { isRTL } = useI18n();
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border rounded-xl",
      connected ? "border-green-200 bg-green-50/50" : "border-slate-200 bg-white"
    )}>
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-lg border flex items-center justify-center p-2 flex-shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <h6 className="font-bold text-[#0F2942] text-sm md:text-base truncate">{name}</h6>
          <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        </div>
      </div>
      {connected ? (
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            <CheckCircle size={10} /> {connectedLabel || "Connected"}
          </span>
          <button className="text-slate-400 hover:text-slate-600">
            <SettingsIcon size={16} />
          </button>
        </div>
      ) : hasToggle ? (
        <button
          onClick={() => setEnabled(!enabled)}
          role="switch"
          aria-checked={enabled}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors self-end sm:self-auto",
            enabled ? "bg-[#D97706]" : "bg-slate-300"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
            enabled
              ? isRTL
                ? "-translate-x-7"
                : "translate-x-7"
              : "translate-x-1"
          )} />
        </button>
      ) : (
        <Button variant="outline" size="sm" className="w-full sm:w-auto self-end sm:self-auto">
          {connectLabel || "Connect"}
        </Button>
      )}
    </div>
  );
}
