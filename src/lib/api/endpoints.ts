/*
 * File: src/lib/api/endpoints.ts
 * Purpose: Centralized API endpoint URLs for the Fastify backend.
 * Used by: API modules (cases.ts, regulations.ts, etc.) to avoid hardcoding URLs.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const endpoints = {
  // Authentication
  auth: {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
    me: `${API_BASE}/api/auth/me`,
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE}/api/dashboard/stats`,
    recentActivity: `${API_BASE}/api/dashboard/recent-activity`,
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
    search: `${API_BASE}/api/regulations/search`,
    subscribe: `${API_BASE}/api/regulations/subscribe`,
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
  },

  // Clients
  clients: {
    list: `${API_BASE}/api/clients`,
    detail: (id: number) => `${API_BASE}/api/clients/${id}`,
    create: `${API_BASE}/api/clients`,
    update: (id: number) => `${API_BASE}/api/clients/${id}`,
    delete: (id: number) => `${API_BASE}/api/clients/${id}`,
    cases: (id: number) => `${API_BASE}/api/clients/${id}/cases`,
  },

  // Alerts/Notifications
  alerts: {
    list: `${API_BASE}/api/alerts`,
    markRead: (id: number) => `${API_BASE}/api/alerts/${id}/read`,
    markAllRead: `${API_BASE}/api/alerts/read-all`,
  },

  // User Profile
  profile: {
    get: `${API_BASE}/api/profile`,
    update: `${API_BASE}/api/profile`,
    updatePassword: `${API_BASE}/api/profile/password`,
  },

  // Settings
  settings: {
    notifications: `${API_BASE}/api/settings/notifications`,
    organization: `${API_BASE}/api/settings/organization`,
    team: `${API_BASE}/api/settings/team`,
    teamInvite: `${API_BASE}/api/settings/team/invite`,
    billing: `${API_BASE}/api/settings/billing`,
  },

  // AI Features
  ai: {
    chat: `${API_BASE}/api/ai/chat`,
    analyzeCase: (caseId: number) => `${API_BASE}/api/ai/cases/${caseId}/analyze`,
    summarizeDocument: (docId: number) => `${API_BASE}/api/documents/${docId}/summarize`,
  },
} as const;
