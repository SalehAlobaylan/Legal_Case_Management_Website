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
  { value: "Corporate", label: "Corporate", icon: Building2, color: "text-purple-600 bg-purple-100" },
  { value: "SME", label: "SME", icon: Briefcase, color: "text-green-600 bg-green-100" },
  { value: "Group", label: "Group", icon: Users, color: "text-orange-600 bg-orange-100" },
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0F2942] text-white">
                <User className="h-5 w-5" />
              </div>
              {mode === "create" ? "Add New Client" : "Edit Client"}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {/* Client Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0F2942]">Client Type</label>
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
                        "hover:shadow-md",
                        isSelected
                          ? "border-[#D97706] bg-orange-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", type.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-[#D97706]" : "text-slate-600"
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0F2942]">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter client name or company name"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
                  "transition-all duration-200",
                  errors.name ? "border-red-400 bg-red-50" : "border-slate-200"
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0F2942]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
                    "transition-all duration-200",
                    errors.email ? "border-red-400 bg-red-50" : "border-slate-200"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0F2942]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
                    "transition-all duration-200",
                    errors.phone ? "border-red-400 bg-red-50" : "border-slate-200"
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0F2942]">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address, city, postal code"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
                  "transition-all duration-200",
                  "border-slate-200"
                )}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0F2942]">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about this client..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
                  "transition-all duration-200",
                  "border-slate-200"
                )}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2.5 rounded-xl font-bold"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
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
