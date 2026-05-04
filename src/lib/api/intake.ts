import axios from "axios";
import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export type IntakeFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

export type IntakeField = {
  id: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export type IntakeFormSection = {
  id: string;
  titleEn?: string;
  titleAr?: string;
  layout?: "single" | "double" | "triple";
  order: number;
  fieldIds: string[];
};

export type IntakeFormTheme = {
  primaryColor: string;
  borderRadius: number;
  layoutDensity: "comfortable" | "compact" | "spacious";
};

export type IntakeFormLogicRule = {
  id: string;
  conditions: { fieldId: string; operator: string; value: string }[];
  action: "show" | "hide" | "require";
  targetFieldIds: string[];
};

export type IntakeFormSchema = {
  sections: IntakeFormSection[];
  logicRules: IntakeFormLogicRule[];
  theme?: IntakeFormTheme;
};

export type IntakeForm = {
  id: number;
  organizationId: number;
  title: string;
  description?: string | null;
  fieldsJson: IntakeField[];
  schema?: IntakeFormSchema | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IntakeSubmission = {
  id: number;
  intakeFormId: number | null;
  organizationId: number;
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    normalizedPhone?: string;
    type?: string;
    notes?: string;
    answers?: Record<string, unknown>;
  } & Record<string, unknown>;
  source: string;
  createdAt: string;
  intakeForm?: { id: number; title: string } | null;
};

export type IntakeAnalytics = {
  totalForms: number;
  activeForms: number;
  totalSubmissions: number;
  submissionsLast30d: number;
  submissionsPerForm: { formId: number; title: string; count: number }[];
  topForms: { formId: number; title: string; count: number }[];
  dailySeries: { date: string; count: number }[];
};

type CreateOrUpdateInput = {
  title: string;
  description?: string | null;
  fieldsJson: IntakeField[];
  schema?: IntakeFormSchema | null;
  isActive?: boolean;
};

export const intakeApi = {
  async listForms(): Promise<IntakeForm[]> {
    const { data } = await apiClient.get<{ forms: IntakeForm[] }>(endpoints.intake.forms);
    return data.forms;
  },

  async createForm(input: CreateOrUpdateInput): Promise<IntakeForm> {
    const { data } = await apiClient.post<{ form: IntakeForm }>(endpoints.intake.forms, input);
    return data.form;
  },

  async updateForm(id: number, input: Partial<CreateOrUpdateInput>): Promise<IntakeForm> {
    const { data } = await apiClient.put<{ form: IntakeForm }>(endpoints.intake.form(id), input);
    return data.form;
  },

  async deleteForm(id: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(endpoints.intake.form(id));
    return data;
  },

  async listSubmissions(formId: number): Promise<{ submissions: IntakeSubmission[]; form: IntakeForm }> {
    const { data } = await apiClient.get<{ submissions: IntakeSubmission[]; form: IntakeForm }>(
      endpoints.intake.submissions(formId)
    );
    return data;
  },

  async listAllSubmissions(): Promise<IntakeSubmission[]> {
    const { data } = await apiClient.get<{ submissions: IntakeSubmission[] }>(
      endpoints.intake.allSubmissions
    );
    return data.submissions;
  },

  async getAnalytics(): Promise<IntakeAnalytics> {
    const { data } = await apiClient.get<IntakeAnalytics>(endpoints.intake.analytics);
    return data;
  },

  async getPublicForm(formId: number): Promise<IntakeForm> {
    const { data } = await axios.get<{ form: IntakeForm }>(endpoints.intake.publicForm(formId));
    return data.form;
  },

  async submitPublicForm(
    formId: number,
    input: {
      answers: Record<string, unknown>;
      honeypot?: string;
    }
  ): Promise<{ success: boolean; clientId: number }> {
    const { data } = await axios.post<{ success: boolean; clientId: number }>(
      endpoints.intake.publicSubmit(formId),
      input
    );
    return data;
  },
};
