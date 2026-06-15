"use client";

import { useState, useEffect } from "react";
import { verifyDemoPin } from "./actions";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/lib/hooks/use-auth";
import { useGoogleSignIn } from "@/lib/hooks/use-oauth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Star, ArrowLeft, ArrowRight, Scale } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const { mutate: login, isPending, error } = useLogin();
  const { signInWithGoogle } = useGoogleSignIn();
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

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const timer = setInterval(() => {
        if (Date.now() >= lockedUntil) {
          setLockedUntil(null);
          setAttempts(0);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const handleDemoLoginClick = () => {
    setShowPinModal(true);
    setPin("");
    setPinError("");
  };

  const submitPin = async () => {
    if (lockedUntil && Date.now() < lockedUntil) {
      setPinError(isRTL ? `محظور. حاول مرة أخرى بعد ${Math.ceil((lockedUntil - Date.now()) / 1000)} ثانية` : `Locked. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s`);
      return;
    }
    
    if (!/^\d{6}$/.test(pin)) {
      setPinError(isRTL ? "يجب أن يتكون الرمز من 6 أرقام" : "PIN must be exactly 6 digits");
      return;
    }

    const result = await verifyDemoPin(pin);
    if (result.success && result.email && result.password) {
      setShowPinModal(false);
      login({ email: result.email, password: result.password });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockedUntil(Date.now() + 60000);
        setPinError(isRTL ? "محاولات كثيرة. محظور لمدة 60 ثانية." : "Too many attempts. Locked for 60 seconds.");
      } else {
        setPinError(isRTL ? `رمز غير صحيح. متبقي ${3 - newAttempts} محاولات.` : `Incorrect PIN. ${3 - newAttempts} attempts left.`);
      }
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] flex bg-gradient-to-br from-slate-50 to-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50">
        <LanguageToggle variant="full" />
      </div>

      {/* Back to Home - Fixed Position */}
      <Link
        href="/"
        className="fixed top-3 left-3 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
      >
        {isRTL ? <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
        <span className="text-xs sm:text-sm font-semibold">{isRTL ? t("nav.home") : 'Home'}</span>
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
          <div className="inline-flex items-center gap-4 mb-10 group">
            <button
              type="button"
              onClick={handleDemoLoginClick}
              className="bg-white rounded-xl p-3 shadow-lg hover:scale-105 transition-transform focus:outline-none"
            >
              <img
                src="/silah-logo.svg"
                alt="Silah"
                className="h-12 w-auto cursor-pointer"
              />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-serif" style={{ color: '#D97706' }}>
                {isRTL ? 'صلة القانوني' : 'Silah Legal'}
              </h1>
              <p className="text-xs text-white/60">
                {isRTL ? 'منصة للقانونيين' : 'Platform for Lawyers'}
              </p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight tracking-tight">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            &quot;{t("auth.silahQuote")}&quot;
          </p>


        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 sm:p-6 md:p-8">
        <div className="max-w-md w-full">
          {/* Mobile Header with Gradient Background */}
          <div className="lg:hidden mb-8">
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1E3A56] rounded-2xl p-6 text-center shadow-xl">
              <button 
                type="button"
                onClick={handleDemoLoginClick}
                className="inline-block mb-4 focus:outline-none"
              >
                <div className="inline-flex items-center justify-center rounded-full bg-white p-2.5 shadow-md hover:scale-105 transition-transform">
                  <Image src="/silah-logo.svg" alt="Silah" width={48} height={48} className="h-12 w-auto" />
                </div>
              </button>
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
              disabled={true}
              className="relative w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl font-semibold text-slate-400 cursor-not-allowed transition-all shadow-sm overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 opacity-50 grayscale" alt="Google" />
              {t("auth.signInWithGoogle")}
              <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200`}>
                {isRTL ? "قريباً" : "Soon"}
              </span>
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
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative" dir={isRTL ? "rtl" : "ltr"}>
            <button 
              onClick={() => setShowPinModal(false)}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-colors`}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-serif text-center">
              {isRTL ? "أدخل رمز الدخول (6 أرقام)" : "Enter 6-digit PIN"}
            </h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              {isRTL ? "تسجيل الدخول كمدير تجريبي محمي برمز مرور." : "Demo admin login is protected by a PIN."}
            </p>
            
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-2xl font-bold p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-slate-50 mb-4"
              placeholder="••••••"
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              autoFocus
            />

            {pinError && (
              <div className="text-red-500 text-sm font-medium text-center mb-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-in slide-in-from-top-2">
                {pinError}
              </div>
            )}

            <button
              onClick={submitPin}
              disabled={lockedUntil !== null && Date.now() < lockedUntil}
              className="w-full bg-gradient-to-r from-[#0F2942] to-[#1E3A56] hover:from-[#1E3A56] hover:to-[#0F2942] text-white p-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isRTL ? "تحقق" : "Verify"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
