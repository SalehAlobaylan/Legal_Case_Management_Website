"use client";

import React from "react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { DollarSign, FileText, TrendingUp, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import { useInvoices } from "@/lib/hooks/use-billing";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCreateClientInvoice } from "@/lib/hooks/use-clients";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ClientFinancials({ clientId }: { clientId: number }) {
  const { t, isRTL, locale } = useI18n();
  const user = useAuthStore((s) => s.user);
  const createInvoice = useCreateClientInvoice();
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [amountSar, setAmountSar] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [description, setDescription] = React.useState("");
  const { data, isLoading } = useInvoices({
    clientId,
    limit: 10,
  });

  const invoices = data?.invoices ?? [];

  const stats = React.useMemo(() => {
    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount, 0);
    const outstanding = invoices
      .filter((i) => i.status === "pending" || i.status === "overdue")
      .reduce((sum, i) => sum + i.amount, 0);
    const lastPaid = invoices
      .filter((i) => i.paidDate)
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0];

    return {
      lifetimeValue: paid,
      outstanding,
      lastPaymentDate: lastPaid?.paidDate || null,
    };
  }, [invoices]);

  const formatCurrency = (halalas: number, currency: string) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(halalas / 100);
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800">{t("clients.financials.title")}</h3>
          <p className="text-sm text-slate-500 mt-1">{t("clients.financials.description")}</p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1e3a56]"
          >
            <FileText className="w-4 h-4" />
            {t("clients.financials.createInvoice")}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex justify-center items-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">{t("clients.financials.lifetimeValue")}</p>
          </div>
          <h4 className="text-2xl font-bold text-emerald-700">{formatCurrency(stats.lifetimeValue, "SAR")}</h4>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex justify-center items-center">
              <DollarSign className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-sm font-semibold text-rose-800">{t("clients.financials.outstandingBalance")}</p>
          </div>
          <h4 className="text-2xl font-bold text-rose-700">{formatCurrency(stats.outstanding, "SAR")}</h4>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex justify-center items-center">
              <CreditCard className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">{t("clients.financials.lastPayment")}</p>
          </div>
          <h4 className="text-xl font-bold text-slate-800 mt-1">
            {stats.lastPaymentDate ? formatDate(stats.lastPaymentDate) : t("common.notAvailable")}
          </h4>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-sm text-slate-700">{t("clients.financials.recentInvoices")}</h4>
          <span className="text-xs font-bold text-slate-500">{invoices.length}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">{t("portal.noInvoices")}</div>
          ) : (
            invoices.map((inv) => (
            <div key={inv.id} className={cn("p-4 flex items-center justify-between hover:bg-slate-50 transition-colors", isRTL && "flex-row-reverse") }>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  inv.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"
                )}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">{inv.invoiceNumber}</h5>
                  <p className="text-xs text-slate-500">{formatDate(inv.issueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={cn("text-right", isRTL && "text-left")}>
                  <p className="font-bold text-sm text-slate-800">{formatCurrency(inv.amount, inv.currency)}</p>
                  <p className="text-xs text-slate-500">{formatDate(inv.dueDate)}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                  inv.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {inv.status === "paid" ? t("clients.financials.paid") : t("clients.financials.unpaid")}
                </span>
                <ChevronRight className={cn("w-4 h-4 text-slate-300", isRTL && "rotate-180")} />
              </div>
            </div>
          ))) }
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.financials.createInvoice")}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">{t("settings.amount")}</label>
              <Input
                type="number"
                min="1"
                value={amountSar}
                onChange={(e) => setAmountSar(e.target.value)}
                placeholder="1500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">{t("clients.documents.date")}</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">{t("clients.overview.notes")}</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                const amountHalalas = Math.round(Number(amountSar || 0) * 100);
                const due = dueDate ? new Date(`${dueDate}T12:00:00.000Z`).toISOString() : "";
                if (!amountHalalas || !due) return;
                createInvoice.mutate(
                  {
                    clientId,
                    amount: amountHalalas,
                    dueDate: due,
                    description: description || undefined,
                    currency: "SAR",
                  },
                  {
                    onSuccess: () => {
                      setDialogOpen(false);
                      setAmountSar("");
                      setDueDate("");
                      setDescription("");
                    },
                  }
                );
              }}
              disabled={createInvoice.isPending}
            >
              {createInvoice.isPending ? t("common.processing") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
