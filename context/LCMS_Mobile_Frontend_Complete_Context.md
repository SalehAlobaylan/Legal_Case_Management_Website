# LCMS — Mobile Frontend Complete Context (Flutter)

**Document Type**: Comprehensive Mobile Development Context  
**Version**: 1.0  
**Date**: 2026-01-21  
**Platform**: Flutter 3.x (Android & iOS)  
**Derived From**: Web Frontend Implementation + PRD + Design System

---

## Executive Summary

This document consolidates all context from the LCMS web frontend development for the **Flutter mobile app**. Since the backend APIs and tech foundation are shared, this document focuses on translating web features and design patterns to mobile, ensuring feature parity where applicable.

### Key Alignment Points

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Brand** | Silah / صلة | Silah / صلة |
| **Primary Language** | Arabic (RTL default) | Arabic (RTL default) |
| **APIs** | Fastify REST + Socket.IO | Same APIs via Dio |
| **Auth** | JWT stored in Zustand | JWT in flutter_secure_storage |
| **Real-time** | Socket.IO client | socket_io_client package |
| **State** | TanStack Query + Zustand | Riverpod + StateNotifier |

---

## Part 1: Product Scope (Mobile)

### 1.1 Mobile Vision

The LCMS mobile app is a **companion** to the web dashboard, optimized for:

- Quick case review on-the-go
- Reading and verifying AI regulation suggestions
- Receiving regulation-change notifications immediately
- Uploading/reading documents from mobile

### 1.2 Non-Goals for v1 Mobile

- Full admin management (user management, org config) → web-only
- Advanced analytics dashboards → web-only
- Complex regulation version diff viewer → simplified in v1
- Clients module CRUD → web-only (v1)
- Full Settings (6 tabs) → simplified profile/notifications only

### 1.3 Supported Platforms

- **Android** (primary)
- **iOS** (secondary)
- **Tablets** supported via responsive layouts (not a separate UX)

### 1.4 Languages & Direction

- **Arabic-first** (default), RTL
- **English** supported, LTR
- Locale switching must update UI direction and persist

### 1.5 User Personas (Mobile-Specific)

| Persona | Role | Mobile Use Case |
|---------|------|-----------------|
| **Senior Lawyer** | senior_lawyer | Push alerts + quick review of AI links while traveling |
| **Paralegal** | paralegal | Upload documents (scans), update case status quickly |
| **Lawyer** | lawyer | Check active cases, add notes, verify/dismiss AI suggestions |

---

## Part 2: Features (Aligned with Web)

### 2.1 P0 Features (Must-Have for v1)

#### Authentication
- Login with email/password
- JWT token stored securely (flutter_secure_storage)
- Session persistence across app restarts
- Logout clears all cached data

#### Cases Module
- Cases list with filters (status, assigned to me)
- Search by case title/number (debounced)
- Pull-to-refresh
- Cached list shows instantly, then refresh remote

**Case Card Must Show:**
- Title
- Case number
- Status badge (with correct colors)
- Last updated (relative time)
- Assigned lawyer avatar/initials

**Case Detail Screen (Tabbed):**

| Tab | Features |
|-----|----------|
| **Overview** | Title, client, status, description, jurisdiction, filing date, next hearing |
| **AI Suggestions** | Regulation title, confidence score, verify button, dismiss button |
| **Documents** | List documents, download, upload button |

#### Regulations Module
- Regulations list/search page
- Search by title/number/category
- Filter by status (active/amended/repealed/draft)
- Regulation detail (summary + metadata)
- Subscribe (monitor) regulation updates

#### Notifications
- Push notifications for regulation updates & case events
- In-app notification center
- Notification types: `regulation_updated`, `case_created`, `case_updated`, `ai_links_refreshed`

#### Offline Support
- Cached cases list (last N items)
- Cached last-opened case details
- "Offline" banner when not connected
- Disable write actions when offline

### 2.2 P1 Features (Nice-to-Have)

