"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Building2, Users, Briefcase, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  type: z.enum(["Individual", "Corporate", "SME", "Group"]),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.input<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  clientId?: number;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

const CLIENT_TYPES = [
  { value: "Individual", label: "individual", icon: User, color: "text-slate-600 bg-slate-100" },
  { value: "Corporate", label: "corporate", icon: Building2, color: "text-violet-600 bg-violet-100" },
  { value: "SME", label: "sme", icon: Briefcase, color: "text-green-600 bg-green-100" },
  { value: "Group", label: "group", icon: Users, color: "text-amber-600 bg-amber-100" },
] as const;

export function ClientForm({ initialData, clientId, mode = "create", onSuccess }: ClientFormProps) {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "Individual",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = (data: ClientFormData) => {
    // Map UI types to API types
    const typeMapping: Record<string, "individual" | "company"> = {
      "Individual": "individual",
      "Corporate": "company",
      "SME": "company",
      "Group": "company",
    };

    const payload = {
      name: data.name,
      type: typeMapping[data.type] || "individual",
      contactEmail: data.email,
      contactPhone: data.phone,
      notes: data.notes,
    };

    if (mode === "create") {
      createClient(payload, {
        onSuccess: () => {
          onSuccess?.();
          router.push("/clients");
        },
      });
    } else if (clientId) {
      updateClient({ id: clientId, input: payload }, {
        onSuccess: () => {
          onSuccess?.();
          router.back();
        },
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label>{t("clients.form.clientType")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CLIENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue("type", type.value, { shouldValidate: true })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200",
                  "flex flex-col items-center gap-2 text-center",
                  "hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]",
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
                  {t(`clients.types.${type.label}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" required>
          {t("clients.form.name")}
        </Label>
        <Input
          id="name"
          placeholder={t("clients.form.namePlaceholder")}
          error={Boolean(errors.name)}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
            {t("clients.form.errors.nameRequired")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" required>
            {t("clients.form.email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("clients.form.emailPlaceholder")}
            error={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
              {errors.email.type === "email" ? t("clients.form.errors.emailInvalid") : t("clients.form.errors.emailRequired")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" required>
            {t("clients.form.phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t("clients.form.phonePlaceholder")}
            error={Boolean(errors.phone)}
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-[var(--color-error-text)] animate-in fade-in slide-in-from-top-1">
              {t("clients.form.errors.phoneRequired")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t("clients.form.address")}</Label>
        <Input
          id="address"
          type="text"
          placeholder={t("clients.form.addressPlaceholder")}
          {...register("address")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("clients.form.notes")}</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder={t("clients.form.notesPlaceholder")}
          {...register("notes")}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[var(--color-border-default)]">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto px-6 rounded-xl font-bold"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t("clients.form.cancel")}
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto px-6 rounded-xl font-semibold bg-[#D97706] hover:bg-[#B45309] text-white shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {mode === "create" ? t("clients.form.submitAdd") : t("clients.form.submitEdit")}
        </Button>
      </div>
    </form>
  );
}
