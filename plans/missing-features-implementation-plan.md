# Missing Features Implementation Plan

## Legal Case Management System - Web Frontend Completion

> **Status**: Implementation roadmap for remaining features  
> **Framework**: Next.js 14+ (App Router)  
> **Priority**: High-impact features first  
> **Timeline**: 3-4 weeks for full completion

---

## Table of Contents

1. [Overview](#overview)
2. [Missing Features Summary](#missing-features-summary)
3. [Phase 1: Core Pages & Routes](#phase-1-core-pages--routes)
4. [Phase 2: Shared Components](#phase-2-shared-components)
5. [Phase 3: UI Primitives](#phase-3-ui-primitives)
6. [Phase 4: State Management & Utilities](#phase-4-state-management--utilities)
7. [Phase 5: Internationalization & RTL](#phase-5-internationalization--rtl)
8. [Phase 6: Advanced Features](#phase-6-advanced-features)
9. [Phase 7: Polish & Testing](#phase-7-polish--testing)
10. [Implementation Checklist](#implementation-checklist)

---

## Overview

This plan addresses the remaining unimplemented features from the original Web Frontend Implementation Plan. We'll build these features incrementally, prioritizing user-facing functionality before infrastructure improvements.

### Key Principles

- **User-first**: Implement visible features before refactoring internals
- **Consistency**: Match existing code style and patterns
- **Progressive enhancement**: Build basic versions first, enhance later
- **Type safety**: Maintain TypeScript coverage throughout

---

## Missing Features Summary

### 0. Highest-Priority Essentials (Do These First)

- **Auth completeness**
  - Implement `src/app/(auth)/register/page.tsx` (Register page)
  - Implement `src/components/features/auth/register-form.tsx` and integrate it into the Register page
  - Implement `src/components/features/auth/login-form.tsx` and refactor `src/app/(auth)/login/page.tsx` to use it

- **Core navigation pages (avoid 404s from sidebar/links)**
  - Implement `src/app/(dashboard)/regulations/page.tsx`
  - Implement `src/app/(dashboard)/profile/page.tsx`
  - Implement `src/app/(dashboard)/settings/page.tsx` together with `src/lib/store/ui-store.ts` and `src/components/layout/theme-toggle.tsx`

- **First impression & main entry point**
  - Replace the default Next.js home with the planned landing page in `src/app/page.tsx`

- **Case detail completeness**
  - Implement `src/components/features/cases/document-manager.tsx` and wire it into the Documents tab of `src/app/(dashboard)/cases/[id]/page.tsx`
  - Add AI link **dismiss/remove** action via `useDismissLink` in `src/lib/hooks/use-ai-links.ts` and update `src/components/features/cases/ai-suggestions.tsx`

- **Usability for real workloads**
  - Add search for cases (hook + input wired into `src/app/(dashboard)/cases/page.tsx`)
  - Add basic pagination infrastructure (pagination component + integration on cases list, if the backend supports it)

### 1. Missing Pages/Routes

- [ ] `src/app/(auth)/register/page.tsx` - User registration page
- [ ] `src/app/(dashboard)/regulations/page.tsx` - Regulations list/search
- [ ] `src/app/(dashboard)/profile/page.tsx` - User profile management
- [ ] `src/app/(dashboard)/settings/page.tsx` - App settings & preferences
- [ ] `src/app/page.tsx` - Landing page (replace Next.js default)
- [ ] Documents tab in `cases/[id]/page.tsx` - Document management UI

### 2. Unimplemented Components

**Auth Components**
- [ ] `src/components/features/auth/login-form.tsx`
- [ ] `src/components/features/auth/register-form.tsx`

**Layout Components**
- [ ] `src/components/layout/footer.tsx`
- [ ] `src/components/layout/theme-toggle.tsx`

**Case Components**
- [ ] `src/components/features/cases/case-list.tsx`

**UI Primitives (shadcn/ui)**
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/table.tsx`
- [ ] `src/components/ui/toast.tsx`
- [ ] `src/components/ui/dropdown-menu.tsx`
- [ ] `src/components/ui/avatar.tsx`
- [ ] `src/components/ui/separator.tsx`
- [ ] `src/components/ui/switch.tsx`
- [ ] `src/components/ui/checkbox.tsx`

### 3. State, Types & Utilities

**API Layer**
- [ ] `src/lib/api/endpoints.ts` - Centralized endpoint constants
- [ ] `src/lib/api/cases.ts` - Case-specific API methods
- [ ] `src/lib/api/regulations.ts` - Regulations API methods
- [ ] `src/lib/api/ai-links.ts` - AI links API methods

**State Management**
- [ ] `src/lib/store/ui-store.ts` - UI preferences (theme, sidebar, etc.)
- [ ] `src/lib/store/websocket-store.ts` - WebSocket connection state

**Types**
- [ ] `src/lib/types/auth.ts` - Auth-specific types
- [ ] `src/lib/types/regulation.ts` - Regulation types (separate from case.ts)
- [ ] `src/lib/types/document.ts` - Document management types

**Utilities**
- [ ] `src/lib/utils/format.ts` - Date/number formatting
- [ ] `src/lib/utils/validators.ts` - Validation helpers

### 4. Internationalization & Accessibility

- [ ] RTL/LTR support with locale detection
- [ ] Arabic language integration
- [ ] Locale switcher UI
- [ ] Direction-aware layout utilities

### 5. Advanced Features

- [ ] Pagination on cases list
- [ ] Search functionality (header + cases page)
- [ ] AI link dismiss/remove action
- [ ] Document upload & management
- [ ] Skeleton loading states
- [ ] Error boundaries

---

## Phase 1: Core Pages & Routes

### 1.1 Register Page

**File**: `src/app/(auth)/register/page.tsx`

```typescript
"use client";

import { RegisterForm } from "@/components/features/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl" aria-hidden="true">⚖️</span>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Register to start managing your legal cases
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Priority**: High (auth flow incomplete without it)  
**Depends on**: `RegisterForm` component (Phase 2)

---

### 1.2 Regulations Page

**File**: `src/app/(dashboard)/regulations/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRegulations } from "@/lib/hooks/use-regulations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function RegulationsPage() {
  const { data: regulations, isLoading } = useRegulations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegulations = regulations?.filter((reg) =>
    reg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regulations</h1>
          <p className="text-muted-foreground">
            Browse and search Saudi legal regulations
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search regulations by title, category, or number..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Regulations Table */}
      <div className="rounded-lg border">
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Number</th>
              <th>Category</th>
              <th>Jurisdiction</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Loading regulations...
                </td>
              </tr>
            ) : (
              filteredRegulations?.map((reg) => (
                <tr key={reg.id}>
                  <td className="font-medium">{reg.title}</td>
                  <td>{reg.regulation_number || "N/A"}</td>
                  <td>{reg.category || "General"}</td>
                  <td>{reg.jurisdiction || "Saudi Arabia"}</td>
                  <td>
                    <Badge variant={reg.status === "active" ? "default" : "secondary"}>
                      {reg.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
```

**Priority**: Medium (navigation exists but page missing)  
**Depends on**: `useRegulations` hook, `Table` component

---

### 1.3 Profile Page

**File**: `src/app/(dashboard)/profile/page.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    // TODO: Implement profile update API call
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  {user?.fullName?.split(" ").map((n) => n[0]).join("") || "LC"}
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-muted-foreground">{user?.role || "Lawyer"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Organization ID</p>
              <p className="text-muted-foreground">{user?.organizationId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-muted-foreground">{user?.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Priority**: Medium  
**Depends on**: `Avatar` component

---

### 1.4 Settings Page

**File**: `src/app/(dashboard)/settings/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useUIStore } from "@/lib/store/ui-store";

export default function SettingsPage() {
  const { locale, setLocale, notifications, setNotifications } = useUIStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your application preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="language">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <Select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "ar")}
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Case Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when cases are updated
              </p>
            </div>
            <Switch
              checked={notifications.caseUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, caseUpdates: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new AI regulation suggestions
              </p>
            </div>
            <Switch
              checked={notifications.aiSuggestions}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, aiSuggestions: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Regulation Updates</Label>
              <p className="text-sm text-muted-foreground">
                Real-time alerts when regulations change
              </p>
            </div>
            <Switch
              checked={notifications.regulationUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, regulationUpdates: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Priority**: Medium  
**Depends on**: `Switch`, `Separator`, `ThemeToggle`, `useUIStore`

---

### 1.5 Landing Page

**File**: `src/app/page.tsx`

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Sparkles, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Legal Case Management
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manage Legal Cases with Intelligence
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your legal practice with AI-powered regulation suggestions,
            real-time collaboration, and intelligent case management for Saudi law.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={<Briefcase className="h-10 w-10 text-blue-600" />}
            title="Case Management"
            description="Organize and track all your legal cases in one centralized dashboard"
          />
          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-purple-600" />}
            title="AI Suggestions"
            description="Get intelligent regulation recommendations powered by advanced AI"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-green-600" />}
            title="Saudi Law Focus"
            description="Built specifically for Saudi Arabian legal system and regulations"
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-orange-600" />}
            title="Real-time Updates"
            description="Stay synced with live updates and team collaboration features"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Legal Case Management System. Built for Saudi legal practitioners.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="pt-6 space-y-4">
        <div className="inline-flex p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
```

**Priority**: High (first impression)  
**Depends on**: None (uses existing components)

---

### 1.6 Document Management UI

**File**: `src/components/features/cases/document-manager.tsx`

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Trash2, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Document {
  id: number;
  name: string;
  size: number;
  uploadedAt: string;
  type: string;
}

interface DocumentManagerProps {
  caseId: number;
}

export function DocumentManager({ caseId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // TODO: Implement actual file upload
      const newDoc: Document = {
        id: Date.now(),
        name: files[0].name,
        size: files[0].size,
        uploadedAt: new Date().toISOString(),
        type: files[0].type,
      };

      setDocuments((prev) => [...prev, newDoc]);
      toast({
        title: "Document uploaded",
        description: `${files[0].name} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({ title: "Document deleted" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload case documents, evidence, or legal files
          </p>
          <label htmlFor="file-upload">
            <Button variant="outline" disabled={isUploading} asChild>
              <span>
                {isUploading ? "Uploading..." : "Choose Files"}
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
          </label>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No documents uploaded yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Update**: `src/app/(dashboard)/cases/[id]/page.tsx`

Replace the Documents tab content:

```typescript
<TabsContent value="documents">
  <DocumentManager caseId={caseId} />
</TabsContent>
```

**Priority**: High (visible placeholder in UI)  
**Depends on**: File upload API endpoint

---

## Phase 2: Shared Components

### 2.1 Auth Form Components

**File**: `src/components/features/auth/login-form.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/lib/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="lawyer@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 text-center">
          {(error as any).response?.data?.error || "Login failed"}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </div>
    </form>
  );
}
```

**File**: `src/components/features/auth/register-form.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/use-auth";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  organizationId: z.number().min(1, "Organization ID is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    register(registerData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          {...registerField("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="lawyer@example.com"
          {...registerField("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationId">Organization ID</Label>
        <Input
          id="organizationId"
          type="number"
          placeholder="1"
          {...registerField("organizationId", { valueAsNumber: true })}
        />
        {errors.organizationId && (
          <p className="text-sm text-red-500">{errors.organizationId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...registerField("password")} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...registerField("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 text-center">
          {(error as any).response?.data?.error || "Registration failed"}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}
```

**Refactor**: Update `src/app/(auth)/login/page.tsx` to use `LoginForm`

**Priority**: Medium (improves code organization)

---

### 2.2 Layout Components

**File**: `src/components/layout/theme-toggle.tsx`

```typescript
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
```

**File**: `src/components/layout/footer.tsx`

```typescript
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">Legal CMS</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered case management for Saudi legal practitioners
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-muted-foreground hover:text-foreground">
                  Cases
                </Link>
              </li>
              <li>
                <Link href="/regulations" className="text-muted-foreground hover:text-foreground">
                  Regulations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Legal Case Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

**Priority**: Low (non-critical UI)

---

### 2.3 Case List Component

**File**: `src/components/features/cases/case-list.tsx`

```typescript
"use client";

import { Case } from "@/lib/types/case";
import { CaseCard } from "./case-card";

interface CaseListProps {
  cases: Case[];
  isLoading?: boolean;
}

export function CaseList({ cases, isLoading }: CaseListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-lg border bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cases found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((case_) => (
        <CaseCard key={case_.id} case_={case_} />
      ))}
    </div>
  );
}
```

**Refactor**: Update `src/app/(dashboard)/cases/page.tsx` to use `CaseList`

**Priority**: Low (organizational improvement)

---

## Phase 3: UI Primitives

### 3.1 Install Missing shadcn/ui Components

```bash
# Run these commands to add missing UI components
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add switch
npx shadcn@latest add checkbox
npx shadcn@latest add alert-dialog
npx shadcn@latest add progress
npx shadcn@latest add skeleton
```

**Priority**: High (required by multiple features)  
**Estimated time**: 30 minutes

---

## Phase 4: State Management & Utilities

### 4.1 API Layer Organization

**File**: `src/lib/api/endpoints.ts`

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const endpoints = {
  // Auth
  auth: {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
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
    search: `${API_BASE}/api/regulations/search`,
  },

  // AI Links
  aiLinks: {
    list: (caseId: number) => `${API_BASE}/api/ai-links/${caseId}`,
    generate: (caseId: number) => `${API_BASE}/api/ai-links/${caseId}/generate`,
    verify: (linkId: number) => `${API_BASE}/api/ai-links/${linkId}/verify`,
    dismiss: (linkId: number) => `${API_BASE}/api/ai-links/${linkId}/dismiss`,
  },

  // Documents
  documents: {
    list: (caseId: number) => `${API_BASE}/api/cases/${caseId}/documents`,
    upload: (caseId: number) => `${API_BASE}/api/cases/${caseId}/documents`,
    delete: (documentId: number) => `${API_BASE}/api/documents/${documentId}`,
    download: (documentId: number) => `${API_BASE}/api/documents/${documentId}/download`,
  },
} as const;
```

**Priority**: Medium (improves maintainability)

---

### 4.2 UI Store

**File**: `src/lib/store/ui-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Notifications {
  caseUpdates: boolean;
  aiSuggestions: boolean;
  regulationUpdates: boolean;
}

interface UIState {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Locale
  locale: "en" | "ar";
  setLocale: (locale: "en" | "ar") => void;

  // Layout
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notifications
  notifications: Notifications;
  setNotifications: (notifications: Notifications) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Locale
      locale: "en",
      setLocale: (locale) => {
        set({ locale });
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      },

      // Layout
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Notifications
      notifications: {
        caseUpdates: true,
        aiSuggestions: true,
        regulationUpdates: true,
      },
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: "ui-storage",
    }
  )
);
```

**Priority**: High (required for settings page)

---

### 4.3 Formatting Utilities

**File**: `src/lib/utils/format.ts`

```typescript
import { format as dateFnsFormat, formatDistance, formatRelative } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export const format = {
  /**
   * Format date to readable string
   */
  date: (date: string | Date, formatStr: string = "PPP", locale: "en" | "ar" = "en") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateFnsFormat(dateObj, formatStr, {
      locale: locale === "ar" ? ar : enUS,
    });
  },

  /**
   * Format date as relative time (e.g., "2 hours ago")
   */
  relative: (date: string | Date, locale: "en" | "ar" = "en") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: locale === "ar" ? ar : enUS,
    });
  },

  /**
   * Format date with context (e.g., "yesterday at 3:30 PM")
   */
  contextual: (date: string | Date, locale: "en" | "ar" = "en") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatRelative(dateObj, new Date(), {
      locale: locale === "ar" ? ar : enUS,
    });
  },

  /**
   * Format file size
   */
  fileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Format currency (SAR)
   */
  currency: (amount: number, locale: "en" | "ar" = "en"): string => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  },

  /**
   * Format case number with prefix
   */
  caseNumber: (number: string | number): string => {
    return `#${number}`;
  },

  /**
   * Format status for display
   */
  status: (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  },
};
```

**Install date-fns**: `npm install date-fns`

**Priority**: High (used across multiple features)

---

### 4.4 Validation Utilities

**File**: `src/lib/utils/validators.ts`

```typescript
import * as z from "zod";

/**
 * Common validation schemas
 */
export const validators = {
  email: z.string().email("Invalid email address"),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  phoneNumber: z
    .string()
    .regex(/^(\+966|00966|0)?5[0-9]{8}$/, "Invalid Saudi phone number"),

  caseNumber: z
    .string()
    .min(1, "Case number is required")
    .regex(/^[A-Z0-9\/-]+$/i, "Case number can only contain letters, numbers, and dashes"),

  url: z.string().url("Invalid URL"),

  /**
   * Validate file type
   */
  fileType: (allowedTypes: string[]) => {
    return z
      .instanceof(File)
      .refine(
        (file) => allowedTypes.some((type) => file.type.includes(type)),
        `File must be one of: ${allowedTypes.join(", ")}`
      );
  },

  /**
   * Validate file size (in MB)
   */
  fileSize: (maxSizeMB: number) => {
    return z
      .instanceof(File)
      .refine(
        (file) => file.size <= maxSizeMB * 1024 * 1024,
        `File size must be less than ${maxSizeMB}MB`
      );
  },
};

/**
 * Helper to check if a string is a valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Validate and parse date string
 */
export function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}
```

**Priority**: Medium (improves validation consistency)

---

### 4.5 Type Definitions

**File**: `src/lib/types/auth.ts`

```typescript
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  organizationId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  organizationId: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  error: string;
  statusCode: number;
}
```

**File**: `src/lib/types/regulation.ts`

```typescript
export interface Regulation {
  id: number;
  title: string;
  regulation_number?: string;
  category?: string;
  jurisdiction?: string;
  status: "active" | "archived" | "draft";
  content?: string;
  effective_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RegulationCategory {
  id: string;
  name: string;
  nameAr?: string;
  count: number;
}

export interface RegulationSearchParams {
  query?: string;
  category?: string;
  jurisdiction?: string;
  status?: string;
}
```

**File**: `src/lib/types/document.ts`

```typescript
export interface Document {
  id: number;
  case_id: number;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

export interface DocumentUploadInput {
  file: File;
  caseId: number;
}
```

**Priority**: High (improves type safety)

---

## Phase 5: Internationalization & RTL

### 5.1 RTL Layout Support

**File**: `src/lib/utils/rtl.ts`

```typescript
export function isRTL(locale: string): boolean {
  return locale === "ar";
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * Get direction-aware class names
 */
export function rtl(locale: string, ltrClass: string, rtlClass: string): string {
  return isRTL(locale) ? rtlClass : ltrClass;
}

/**
 * CSS logical properties helper
 */
export const logical = {
  marginStart: (value: string) => ({
    marginInlineStart: value,
  }),
  marginEnd: (value: string) => ({
    marginInlineEnd: value,
  }),
  paddingStart: (value: string) => ({
    paddingInlineStart: value,
  }),
  paddingEnd: (value: string) => ({
    paddingInlineEnd: value,
  }),
  start: (value: string) => ({
    insetInlineStart: value,
  }),
  end: (value: string) => ({
    insetInlineEnd: value,
  }),
};
```

---

### 5.2 Translation Hook

**File**: `src/lib/hooks/use-translation.ts`

```typescript
"use client";

import { useUIStore } from "@/lib/store/ui-store";

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    cases: "Cases",
    regulations: "Regulations",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",

    // Actions
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",

    // Case Management
    newCase: "New Case",
    caseDetails: "Case Details",
    caseNumber: "Case Number",
    caseType: "Case Type",
    status: "Status",
    client: "Client",
    description: "Description",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noData: "No data available",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    cases: "القضايا",
    regulations: "الأنظمة",
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",

    // Actions
    create: "إنشاء",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    filter: "تصفية",

    // Case Management
    newCase: "قضية جديدة",
    caseDetails: "تفاصيل القضية",
    caseNumber: "رقم القضية",
    caseType: "نوع القضية",
    status: "الحالة",
    client: "العميل",
    description: "الوصف",

    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    noData: "لا توجد بيانات",
  },
};

export function useTranslation() {
  const locale = useUIStore((state) => state.locale);

  const t = (key: keyof typeof translations.en): string => {
    return translations[locale][key] || translations.en[key] || key;
  };

  return { t, locale };
}
```

---

### 5.3 Update Root Layout for RTL

**Update**: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { RootLayoutClient } from "./root-layout-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Case Management System",
  description: "AI-powered legal case management for Saudi practitioners",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
```

**File**: `src/app/root-layout-client.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store/ui-store";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const locale = useUIStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
```

**Priority**: High (enables Arabic support)

---

## Phase 6: Advanced Features

### 6.1 Pagination Component

**File**: `src/components/ui/pagination.tsx`

```typescript
"use client";

import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (Math.abs(page - currentPage) <= 1) return true;
    return false;
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, idx) => {
        const prevPage = visiblePages[idx - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-2">...</span>}
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

---

### 6.2 Search Implementation

**File**: `src/lib/hooks/use-search.ts`

```typescript
"use client";

import { useState, useMemo } from "react";
import { debounce } from "@/lib/utils/debounce";

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  delay: number = 300
) {
  const [query, setQuery] = useState("");

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setQuery(value), delay),
    [delay]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(lowerQuery);
      })
    );
  }, [items, query, searchFields]);

  return {
    query,
    setQuery: debouncedSetQuery,
    filteredItems,
  };
}
```

**File**: `src/lib/utils/debounce.ts`

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

**Update Cases Page** with search:

```typescript
// In src/app/(dashboard)/cases/page.tsx
import { useSearch } from "@/lib/hooks/use-search";