- Case creation (simplified form)
- Scan document using camera + upload
- Better regulation viewer (sections, TOC)
- Background sync for monitored regulations
- Multi-account or org switching
- Regulation version history comparison

---

## Part 3: Tech Stack (Mandatory)

### 3.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Flutter | 3.x stable | Cross-platform UI |
| Dart | 3.x | Programming language |

### 3.2 State Management

**Primary**: Riverpod v2 + StateNotifier / AsyncNotifier

```dart
// Example provider structure
final casesProvider = StateNotifierProvider<CasesNotifier, AsyncValue<List<Case>>>((ref) {
  return CasesNotifier(ref.read(casesRepositoryProvider));
});
```

**Why Riverpod:**
- Predictable, testable state
- Great for dependency injection
- Handles async loading nicely
- No BuildContext required for providers

### 3.3 Networking

| Package | Purpose |
|---------|---------|
| `dio` | HTTP client |
| `socket_io_client` | Real-time WebSocket |

**Dio Setup with Auth Interceptor:**

```dart
class AuthInterceptor extends Interceptor {
  final SecureStorage storage;
  
  AuthInterceptor(this.storage);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await storage.readToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Trigger logout
    }
    return handler.next(err);
  }
}
```

### 3.4 Storage

| Package | Purpose |
|---------|---------|
| `flutter_secure_storage` | JWT and sensitive data |
| `hive` or `isar` | Offline cache (cases, regulations, notifications) |

### 3.5 Push Notifications

| Package | Purpose |
|---------|---------|
| `firebase_messaging` | FCM for Android/iOS |
| `flutter_local_notifications` | Local notification display |

**Push Types:**
- `regulation_updated` → Navigate to regulation detail
- `case_created` → Navigate to case detail
- `case_updated` → Refresh case detail
- `ai_links_refreshed` → Navigate to case AI tab

---

## Part 4: API Endpoints (Shared with Web)

### 4.1 Authentication

```
POST   /api/auth/login       # Get JWT token
POST   /api/auth/register    # Create new user
POST   /api/auth/logout      # Invalidate session
GET    /api/auth/me          # Get current user info
```

### 4.2 User Profile

```
GET    /api/users/profile              # Get user profile
PATCH  /api/users/profile              # Update profile
```

### 4.3 Cases

```
GET    /api/cases                      # List cases (filtered by org)
POST   /api/cases                      # Create case (triggers AI)
GET    /api/cases/:id                  # Get case details
PUT    /api/cases/:id                  # Update case
DELETE /api/cases/:id                  # Soft delete case
GET    /api/cases/:id/documents        # List case documents
POST   /api/cases/:id/documents        # Upload document
```

### 4.4 AI Links

```
GET    /api/ai-links/:caseId           # Get AI suggestions
POST   /api/ai-links/:caseId/generate  # Manually trigger AI
PATCH  /api/ai-links/:linkId/verify    # Mark as verified
DELETE /api/ai-links/:linkId           # Dismiss suggestion
```

### 4.5 Regulations

```
GET    /api/regulations                # List regulations
GET    /api/regulations/:id            # Get regulation details
GET    /api/regulations/:id/versions   # Version history
POST   /api/regulations/search         # Full-text + semantic search
```

### 4.6 Regulation Subscriptions

```
POST   /api/regulations/:regId/subscribe    # Subscribe to updates
GET    /api/subscriptions                    # List my subscriptions
PATCH  /api/subscriptions/:id               # Update subscription
DELETE /api/subscriptions/:id               # Unsubscribe
```

### 4.7 Documents

```
GET    /api/documents/:id/download     # Download document
DELETE /api/documents/:id              # Delete document
```

### 4.8 Settings

```
GET    /api/settings                   # Get user settings
PATCH  /api/settings                   # Update settings
```

---

## Part 5: Domain Model (Must Match Backend)

### 5.1 Case Statuses

```dart
enum CaseStatus {
  open,
  inProgress,      // API: in_progress
  pendingHearing,  // API: pending_hearing
  closed,
  archived,
}
```

**Status Display Config:**

