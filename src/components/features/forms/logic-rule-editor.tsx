"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { IntakeField, IntakeFormLogicRule } from "@/lib/api/intake";

type Props = {
  rules: IntakeFormLogicRule[];
  fields: IntakeField[];
  onChange: (rules: IntakeFormLogicRule[]) => void;
  isRTL?: boolean;
};

export function LogicRuleEditor({ rules, fields, onChange, isRTL }: Props) {
  const updateRule = (id: string, patch: Partial<IntakeFormLogicRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRule = (id: string) => onChange(rules.filter((r) => r.id !== id));
  const addRule = () =>
    onChange([
      ...rules,
      {
        id: `rule_${Date.now()}`,
        conditions: [{ fieldId: fields[0]?.id || "", operator: "equals", value: "" }],
        action: "show",
        targetFieldIds: [],
      },
    ]);

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-xs text-slate-400">
          {isRTL ? "لا توجد قواعد. أضف قاعدة لإظهار/إخفاء الحقول حسب الإجابات." : "No rules. Add one to show/hide fields based on answers."}
        </p>
      )}
      {rules.map((rule) => (
        <div key={rule.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{isRTL ? "إذا" : "If"}</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRule(rule.id)}
              aria-label={isRTL ? "حذف القاعدة" : "Delete rule"}
              className="text-red-500 hover:bg-red-50 h-7 w-7"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {rule.conditions.map((cond, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <Select
                aria-label={isRTL ? "الحقل" : "Field"}
                value={cond.fieldId}
                onChange={(e) => {
                  const next = [...rule.conditions];
                  next[i] = { ...cond, fieldId: e.target.value };
                  updateRule(rule.id, { conditions: next });
                }}
                className="col-span-4 h-9"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </Select>
              <Select
                aria-label={isRTL ? "الشرط" : "Operator"}
                value={cond.operator}
                onChange={(e) => {
                  const next = [...rule.conditions];
                  next[i] = { ...cond, operator: e.target.value };
                  updateRule(rule.id, { conditions: next });
                }}
                className="col-span-3 h-9"
              >
                <option value="equals">{isRTL ? "يساوي" : "equals"}</option>
                <option value="not_equals">{isRTL ? "لا يساوي" : "not equals"}</option>
                <option value="contains">{isRTL ? "يحتوي" : "contains"}</option>
                <option value="empty">{isRTL ? "فارغ" : "is empty"}</option>
                <option value="not_empty">{isRTL ? "غير فارغ" : "not empty"}</option>
              </Select>
              <Input
                aria-label={isRTL ? "القيمة" : "Value"}
                value={cond.value}
                onChange={(e) => {
                  const next = [...rule.conditions];
                  next[i] = { ...cond, value: e.target.value };
                  updateRule(rule.id, { conditions: next });
                }}
                placeholder={isRTL ? "القيمة" : "value"}
                className="col-span-5 h-9"
                disabled={cond.operator === "empty" || cond.operator === "not_empty"}
              />
            </div>
          ))}

          <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-100">
            <Label className="col-span-12 text-xs mt-1">{isRTL ? "ثم" : "Then"}</Label>
            <Select
              aria-label={isRTL ? "الإجراء" : "Action"}
              value={rule.action}
              onChange={(e) => updateRule(rule.id, { action: e.target.value as IntakeFormLogicRule["action"] })}
              className="col-span-4 h-9"
            >
              <option value="show">{isRTL ? "اعرض" : "show"}</option>
              <option value="hide">{isRTL ? "أخفِ" : "hide"}</option>
              <option value="require">{isRTL ? "اجعل مطلوباً" : "require"}</option>
            </Select>
            <Select
              aria-label={isRTL ? "الحقول المستهدفة" : "Target fields"}
              multiple
              value={rule.targetFieldIds}
              onChange={(e) => {
                const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                updateRule(rule.id, { targetFieldIds: opts });
              }}
              className="col-span-8 h-20"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRule} disabled={fields.length === 0}>
        <Plus className="h-3.5 w-3.5" />
        <span className="ms-1">{isRTL ? "إضافة قاعدة" : "Add Rule"}</span>
      </Button>
    </div>
  );
}