// Inside component:
const { data: cases = [], isLoading } = useCases();
const { query, setQuery, filteredItems: searchedCases } = useSearch(
  cases,
  ["title", "case_number", "description"],
  300
);

// Add search input:
<Input
  placeholder="Search cases..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

**Priority**: High (improves usability)

---

### 6.3 AI Link Dismiss Action

**Update**: `src/lib/hooks/use-ai-links.ts`

Add dismiss mutation:

```typescript
export function useDismissLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: number) => {
      await apiClient.delete(`/api/ai-links/${linkId}`);
    },
    onSuccess: (_, linkId) => {
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      toast({
        title: "Link dismissed",
        description: "AI suggestion has been removed",
      });
    },
  });
}
```

**Update**: `src/components/features/cases/ai-suggestions.tsx`

Add dismiss button:

```typescript
import { useDismissLink } from "@/lib/hooks/use-ai-links";
import { X } from "lucide-react";

// Inside component:
const { mutate: dismissLink } = useDismissLink();

// In the link card JSX:
<Button
  size="sm"
  variant="ghost"
  onClick={() => dismissLink(link.id)}
>
  <X className="h-4 w-4 text-red-600" />
</Button>
```

**Priority**: High (user requested feature)

---

### 6.4 Loading Skeletons

**File**: `src/components/ui/skeleton.tsx`