| Status | Arabic | English | Color |
|--------|--------|---------|-------|
| `open` | مفتوح | Open | Blue |
| `in_progress` | قيد التنفيذ | In Progress | Yellow/Amber |
| `pending_hearing` | في انتظار الجلسة | Pending Hearing | Orange |
| `closed` | مغلق | Closed | Green |
| `archived` | مؤرشف | Archived | Gray |

### 5.2 Case Types

```dart
enum CaseType {
  criminal,
  civil,
  commercial,
  labor,
  family,
  administrative,
}
```

### 5.3 User Roles (RBAC)

```dart
enum UserRole {
  admin,
  seniorLawyer,  // API: senior_lawyer
  lawyer,
  paralegal,
  clerk,
}
```

**Mobile Permissions:**

| Role | Can Verify AI | Can Dismiss AI | Can Upload Docs | Can Edit Case |
|------|--------------|----------------|-----------------|---------------|
| admin | ✅ | ✅ | ✅ | ✅ |
| senior_lawyer | ✅ | ✅ | ✅ | ✅ |
| lawyer | ✅ | ✅ | ✅ | ✅ |
| paralegal | ❌ | ❌ | ✅ | ✅ |
| clerk | ❌ | ❌ | ✅ | ❌ |

### 5.4 Regulation Statuses

```dart
enum RegulationStatus {
  active,
  amended,
  repealed,
  draft,
}
```

---

## Part 6: Design System (Aligned with Figma)

### 6.1 Brand Identity

| Element | English | Arabic |
|---------|---------|--------|
| **Brand Name** | Silah | صلة |
| **Tagline** | Case Management | إدارة القضايا |

### 6.2 Color Palette

**Primary Brand Colors:**

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#0F2942` | Headers, active states, navy accents |
| `brand-accent` | `#D97706` | CTAs, highlights, badges, active indicators |
| `brand-accent-hover` | `#B45309` | Pressed states for accent buttons |
| `brand-secondary` | `#1E3A56` | Darker backgrounds, borders |
| `brand-tertiary` | `#2A4D70` | Input focus borders |

**Surface Colors:**

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-bg` | `#F8FAFC` | Main page background (light mode) |
| `surface-card` | `#FFFFFF` | Card backgrounds |
| `text-primary` | `#0F2942` | Primary headings |
| `text-muted` | `#64748B` | Secondary text |

**Semantic Colors:**

| Purpose | Background | Text | Border |
|---------|------------|------|--------|
| Success | `green-50` | `green-700` | `green-200` |
| Warning | `orange-50` | `#D97706` | `orange-100` |
| Error | `red-50` | `red-600` | `red-200` |
| Info | `blue-50` | `blue-700` | `blue-200` |

### 6.3 Typography

```dart
// Recommended Flutter font configuration
const fontFamily = 'Inter'; // Primary sans-serif
const fontFamilySerif = 'Playfair Display'; // For stat values
```

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Page Title | 24-30sp | Bold (700) | Screen headers |
| Section Title | 18-20sp | Bold (700) | Card headers |
| Body Text | 14sp | Regular (400) | General content |
| Small Text | 12sp | Medium (500) | Timestamps, metadata |
| Micro Text | 10sp | Bold (700) | Badges, labels |

### 6.4 Status Badge Styles

```dart
Color getStatusColor(CaseStatus status) {
  switch (status) {
    case CaseStatus.open:
      return Colors.blue;
    case CaseStatus.inProgress:
      return Colors.amber;
    case CaseStatus.pendingHearing:
      return Colors.orange;
    case CaseStatus.closed:
      return Colors.green;
    case CaseStatus.archived:
      return Colors.grey;
  }
}
```

---

## Part 7: App Architecture

### 7.1 Folder Structure

