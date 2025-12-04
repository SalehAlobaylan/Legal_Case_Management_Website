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
import { useCreateCase } from "@/lib/hooks/use-cases";
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
});

type CaseFormData = z.input<typeof caseSchema>;

interface CaseFormProps {
  onSuccess?: () => void;
}

export function CaseForm({ onSuccess }: CaseFormProps) {
  const { mutate: createCase, isPending } = useCreateCase();

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
    createCase(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Case Number *</Label>
          <Input
            id="caseNumber"
            placeholder="e.g. 45/2025"
            {...register("caseNumber")}
          />
          {errors.caseNumber && (
            <p className="text-xs text-red-500">
              {errors.caseNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseType">Case Type *</Label>
          <Select id="caseType" defaultValue="" {...register("caseType")}>
            <option value="" disabled>
              Select type
            </option>
            <option value={CaseType.CIVIL}>Civil</option>
            <option value={CaseType.COMMERCIAL}>Commercial</option>
            <option value={CaseType.LABOR}>Labor</option>
            <option value={CaseType.CRIMINAL}>Criminal</option>
            <option value={CaseType.FAMILY}>Family</option>
            <option value={CaseType.ADMINISTRATIVE}>Administrative</option>
          </Select>
          {errors.caseType && (
            <p className="text-xs text-red-500">{errors.caseType.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Short case title"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
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

      <div className="flex justify-end">
        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? "Creating..." : "Create Case"}
        </Button>
      </div>
    </form>
  );
}