```bash
npx shadcn@latest add skeleton
```

**File**: `src/components/features/cases/case-skeleton.tsx`

```typescript
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CaseSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </Card>
  );
}
```

Use in pages:

```typescript
{isLoading && (
  <div className="grid gap-4 md:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <CaseSkeleton key={i} />
    ))}
  </div>
)}
```

**Priority**: Medium (polish)

---

## Phase 7: Polish & Testing

### 7.1 Error Boundary

**File**: `src/components/error-boundary.tsx`

```typescript
"use client";

import { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Priority**: High (production stability)

---

### 7.2 Environment Configuration

**File**: `.env.example`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=Legal Case Management System
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# Upload Limits
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.jpg,.png
```

**Priority**: High (deployment requirement)

---

### 7.3 README Update

**File**: `README.md`

```markdown
# Legal Case Management System - Web Frontend

AI-powered legal case management system built with Next.js 14, designed for Saudi legal practitioners.

## Features

- 📁 **Case Management** - Create, track, and manage legal cases
- 🤖 **AI Suggestions** - Get intelligent regulation recommendations
- 🌐 **Bilingual** - Full support for English and Arabic (RTL)
- 🔐 **Secure Auth** - JWT-based authentication
- ⚡ **Real-time** - WebSocket updates for live collaboration
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **State**: TanStack Query + Zustand
- **Language**: TypeScript
- **Real-time**: Socket.IO

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd legal-cms-web
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your API endpoints.

4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components (header, sidebar)
├── lib/
│   ├── api/             # API client & endpoints
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
└── providers/           # Context providers
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Implementation Status

### ✅ Completed
- [x] Authentication (login/register)
- [x] Dashboard with statistics
- [x] Case CRUD operations
- [x] AI regulation suggestions
- [x] WebSocket real-time updates
- [x] Dark mode support
- [x] RTL/Arabic support
- [x] Responsive design

### 🚧 In Progress
- [ ] Document management
- [ ] Advanced search
- [ ] Pagination
- [ ] User profile settings

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL
- `NEXT_PUBLIC_DEFAULT_LOCALE` - Default language (en/ar)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a graduation project for a Legal Case Management System.

## Support

For support and questions, contact the development team.
```

