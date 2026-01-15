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
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Mock data
const MOCK_TEAM = [
  { id: 1, name: "Ahmed Al-Lawyer", email: "ahmed@alfaisal.law", role: "Admin", status: "Active" },
  { id: 2, name: "Sara Al-Faisal", email: "sara@alfaisal.law", role: "Lawyer", status: "Active" },
  { id: 3, name: "Mohammed Hassan", email: "mohammed@alfaisal.law", role: "Paralegal", status: "Pending" },
];

const MOCK_INVOICES = [
  { id: "INV-2024-012", date: "Dec 1, 2024", amount: "SAR 499", status: "Paid" },
  { id: "INV-2024-011", date: "Nov 1, 2024", amount: "SAR 499", status: "Paid" },
  { id: "INV-2024-010", date: "Oct 1, 2024", amount: "SAR 499", status: "Paid" },
];

const MOCK_LOGIN_HISTORY = [
  { device: "MacBook Pro - Chrome", location: "Riyadh, SA", ip: "192.168.1.1", time: "Now (Active)" },
  { device: "iPhone 15 - Safari", location: "Riyadh, SA", ip: "192.168.1.2", time: "2 hours ago" },
  { device: "Windows PC - Edge", location: "Jeddah, SA", ip: "192.168.2.1", time: "Yesterday" },
];

