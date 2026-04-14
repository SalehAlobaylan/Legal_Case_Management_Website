"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/hooks/use-i18n";
import { usePublicIntakeForm, useSubmitPublicIntakeForm } from "@/lib/hooks/use-intake";

export default function PublicIntakePage() {
  const params = useParams<{ formId: string }>();
  const searchParams = useSearchParams();
  const formId = Number(params?.formId || 0);
  const { t, isRTL, setLocale } = useI18n();
  const { data: form, isLoading, isError } = usePublicIntakeForm(formId);
  const submit = useSubmitPublicIntakeForm(formId);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [honeypot, setHoneypot] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const lang = searchParams.get("lang");
    if (lang === "ar" || lang === "en") {
      setLocale(lang);
      return;
    }

    if (typeof navigator !== "undefined") {
      const browserLocale = navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
      setLocale(browserLocale);
    }
  }, [searchParams, setLocale]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500">{t("common.loading")}</div>;
  }

  if (isError || !form) {
    return <div className="min-h-screen grid place-items-center text-red-600">{t("common.error")}</div>;
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#fef3c7_0%,transparent_30%),radial-gradient(circle_at_90%_10%,#e2e8f0_0%,transparent_35%),linear-gradient(135deg,#f8fafc_0%,#fff7ed_45%,#f8fafc_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl md:p-10 backdrop-blur">
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">{form.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("settings.intakePublicDescription")}</p>

          {done ? (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {t("settings.intakeSuccess")}
            </div>
          ) : (
            <form
              className="mt-8 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate(
                  {
                    name,
                    email: email || undefined,
                    phone: phone || undefined,
                    notes: notes || undefined,
                    honeypot,
                  },
                  {
                    onSuccess: () => setDone(true),
                  }
                );
              }}
            >
              <label className="block text-sm font-semibold text-slate-700">{t("auth.fullName")}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
              />

              <label className="block text-sm font-semibold text-slate-700">{t("auth.emailAddress")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
              />

              <label className="block text-sm font-semibold text-slate-700">{t("clients.contact")}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
              />

              <label className="block text-sm font-semibold text-slate-700">{t("clients.overview.notes")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2"
              />

              <input
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              <button
                disabled={submit.isPending}
                className="h-11 rounded-xl bg-[#D97706] px-5 text-white font-semibold hover:bg-[#B45309] disabled:opacity-60"
                type="submit"
              >
                {submit.isPending ? t("common.processing") : t("common.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
