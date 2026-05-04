"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  onChange: (options: Option[]) => void;
  isRTL?: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

export function FieldOptionsEditor({ options, onChange, isRTL }: Props) {
  const update = (i: number, patch: Partial<Option>) => {
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  };

  const add = () => {
    const idx = options.length + 1;
    onChange([...options, { value: `option_${idx}`, label: `${isRTL ? "خيار" : "Option"} ${idx}` }]);
  };

  const remove = (i: number) => {
    onChange(options.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2 mt-2">
      <Label className="text-xs">{isRTL ? "الخيارات" : "Options"}</Label>
      {options.length === 0 && (
        <p className="text-xs text-slate-400">
          {isRTL ? "لا توجد خيارات بعد" : "No options yet"}
        </p>
      )}
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={opt.label}
            onChange={(e) => {
              const newLabel = e.target.value;
              update(i, {
                label: newLabel,
                value: opt.value || slugify(newLabel),
              });
            }}
            placeholder={isRTL ? "التسمية" : "Label"}
            className="h-9 flex-1"
            aria-label={isRTL ? `تسمية الخيار ${i + 1}` : `Option ${i + 1} label`}
          />
          <Input
            value={opt.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder={isRTL ? "القيمة" : "Value"}
            className="h-9 w-32"
            aria-label={isRTL ? `قيمة الخيار ${i + 1}` : `Option ${i + 1} value`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            aria-label={isRTL ? "حذف الخيار" : "Delete option"}
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        <span className="ms-1">{isRTL ? "إضافة خيار" : "Add option"}</span>
      </Button>
    </div>
  );
}
