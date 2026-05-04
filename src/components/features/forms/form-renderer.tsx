"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type {
  IntakeField,
  IntakeFormLogicRule,
} from "@/lib/api/intake";

export type FormValues = Record<string, unknown>;

type Props = {
  fields: IntakeField[];
  logicRules?: IntakeFormLogicRule[];
  values: FormValues;
  onChange: (values: FormValues) => void;
  errors?: Record<string, string>;
  isRTL?: boolean;
  disabled?: boolean;
  primaryColor?: string;
  density?: "comfortable" | "compact" | "spacious";
};

const evalCondition = (
  cond: { fieldId: string; operator: string; value: string },
  values: FormValues
) => {
  const v = values[cond.fieldId];
  const target = cond.value;
  switch (cond.operator) {
    case "equals":
      return String(v ?? "") === target;
    case "not_equals":
      return String(v ?? "") !== target;
    case "contains":
      return String(v ?? "").includes(target);
    case "empty":
      return v === undefined || v === null || v === "";
    case "not_empty":
      return v !== undefined && v !== null && v !== "";
    default:
      return false;
  }
};

export function applyLogic(
  fields: IntakeField[],
  rules: IntakeFormLogicRule[] | undefined,
  values: FormValues
): { visible: Set<string>; required: Set<string> } {
  const visible = new Set(fields.map((f) => f.id));
  const required = new Set(fields.filter((f) => f.required).map((f) => f.id));

  if (!rules || rules.length === 0) return { visible, required };

  for (const rule of rules) {
    const allTrue =
      rule.conditions.length > 0 &&
      rule.conditions.every((c) => evalCondition(c, values));
    if (!allTrue) continue;

    for (const targetId of rule.targetFieldIds) {
      if (rule.action === "show") visible.add(targetId);
      if (rule.action === "hide") {
        visible.delete(targetId);
        required.delete(targetId);
      }
      if (rule.action === "require") required.add(targetId);
    }
  }

  return { visible, required };
}

export function FormRenderer({
  fields,
  logicRules,
  values,
  onChange,
  errors,
  isRTL = false,
  disabled = false,
  primaryColor,
  density = "comfortable",
}: Props) {
  const { visible, required } = React.useMemo(
    () => applyLogic(fields, logicRules, values),
    [fields, logicRules, values]
  );

  const set = (id: string, value: unknown) => onChange({ ...values, [id]: value });

  const gap = density === "compact" ? "space-y-2" : density === "spacious" ? "space-y-5" : "space-y-3";
  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2";
  const inputHeight = density === "compact" ? "h-9" : density === "spacious" ? "h-12" : "h-11";

  const focusStyle = primaryColor
    ? ({
        // Tailwind doesn't know the dynamic color; rely on inline style for ring on focus
      } as React.CSSProperties)
    : undefined;

  return (
    <div className={gap} dir={isRTL ? "rtl" : "ltr"}>
      {fields.map((field) => {
        if (!visible.has(field.id)) return null;
        const isRequired = required.has(field.id);
        const error = errors?.[field.id];
        const value = values[field.id];

        const labelEl = (
          <label
            htmlFor={`field-${field.id}`}
            className="block text-sm font-semibold text-slate-700"
          >
            {field.label}
            {isRequired && (
              <span aria-hidden="true" className="ml-1 text-red-500">
                *
              </span>
            )}
          </label>
        );

        const errorEl = error ? (
          <p id={`field-${field.id}-error`} className="text-xs text-red-600 mt-1">
            {error}
          </p>
        ) : null;

        const commonProps = {
          id: `field-${field.id}`,
          "aria-required": isRequired || undefined,
          "aria-invalid": !!error || undefined,
          "aria-describedby": error ? `field-${field.id}-error` : undefined,
          disabled,
        };

        let inputEl: React.ReactNode = null;

        switch (field.type) {
          case "textarea":
            inputEl = (
              <textarea
                {...commonProps}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(field.id, e.target.value)}
                placeholder={field.placeholder || ""}
                className={cn(
                  inputBase,
                  "min-h-28 border-slate-200 bg-white",
                  error && "border-red-300 focus:ring-red-200",
                  !error && "focus:ring-amber-200 focus:border-amber-500"
                )}
                style={focusStyle}
              />
            );
            break;
          case "select":
            inputEl = (
              <select
                {...commonProps}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(field.id, e.target.value)}
                className={cn(
                  inputBase,
                  inputHeight,
                  "border-slate-200 bg-white",
                  error && "border-red-300 focus:ring-red-200",
                  !error && "focus:ring-amber-200 focus:border-amber-500"
                )}
              >
                <option value="">{isRTL ? "اختر..." : "Select..."}</option>
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
            break;
          case "radio":
            inputEl = (
              <div role="radiogroup" aria-required={isRequired || undefined} className="flex flex-wrap gap-3">
                {(field.options || []).map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`field-${field.id}`}
                      value={opt.value}
                      checked={value === opt.value}
                      onChange={() => set(field.id, opt.value)}
                      disabled={disabled}
                      className="accent-[#D97706]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            );
            break;
          case "checkbox": {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            inputEl = (
              <div className="flex flex-wrap gap-3">
                {(field.options && field.options.length > 0
                  ? field.options
                  : [{ value: "true", label: field.label }]
                ).map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={arr.includes(opt.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...arr, opt.value]
                          : arr.filter((v) => v !== opt.value);
                        set(field.id, next);
                      }}
                      disabled={disabled}
                      className="accent-[#D97706]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            );
            break;
          }
          case "date":
          case "email":
          case "phone":
          case "text":
          default: {
            const inputType =
              field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : field.type === "date"
                    ? "date"
                    : "text";
            inputEl = (
              <input
                {...commonProps}
                type={inputType}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(field.id, e.target.value)}
                placeholder={field.placeholder || ""}
                className={cn(
                  inputBase,
                  inputHeight,
                  "border-slate-200 bg-white",
                  error && "border-red-300 focus:ring-red-200",
                  !error && "focus:ring-amber-200 focus:border-amber-500"
                )}
              />
            );
            break;
          }
        }

        return (
          <div key={field.id} className="space-y-1.5">
            {field.type !== "checkbox" || (field.options && field.options.length > 0) ? labelEl : null}
            {inputEl}
            {errorEl}
          </div>
        );
      })}
    </div>
  );
}

export function validateClientSide(
  fields: IntakeField[],
  rules: IntakeFormLogicRule[] | undefined,
  values: FormValues
): Record<string, string> {
  const errors: Record<string, string> = {};
  const { visible, required } = applyLogic(fields, rules, values);

  for (const field of fields) {
    if (!visible.has(field.id)) continue;
    const v = values[field.id];
    const isEmpty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    if (required.has(field.id) && isEmpty) {
      errors[field.id] = "Required";
      continue;
    }
    if (isEmpty) continue;
    if (field.type === "email" && typeof v === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errors[field.id] = "Invalid email";
      }
    }
  }
  return errors;
}