```
lib/
├── main.dart
├── app/
│   ├── lcms_app.dart               # MaterialApp.router, theme, locale
│   ├── router.dart                 # go_router routes
│   ├── theme/
│   │   ├── app_theme.dart          # Light/dark themes
│   │   └── color_schemes.dart      # Brand colors
│   └── localization/
│       ├── l10n.dart               # AR/EN helpers
│       └── arb/                    # .arb translation files
│
├── core/
│   ├── config/
│   │   ├── env.dart                # API base URL, build flavors
│   │   └── constants.dart          # App constants
│   ├── network/
│   │   ├── dio_provider.dart       # Dio instance
│   │   ├── auth_interceptor.dart   # JWT attachment
│   │   └── error_mapper.dart       # Error to message mapping
│   ├── storage/
│   │   ├── secure_storage.dart     # JWT storage
│   │   └── local_db.dart           # Hive/Isar init
│   ├── realtime/
│   │   ├── socket_client.dart      # Socket.IO connection
│   │   └── realtime_events.dart    # Event types
│   └── utils/
│       ├── formatters.dart         # Date/number formatting
│       ├── validators.dart         # Form validators
│       └── rtl.dart                # RTL utilities
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── auth_api.dart
│   │   │   └── auth_repo.dart
│   │   ├── state/
│   │   │   ├── auth_state.dart
│   │   │   └── auth_notifier.dart
│   │   └── ui/
│   │       ├── login_screen.dart
│   │       └── widgets/
│   │           └── login_form.dart
│   │
│   ├── cases/
│   │   ├── data/
│   │   │   ├── cases_api.dart
│   │   │   ├── cases_local.dart
│   │   │   └── cases_repo.dart
│   │   ├── state/
│   │   │   ├── cases_list_notifier.dart
│   │   │   ├── case_detail_notifier.dart
│   │   │   └── models/
│   │   │       ├── case_model.dart
│   │   │       └── case_status.dart
│   │   └── ui/
│   │       ├── cases_list_screen.dart
│   │       ├── case_detail_screen.dart
│   │       └── widgets/
│   │           ├── case_card.dart
│   │           ├── case_status_badge.dart
│   │           └── tabs/
│   │               ├── case_overview_tab.dart
│   │               ├── case_ai_tab.dart
│   │               └── case_documents_tab.dart
│   │
│   ├── regulations/
│   │   ├── data/
│   │   │   ├── regulations_api.dart
│   │   │   ├── regulations_local.dart
│   │   │   └── regulations_repo.dart
│   │   ├── state/
│   │   │   ├── regulations_search_notifier.dart
│   │   │   ├── regulation_detail_notifier.dart
│   │   │   └── subscriptions_notifier.dart
│   │   └── ui/
│   │       ├── regulations_list_screen.dart
│   │       ├── regulation_detail_screen.dart
│   │       └── widgets/
│   │           ├── regulation_card.dart
│   │           └── subscribe_bottom_sheet.dart
│   │
│   ├── documents/
│   │   ├── data/
│   │   │   ├── documents_api.dart
│   │   │   └── documents_repo.dart
│   │   └── ui/
│   │       └── widgets/
│   │           ├── document_row.dart
│   │           └── upload_button.dart
│   │
│   └── notifications/
│       ├── data/
│       │   ├── notifications_local.dart
│       │   └── notifications_repo.dart
│       ├── state/
│       │   └── notifications_notifier.dart
│       └── ui/
│           ├── notifications_screen.dart
│           └── widgets/
│               └── notification_tile.dart
│
└── shared/
    ├── widgets/
    │   ├── app_scaffold.dart
    │   ├── loading_view.dart
    │   ├── error_view.dart
    │   ├── empty_view.dart
    │   └── confirm_dialog.dart
    └── models/
        ├── paginated.dart
        └── api_result.dart
```

### 7.2 Navigation (go_router)

```dart
// Routes structure
final routes = [
  GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
  
  ShellRoute(
    builder: (_, __, child) => MainShell(child: child),
    routes: [
      GoRoute(path: '/home', builder: (_, __) => const DashboardScreen()),
      GoRoute(path: '/cases', builder: (_, __) => const CasesListScreen()),
      GoRoute(path: '/regulations', builder: (_, __) => const RegulationsListScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    ],
  ),
  
  // Detail routes
  GoRoute(path: '/cases/:id', builder: (_, state) => CaseDetailScreen(id: state.pathParameters['id']!)),
  GoRoute(path: '/regulations/:id', builder: (_, state) => RegulationDetailScreen(id: state.pathParameters['id']!)),
];
```

