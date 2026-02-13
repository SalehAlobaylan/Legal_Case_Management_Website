# Unimplemented Features - Frontend

This document lists all non-functional buttons and features in the frontend that require backend implementation to work properly.

---

## Authentication Pages

### Login Page (`/login`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Forgot Password link | Placeholder (`href="#"`) | Implement password reset flow with email service |

### Register Page (`/register`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Terms of Service link | Placeholder (`href="#"`) | Add actual terms page |
| Privacy Policy link | Placeholder (`href="#"`) | Add actual privacy policy page |
| Google Sign-In | UI exists | Backend OAuth endpoints for Google |

---

## Dashboard Pages

### Clients Page (`/clients`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Export button | Non-functional | Implement `/api/clients/export` endpoint |
| Search | UI exists | Implement search API with query params |

### Client Detail Page (`/clients/[id]`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Edit button | Non-functional | Implement `/api/clients/:id` PUT endpoint |
| Send Message button | Non-functional | Implement notification/email API |

---

## Cases Pages

### Case Detail Page (`/cases/[id]`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Edit Case button | Navigates to `/cases/:id/edit` | Implement case edit page and API |
| Manual Search Regulations | Card exists, non-functional | Implement regulation search page |

---

## Regulations Page (`/regulations`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Discover New button | Non-functional | Implement external regulation API integration |
| Filter button | Non-functional | Implement filter modal with API |

---

## Settings Page (`/settings`)

### Profile Tab

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Save Changes button | UI only | Implement `/api/users/profile` PUT endpoint |
| Change Avatar button | UI only | Implement `/api/users/avatar` upload endpoint |
| Language selector | UI only | Implement user preference API |

### Organization Tab

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Invite Member button | Non-functional | Implement `/api/organizations/:id/invite` endpoint |
| Team members table | Uses API data | Verify full CRUD operations work |
| Storage/Case stats | Mock data | Implement `/api/organizations/:id/usage` endpoint |

### Security Tab

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Change Password | Non-functional | Implement `/api/auth/change-password` endpoint |
| Configure 2FA | Non-functional | Implement 2FA setup flow |
| Login Activity | Mock data | Implement `/api/users/login-history` endpoint |

### Integrations Tab

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Moj Najiz Connect | UI only | Implement Najiz API integration |
| Outlook Calendar | UI only | Implement OAuth for Microsoft |
| Cloud Storage toggle | UI only | Implement OAuth for Google Drive/OneDrive |

### Billing Tab

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Upgrade Plan button | Non-functional | Implement Stripe/payment integration |
| Cancel Subscription | Non-functional | Implement subscription cancellation |
| Download PDF invoices | Non-functional | Implement invoice PDF generation |
| Invoice history table | Mock data | Implement `/api/billing/invoices` endpoint |

---

## Profile Page (`/profile`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Edit Profile | UI exists | Implement `/api/users/profile` PUT endpoint |
| Upload Avatar | UI exists | Implement `/api/users/avatar` upload endpoint |
| Organization name | Hardcoded | Get from `user.organization.name` API |
| Specialization field | Hardcoded | Add to user profile API |
| Activity Log | Mock data | Implement `/api/users/activities` endpoint |
| All Stats | Some mock data | Implement `/api/users/stats` endpoint |

---

## Landing Page (`/`)

| Feature | Current Status | Required Backend Implementation |
|---------|----------------|-------------------------------|
| Footer links | All placeholders (`href="#"`) | Add actual pages (About, Careers, etc.) |
| Pricing buttons | Non-functional | Add pricing page with payment integration |

---

## General Requirements

### API Endpoints Needed

```typescript
// Auth
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
GET  /api/auth/oauth/google

// Users
PUT  /api/users/profile
PUT  /api/users/avatar
GET  /api/users/avatar
GET  /api/users/activities
GET  /api/users/stats
GET  /api/users/login-history

// Organizations
POST /api/organizations/:id/invite
GET  /api/organizations/:id/usage
GET  /api/organizations/:id/members
PUT  /api/organizations/:id

// Clients
GET  /api/clients/export
POST /api/clients/:id/message

// Billing
GET  /api/billing/invoices
POST /api/billing/subscribe
DELETE /api/billing/subscription
GET  /api/billing/invoices/:id/pdf

// Integrations
POST /api/integrations/najiz/connect
POST /api/integrations/microsoft/connect
POST /api/integrations/google/connect
```

### Pages to Create

- `/forgot-password` - Password reset page
- `/reset-password` - Password reset with token
- `/terms` - Terms of Service page
- `/privacy` - Privacy Policy page
- `/pricing` - Pricing plans page
- `/about` - About Us page
- `/careers` - Careers page
- `/cases/[id]/edit` - Case edit page

---

## Priority Order

1. **High Priority** (Core Functionality)
   - Password reset flow
   - Profile edit/upload
   - Client management (CRUD)

2. **Medium Priority** (Important Features)
   - Export functionality
   - Integrations
   - Billing

3. **Low Priority** (Nice to Have)
   - Landing page footer links
   - Marketing pages (About, Careers, etc.)
