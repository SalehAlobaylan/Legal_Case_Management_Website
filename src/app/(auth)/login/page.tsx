"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLogin } from "@/lib/hooks/use-auth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const { mutate: login, isPending, error } = useLogin();
  const { t, isRTL } = useI18n();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageToggle variant="full" />
      </div>

      {/* Back to Home - Fixed Position */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
      >
        {isRTL ? <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
        <span className="text-sm font-semibold">{isRTL ? 'الرئيسية' : 'Home'}</span>
      </Link>

      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0F2942] via-[#153550] to-[#1E3A56] relative overflow-hidden items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D97706]/15 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#1E3A56] rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#D97706]/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <Link href="/" className="inline-flex items-center gap-4 mb-10 group">
            <div className="bg-white rounded-xl p-3 shadow-lg group-hover:scale-105 transition-transform">
              <img
                src="/silah-logo.png"
                alt="Silah"
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif" style={{ color: '#D97706' }}>
                {isRTL ? 'صلة القانوني' : 'Silah Legal'}
              </h1>
              <p className="text-xs text-white/60">
                {isRTL ? 'منصة للقانونيين' : 'Platform for Lawyers'}
              </p>
            </div>
          </Link>

          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight tracking-tight">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            &quot;{t("auth.silahQuote")}&quot;
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className={`flex ${isRTL ? 'flex-row-reverse -space-x-3 space-x-reverse' : '-space-x-3'}`}>
              <div className="w-11 h-11 rounded-full border-3 border-[#0F2942] bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg"></div>
              <div className="w-11 h-11 rounded-full border-3 border-[#0F2942] bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg"></div>
              <div className="w-11 h-11 rounded-full border-3 border-[#0F2942] bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg"></div>
            </div>
            <div>
              <p className="font-bold text-white mb-1">{t("auth.trustedByLawyers")}</p>
              <div className="flex gap-0.5 text-[#D97706]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
        <div className="max-w-md w-full">
          {/* Mobile Header with Gradient Background */}
          <div className="lg:hidden mb-8">
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1E3A56] rounded-2xl p-6 text-center shadow-xl">
              <Link href="/" className="inline-block mb-4">
                <img src="/silah-logo.png" alt="Silah" className="h-12 w-auto mx-auto" />
              </Link>
              <h2 className="text-xl font-bold text-white mb-1">{t("auth.signInToSilah")}</h2>
              <p className="text-blue-200/80 text-sm">{t("auth.enterCredentials")}</p>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F2942] font-serif mb-2">{t("auth.signInToSilah")}</h2>
            <p className="text-slate-500">{t("auth.enterCredentials")}</p>
          </div>

          <div className="space-y-6">
            {/* Google Sign In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              {t("auth.signInWithGoogle")}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">{t("auth.orWithEmail")}</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.emailAddress")}</label>
                <input
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">{t("auth.password")}</label>
                  <Link href="#" className="text-xs font-semibold text-[#D97706] hover:text-[#B45309] transition-colors">{t("auth.forgotPassword")}</Link>
                </div>
                <input
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 text-[#D97706] focus:ring-[#D97706] focus:ring-offset-0"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 font-medium">{t("auth.rememberMe")}</label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(error as any).response?.data?.error || t("auth.errorOccurred")}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0F2942] to-[#1E3A56] hover:from-[#1E3A56] hover:to-[#0F2942] text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-[#0F2942]/20 transition-all hover:shadow-xl hover:shadow-[#0F2942]/30 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? t("auth.signingIn") : t("auth.signIn")}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 pt-2">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="text-[#D97706] font-bold hover:text-[#B45309] transition-colors">
                {t("auth.createFreeAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
