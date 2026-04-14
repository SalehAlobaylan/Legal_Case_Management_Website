"use client";

import * as React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useIntakeForms, useCreateIntakeForm } from "@/lib/hooks/use-intake";
import type { IntakeField } from "@/lib/api/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export default function ClientIntakePage() {
  const { data: forms = [] } = useIntakeForms();
  const createForm = useCreateIntakeForm();
  const { locale, isRTL } = useI18n();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const getPresetFields = React.useCallback(
    (type: "basic" | "detailed"): IntakeField[] => {
      if (type === "detailed") {
        return [
          { id: "matter_type", label: locale === "ar" ? "نوع الطلب" : "Matter Type", type: "text", required: true },
          { id: "opponent", label: locale === "ar" ? "الطرف الآخر" : "Counterparty", type: "text" },
          { id: "urgency", label: locale === "ar" ? "درجة الاستعجال" : "Urgency", type: "text" },
          { id: "notes", label: locale === "ar" ? "ملخص الوقائع" : "Case Summary", type: "textarea" },
        ];
      }

      return [
        { id: "matter_type", label: locale === "ar" ? "نوع الطلب" : "Matter Type", type: "text", required: true },
        { id: "notes", label: locale === "ar" ? "وصف مختصر" : "Short Description", type: "textarea" },
      ];
    },
    [locale]
  );

  const [title, setTitle] = React.useState(
    locale === "ar" ? "نموذج استقبال عميل جديد" : "New Client Intake Form"
  );
  const [preset, setPreset] = React.useState<"basic" | "detailed">("basic");
  const [fields, setFields] = React.useState<IntakeField[]>(() => getPresetFields("basic"));

  React.useEffect(() => {
    setFields(getPresetFields(preset));
  }, [getPresetFields, preset]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        label: locale === "ar" ? "حقل جديد" : "New Field",
        type: "text",
        required: false,
      },
    ]);
  };

  const updateField = (index: number, patch: Partial<IntakeField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    setFields((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const handleCreateForm = () => {
    const normalizedFields = fields
      .map((f) => ({ ...f, label: f.label.trim() }))
      .filter((f) => f.label.length > 0);

    if (!title.trim() || normalizedFields.length === 0) return;

    createForm.mutate({
      title: title.trim(),
      fieldsJson: normalizedFields,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            {isRTL ? "نماذج استقبال العملاء" : "Client Intake Forms"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRTL
              ? "أنشئ وشارك نماذج استقبال العملاء ضمن قسم CRM."
              : "Create and share client intake forms inside CRM."}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-lg font-bold text-[#0F2942]">{isRTL ? "منشئ النموذج" : "Form Builder"}</h4>
        <p className="text-sm text-slate-500 mt-1">
          {isRTL
            ? "الهدف: إنشاء نموذج جاهز للإرسال للعميل."
            : "Goal: create a shareable intake form for clients."}
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>{isRTL ? "اسم النموذج" : "Form Name"}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRTL ? "مثال: نموذج استقبال قضية عمالية" : "Example: Labor Case Intake Form"}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "نوع النموذج" : "Form Preset"}</Label>
            <Select value={preset} onChange={(e) => setPreset(e.target.value as "basic" | "detailed")} className="h-11">
              <option value="basic">{isRTL ? "مختصر" : "Basic"}</option>
              <option value="detailed">{isRTL ? "مفصل" : "Detailed"}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "يُستخدم لـ" : "Use Case"}</Label>
            <div className="h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 flex items-center">
              {preset === "basic"
                ? isRTL
                  ? "التأهيل السريع للعميل"
                  : "Quick client qualification"
                : isRTL
                  ? "جمع معلومات أولية شاملة"
                  : "Detailed first intake"}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>{isRTL ? "حقول النموذج" : "Form Fields"}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                {isRTL ? "إضافة حقل" : "Add Field"}
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="md:col-span-5 h-10 bg-white"
                    placeholder={isRTL ? "عنوان الحقل" : "Field label"}
                  />
                  <Select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as IntakeField["type"] })}
                    className="md:col-span-3 h-10 bg-white"
                  >
                    <option value="text">{isRTL ? "نص" : "Text"}</option>
                    <option value="email">{isRTL ? "بريد إلكتروني" : "Email"}</option>
                    <option value="phone">{isRTL ? "هاتف" : "Phone"}</option>
                    <option value="textarea">{isRTL ? "وصف" : "Textarea"}</option>
                  </Select>
                  <button
                    type="button"
                    onClick={() => updateField(index, { required: !field.required })}
                    className={cn(
                      "md:col-span-2 h-10 rounded-lg border text-xs font-bold",
                      field.required
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    {isRTL ? (field.required ? "إلزامي" : "اختياري") : field.required ? "Required" : "Optional"}
                  </button>
                  <div className="md:col-span-1 h-10 grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                      className="rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, "down")}
                      disabled={index === fields.length - 1}
                      className="rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="md:col-span-1 h-10 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-bold"
                    disabled={fields.length <= 1}
                  >
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="mt-4 bg-[#D97706] hover:bg-[#B45309]"
          onClick={handleCreateForm}
          disabled={createForm.isPending || !title.trim()}
        >
          {createForm.isPending ? (isRTL ? "جارٍ الإنشاء..." : "Creating...") : (isRTL ? "إنشاء النموذج" : "Create Form")}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {forms.length === 0 ? (
          <p className="text-sm text-slate-400">{isRTL ? "لا توجد نماذج" : "No forms yet"}</p>
        ) : (
          forms.map((form) => {
            const intakeLink = `${origin}/intake/${form.id}?lang=${locale}`;
            return (
              <div key={form.id} className={cn("flex items-center justify-between rounded-xl border border-slate-200 p-3", isRTL ? "flex-row-reverse text-right" : "") }>
                <div>
                  <p className="font-semibold text-[#0F2942]">{form.title}</p>
                  <p className="text-xs text-slate-500">{intakeLink}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(intakeLink)}>
                    {isRTL ? "نسخ الرابط" : "Copy Link"}
                  </Button>
                  <Button variant="outline" onClick={() => window.open(intakeLink, "_blank")}>
                    {isRTL ? "معاينة" : "Preview"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