**Priority**: Medium

---

## Implementation Checklist

### Week 1: Core Pages (Phase 1)
- [ ] Day 1: Register page + RegisterForm component
- [ ] Day 2: Regulations page + useRegulations hook
- [ ] Day 3: Profile page
- [ ] Day 4: Settings page + UI store
- [ ] Day 5: Landing page redesign

### Week 2: Components & UI (Phases 2-3)
- [ ] Day 1: Install shadcn components (dialog, table, etc.)
- [ ] Day 2: Auth form components (login/register forms)
- [ ] Day 3: Layout components (footer, theme toggle)
- [ ] Day 4: Document management UI
- [ ] Day 5: Case list component + loading skeletons

### Week 3: State & Utilities (Phase 4)
- [ ] Day 1: API layer organization (endpoints.ts)
- [ ] Day 2: UI store implementation
- [ ] Day 3: Formatting utilities (format.ts)
- [ ] Day 4: Validation utilities (validators.ts)
- [ ] Day 5: Type definitions (auth, regulation, document)

### Week 4: Advanced Features (Phases 5-7)
- [ ] Day 1: RTL support implementation
- [ ] Day 2: Translation hook + locale switcher
- [ ] Day 3: Pagination + search functionality
- [ ] Day 4: AI dismiss action + polish
- [ ] Day 5: Error boundary + final testing

