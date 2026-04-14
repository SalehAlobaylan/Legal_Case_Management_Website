import axios from "axios";
import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export type IntakeField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea";
  required?: boolean;
};

export type IntakeForm = {
  id: number;
  organizationId: number;
  title: string;
  fieldsJson: IntakeField[];
  createdAt: string;
  updatedAt: string;
};

export const intakeApi = {
  async listForms(): Promise<IntakeForm[]> {
    const { data } = await apiClient.get<{ forms: IntakeForm[] }>(endpoints.intake.forms);
    return data.forms;
  },

  async createForm(input: { title: string; fieldsJson: IntakeField[] }): Promise<IntakeForm> {
    const { data } = await apiClient.post<{ form: IntakeForm }>(endpoints.intake.forms, input);
    return data.form;
  },

  async getPublicForm(formId: number): Promise<IntakeForm> {
    const { data } = await axios.get<{ form: IntakeForm }>(endpoints.intake.publicForm(formId));
    return data.form;
  },

  async submitPublicForm(
    formId: number,
    input: {
      name: string;
      email?: string;
      phone?: string;
      notes?: string;
      answers?: Record<string, unknown>;
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
