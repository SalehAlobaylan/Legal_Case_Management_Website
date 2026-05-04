"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/hooks/use-i18n";
import { usePublicIntakeForm, useSubmitPublicIntakeForm } from "@/lib/hooks/use-intake";
import { FormRenderer, validateClientSide, type FormValues } from "@/components/features/forms/form-renderer";
import { toast } from "@/components/ui/use-toast";

export default function PublicIntakePage() {
  const params = useParams<{ formId: string }>();
  const searchParams = useSearchParams();
  const formId = Number(params?.formId || 0);
  const { t, isRTL, setLocale } = useI18n();
  const { data: form, isLoading, isError } = usePublicIntakeForm(formId);
  const submit = useSubmitPublicIntakeForm(formId);

  const [values, setValues] = React.useState<FormValues>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        {t("common.loading")}
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen grid place-items-center text-red-600">
        {t("common.error")}
      </div>
    );
  }

  const fields = form.fieldsJson || [];
  const logicRules = form.schema?.logicRules || [];
  const theme = form.schema?.theme;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateClientSide(fields, logicRules, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: isRTL ? "تحقق من الحقول" : "Please check the fields",
        variant: "destructive",
      });
      return;
    }

    submit.mutate(
      { answers: values, honeypot },
      {
        onSuccess: () => {
          setDone(true);
          toast({
            title: isRTL ? "تم الإرسال" : "Submitted",
            variant: "success",
          });
        },
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { errors?: Record<string, string> } } };
          if (e?.response?.data?.errors) {
            setErrors(e.response.data.errors);
          }
          toast({
            title: isRTL ? "فشل الإرسال" : "Submission failed",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#fef3c7_0%,transparent_30%),radial-gradient(circle_at_90%_10%,#e2e8f0_0%,transparent_35%),linear-gradient(135deg,#f8fafc_0%,#fff7ed_45%,#f8fafc_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-2xl">
        <div
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl md:p-10 backdrop-blur"
          style={theme?.borderRadius ? { borderRadius: theme.borderRadius * 2 } : undefined}
        >
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">{form.title}</h1>
          {form.description ? (
            <p className="mt-2 text-sm text-slate-500">{form.description}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{t("settings.intakePublicDescription")}</p>
          )}

          {done ? (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {t("settings.intakeSuccess")}
            </div>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              <FormRenderer
                fields={fields}
                logicRules={logicRules}
                values={values}
                onChange={setValues}
                errors={errors}
                isRTL={isRTL}
                disabled={submit.isPending}
                primaryColor={theme?.primaryColor}
                density={theme?.layoutDensity}
              />

              {/* Honeypot */}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              <button
                disabled={submit.isPending}
                className="h-11 rounded-xl px-5 text-white font-semibold disabled:opacity-60 transition-colors"
                style={{
                  backgroundColor: theme?.primaryColor || "#D97706",
                }}
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
