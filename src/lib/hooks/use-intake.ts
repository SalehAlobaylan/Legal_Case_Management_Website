"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intakeApi, type IntakeField, type IntakeFormSchema } from "@/lib/api/intake";

const FORMS_KEY = ["intake-forms"];
const ANALYTICS_KEY = ["intake-analytics"];

export function useIntakeForms() {
  return useQuery({
    queryKey: FORMS_KEY,
    queryFn: () => intakeApi.listForms(),
  });
}

type UpsertInput = {
  title: string;
  description?: string | null;
  fieldsJson: IntakeField[];
  schema?: IntakeFormSchema | null;
  isActive?: boolean;
};

export function useCreateIntakeForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertInput) => intakeApi.createForm(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useUpdateIntakeForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<UpsertInput> }) =>
      intakeApi.updateForm(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useDeleteIntakeForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => intakeApi.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useFormSubmissions(formId: number | null) {
  return useQuery({
    queryKey: ["intake-submissions", formId],
    queryFn: () => intakeApi.listSubmissions(formId!),
    enabled: !!formId,
  });
}

export function useAllSubmissions() {
  return useQuery({
    queryKey: ["intake-submissions", "all"],
    queryFn: () => intakeApi.listAllSubmissions(),
  });
}

export function useIntakeAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: () => intakeApi.getAnalytics(),
  });
}

export function usePublicIntakeForm(formId: number) {
  return useQuery({
    queryKey: ["public-intake-form", formId],
    queryFn: () => intakeApi.getPublicForm(formId),
    enabled: !!formId,
  });
}

export function useSubmitPublicIntakeForm(formId: number) {
  return useMutation({
    mutationFn: (input: {
      answers: Record<string, unknown>;
      honeypot?: string;
    }) => intakeApi.submitPublicForm(formId, input),
  });
}
