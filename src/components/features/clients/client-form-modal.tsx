/**
 * File: src/components/features/clients/client-form-modal.tsx
 * Purpose: Modal for creating/editing client information.
 *
 * Features:
 * - Full form with validation
 * - Client types: Individual, Corporate, SME, Group
 * - Contact information fields
 * - Address and notes
 * - Silah design system styling
 */

"use client";

import * as React from "react";
import { User, Building2, Users, Briefcase, X, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   TYPES
   ============================================================================= */

export interface ClientFormData {
  name: string;
  type: "Individual" | "Corporate" | "SME" | "Group";
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: Partial<ClientFormData>;
  mode?: "create" | "edit";
}

/* =============================================================================
   CLIENT TYPE OPTIONS
   ============================================================================= */

const CLIENT_TYPES = [
  { value: "Individual", label: "Individual", icon: User, color: "text-blue-600 bg-blue-100" },
  { value: "Corporate", label: "Corporate", icon: Building2, color: "text-violet-600 bg-violet-100" },
  { value: "SME", label: "SME", icon: Briefcase, color: "text-green-600 bg-green-100" },
  { value: "Group", label: "Group", icon: Users, color: "text-amber-600 bg-amber-100" },
] as const;

/* =============================================================================
   COMPONENT
   ============================================================================= */

export function ClientFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: ClientFormModalProps) {
  const [formData, setFormData] = React.useState<ClientFormData>({
    name: initialData?.name ?? "",
    type: initialData?.type ?? "Individual",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    address: initialData?.address ?? "",
    notes: initialData?.notes ?? "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof ClientFormData, string>>>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name ?? "",
        type: initialData?.type ?? "Individual",
        phone: initialData?.phone ?? "",
        email: initialData?.email ?? "",
        address: initialData?.address ?? "",
        notes: initialData?.notes ?? "",
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[var(--color-border-default)] bg-[var(--color-surface-card)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative" icon={<User className="h-5 w-5" />}>
            <DialogTitle>{mode === "create" ? "Add New Client" : "Edit Client"}</DialogTitle>
            <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]">
              <X className="h-5 w-5" />
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-6">
            <div className="space-y-2">
              <Label>Client Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CLIENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange("type", type.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200",
                        "flex flex-col items-center gap-2 text-center",
                        "hover:shadow-sm",
                        isSelected
                          ? "border-[var(--color-brand-accent)] bg-orange-50/70 shadow-sm"
                          : "border-[var(--color-border-default)] hover:border-[var(--color-border-dark)]"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", type.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected
                            ? "text-[var(--color-brand-accent)]"
                            : "text-[var(--color-text-secondary)]"
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name" required>
                Client Name
              </Label>
              <Input
                id="client-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter client name or company name"
                error={Boolean(errors.name)}
                aria-invalid={Boolean(errors.name)}
                className={cn(errors.name && "bg-[var(--color-error-bg)]")}
              />
              {errors.name && (
                <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-email" required>
                  Email Address
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                  error={Boolean(errors.email)}
                  aria-invalid={Boolean(errors.email)}
                  className={cn(errors.email && "bg-[var(--color-error-bg)]")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-phone" required>
                  Phone Number
                </Label>
                <Input
                  id="client-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  error={Boolean(errors.phone)}
                  aria-invalid={Boolean(errors.phone)}
                  className={cn(errors.phone && "bg-[var(--color-error-bg)]")}
                />
                {errors.phone && (
                  <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address, city, postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea
                id="client-notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about this client..."
                rows={3}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="px-6 rounded-xl"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="px-6 rounded-xl font-semibold"
            >
              <Save className="h-4 w-4" />
              {mode === "create" ? "Add Client" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