---

## Testing Strategy

### Manual Testing Checklist

**Authentication**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Logout functionality
- [ ] Token expiration handling

**Case Management**
- [ ] Create new case
- [ ] View case details
- [ ] Edit case information
- [ ] Delete case
- [ ] Filter cases by status/type
- [ ] Search cases by title

**AI Features**
- [ ] Generate AI suggestions
- [ ] Verify AI link
- [ ] Dismiss AI link
- [ ] Real-time updates via WebSocket

**Internationalization**
- [ ] Switch between English and Arabic
- [ ] RTL layout in Arabic mode
- [ ] Date/number formatting in both locales

**Responsive Design**
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640px - 1024px)
- [ ] Desktop view (> 1024px)

---

## Performance Optimization

### Recommendations

1. **Code Splitting**
   - Use dynamic imports for heavy components
   - Lazy load routes not in initial view

2. **Image Optimization**
   - Use Next.js `<Image>` component
   - Implement proper sizes and formats

3. **Caching Strategy**
   - Leverage TanStack Query's cache
   - Use ISR for static regulation pages

4. **Bundle Size**
   - Monitor with `next build` analyzer
   - Remove unused dependencies

---

## Deployment Checklist

### Pre-deployment
- [ ] Update `.env.example` with all variables
- [ ] Test production build locally (`npm run build && npm start`)
- [ ] Verify API endpoints are correct
- [ ] Check CORS configuration
- [ ] Test on multiple browsers

### Deployment
- [ ] Set up environment variables on hosting platform
- [ ] Configure domain and SSL
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure analytics if enabled

### Post-deployment
- [ ] Smoke test all critical paths
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify WebSocket connections

---

## Notes

- **Prioritize user-facing features first** (pages, core components)
- **Test RTL support thoroughly** - Arabic layout is critical for Saudi users
- **Keep components small and focused** - easier to maintain and test
- **Document complex logic** - especially around WebSocket and AI features
- **Use TypeScript strictly** - avoid `any` types where possible

---

**End of Missing Features Implementation Plan**

*Last Updated: December 2024*

