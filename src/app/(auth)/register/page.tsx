"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/use-auth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";

// Schema matching the form layout
const registerSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[0-9]/, "Must contain a number"),
    organization: z.string().min(1, "Organization is required"),
    role: z.string(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { mutate: registerUser, isPending, error } = useRegister();
    const { t, isRTL } = useI18n();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "Lawyer",
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        registerUser({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            organizationId: 1,
        });
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
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#92400e] relative overflow-hidden items-center justify-center p-12">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#0F2942]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0F2942]/15 rounded-full blur-[100px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/5 rounded-full blur-[80px]"></div>
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
                            <h1 className="text-2xl font-bold font-serif" style={{ color: '#0F2942' }}>
                                {isRTL ? 'صلة القانوني' : 'Silah Legal'}
                            </h1>
                            <p className="text-xs text-white/80">
                                {isRTL ? 'منصة للقانونيين' : 'Platform for Lawyers'}
                            </p>
                        </div>
                    </Link>

                    <h2 className="text-4xl md:text-5xl font-bold font-serif mb-10 leading-tight tracking-tight">
                        {t("auth.startJourney")}
                    </h2>

                    <ul className="space-y-6">
                        <li className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                                <Check size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="font-bold block text-lg mb-1">{t("auth.freeTrial")}</span>
                                <span className="text-sm text-white/70">{t("auth.freeTrialDesc")}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                                <Check size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="font-bold block text-lg mb-1">{t("auth.instantAI")}</span>
                                <span className="text-sm text-white/70">{t("auth.instantAIDesc")}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                                <Check size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="font-bold block text-lg mb-1">{t("auth.dedicatedSupport")}</span>
                                <span className="text-sm text-white/70">{t("auth.dedicatedSupportDesc")}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
                <div className="max-w-md w-full">
                    {/* Mobile Header with Gradient Background */}
                    <div className="lg:hidden mb-8">
                        <div className="bg-gradient-to-r from-[#D97706] to-[#B45309] rounded-2xl p-6 text-center shadow-xl">
                            <Link href="/" className="inline-block mb-4">
                                <img src="/silah-logo.png" alt="Silah" className="h-12 w-auto mx-auto" />
                            </Link>
                            <h2 className="text-xl font-bold text-white mb-1">{t("auth.createAccount")}</h2>
                            <p className="text-white/80 text-sm">{t("auth.joinThousands")}</p>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#0F2942] font-serif mb-2">{t("auth.createAccount")}</h2>
                        <p className="text-slate-500">{t("auth.joinThousands")}</p>
                    </div>

                    <div className="space-y-5">
                        {/* Google Sign Up */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            {t("auth.signUpWithGoogle")}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">{t("auth.orWithEmail")}</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.fullName")}</label>
                                <input
                                    type="text"
                                    placeholder={isRTL ? "مثال: أحمد الفيصل" : "e.g. Ahmed Al-Faisal"}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.password")}</label>
                                <input
                                    type="password"
                                    placeholder={t("auth.createPassword")}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.organization")}</label>
                                    <input
                                        type="text"
                                        placeholder={t("auth.organizationPlaceholder")}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white text-sm"
                                        {...register("organization")}
                                    />
                                    {errors.organization && (
                                        <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                            {errors.organization.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.role")}</label>
                                    <select
                                        className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 bg-white transition-all text-sm"
                                        {...register("role")}
                                    >
                                        <option value="Lawyer">{t("auth.lawyer")}</option>
                                        <option value="Paralegal">{t("auth.paralegal")}</option>
                                        <option value="Admin">{t("auth.admin")}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#D97706] focus:ring-[#D97706] focus:ring-offset-0"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                                    {t("auth.agreeToTerms")}{" "}
                                    <Link href="#" className="text-[#0F2942] font-bold underline hover:text-[#1E3A56] transition-colors">{t("auth.termsOfService")}</Link>
                                    {" "}{t("common.and")}{" "}
                                    <Link href="#" className="text-[#0F2942] font-bold underline hover:text-[#1E3A56] transition-colors">{t("auth.privacyPolicy")}</Link>.
                                </label>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(error as any).response?.data?.error || t("auth.errorOccurred")}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#D97706] text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-[#D97706]/20 transition-all hover:shadow-xl hover:shadow-[#D97706]/30 disabled:opacity-50"
                                disabled={isPending}
                            >
                                {isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 pt-1">
                            {t("auth.hasAccount")}{" "}
                            <Link href="/login" className="text-[#D97706] font-bold hover:text-[#B45309] transition-colors">
                                {t("auth.signIn")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