type TabId = "profile" | "org" | "notifications" | "security" | "integrations" | "billing";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const TABS: Tab[] = [
  { id: "profile", label: "My Profile", icon: <User size={18} /> },
  { id: "org", label: "Organization", icon: <Building size={18} />, adminOnly: true },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { id: "security", label: "Security", icon: <Lock size={18} /> },
  { id: "integrations", label: "Integrations", icon: <LinkIcon size={18} /> },
  { id: "billing", label: "Billing", icon: <CreditCard size={18} />, adminOnly: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("profile");
  const [role, setRole] = React.useState<"Admin" | "Lawyer">("Admin");
  const { user } = useAuthStore();

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || role === "Admin");

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#0F2942] font-serif">Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your account and preferences</p>
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
              RBAC Simulator
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Current Role:</span>
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
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          {/* Tab Header */}
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#0F2942]">
              {visibleTabs.find((t) => t.id === activeTab)?.label}
            </h3>
            {activeTab === "profile" && (
              <Button className="bg-[#0F2942] hover:bg-[#1E3A56]">
                Save Changes
              </Button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "org" && <OrganizationTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   PROFILE TAB
   ============================================================================= */

function ProfileTab() {
  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#0F2942] text-white flex items-center justify-center text-2xl font-bold ring-4 ring-slate-100">
          AL
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#0F2942]">Ahmed Al-Lawyer</h4>
          <p className="text-sm text-slate-500 mb-3">Senior Partner • Al-Faisal Law Firm</p>
          <button className="text-xs font-bold text-[#D97706] border border-[#D97706] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
            Change Avatar
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" defaultValue="Ahmed Al-Lawyer" />
          <FormField label="Email Address" type="email" defaultValue="ahmed@alfaisal.law" />
          <FormField label="Job Title" defaultValue="Senior Partner" />
          <FormField label="Phone Number" type="tel" defaultValue="+966 50 123 4567" />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h5 className="font-bold text-[#0F2942] mb-4">Regional Settings</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Language</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50">
                <option value="en">English</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Timezone</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] bg-slate-50">
                <option>Riyadh (GMT+3)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   ORGANIZATION TAB
   ============================================================================= */

function OrganizationTab() {
  return (
    <div className="space-y-6">
      {/* Org Header */}
      <div className="bg-[#0F2942] rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h4 className="text-xl font-bold">Al-Faisal Law Firm</h4>
          <p className="text-blue-200 text-sm mt-1">
            License No: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">LC-99283</span> • Valid until Dec 2025
          </p>
        </div>
        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
          Active License
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatBox title="Storage Used" value="4.2 GB" max="10 GB" progress={42} color="orange" />
        <StatBox title="Active Cases" value="24" max="Unlimited" progress={100} color="green" />
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-[#0F2942]">Team Members</h4>
          <button className="text-xs font-bold bg-[#D97706] text-white px-3 py-2 rounded-lg hover:bg-[#B45309] transition-colors flex items-center gap-2">
            <Plus size={14} /> Invite Member
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_TEAM.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-[#0F2942]">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-6 py-4">
                  <StatusDot status={member.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-[#0F2942]">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =============================================================================
   NOTIFICATIONS TAB
   ============================================================================= */

function NotificationsTab() {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <NotificationToggle
        title="AI Recommendations"
        description="Get alerted when AI finds new regulation matches for your active cases."
        defaultChecked={false}
      />
      <NotificationToggle
        title="Regulation Updates"
        description="Receive immediate notifications when subscribed laws are amended."
        defaultChecked={true}
      />
      <NotificationToggle
        title="System Alerts"
        description="Maintenance schedules and security alerts."
        defaultChecked={true}
      />
    </div>
  );
}

/* =============================================================================
   SECURITY TAB
   ============================================================================= */

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="bg-green-100 p-2 rounded-lg text-green-700">
            <Shield size={24} />
          </div>
          <div>
            <h5 className="font-bold text-[#0F2942]">Strong Security Enabled</h5>
            <p className="text-xs text-slate-500">Your account is protected with 2FA.</p>
          </div>
          <button className="ml-auto text-xs font-bold text-[#D97706] border border-[#D97706] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
            Configure 2FA
          </button>
        </div>

        {/* Change Password */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h5 className="font-bold text-[#0F2942]">Change Password</h5>
          <div className="grid grid-cols-1 gap-4">
            <input type="password" placeholder="Current Password" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#D97706]" />
            <div className="grid grid-cols-2 gap-4">
              <input type="password" placeholder="New Password" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#D97706]" />
              <input type="password" placeholder="Confirm Password" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#D97706]" />
            </div>
            <Button className="w-fit bg-slate-900 hover:bg-[#0F2942]">
              Update Password
            </Button>
          </div>
        </div>

        {/* Login Activity */}
        <div className="pt-6 border-t border-slate-100">
          <h5 className="font-bold text-[#0F2942] mb-4">Login Activity</h5>
          <div className="space-y-3">
            {MOCK_LOGIN_HISTORY.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                    {log.device.includes("iPhone") ? <Smartphone size={16} /> : <Zap size={16} />}
                  </div>
                  <div>
                    <p className="font-bold text-[#0F2942]">{log.device}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {log.location} • {log.ip}
                    </p>
                  </div>
                </div>
                <span className={cn("text-xs font-bold", idx === 0 ? "text-green-600" : "text-slate-400")}>
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   INTEGRATIONS TAB
   ============================================================================= */

function IntegrationsTab() {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="font-bold text-[#0F2942] text-lg">Connected Apps</h5>
          <p className="text-sm text-slate-500 mt-1">Supercharge your workflow by connecting external services.</p>
        </div>
        <Button className="bg-[#D97706] hover:bg-[#B45309]">
          Browse Marketplace
        </Button>
      </div>

      <div className="space-y-4">
        <IntegrationCard
          icon={<Scale className="text-[#0F2942]" size={24} />}
          name="Ministry of Justice (Najiz)"
          description="Sync cases, deeds, and enforcement orders automatically."
          connected
        />
        <IntegrationCard
          icon={<Mail className="text-blue-600" size={24} />}
          name="Outlook Calendar & Email"
          description="Sync court hearings to your calendar and attach emails to cases."
          iconBg="bg-blue-50 border-blue-100"
        />
        <IntegrationCard
          icon={<UploadCloud className="text-yellow-600" size={24} />}
          name="Google Drive / OneDrive"
          description="Backup case documents securely to your cloud storage."
          iconBg="bg-yellow-50 border-yellow-100"
          hasToggle
        />
      </div>
    </div>
  );
}

/* =============================================================================
   BILLING TAB
   ============================================================================= */

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Plan Card */}
      <div className="bg-gradient-to-br from-[#0F2942] to-[#1E3A56] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Current Plan</p>
            <h2 className="text-3xl font-bold font-serif mb-1">Enterprise Plan</h2>
            <p className="text-blue-200">Billed Annually • Next billing Dec 1, 2025</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">
              SAR 499<span className="text-lg text-blue-300 font-normal">/mo</span>
            </h2>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <Button className="bg-[#D97706] hover:bg-[#B45309]">Upgrade Plan</Button>
          <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white">
            Cancel Subscription
          </Button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-[#0F2942]">Invoice History</h4>
          <button className="text-xs font-bold text-slate-500 hover:text-[#0F2942] flex items-center gap-1">
            <Download size={14} /> Download All
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-bold">Invoice ID</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#0F2942]">{inv.id}</td>
                <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                <td className="px-6 py-4 font-bold text-[#0F2942]">{inv.amount}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                    <CheckCircle size={10} /> Paid
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#D97706] hover:text-[#B45309] font-bold text-xs flex items-center gap-1 justify-end">
                    <Download size={12} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =============================================================================
   HELPER COMPONENTS
   ============================================================================= */

function FormField({ label, type = "text", defaultValue }: { label: string; type?: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] bg-slate-50"
      />
    </div>
  );
}

function StatBox({ title, value, max, progress, color }: { title: string; value: string; max: string; progress: number; color: "orange" | "green" }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <h5 className="text-xs text-slate-400 uppercase font-bold tracking-wider">{title}</h5>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-2xl font-bold text-[#0F2942]">{value}</span>
        <span className="text-xs text-slate-500 mb-1">/ {max}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
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

function NotificationToggle({ title, description, defaultChecked }: { title: string; description: string; defaultChecked: boolean }) {
  const [checked, setChecked] = React.useState(defaultChecked);
  return (
    <div className="flex items-start justify-between pb-6 border-b border-slate-100 last:border-0 last:pb-0">
      <div>
        <h5 className="font-bold text-[#0F2942] text-lg">{title}</h5>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors",
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

function IntegrationCard({ icon, name, description, iconBg = "bg-white border-slate-200", connected = false, hasToggle = false }: {
  icon: React.ReactNode;
  name: string;
  description: string;
  iconBg?: string;
  connected?: boolean;
  hasToggle?: boolean;
}) {
  const [enabled, setEnabled] = React.useState(false);
  return (
    <div className={cn(
      "flex items-center justify-between p-4 border rounded-xl",
      connected ? "border-green-200 bg-green-50/50" : "border-slate-200 bg-white"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-lg border flex items-center justify-center p-2", iconBg)}>
          {icon}
        </div>
        <div>
          <h6 className="font-bold text-[#0F2942]">{name}</h6>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {connected ? (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> Connected
          </span>
          <button className="text-slate-400 hover:text-slate-600">
            <SettingsIcon size={18} />
          </button>
        </div>
      ) : hasToggle ? (
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            enabled ? "bg-[#D97706]" : "bg-slate-300"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
            enabled ? "translate-x-7" : "translate-x-1"
          )} />
        </button>
      ) : (
        <Button variant="outline" size="sm">
          Connect
        </Button>
      )}
    </div>
  );
}