**Route Guard:**

```dart
redirect: (context, state) {
  final isLoggedIn = ref.read(authProvider).isLoggedIn;
  final isLoginRoute = state.matchedLocation == '/login';
  
  if (!isLoggedIn && !isLoginRoute) {
    return '/login';
  }
  if (isLoggedIn && isLoginRoute) {
    return '/home';
  }
  return null;
}
```

---

## Part 8: Screen Specifications

### 8.1 Login Screen

**Fields:**
- Email input
- Password input (with visibility toggle)
- "Login" button
- "Forgot Password?" link (P1)
- Arabic/English toggle

**Validation:**
- Email: required, valid format
- Password: required, min 6 chars

**Error States:**
- 401 → "Invalid credentials"
- 500 → "Server error, try again"
- Network error → "No internet connection"

### 8.2 Home Screen (Bottom Navigation)

**Bottom Nav Items:**

| Icon | Label (EN) | Label (AR) | Route |
|------|------------|------------|-------|
| Dashboard | Dashboard | الرئيسية | /home |
| Folder | Cases | القضايا | /cases |
| Book | Regulations | الأنظمة | /regulations |
| Bell | Notifications | الإشعارات | /notifications |
| User | Profile | الملف | /profile |

### 8.3 Dashboard Screen

**Widgets:**
- Welcome message with user name
- Stats cards row:
  - Active Cases (count)
  - Pending Hearings (count)
  - AI Suggestions (count)
  - Monitored Regulations (count)
- Recent Cases list (last 5)
- Quick Actions: "New Case" button

### 8.4 Cases List Screen

**Features:**
- Search bar (debounced 300ms)
- Filter chips: All, Open, In Progress, Pending, Closed
- Case cards list
- Pull-to-refresh
- Infinite scroll pagination

**Case Card:**
```
┌─────────────────────────────────────┐
│ [Status Badge]           [Date]    │
│ Case Title                          │
│ Case #12345 • Client Name          │
│ [Lawyer Avatar] Assigned to: Name  │
└─────────────────────────────────────┘
```

### 8.5 Case Detail Screen

**Header:**
- Back button
- Case title
- Status badge
- More menu (Edit, Delete)

**Tab Bar:**
- Overview
- AI Suggestions
- Documents

**Overview Tab:**
- Case number
- Title
- Description
- Type
- Status
- Client info
- Assigned lawyer
- Jurisdiction
- Filing date
- Next hearing

**AI Suggestions Tab:**

```
┌─────────────────────────────────────┐
│ 📋 Regulation Title                 │
│ Score: 87%   [✓ Verify] [✗ Dismiss]│
│ Category: Labor Law                 │
└─────────────────────────────────────┘
```

**Documents Tab:**
- Upload button (FAB)
- Documents list
- Each row: filename, size, date, download button

### 8.6 Regulations List Screen

**Features:**
- Search bar
- Status filter chips
- Regulation cards grid/list
- Monitor button per regulation

**Regulation Card:**
```
┌─────────────────────────────────────┐
│ [📖 Icon]              [Status]    │
│ Regulation Title                    │
│ Description (2 lines max)           │
│ ─────────────────────────────────── │
│ Updated: Date    [🔔 Monitored]    │
└─────────────────────────────────────┘
```

### 8.7 Regulation Detail Screen

**Sections:**
- Title + regulation number
- Status badge
- Metadata (category, jurisdiction, effective date)
- Summary/content section
- "Monitor Updates" CTA button
- "Open Source URL" button (if available)
- Version history (P1)

### 8.8 Notifications Screen

**Features:**
- All / Unread tabs
- Notification list
- Swipe to dismiss
- Tap to navigate

