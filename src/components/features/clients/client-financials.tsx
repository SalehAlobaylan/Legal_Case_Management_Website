"use client";

import React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { DollarSign, FileText, TrendingUp, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

export function ClientFinancials() {
  const { t, isRTL } = useI18n();

  // Mock data for financials
  const stats = {
    lifetimeValue: "145,000 SAR",
    outstanding: "12,500 SAR",
    lastPaymentDate: "2024-03-12",
  };

  const invoices = [
    { id: "INV-2024-001", amount: "12,500 SAR", status: "unpaid", date: "2024-04-01", description: "Retainer Fee Q2" },
    { id: "INV-2024-002", amount: "45,000 SAR", status: "paid", date: "2024-03-10", description: "Litigation Settlement" },
    { id: "INV-2024-003", amount: "8,500 SAR", status: "paid", date: "2024-02-15", description: "Consultation Hours" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800">{t("clients.financials.title")}</h3>
          <p className="text-sm text-slate-500 mt-1">{t("clients.financials.description")}</p>
        </div>
        <Button className="bg-[#0F2942] hover:bg-[#1e4468] text-white flex items-center gap-2 rounded-xl">
          <FileText className="w-4 h-4" />
          {t("clients.financials.createInvoice")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex justify-center items-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">{t("clients.financials.lifetimeValue")}</p>
          </div>
          <h4 className="text-2xl font-bold text-emerald-700">{stats.lifetimeValue}</h4>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex justify-center items-center">
              <DollarSign className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-sm font-semibold text-rose-800">{t("clients.financials.outstandingBalance")}</p>
          </div>
          <h4 className="text-2xl font-bold text-rose-700">{stats.outstanding}</h4>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex justify-center items-center">
              <CreditCard className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">{t("clients.financials.lastPayment")}</p>
          </div>
          <h4 className="text-xl font-bold text-slate-800 mt-1">{stats.lastPaymentDate}</h4>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-sm text-slate-700">{t("clients.financials.recentInvoices")}</h4>
          <button className="text-xs font-bold text-[#D97706] hover:underline">{t("clients.financials.viewAll")}</button>
        </div>
        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  inv.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">{inv.id}</h5>
                  <p className="text-xs text-slate-500">{inv.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-800">{inv.amount}</p>
                  <p className="text-xs text-slate-500">{inv.date}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                  inv.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {t(`clients.financials.${inv.status}`)}
                </span>
                <ChevronRight className={cn("w-4 h-4 text-slate-300", isRTL && "rotate-180")} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
