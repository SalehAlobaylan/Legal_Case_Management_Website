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
  CreditCard,
  CheckCircle,
  Plus,
  MoreVertical,
  RefreshCw,
  Smartphone,
  MapPin,
  Zap,
  Shield,
  Mail,
  Scale,
  UploadCloud,
  Download,
  Settings as SettingsIcon,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useBillingInfo, useSubscribeToPlan, useCancelSubscription, useDownloadInvoicePDF } from "@/lib/hooks/use-billing";
import { useUpdateProfile } from "@/lib/hooks/use-profile";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/lib/hooks/use-notification-settings";
import { useLoginActivity, useChangePassword } from "@/lib/hooks/use-security-settings";

type TabId = "profile" | "org" | "notifications" | "security" | "integrations" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("profile");
  const [role, setRole] = React.useState<"Admin" | "Lawyer">("Admin");
  const { user } = useAuthStore();
  const { t, isRTL } = useI18n();

  const { data: teamData } = useTeamMembers();
  const { data: billingData } = useBillingInfo();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const TABS = [
    { id: "profile" as TabId, label: t("settings.myProfile"), icon: <User size={18} /> },
    { id: "org" as TabId, label: t("settings.organization"), icon: <Building size={18} />, adminOnly: true },
    { id: "notifications" as TabId, label: t("settings.notifications"), icon: <Bell size={18} /> },
    { id: "security" as TabId, label: t("settings.security"), icon: <Lock size={18} /> },
    { id: "integrations" as TabId, label: t("settings.integrations"), icon: <LinkIcon size={18} /> },
    { id: "billing" as TabId, label: t("settings.billing"), icon: <CreditCard size={18} />, adminOnly: true },
  ];

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || role === "Admin");

  return (
    <div className={`flex flex-col md:flex-row overflow-hidden ${isRTL ? 'md:flex-row-reverse' : ''}`}>
      {/* Mobile Tab Selector */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabId)}
          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50 font-medium text-[#0F2942]"
        >
          {visibleTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
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

        {/* RBAC Simulator */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              {t("settings.rbacSimulator")}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">{t("settings.currentRole")}:</span>
              <button
                onClick={() => setRole(role === "Admin" ? "Lawyer" : "Admin")}
                className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={10} /> {role}
              </button>
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
          {activeTab === "notifications" && <NotificationsTab t={t} />}
          {activeTab === "security" && <SecurityTab t={t} isRTL={isRTL} />}
          {activeTab === "integrations" && <IntegrationsTab t={t} />}
          {activeTab === "billing" && <BillingTab t={t} isRTL={isRTL} billingData={billingData} />}
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
          <h4 className="text-base md:text-lg font-bold text-[#0F2942] truncate">{user?.fullName || "Loading..."}</h4>
          <p className="text-sm text-slate-500 mb-2 md:mb-3">{user?.role || "User"}</p>
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
              <label className="text-sm font-bold text-slate-700">{t("settings.language")}</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50">
                <option value="en">English</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("settings.timezone")}</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50">
                <option>Riyadh (GMT+3)</option>
              </select>
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

function OrganizationTab({ t, isRTL, teamData }: { t: (key: string) => string; isRTL: boolean; teamData?: { members: any[]; total: number } }) {
  return (
    <div className="space-y-6">
      {/* Org Header */}
      <div className="bg-[#0F2942] rounded-2xl p-4 md:p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-lg md:text-xl font-bold">Al-Faisal Law Firm</h4>
          <p className="text-blue-200 text-xs md:text-sm mt-1">
            {t("settings.licenseNo")}: <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">LC-99283</span> • {t("settings.validUntil")}
          </p>
        </div>
        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
          {t("settings.activeLicense")}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <StatBox title={t("settings.storageUsed")} value="4.2 GB" max="10 GB" progress={42} color="orange" />
        <StatBox title={t("settings.activeCases")} value="24" max={t("settings.unlimited")} progress={100} color="green" />
      </div>

      {/* Team Members Table - Mobile Responsive */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-[#0F2942]">{t("settings.teamMembers")}</h4>
          <button className="text-xs font-bold bg-[#D97706] text-white px-3 py-2 rounded-lg hover:bg-[#B45309] transition-colors flex items-center gap-2">
            <Plus size={14} /> <span className="hidden sm:inline">{t("settings.inviteMember")}</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">{t("settings.name")}</th>
                <th className="px-6 py-4 font-bold">{t("settings.role")}</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className={`px-6 py-4 font-bold ${isRTL ? 'text-left' : 'text-right'}`}>{t("settings.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamData?.members.map((member: any) => (
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
                  <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <button className="text-slate-400 hover:text-[#0F2942]">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {teamData?.members.map((member: any) => (
            <div key={member.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-[#0F2942]">{member.fullName}</div>
                  <div className="text-xs text-slate-400">{member.email}</div>
                </div>
                <button className="text-slate-400 hover:text-[#0F2942]">
                  <MoreVertical size={16} />
                </button>
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

function NotificationsTab({ t }: { t: (key: string) => string }) {
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
        />
        <NotificationToggle
          title={t("settings.pushNotificationsTitle")}
          description={t("settings.pushNotificationsDesc")}
          checked={localPrefs.pushNotifications ?? true}
          onToggle={() => toggleLocal("pushNotifications")}
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
        />
        <NotificationToggle
          title={t("settings.regulationUpdates")}
          description={t("settings.regulationUpdatesDesc")}
          checked={localPrefs.regulationUpdates ?? true}
          onToggle={() => toggleLocal("regulationUpdates")}
        />
        <NotificationToggle
          title={t("settings.caseUpdates")}
          description={t("settings.caseUpdatesDesc")}
          checked={localPrefs.caseUpdates ?? true}
          onToggle={() => toggleLocal("caseUpdates")}
        />
        <NotificationToggle
          title={t("settings.systemAlerts")}
          description={t("settings.systemAlertsDesc")}
          checked={localPrefs.systemAlerts ?? true}
          onToggle={() => toggleLocal("systemAlerts")}
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
        />
        {localPrefs.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2 pl-2 animate-in fade-in duration-200">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("settings.quietHoursStart")}</label>
              <input
                type="time"
                value={localPrefs.quietHoursStart || "22:00"}
                onChange={(e) => setLocal("quietHoursStart", e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("settings.quietHoursEnd")}</label>
              <input
                type="time"
                value={localPrefs.quietHoursEnd || "07:00"}
                onChange={(e) => setLocal("quietHoursEnd", e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50"
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
        />
        {localPrefs.digestEnabled && (
          <div className="pt-2 pl-2 animate-in fade-in duration-200">
            <label className="text-sm font-bold text-slate-700 block mb-2">{t("settings.digestFrequency")}</label>
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
          <input
            type="password"
            placeholder={t("settings.currentPassword")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#D97706]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder={t("settings.newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#D97706]"
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
              <input
                type="password"
                placeholder={t("auth.confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full p-3 rounded-xl border bg-slate-50 focus:outline-none focus:border-[#D97706]",
                  !passwordsMatch ? "border-red-300" : "border-slate-200"
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
          icon={<Mail className="text-blue-600" size={24} />}
          name={t("settings.outlookCalendar")}
          description={t("settings.outlookCalendarDesc")}
          iconBg="bg-blue-50 border-blue-100"
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
   BILLING TAB
   ============================================================================= */

function BillingTab({ t, isRTL, billingData }: { t: (key: string) => string; isRTL: boolean; billingData?: any }) {
  const invoices = billingData?.invoices || [];
  const { mutate: subscribeToPlan, isPending: isSubscribing } = useSubscribeToPlan();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
  const { mutate: downloadInvoicePDF, isPending: isDownloading } = useDownloadInvoicePDF();

  return (
    <div className="space-y-6">
      {/* Plan Card */}
      <div className="bg-gradient-to-br from-[#0F2942] to-[#1E3A56] rounded-2xl p-4 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-32 bg-white/5 rounded-full blur-3xl ${isRTL ? '-ml-10' : '-mr-10'} -mt-10`} />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-blue-200 text-xs md:text-sm font-bold uppercase tracking-wider mb-2">{t("settings.currentPlan")}</p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-1">{billingData?.plan?.name || t("settings.enterprisePlan")}</h2>
            <p className="text-blue-200 text-xs md:text-sm">{t("settings.billedAnnually")} • {billingData?.nextBillingDate || t("settings.nextBilling")}</p>
          </div>
          <div className={isRTL ? 'text-left' : 'text-right'}>
            <h2 className="text-2xl md:text-3xl font-bold">
              SAR {billingData?.plan?.price || 499}<span className="text-sm md:text-lg text-blue-300 font-normal">{t("settings.perMonth")}</span>
            </h2>
          </div>
        </div>
        <div className="mt-4 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            onClick={() => subscribeToPlan({ planId: 1, billingCycle: "yearly" })}
            disabled={isSubscribing}
            className="bg-[#D97706] hover:bg-[#B45309] w-full sm:w-auto"
          >
            {isSubscribing ? "Processing..." : t("settings.upgradePlan")}
          </Button>
          <Button
            onClick={() => cancelSubscription()}
            disabled={isCancelling}
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white w-full sm:w-auto"
          >
            {isCancelling ? "Cancelling..." : t("settings.cancelSubscription")}
          </Button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-[#0F2942]">{t("settings.invoiceHistory")}</h4>
          <button className="text-xs font-bold text-slate-500 hover:text-[#0F2942] flex items-center gap-1">
            <Download size={14} /> <span className="hidden sm:inline">{t("settings.downloadAll")}</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">{t("settings.invoiceId")}</th>
                <th className="px-6 py-4 font-bold">{t("settings.date")}</th>
                <th className="px-6 py-4 font-bold">{t("settings.amount")}</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className={`px-6 py-4 font-bold ${isRTL ? 'text-left' : 'text-right'}`}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#0F2942]">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-[#0F2942]">{inv.amount} SAR</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                      <CheckCircle size={10} /> {inv.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <button
                      onClick={() => downloadInvoicePDF(inv.id)}
                      disabled={isDownloading}
                      className="text-[#D97706] hover:text-[#B45309] font-bold text-xs flex items-center gap-1 justify-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={12} /> {isDownloading ? "Downloading..." : t("settings.pdf")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-[#0F2942]">{inv.id}</div>
                  <div className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()}</div>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={10} /> {inv.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-bold text-[#0F2942]">{inv.amount} SAR</div>
                <button
                  onClick={() => downloadInvoicePDF(inv.id)}
                  disabled={isDownloading}
                  className="text-[#D97706] hover:text-[#B45309] font-bold text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={12} /> {isDownloading ? "..." : t("settings.pdf")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   HELPER COMPONENTS
   ============================================================================= */

function FormField({ label, type = "text", defaultValue, disabled }: { label: string; type?: string; defaultValue: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
    Admin: "bg-purple-50 text-purple-700 border-purple-100",
    Lawyer: "bg-blue-50 text-blue-700 border-blue-100",
    Paralegal: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("px-2 py-1 rounded text-xs font-bold border", styles[role] || styles.Paralegal)}>
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", status === "Active" ? "bg-green-500" : "bg-amber-500")} />
      <span className="text-slate-600 font-medium">{status}</span>
    </div>
  );
}

function NotificationToggle({ title, description, checked, onToggle }: { title: string; description: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="min-w-0">
        <h5 className="font-bold text-[#0F2942] text-base md:text-lg">{title}</h5>
        {description && <p className="text-xs md:text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-[#D97706]" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
          checked ? "translate-x-7" : "translate-x-1"
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
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors self-end sm:self-auto",
            enabled ? "bg-[#D97706]" : "bg-slate-300"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
            enabled ? "translate-x-7" : "translate-x-1"
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
