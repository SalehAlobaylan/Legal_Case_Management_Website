"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/use-auth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Check } from "lucide-react";

// Schema matching the form layout (organization as text, role as select)
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
        // Convert to backend format
        registerUser({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            organizationId: 1, // Default org ID - backend handles organization creation
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Visual */}
            <div className={`hidden lg:flex w-1/2 bg-[#D97706] relative overflow-hidden items-center justify-center p-12 ${isRTL ? 'order-2' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#0F2942]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0F2942]/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h2 className="text-5xl font-bold font-serif mb-6 leading-tight">{t("auth.startJourney")}</h2>
                    <ul className="space-y-6 text-white/90 text-lg">
                        <li className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-lg mt-1"><Check size={20} /></div>
                            <div>
                                <span className="font-bold block">{t("auth.freeTrial")}</span>
                                <span className="text-sm opacity-80">{t("auth.freeTrialDesc")}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-lg mt-1"><Check size={20} /></div>
                            <div>
                                <span className="font-bold block">{t("auth.instantAI")}</span>
                                <span className="text-sm opacity-80">{t("auth.instantAIDesc")}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-lg mt-1"><Check size={20} /></div>
                            <div>
                                <span className="font-bold block">{t("auth.dedicatedSupport")}</span>
                                <span className="text-sm opacity-80">{t("auth.dedicatedSupportDesc")}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${isRTL ? 'order-1' : ''}`}>
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#0F2942] font-serif">{t("auth.createAccount")}</h2>
                        <p className="text-slate-500 mt-2">{t("auth.joinThousands")}</p>
                    </div>

                    <div className="space-y-6">
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            {t("auth.signUpWithGoogle")}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">{t("auth.orWithEmail")}</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t("auth.fullName")}</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ahmed Al-Faisal"
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t("auth.emailAddress")}</label>
                                <input
                                    type="email"
                                    placeholder={t("auth.emailPlaceholder")}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t("auth.password")}</label>
                                <input
                                    type="password"
                                    placeholder={t("auth.createPassword")}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{t("auth.organization")}</label>
                                    <input
                                        type="text"
                                        placeholder={t("auth.organizationPlaceholder")}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                                        {...register("organization")}
                                    />
                                    {errors.organization && (
                                        <p className="text-sm text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                                            {errors.organization.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{t("auth.role")}</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] bg-white transition-all"
                                        {...register("role")}
                                    >
                                        <option>{t("auth.lawyer")}</option>
                                        <option>{t("auth.paralegal")}</option>
                                        <option>{t("auth.admin")}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 rounded border-slate-300 text-[#D97706] focus:ring-[#D97706]"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-500">
                                    {t("auth.agreeToTerms")}{" "}
                                    <Link href="#" className="text-[#0F2942] font-bold underline">{t("auth.termsOfService")}</Link>
                                    {" "}{t("common.and")}{" "}
                                    <Link href="#" className="text-[#0F2942] font-bold underline">{t("auth.privacyPolicy")}</Link>.
                                </label>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center shadow-sm">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(error as any).response?.data?.error || t("auth.errorOccurred")}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-[#0F2942] hover:bg-[#1E3A56] text-white p-3.5 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02]"
                                disabled={isPending}
                            >
                                {isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500">
                            {t("auth.hasAccount")}{" "}
                            <Link href="/login" className="text-[#D97706] font-bold hover:underline">
                                {t("auth.signIn")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