**Notification Item:**
```
┌─────────────────────────────────────┐
│ [Icon]  Notification Title     Dot │
│         Description text            │
│         2 hours ago                 │
└─────────────────────────────────────┘
```

**Icon Types:**
- AI (Sparkles) → Purple
- Regulation (Book) → Orange
- Case (Folder) → Navy
- System (Info) → Gray

### 8.9 Profile Screen

**Sections:**
- Avatar with initials
- Full name
- Email (read-only)
- Role badge
- Organization name

**Settings:**
- Theme toggle (Light/Dark/System)
- Language selector (Arabic/English)
- Notification toggles

**Actions:**
- Logout button

---

## Part 9: Real-time Updates (Socket.IO)

### 9.1 Connection Setup

```dart
class SocketClient {
  late Socket socket;
  
  void connect(String token) {
    socket = io(
      Env.apiUrl,
      OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .setReconnection(true)
        .setReconnectionAttempts(5)
        .setReconnectionDelay(1000)
        .build(),
    );
    
    socket.onConnect((_) {
      debugPrint('Socket connected');
    });
    
    socket.onDisconnect((_) {
      debugPrint('Socket disconnected');
    });
  }
  
  void disconnect() {
    socket.disconnect();
  }
}
```

### 9.2 Event Handlers

| Event | Action |
|-------|--------|
| `case_created` | Invalidate cases list, show toast |
| `case_updated` | Invalidate case detail |
| `case_links_refreshed` | Invalidate AI links, show toast with "View" action |
| `regulation_updated` | Invalidate regulations, show toast |
| `document_uploaded` | Invalidate documents list |

### 9.3 Foreground vs Background

**Foreground (app open):**
- Handle WebSocket events
- Show in-app toast/snackbar
- Update UI immediately

**Background/Killed:**
- Use FCM push notifications
- On tap: navigate to relevant screen

---

## Part 10: Offline & Caching

### 10.1 What to Cache (Priority Order)

1. Cases list (last 100 items)
2. Last opened case details
3. Regulations search results (recent queries)
4. Subscriptions list
5. Notifications feed

### 10.2 Cache Strategy

```dart
// Repository pattern with cache-first
class CasesRepository {
  final CasesApi api;
  final CasesLocal local;
  
  Future<List<Case>> getCases() async {
    // 1. Return cached data immediately
    final cached = await local.getCases();
    if (cached.isNotEmpty) {
      // Emit cached data first
      // Then fetch fresh in background
    }
    
    // 2. Fetch from API
    try {
      final fresh = await api.getCases();
      await local.saveCases(fresh);
      return fresh;
    } catch (e) {
      // Return cached if network fails
      return cached;
    }
  }
}
```

### 10.3 Offline UX Rules

- Show "Offline" banner at top when disconnected
- Disable write actions (verify/dismiss/upload)
- Show last-synced timestamp
- Auto-retry on reconnection

---

## Part 11: RTL & Localization

### 11.1 RTL Implementation

```dart
// In main.dart / MaterialApp
MaterialApp(
  locale: currentLocale,
  supportedLocales: const [
    Locale('ar'), // Arabic (default)
    Locale('en'), // English
  ],
  localizationsDelegates: [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
)
```

### 11.2 Direction-Aware Widgets

```dart
// Use Directionality
Directionality(
  textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
  child: myWidget,
)

// Prefer start/end over left/right
EdgeInsetsDirectional.only(start: 16, end: 8)

// For icons that should flip
Transform.flip(
  flipX: isArabic,
  child: Icon(Icons.arrow_forward),
)
```

### 11.3 Translation Keys Structure

```json
// lib/l10n/app_ar.arb
{
  "appName": "صلة",
  "login": "تسجيل الدخول",
  "cases": "القضايا",
  "regulations": "الأنظمة",
  "notifications": "الإشعارات",
  "profile": "الملف الشخصي",
  "welcome": "مرحباً بك",
  "activeCases": "القضايا النشطة",
  "aiSuggestions": "اقتراحات الذكاء الاصطناعي",
  "verify": "تحقق",
  "dismiss": "تجاهل",
  "monitor": "مراقبة",
  "logout": "تسجيل الخروج"
}
```

