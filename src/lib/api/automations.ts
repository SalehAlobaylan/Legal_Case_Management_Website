import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export type AutomationRule = {
  id: number;
  organizationId: number;
  name: string;
  triggerType: "client.status.changed";
  triggerValue?: string | null;
  actionType: "send_email" | "send_whatsapp" | "send_sms";
  templateBody: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const automationsApi = {
  async listRules(): Promise<AutomationRule[]> {
    const { data } = await apiClient.get<{ rules: AutomationRule[] }>(endpoints.automations.list);
    return data.rules;
  },

  async createRule(input: Omit<AutomationRule, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<AutomationRule> {
    const { data } = await apiClient.post<{ rule: AutomationRule }>(endpoints.automations.create, input);
    return data.rule;
  },

  async updateRule(
    id: number,
    input: Partial<Omit<AutomationRule, "id" | "organizationId" | "createdAt" | "updatedAt">>
  ): Promise<AutomationRule> {
    const { data } = await apiClient.put<{ rule: AutomationRule }>(endpoints.automations.update(id), input);
    return data.rule;
  },
};
