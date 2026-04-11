# Advanced CRM Systems Implementation Plan

This document outlines the technical implementation strategy for three advanced CRM systems designed to showcase high-level automation, end-to-end data flow, and modern legal tech capabilities for the graduation project presentation.

---

## 1. Automated Client Intake System

**Goal:** Create dynamic public-facing forms that allow potential clients to submit their details. These submissions automatically convert into "New Leads" in the CRM Kanban board.

### Phase 1: Database & Backend
*   **Schema Update (`schema.ts`):**
    *   Create an `intake_forms` table to store custom form configurations (`form_id`, `title`, `fields_json`, `organization_id`).
    *   Create an `intake_submissions` log table (optional, for auditing).
*   **API Endpoints (`Fastify`):**
    *   `POST /api/public/intake/:formId`: Public endpoint (no auth required) to accept form submissions. This endpoint automatically creates a record in the `clients` table with `leadStatus: "lead"` and creates a corresponding `client_activities` entry (e.g., "Lead generated via public intake form").
    *   `GET/POST /api/intake-forms`: Private endpoints for the firm to manage their forms.

### Phase 2: Frontend Implementation
*   **Public Form Page (`app/intake/[formId]/page.tsx`):**
    *   A clean, highly aesthetic public landing page displaying the dynamic intake form. 
    *   Must be bilingual (Arabic/English) depending on URL state or browser preferences.
    *   Submission triggers a success state (and potentially an automated "Thank You" email if combined with System #3).
*   **CRM Settings Builder:**
    *   A UI in the settings page for lawyers to copy the public `Intake Link` to easily paste on their websites or WhatsApp status.

---

## 2. Client Portal (Self-Service Tracker)

**Goal:** Provide clients with a restricted dashboard to track their cases, view shared documents, and see outstanding invoices.

### Phase 1: Identity & Authorization Integration
*   **Role-Based Access Control (RBAC):**
    *   Update Next-Auth and Fastify JWT middleware to safely partition views based on user `role`.
    *   Ensure a user with the role `"client"` is strictly mapped to a specific `client_id` in the database.
*   **Backend Security:**
    *   Update queries in `/api/cases`, `/api/documents`, and `/api/billing` to automatically filter results to `client_id` if the requesting token belongs to a client.

### Phase 2: Frontend Implementation
*   **Client Routing (`app/(client-portal)`):**
    *   Create an isolated Next.js layout (`app/(client-portal)/layout.tsx`) specifically for client accounts, featuring a simplified, non-lawyer sidebar.
*   **Portal Dashboard Views:**
    *   `Overview`: High-level summary of active cases and next court hearing dates.
    *   `My Documents`: Read-only view of the Document Vault where the lawyer has shared files.
    *   `Billing`: View outstanding invoices and mock payment buttons.

---

## 3. Smart Communication Automations (Trigger System)

**Goal:** Implement an "If This, Then That" (IFTTT) rule engine where CRM status changes (e.g., Lead -> Retained) automatically trigger communications.

### Phase 1: Automation Engine
*   **Database Schema (`schema.ts`):** 
    *   Create `automation_rules` table (`trigger_type`, `action_type`, `template_body`).
*   **Event Emitter / Webhooks (`Fastify Backend`):**
    *   Implement an event bus (e.g., Node.js `EventEmitter` or BullMQ for advanced usage).
    *   When an API controller updates a client to `leadStatus: "retained"`, emit an event: `client.status.changed`.
    *   The Automation Engine listens for this event, checks `automation_rules`, and executes the action.

### Phase 2: Channel Integration (Simulated or Real)
*   **Email Engine:** Integrate `Nodemailer` to send automated emails (e.g., "Welcome to Silah Legal, here is your portal login").
*   **WhatsApp/SMS (Mock or API):** Set up a mock integration or use the Twilio/WhatsApp Business API to send interactive message updates ("Your hearing date has been scheduled").

### Phase 3: Frontend Implementation
*   **Automation Settings UI:**
    *   A visual builder under `Settings -> Automations`.
    *   UI mapping Triggers (Dropdown: "When Client Status Changes") to Actions (Dropdown: "Send WhatsApp / Send Email").
    *   A rich text editor to draft the automated message template (with merge tags like `{{client_name}}`).