---

## Part 12: Error Handling

### 12.1 Error Mapping

```dart
String mapError(DioException error) {
  switch (error.type) {
    case DioExceptionType.connectionTimeout:
      return 'Connection timeout';
    case DioExceptionType.receiveTimeout:
      return 'Server not responding';
    case DioExceptionType.badResponse:
      switch (error.response?.statusCode) {
        case 401:
          return 'Invalid credentials';
        case 403:
          return 'Insufficient permissions';
        case 404:
          return 'Resource not found';
        case 500:
          return 'Server error';
        default:
          return 'Something went wrong';
      }
    default:
      return 'No internet connection';
  }
}
```

### 12.2 Global Error Handling

- 401 responses → Force logout → Navigate to login
- Network errors → Show retry option
- Server errors → Show error message + retry

---

## Part 13: Implementation Timeline

### Week 1: Foundations
1. Project setup + env + theming + localization
2. Auth flow + guarded routing
3. Core networking layer (Dio + interceptor)
4. Token persistence

### Week 2: Cases
1. Cases list + cache + search
2. Case detail + tabs
3. AI verify/dismiss actions
4. Documents list + download + upload

### Week 3: Regulations + Subscriptions
1. Regulations list + search + filter
2. Regulation detail
3. Subscription bottom sheet
4. Subscriptions management

### Week 4: Notifications + Polish
1. In-app notifications screen
2. WebSocket event handling
3. Push notifications (FCM)
4. RTL testing + offline testing
5. Performance optimization

---

## Part 14: Acceptance Criteria (Mobile v1)

### Functional

- [ ] User can login and token persists after app restart
- [ ] Cases list loads (cached first, then refreshed)
- [ ] Case detail shows all three tabs
- [ ] AI suggestions display with scores
- [ ] Verify/dismiss works and updates UI immediately
- [ ] Document list displays correctly
- [ ] Document download works
- [ ] Document upload works
- [ ] Regulations can be searched and filtered
- [ ] Regulation detail displays correctly
- [ ] User can subscribe to a regulation
- [ ] "Monitored" badge shows for subscribed regulations
- [ ] Notifications screen shows all notification types
- [ ] Tapping notification navigates to correct screen
- [ ] Push notification opens correct screen
- [ ] Profile displays user info correctly
- [ ] Theme toggle works and persists
- [ ] Language toggle works and persists (with RTL switch)
- [ ] Logout clears all data

### RTL

- [ ] Arabic layout is RTL across all screens
- [ ] Titles and labels are localized
- [ ] Icons flip correctly when needed
- [ ] Lists read right-to-left in Arabic
- [ ] Forms align correctly per locale

### Performance

- [ ] First meaningful screen < 3 seconds on mid-range Android
- [ ] Scrolling lists are smooth (60fps)
- [ ] Offline mode works with cached data
- [ ] App size < 50MB (release APK)

### Offline

- [ ] Cached cases list displays when offline
- [ ] "Offline" banner appears when disconnected
- [ ] Write actions are disabled when offline
- [ ] Data syncs on reconnection

---

## Part 15: Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  
  # Navigation
  go_router: ^12.0.0
  
  # Networking
  dio: ^5.3.0
  socket_io_client: ^2.0.0
  
  # Storage
  flutter_secure_storage: ^9.0.0
  hive_flutter: ^1.1.0
  
  # Push Notifications
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.0.0
  
  # UI
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Utils
  intl: ^0.18.0
  flutter_localization: ^0.2.0
  image_picker: ^1.0.0
  file_picker: ^6.0.0
  url_launcher: ^6.2.0
  
  # Dev
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
  hive_generator: ^2.0.0
  mockito: ^5.4.0
```

---

**End of Mobile Frontend Context**

*Version: 1.0*  
*Last Updated: 2026-01-21*  
*Status: Ready for Implementation*
