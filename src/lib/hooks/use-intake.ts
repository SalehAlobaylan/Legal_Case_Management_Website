"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intakeApi, type IntakeField } from "@/lib/api/intake";

export function useIntakeForms() {
  return useQuery({
    queryKey: ["intake-forms"],
    queryFn: () => intakeApi.listForms(),
  });
}

export function useCreateIntakeForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; fieldsJson: IntakeField[] }) => intakeApi.createForm(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intake-forms"] });
    },
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
      name: string;
      email?: string;
      phone?: string;
      notes?: string;
      answers?: Record<string, unknown>;
      honeypot?: string;
    }) => intakeApi.submitPublicForm(formId, input),
  });
}
