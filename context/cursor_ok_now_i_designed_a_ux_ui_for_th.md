**User**

@context/LCMS-Figma-Design-Refactoring-Plan.md:1-1205 i want you to review the plan and check if there are unimplemented parts of the plan

---

**Cursor**

Here’s a gap check against the refactoring plan:

- **Data & CRUD (Plan: full CRUD, real data)**

  - Clients, cases, alerts, and regulations still rely on mock data; no API integration or persistence. The “New Client” flow only updates local state.
  - Alerts are local state only; no backend read/unread sync.
  - Cases new/edit flow lacks a working Case Form modal and persistence.

- **Internationalization (Plan §5)**

  - Translations aren’t wired across pages; most UI strings are hardcoded English.
  - No shared translation files (`en/ar`) or app-level i18n provider usage; locale toggle not applied to pages/components.

- **Global Search (Plan Appendix A)**

  - `GlobalSearchResultsView` and search results page are not implemented; header search just routes without results UI.

- **Modals & Feature Components (Plan Appendix A)**

  - Missing/partial: Document Preview modal, Compose/Message modal, Case Form modal (for /cases/new and edit), Regulation Diff modal usage in production flows, and Message/Contact flows for clients.
  - Regulation Discovery/Diff may exist from context export, but not integrated into the main Next.js flows or navigation.

- **Settings Functionality**

  - Tabs are UI-only with mock data; no real save/update calls for profile, organization, notifications, security, integrations, or billing. RBAC simulator is present but not backed by actual role/permission logic.

- **Real-time & Auth**

  - Socket.io real-time updates and JWT-backed auth flows are not connected to backend; header’s web socket hook is a stub.

- **RTL Coverage**

  - Base RTL utilities added, but pages/components aren’t consuming locale to flip layout/strings; many icons and directional elements aren’t conditionally flipped.

- **Animations vs. Plan**
  - We added a full animation suite; the plan called for “subtle transitions only.” If strict adherence is required, we should pare back to light transitions.

If you want, I can prioritize wiring i18n + real CRUD for clients/cases/alerts first, then add global search and the missing modals with backend hooks.

---

**User**

when you say CRUD not implemented do you mean implementing the recieving of the CRUD from the backend?
becuase if you know this system should be connected to a backend and this is its context @context/LCMS_Comprehensive_Context.md

---

**Cursor**

By “CRUD not implemented,” I mean the UI is still using mock/local state—there are no calls to the Fastify backend to create/read/update/delete data. Given the backend context (`LCMS_Comprehensive_Context.md`), we need to wire the frontend to the real API. Concretely:

- **Wire API clients + hooks**: Add `src/lib/api/{clients,cases,regulations,alerts}.ts` and TanStack Query hooks for list/detail/create/update/delete, using the Fastify endpoints (e.g., `/api/cases`, `/api/cases/:id`, `/api/clients`, `/api/ai-links/:caseId`, etc.).
- **Auth/JWT**: Ensure requests send the JWT; hydrate user/org from `/api/auth/me`; handle 401 → login.
- **State**: Replace mock arrays with queries; use mutations for create/update/delete and invalidate queries (`cases`, `clients`, `alerts`, `regulations`).
- **Realtime**: Hook Socket.IO events (`case_links_refreshed`, `regulation_updated`, `case_created`, etc.) to invalidate queries and update badge counts.
- **CRUD scope**:
  - Clients: list/detail/create/update/delete; persist contact info, type, notes; cases per client.
  - Cases: create/update/delete; documents upload/list/delete; AI links verify/dismiss; status changes.
  - Alerts: fetch from backend and mark read/unread; not just local state.
  - Regulations: fetch list/detail/versions; subscribe/unsubscribe to monitoring.
  - Settings: persist profile/org/notifications/security/integrations/billing to backend endpoints (currently UI-only).

If you want, I can outline the exact API client signatures and the TanStack Query hook shapes to replace the mocks, and a short checklist to connect JWT + Socket.IO for live updates.
