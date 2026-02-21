# Legal Case Management System

An AI-powered legal case management platform designed for Saudi legal practitioners. The system leverages semantic similarity to automatically link legal cases with relevant regulations from Saudi Arabian law.

---

## System Architecture

The platform consists of four integrated components:

| Component           | Technology                                         | Purpose                                                   |
| ------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| **Web Frontend**    | Next.js 14+, TypeScript, shadcn/ui, TanStack Query | Responsive web interface for case management              |
| **Backend API**     | Fastify, TypeScript, Drizzle ORM, PostgreSQL       | RESTful API with JWT authentication and WebSocket support |
| **AI Microservice** | FastAPI, Python, BAAI/BGE-M3 Model                 | Semantic similarity for case-regulation linking           |
| **Mobile App**      | Flutter, Dart, Provider                            | Cross-platform mobile application (iOS/Android)           |

## Tech Stack

### 1. Web Frontend (Next.js)

A responsive web application providing the primary user interface for desktop and tablet users.

**Technology Stack:**

- Next.js 14+ with App Router
- TypeScript
- TanStack Query for server state management
- Zustand for client state
- shadcn/ui + Radix UI components
- Tailwind CSS
- Socket.IO Client for real-time updates

### 2. Backend API (Fastify)

A high-performance RESTful API handling business logic, authentication, and data management.

**Technology Stack:**

- Fastify with TypeScript
- PostgreSQL database with pgvector extension
- Drizzle ORM
- JWT authentication
- WebSocket support for real-time notifications
- OpenAPI/Swagger documentation

---

## Features

### Case Management

- Create, read, update, and delete legal cases
- Support for multiple case types: Criminal, Civil, Commercial, Labor, Family, Administrative
- Case status tracking: Open, In Progress, Pending Hearing, Closed, Archived
- Assign cases to lawyers within an organization
- Track court jurisdiction, filing dates, and hearing schedules

### AI-Powered Regulation Linking

- Automatic semantic similarity matching between cases and regulations
- BGE-M3 multilingual model with Arabic language support
- Cosine similarity scoring (0-100%) for relevance ranking
- Lawyer verification/dismissal of AI suggestions
- Hybrid linking: AI-generated and manual links
- High-score subscription suggestion dialog with preselected regulations and user opt-out checkboxes
- Bulk subscription submission directly from the case AI suggestions flow
- Documents tab now includes inline AI insights per attachment (summary + related highlights)
- Insights status badges and refresh action for each case document
- Automatic refresh behavior when insights are still processing

### User Management

- JWT-based authentication
- Role-based access control: Admin, Senior Lawyer, Lawyer, Paralegal, Clerk
- Multi-tenant organization support
- Secure password hashing with bcrypt

### Real-Time Updates

- WebSocket notifications for regulation updates
- Automatic case-regulation link refresh notifications
- Live synchronization across web and mobile clients
- Invalidation for alerts, regulation detail, and regulation version history on update events

### Additional Features

- Dark/Light theme support
- Arabic and English localization with RTL support
- Offline caching for mobile app
- Analytics dashboard with case statistics
- OpenAPI/Swagger documentation
- Regulation version detail page (`/regulations/[id]`) with timeline-style history view


---

## Getting Started

### Web Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Web Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | User login        |
| GET    | /api/auth/me       | Get current user  |

### Cases

| Method | Endpoint       | Description      |
| ------ | -------------- | ---------------- |
| GET    | /api/cases     | List all cases   |
| POST   | /api/cases     | Create new case  |
| GET    | /api/cases/:id | Get case details |
| PUT    | /api/cases/:id | Update case      |
| DELETE | /api/cases/:id | Delete case      |

---

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication routes group
│   │   └── login/
│   │       └── page.tsx              # Login page
│   ├── (dashboard)/                  # Protected dashboard routes
│   │   ├── cases/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Case detail page
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new case
│   │   │   └── page.tsx              # Cases list
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard with stats
│   │   └── layout.tsx                # Dashboard layout (sidebar + header)
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home/landing page
├── components/
│   ├── features/                     # Feature-specific components
│   │   ├── cases/
│   │   │   ├── ai-suggestions.tsx    # AI regulation suggestions panel
│   │   │   ├── case-card.tsx         # Case preview card
│   │   │   ├── case-filters.tsx      # Filter controls
│   │   │   └── case-form.tsx         # Create/edit case form
│   │   └── layout/
│   │       ├── header.tsx            # Top navigation bar
│   │       ├── sidebar.tsx           # Side navigation
│   │       └── theme-provider.tsx    # Dark/light mode provider
│   └── ui/                           # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toaster.tsx
│       └── use-toast.ts
├── lib/
│   ├── api/
│   │   └── client.ts                 # Axios client with interceptors
│   ├── hooks/                        # TanStack Query hooks
│   │   ├── use-ai-links.ts           # AI suggestions queries/mutations
│   │   ├── use-auth.ts               # Authentication hooks
│   │   ├── use-cases.ts              # Cases CRUD hooks
│   │   └── use-websocket.ts          # Real-time updates
│   ├── store/
│   │   └── auth-store.ts             # Zustand auth state
│   ├── types/
│   │   └── case.ts                   # TypeScript interfaces
│   └── utils/
│       └── cn.ts                     # Class name helper
├── providers/
│   └── query-provider.tsx            # TanStack Query provider
├── middleware.ts                     # Auth route protection
├── public/                           # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

### Core Tables

- **organizations**: Law firms and legal organizations
- **users**: System users with roles and organization membership
- **cases**: Legal cases with metadata and status
- **regulations**: Saudi legal regulations and laws
- **regulation_versions**: Version history for regulations
- **case_regulation_links**: AI-generated and manual case-regulation associations

---

## Deployment

### Docker

```bash
# Build all services
docker-compose build

# Run the stack
docker-compose up -d
```

### Production Considerations

- Enable HTTPS with TLS certificates
- Configure rate limiting for API protection
- Set up Redis clustering for high availability
- Use GPU instances for AI service performance
- Implement database read replicas for scaling

---

## License

This project is developed as part of a graduation project for managing legal cases in the Saudi Arabian legal system.
