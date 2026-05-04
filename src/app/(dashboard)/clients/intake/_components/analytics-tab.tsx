"use client";

import * as React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useIntakeAnalytics } from "@/lib/hooks/use-intake";
import { BarChart3, FileText, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function AnalyticsTab() {
  const { isRTL } = useI18n();
  const { data, isLoading, isError } = useIntakeAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        {isRTL ? "جاري التحميل..." : "Loading analytics..."}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-red-500">
        {isRTL ? "تعذر تحميل التحليلات" : "Could not load analytics"}
      </div>
    );
  }

  const cards = [
    {
      icon: FileText,
      label: isRTL ? "إجمالي النماذج" : "Total Forms",
      value: data.totalForms,
      tone: "bg-slate-50 text-[#0F2942]",
    },
    {
      icon: Activity,
      label: isRTL ? "نشط" : "Active",
      value: data.activeForms,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      icon: BarChart3,
      label: isRTL ? "إجمالي التقديمات" : "Total Submissions",
      value: data.totalSubmissions,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      icon: TrendingUp,
      label: isRTL ? "آخر 30 يوماً" : "Last 30 days",
      value: data.submissionsLast30d,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.tone}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{c.label}</p>
              <c.icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="text-sm font-bold text-[#0F2942] mb-4">
          {isRTL ? "التقديمات اليومية (آخر 30 يوماً)" : "Daily Submissions (last 30 days)"}
        </h4>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(5)}
                fontSize={11}
                stroke="#94a3b8"
              />
              <YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#D97706" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="text-sm font-bold text-[#0F2942] mb-4">
          {isRTL ? "أكثر النماذج تلقياً للتقديمات" : "Top Forms by Submissions"}
        </h4>
        {data.topForms.length === 0 ? (
          <p className="text-sm text-slate-400">{isRTL ? "لا توجد بيانات بعد" : "No data yet"}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-start py-2 font-semibold">
                  {isRTL ? "النموذج" : "Form"}
                </th>
                <th className="text-end py-2 font-semibold">
                  {isRTL ? "التقديمات" : "Submissions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topForms.map((f) => (
                <tr key={f.formId} className="border-t border-slate-100">
                  <td className="py-2 text-[#0F2942]">{f.title}</td>
                  <td className="py-2 text-end font-bold text-amber-600">{f.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
