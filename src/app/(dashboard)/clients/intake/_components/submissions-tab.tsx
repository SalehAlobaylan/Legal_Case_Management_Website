"use client";

import * as React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAllSubmissions, useIntakeForms } from "@/lib/hooks/use-intake";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Download, Inbox, Search } from "lucide-react";
import type { IntakeSubmission } from "@/lib/api/intake";

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const csvEscape = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCSV = (rows: IntakeSubmission[], filename: string) => {
  if (rows.length === 0) return;
  const cols = ["id", "createdAt", "formTitle", "name", "email", "phone", "type", "notes", "answers"];
  const header = cols.join(",");
  const lines = rows.map((r) => {
    const p = r.payload || {};
    return [
      r.id,
      r.createdAt,
      r.intakeForm?.title || "",
      p.name || "",
      p.email || "",
      p.phone || "",
      p.type || "",
      p.notes || "",
      JSON.stringify(p.answers || {}),
    ]
      .map(csvEscape)
      .join(",");
  });
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export function SubmissionsTab() {
  const { isRTL } = useI18n();
  const { data: forms = [] } = useIntakeForms();
  const { data: submissions = [], isLoading } = useAllSubmissions();
  const [formFilter, setFormFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<IntakeSubmission | null>(null);

  const filtered = React.useMemo(() => {
    let list = submissions;
    if (formFilter !== "all") {
      const id = Number(formFilter);
      list = list.filter((s) => s.intakeFormId === id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const p = s.payload || {};
        return (
          (p.name && String(p.name).toLowerCase().includes(q)) ||
          (p.email && String(p.email).toLowerCase().includes(q)) ||
          (p.phone && String(p.phone).toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [submissions, formFilter, search]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="h-4 w-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث بالاسم أو البريد أو الهاتف" : "Search name / email / phone"}
            className="ps-9"
            aria-label={isRTL ? "بحث" : "Search submissions"}
          />
        </div>
        <Select
          value={formFilter}
          onChange={(e) => setFormFilter(e.target.value)}
          className="w-56"
          aria-label={isRTL ? "تصفية بالنموذج" : "Filter by form"}
        >
          <option value="all">{isRTL ? "كل النماذج" : "All forms"}</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </Select>
        <Button
          variant="outline"
          onClick={() => downloadCSV(filtered, `submissions-${Date.now()}.csv`)}
          disabled={filtered.length === 0}
        >
          <Download className="h-4 w-4" />
          <span className="ms-1">{isRTL ? "تصدير CSV" : "Export CSV"}</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            {isRTL ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Inbox}
              title={isRTL ? "لا توجد تقديمات" : "No submissions yet"}
              description={
                isRTL
                  ? "ستظهر التقديمات هنا فور إرسال أول نموذج"
                  : "Submissions will appear here as soon as your first form is filled out"
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {isRTL ? "التاريخ" : "Date"}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {isRTL ? "النموذج" : "Form"}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {isRTL ? "الاسم" : "Name"}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {isRTL ? "التواصل" : "Contact"}
                </th>
                <th className="text-start px-4 py-3 font-semibold w-20">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setActive(s)}
                >
                  <td className="px-4 py-3 text-slate-600">{fmt(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default" className="text-xs">
                      {s.intakeForm?.title || (isRTL ? "(محذوف)" : "(deleted)")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0F2942]">
                    {s.payload?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.payload?.email || s.payload?.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(s);
                      }}
                    >
                      {isRTL ? "عرض" : "View"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="end" ariaLabel={isRTL ? "تفاصيل التقديم" : "Submission details"}>
          <SheetHeader>
            <SheetTitle>{isRTL ? "تفاصيل التقديم" : "Submission details"}</SheetTitle>
          </SheetHeader>
          <SheetBody>
            {active && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">{fmt(active.createdAt)}</div>

                <Section title={isRTL ? "الحقول المعروفة" : "Known fields"}>
                  <Field label={isRTL ? "الاسم" : "Name"} value={active.payload?.name} />
                  <Field label={isRTL ? "البريد الإلكتروني" : "Email"} value={active.payload?.email} />
                  <Field label={isRTL ? "الهاتف" : "Phone"} value={active.payload?.phone} />
                  <Field label={isRTL ? "النوع" : "Type"} value={active.payload?.type} />
                  <Field label={isRTL ? "ملاحظات" : "Notes"} value={active.payload?.notes} />
                </Section>

                <Section title={isRTL ? "الإجابات المخصصة" : "Custom answers"}>
                  {Object.entries(active.payload?.answers || {}).length === 0 ? (
                    <p className="text-xs text-slate-400">
                      {isRTL ? "لا توجد" : "None"}
                    </p>
                  ) : (
                    Object.entries(active.payload?.answers || {}).map(([k, v]) => (
                      <Field
                        key={k}
                        label={k}
                        value={typeof v === "string" ? v : JSON.stringify(v)}
                      />
                    ))
                  )}
                </Section>
              </div>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="text-sm">
      <span className="text-slate-500">{label}: </span>
      <span className="text-[#0F2942] font-medium break-words">{String(value)}</span>
    </div>
  );
}
