/*
 * File: src/components/features/cases/case-form.tsx
 * Purpose: Reusable case creation form with validation, wired to the backend via useCreateCase.
 * Phase: 8.1 - Advanced Components (Case Form Component)
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAssignCase, useCreateCase } from "@/lib/hooks/use-cases";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { usePermission } from "@/lib/hooks/use-permission";
import { CaseType, CaseStatus } from "@/lib/types/case";

const caseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  caseType: z.nativeEnum(CaseType),
  status: z.nativeEnum(CaseStatus).default(CaseStatus.OPEN),
  clientInfo: z.string().optional(),
  courtJurisdiction: z.string().optional(),
  filingDate: z.string().optional(),
  nextHearing: z.string().optional(),
  assignedLawyerId: z.string().uuid().optional().or(z.literal("")),
});

type CaseFormData = z.input<typeof caseSchema>;

interface CaseFormProps {
  onSuccess?: () => void;
}

export function CaseForm({ onSuccess }: CaseFormProps) {
  const { mutate: createCase, isPending } = useCreateCase();
  const assignCase = useAssignCase();
  const { can } = usePermission();
  const canAssign = can("delegated.cases.assign");
  const { data: teamData } = useTeamMembers();
  const teamMembers = teamData?.members ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: CaseStatus.OPEN,
    },
  });

  const onSubmit = (data: CaseFormData) => {
    const { assignedLawyerId, ...rest } = data;
    createCase(rest, {
      onSuccess: (newCase) => {
        // Backend auto-assigns the creator; if the admin picked someone else
        // explicitly, reassign right after creation.
        if (assignedLawyerId && canAssign) {
          assignCase.mutate({
            id: newCase.id,
            assignedLawyerId,
          });
        }
        onSuccess?.();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="caseNumber" required>
            Case Number
          </Label>
          <Input
            id="caseNumber"
            placeholder="e.g. 45/2025"
            error={Boolean(errors.caseNumber)}
            aria-invalid={Boolean(errors.caseNumber)}
            {...register("caseNumber")}
          />
          {errors.caseNumber && (
            <p className="text-xs font-medium text-[var(--color-error-text)]">
              {errors.caseNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseType" required>
            Case Type
          </Label>
          <Select
            id="caseType"
            defaultValue=""
            error={Boolean(errors.caseType)}
            aria-invalid={Boolean(errors.caseType)}
            {...register("caseType")}
          >
            <option value="" disabled>
              Select type
            </option>
            <option value={CaseType.GENERAL}>General</option>
            <option value={CaseType.CRIMINAL}>Criminal</option>
            <option value={CaseType.PERSONAL_STATUS}>Personal Status</option>
            <option value={CaseType.COMMERCIAL}>Commercial</option>
            <option value={CaseType.LABOR}>Labor</option>
            <option value={CaseType.ADMINISTRATIVE}>Administrative</option>
            <option value={CaseType.ENFORCEMENT}>Enforcement</option>
          </Select>
          {errors.caseType && (
            <p className="text-xs font-medium text-[var(--color-error-text)]">
              {errors.caseType.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input
          id="title"
          placeholder="Short case title"
          error={Boolean(errors.title)}
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs font-medium text-[var(--color-error-text)]">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Key facts, parties, and summary of the case"
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="courtJurisdiction">Court / Jurisdiction</Label>
          <Input
            id="courtJurisdiction"
            placeholder="e.g. Riyadh Commercial Court"
            {...register("courtJurisdiction")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientInfo">Client Info</Label>
          <Input
            id="clientInfo"
            placeholder="Client name or reference"
            {...register("clientInfo")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="filingDate">Filing Date</Label>
          <Input id="filingDate" type="date" {...register("filingDate")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextHearing">Next Hearing</Label>
          <Input
            id="nextHearing"
            type="datetime-local"
            {...register("nextHearing")}
          />
        </div>
      </div>

      {canAssign && (
        <div className="space-y-2">
          <Label htmlFor="assignedLawyerId">Assigned to</Label>
          <Select
            id="assignedLawyerId"
            defaultValue=""
            {...register("assignedLawyerId")}
          >
            <option value="">(Default — me)</option>
            {teamMembers.map((m: { id: string; fullName?: string | null; email: string }) => (
              <option key={m.id} value={m.id}>
                {m.fullName || m.email}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? "Creating..." : "Create Case"}
        </Button>
      </div>
    </form>
  );
}


