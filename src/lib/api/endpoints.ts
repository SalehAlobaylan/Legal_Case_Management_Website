/*
 * File: src/lib/api/endpoints.ts
 * Purpose: Centralized API endpoint URLs for the Fastify backend.
 * Used by: API modules (cases.ts, regulations.ts, etc.) to avoid hardcoding URLs.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const endpoints = {
  // Authentication
  auth: {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
    me: `${API_BASE}/api/auth/me`,
  },

  // Organizations
  organizations: {
    list: `${API_BASE}/api/organizations`,
    detail: (id: number) => `${API_BASE}/api/organizations/${id}`,
    create: `${API_BASE}/api/organizations`,
    update: (id: number) => `${API_BASE}/api/organizations/${id}`,
    delete: (id: number) => `${API_BASE}/api/organizations/${id}`,
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE}/api/dashboard/stats`,
    recentActivity: `${API_BASE}/api/dashboard/recent-activity`,
    dailyOperations: `${API_BASE}/api/dashboard/daily-operations`,
    createTask: `${API_BASE}/api/dashboard/tasks`,
    updateTask: (id: number) => `${API_BASE}/api/dashboard/tasks/${id}`,
    deleteTask: (id: number) => `${API_BASE}/api/dashboard/tasks/${id}`,
    updateDocumentReview: (id: number) => `${API_BASE}/api/dashboard/documents/${id}/review`,
  },

  // Cases
  cases: {
    list: `${API_BASE}/api/cases`,
    detail: (id: number) => `${API_BASE}/api/cases/${id}`,
    create: `${API_BASE}/api/cases`,
    update: (id: number) => `${API_BASE}/api/cases/${id}`,
    delete: (id: number) => `${API_BASE}/api/cases/${id}`,
  },

  // Regulations
  regulations: {
    list: `${API_BASE}/api/regulations`,
    detail: (id: number) => `${API_BASE}/api/regulations/${id}`,
    versions: (id: number) => `${API_BASE}/api/regulations/${id}/versions`,
    compare: (id: number) => `${API_BASE}/api/regulations/${id}/compare`,
    insights: (id: number) => `${API_BASE}/api/regulations/${id}/insights`,
    refreshInsights: (id: number) =>
      `${API_BASE}/api/regulations/${id}/insights/refresh`,
    amendmentImpact: (id: number) =>
      `${API_BASE}/api/regulations/${id}/amendment-impact`,
    refreshAmendmentImpact: (id: number) =>
      `${API_BASE}/api/regulations/${id}/amendment-impact/refresh`,
    aiHealth: `${API_BASE}/api/regulations/ai/health`,
    search: `${API_BASE}/api/regulations/search`,
    subscribe: `${API_BASE}/api/regulations/subscribe`,
    sourceSync: `${API_BASE}/api/regulations/source/moj/sync`,
    sourceHealth: `${API_BASE}/api/regulations/source/moj/health`,
  },

  // AI Links
  aiLinks: {
    list: (caseId: number) => `${API_BASE}/api/ai-links/${caseId}`,
    generate: (caseId: number) => `${API_BASE}/api/ai-links/${caseId}/generate`,
    verify: (linkId: number) => `${API_BASE}/api/ai-links/${linkId}/verify`,
    dismiss: (linkId: number) => `${API_BASE}/api/ai-links/${linkId}`,
  },

  // Documents
  documents: {
    list: (caseId: number) => `${API_BASE}/api/cases/${caseId}/documents`,
    upload: (caseId: number) => `${API_BASE}/api/cases/${caseId}/documents`,
    download: (docId: number) => `${API_BASE}/api/documents/${docId}/download`,
    delete: (docId: number) => `${API_BASE}/api/documents/${docId}`,
    insights: (docId: number) => `${API_BASE}/api/documents/${docId}/insights`,
    refreshInsights: (docId: number) =>
      `${API_BASE}/api/documents/${docId}/insights/refresh`,
    insightsHealth: `${API_BASE}/api/documents/insights/health`,
  },

  // Clients
  clients: {
    list: `${API_BASE}/api/clients`,
    detail: (id: number) => `${API_BASE}/api/clients/${id}`,
    create: `${API_BASE}/api/clients`,
    update: (id: number) => `${API_BASE}/api/clients/${id}`,
    delete: (id: number) => `${API_BASE}/api/clients/${id}`,
    cases: (id: number) => `${API_BASE}/api/clients/${id}/cases`,
    export: `${API_BASE}/api/clients/export`,
    message: (id: number) => `${API_BASE}/api/clients/${id}/message`,
    messages: (id: number) => `${API_BASE}/api/clients/${id}/messages`,
    markMessageRead: (id: number, messageId: number) => `${API_BASE}/api/clients/${id}/messages/${messageId}/read`,
    retryMessage: (id: number, messageId: number) => `${API_BASE}/api/clients/${id}/messages/${messageId}/retry`,
    activities: (id: number) => `${API_BASE}/api/clients/${id}/activities`,
    documents: (id: number) => `${API_BASE}/api/clients/${id}/documents`,
    deleteDocument: (id: number, docId: number) => `${API_BASE}/api/clients/${id}/documents/${docId}`,
    downloadDocument: (id: number, docId: number) => `${API_BASE}/api/clients/${id}/documents/${docId}/download`,
  },

  // Intake forms (private + public)
  intake: {
    forms: `${API_BASE}/api/intake-forms`,
    form: (id: number) => `${API_BASE}/api/intake-forms/${id}`,
    publicForm: (formId: number) => `${API_BASE}/api/public/intake/${formId}`,
    publicSubmit: (formId: number) => `${API_BASE}/api/public/intake/${formId}`,
  },

  // Automation rules
  automations: {
    list: `${API_BASE}/api/automations`,
    create: `${API_BASE}/api/automations`,
    update: (id: number) => `${API_BASE}/api/automations/${id}`,
  },

  // Billing
  billing: {
    invoices: `${API_BASE}/api/billing/invoices`,
    createInvoice: `${API_BASE}/api/billing/invoices`,
    subscribe: `${API_BASE}/api/billing/subscribe`,
    subscription: `${API_BASE}/api/billing/subscription`,
    invoicePdf: (id: number) => `${API_BASE}/api/billing/invoices/${id}/pdf`,
  },

  // Alerts/Notifications
  alerts: {
    list: `${API_BASE}/api/alerts`,
    unreadCount: `${API_BASE}/api/alerts/unread-count`,
    markRead: (id: number) => `${API_BASE}/api/alerts/${id}/read`,
    markAllRead: `${API_BASE}/api/alerts/read-all`,
    delete: (id: number) => `${API_BASE}/api/alerts/${id}`,
  },

  // User Profile
  profile: {
    get: `${API_BASE}/api/profile`,
    update: `${API_BASE}/api/profile`,
    updatePassword: `${API_BASE}/api/profile/password`,
    stats: `${API_BASE}/api/profile/stats`,
    activities: `${API_BASE}/api/profile/activities`,
    avatar: `${API_BASE}/api/profile/avatar`,
  },

  // Settings
  settings: {
    notifications: `${API_BASE}/api/settings/notifications`,
    organization: `${API_BASE}/api/settings/organization`,
    organizationLeave: `${API_BASE}/api/settings/organization/leave`,
    team: `${API_BASE}/api/settings/team`,
    teamInvite: `${API_BASE}/api/settings/team/invite`,
    teamInvitations: `${API_BASE}/api/settings/team/invitations`,
    teamAcceptInvitation: `${API_BASE}/api/settings/team/invitations/accept`,
    teamUpdateRole: (memberId: string) =>
      `${API_BASE}/api/settings/team/members/${memberId}/role`,
    teamRemoveMember: (memberId: string) =>
      `${API_BASE}/api/settings/team/members/${memberId}`,
    billing: `${API_BASE}/api/settings/billing`,
    ai: `${API_BASE}/api/settings/ai`,
    security: {
      changePassword: `${API_BASE}/api/settings/security/password`,
      loginActivity: `${API_BASE}/api/settings/security/activity`,
    },
  },

  // Search
  search: {
    unified: `${API_BASE}/api/search`,
  },

  // AI Features
  ai: {
    chat: `${API_BASE}/api/ai/chat`,
    chatStream: `${API_BASE}/api/ai/chat/stream`,
    chatSessions: `${API_BASE}/api/ai/chat/sessions`,
    chatSession: (id: number) => `${API_BASE}/api/ai/chat/sessions/${id}`,
    analyzeCase: (caseId: number) => `${API_BASE}/api/ai/cases/${caseId}/analyze`,
    summarizeDocument: (docId: number) => `${API_BASE}/api/documents/${docId}/summarize`,
  },

  // AI Evaluation (admin-only)
  aiEvaluation: {
    labels: `${API_BASE}/api/ai-evaluation/labels`,
    deleteLabel: (id: number) => `${API_BASE}/api/ai-evaluation/labels/${id}`,
    run: `${API_BASE}/api/ai-evaluation/run`,
    runs: `${API_BASE}/api/ai-evaluation/runs`,
    runById: (id: number) => `${API_BASE}/api/ai-evaluation/runs/${id}`,
    caseSummary: (caseId: number) => `${API_BASE}/api/ai-evaluation/cases/${caseId}/summary`,
  },
} as const;
