"use client";

import * as React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAutomationRules, useCreateAutomationRule, useUpdateAutomationRule } from "@/lib/hooks/use-automations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export default function ClientAutomationsPage() {
  const { t, isRTL } = useI18n();
  const { data: rules = [] } = useAutomationRules();
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();

  const [name, setName] = React.useState("");
  const [triggerValue, setTriggerValue] = React.useState("retained");
  const [actionType, setActionType] = React.useState<"send_email" | "send_whatsapp" | "send_sms">("send_email");
  const [templateBody, setTemplateBody] = React.useState(
    isRTL
      ? "مرحباً {{client_name}}، تم تحديث حالتك إلى {{new_status}}. سيتواصل معك فريقنا خلال وقت قصير."
      : "Hello {{client_name}}, your status has been updated to {{new_status}}. Our team will contact you shortly."
  );
  const [editingRuleId, setEditingRuleId] = React.useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "active" | "paused">("all");

  const triggerOptions = ["lead", "contacted", "consultation", "retained"] as const;

  const labelForStatus = (value: string) => {
    if (value === "lead") return isRTL ? "عميل محتمل" : "Lead";
    if (value === "contacted") return isRTL ? "تم التواصل" : "Contacted";
    if (value === "consultation") return isRTL ? "استشارة" : "Consultation";
    if (value === "retained") return isRTL ? "تم التعاقد" : "Retained";
    return value;
  };

  const labelForAction = (value: "send_email" | "send_whatsapp" | "send_sms") => {
    if (value === "send_whatsapp") return isRTL ? "إرسال واتساب" : "Send WhatsApp";
    if (value === "send_sms") return isRTL ? "إرسال رسالة نصية" : "Send SMS";
    return isRTL ? "إرسال بريد إلكتروني" : "Send Email";
  };

  const handleCreate = () => {
    if (!name.trim() || !templateBody.trim()) return;

    createRule.mutate(
      {
        name: name.trim(),
        triggerType: "client.status.changed",
        triggerValue,
        actionType,
        templateBody: templateBody.trim(),
        active: true,
      },
      {
        onSuccess: () => {
          setName("");
          setTriggerValue("retained");
          setActionType("send_email");
          setTemplateBody(
            isRTL
              ? "مرحباً {{client_name}}، تم تحديث حالتك إلى {{new_status}}. سيتواصل معك فريقنا خلال وقت قصير."
              : "Hello {{client_name}}, your status has been updated to {{new_status}}. Our team will contact you shortly."
          );
        },
      }
    );
  };

  const templatePresets = React.useMemo(
    () => [
      {
        key: "welcome",
        label: isRTL ? "ترحيب" : "Welcome",
        body: isRTL
          ? "مرحباً {{client_name}}، تم تحديث حالتك إلى {{new_status}}. يسعدنا بدء العمل معك."
          : "Hello {{client_name}}, your status is now {{new_status}}. We are glad to start working with you.",
      },
      {
        key: "consultation",
        label: isRTL ? "تأكيد استشارة" : "Consultation Follow-up",
        body: isRTL
          ? "مرحباً {{client_name}}، تم تحديث حالتك إلى {{new_status}}. يرجى مشاركة أي مستندات إضافية قبل الموعد."
          : "Hello {{client_name}}, your status is now {{new_status}}. Please share any additional documents before the meeting.",
      },
      {
        key: "payment",
        label: isRTL ? "تنبيه التعاقد" : "Retainer Notice",
        body: isRTL
          ? "عزيزي {{client_name}}، تم اعتماد حالتك كـ {{new_status}}. سيرسل فريقنا الخطوات التالية قريباً."
          : "Dear {{client_name}}, your status is now {{new_status}}. Our team will send the next steps shortly.",
      },
    ],
    [isRTL]
  );

  const insertVariable = (token: string) => {
    setTemplateBody((prev) => `${prev}${prev.endsWith(" ") || prev.length === 0 ? "" : " "}${token}`);
  };

  const previewTemplate = (template: string, status: string) =>
    template
      .replaceAll("{{client_name}}", isRTL ? "محمد الأحمد" : "Ahmed Al-Salem")
      .replaceAll("{{client_email}}", "client@example.com")
      .replaceAll("{{old_status}}", labelForStatus("consultation"))
      .replaceAll("{{new_status}}", labelForStatus(status));

  const visibleRules = React.useMemo(() => {
    if (filter === "active") return rules.filter((r) => r.active);
    if (filter === "paused") return rules.filter((r) => !r.active);
    return rules;
  }, [filter, rules]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
          {isRTL ? "أتمتة تواصل العملاء" : "Client Communication Automations"}
        </h1>
        <p className="text-slate-500 mt-2">
          {isRTL ? "أنشئ قواعد تواصل تلقائي داخل CRM." : "Create automatic communication rules inside CRM."}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-lg font-bold text-[#0F2942]">{t("settings.automations")}</h4>
        <p className="text-sm text-slate-500 mt-1">{t("settings.automationsDesc")}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{isRTL ? "اسم القاعدة" : "Rule Name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>{isRTL ? "الحالة التي تُفعّل القاعدة" : "Trigger Status"}</Label>
            <Select value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)} className="h-11">
              {triggerOptions.map((status) => (
                <option key={status} value={status}>
                  {labelForStatus(status)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{isRTL ? "نوع الإجراء" : "Action Type"}</Label>
            <Select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as "send_email" | "send_whatsapp" | "send_sms")}
              className="h-11"
            >
              <option value="send_email">{labelForAction("send_email")}</option>
              <option value="send_whatsapp">{labelForAction("send_whatsapp")}</option>
              <option value="send_sms">{labelForAction("send_sms")}</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{isRTL ? "نص الرسالة" : "Message Template"}</Label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {templatePresets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setTemplateBody(preset.body)}
                  className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              className="w-full min-h-[96px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {["{{client_name}}", "{{client_email}}", "{{old_status}}", "{{new_status}}"].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertVariable(token)}
                  className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {token}
                </button>
              ))}
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{previewTemplate(templateBody, triggerValue)}</p>
            </div>
          </div>
        </div>

        <Button className="mt-4 bg-[#0F2942] hover:bg-[#1E3A56]" onClick={handleCreate} disabled={createRule.isPending || !name.trim() || !templateBody.trim()}>
          {createRule.isPending ? (isRTL ? "جارٍ الإنشاء..." : "Creating...") : t("settings.createAutomation")}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          {([
            { key: "all", label: isRTL ? "الكل" : "All" },
            { key: "active", label: isRTL ? "مفعلة" : "Active" },
            { key: "paused", label: isRTL ? "متوقفة" : "Paused" },
          ] as const).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-bold border",
                filter === item.key ? "bg-[#0F2942] text-white border-[#0F2942]" : "bg-white text-slate-600 border-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {visibleRules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#0F2942]">{rule.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {isRTL ? "عند تغيير حالة العميل إلى" : "When client status changes to"} {" "}
                  <span className="font-bold">{labelForStatus(rule.triggerValue || "retained")}</span>
                  {" • "}
                  {labelForAction(rule.actionType)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateRule.mutate({ id: rule.id, input: { active: !rule.active } })}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold border",
                  rule.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                )}
              >
                {rule.active ? (isRTL ? "مفعلة" : "Active") : (isRTL ? "متوقفة" : "Paused")}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingRuleId(rule.id);
                  setEditingTemplate(rule.templateBody);
                }}
              >
                {isRTL ? "تعديل النص" : "Edit Message"}
              </Button>
              {editingRuleId === rule.id && (
                <Button
                  size="sm"
                  className="bg-[#0F2942] hover:bg-[#1E3A56]"
                  onClick={() => {
                    if (!editingTemplate.trim()) return;
                    updateRule.mutate({ id: rule.id, input: { templateBody: editingTemplate.trim() } });
                    setEditingRuleId(null);
                  }}
                >
                  {isRTL ? "حفظ" : "Save"}
                </Button>
              )}
            </div>
            {editingRuleId === rule.id && (
              <textarea
                value={editingTemplate}
                onChange={(e) => setEditingTemplate(e.target.value)}
                className="mt-2 w-full min-h-[88px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
