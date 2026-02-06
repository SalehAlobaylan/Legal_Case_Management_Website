"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRegister } from "@/lib/hooks/use-auth";
import { useGoogleSignIn } from "@/lib/hooks/use-oauth";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Check, ArrowLeft, ArrowRight, Building2, Users } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Organization } from "@/lib/types/auth";

const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    registrationType: z.enum(["create", "join"]),
    organizationName: z.string().optional(),
    organizationId: z.string().optional(),
    subscriptionTier: z.string().optional(),
    role: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.registrationType === "create") {
        return data.organizationName && data.organizationName.length >= 2;
    }
    return true;
}, {
    message: "Organization name is required",
    path: ["organizationName"],
}).refine((data) => {
    if (data.registrationType === "join") {
        return data.organizationId && data.organizationId !== "";
    }
    return true;
}, {
    message: "Please select an organization",
    path: ["organizationId"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { mutate: registerUser, isPending, error } = useRegister();
    const { signInWithGoogle } = useGoogleSignIn();
    const { t, isRTL } = useI18n();
    const [registrationType, setRegistrationType] = useState<"create" | "join">("create");
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "lawyer",
            registrationType: "create",
            subscriptionTier: "free",
        },
    });

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    useEffect(() => {
        const fetchOrganizations = async () => {
            setIsLoadingOrgs(true);
            try {
                const response = await fetch(`${API_BASE}/api/organizations`);
                const data = await response.json();
                setOrganizations(data.organizations || []);
            } catch (err) {
                console.error("Failed to fetch organizations:", err);
            } finally {
                setIsLoadingOrgs(false);
            }
        };

        fetchOrganizations();
    }, [API_BASE]);

    useEffect(() => {
        setValue("registrationType", registrationType);
    }, [registrationType, setValue]);

    const onSubmit = (data: RegisterFormData) => {
        if (data.registrationType === "create") {
            registerUser({
                registrationType: "create",
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                organizationName: data.organizationName!,
                subscriptionTier: data.subscriptionTier || "free",
                role: data.role as "lawyer" | "senior_lawyer" | "paralegal" | "clerk" | "admin" | undefined,
            });
        } else {
            registerUser({
                registrationType: "join",
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                organizationId: parseInt(data.organizationId || "0"),
                role: data.role as "lawyer" | "senior_lawyer" | "paralegal" | "clerk" | "admin" | undefined,
            });
        }
    };

    return (
        <div className={`min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="fixed top-6 right-6 z-50">
                <LanguageToggle variant="full" />
            </div>

            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
            >
                {isRTL ? <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
                <span className="text-sm font-semibold">{isRTL ? 'الرئيسية' : 'Home'}</span>
            </Link>

            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#92400e] relative overflow-hidden items-center justify-center p-12">
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

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
                <div className="max-w-md w-full">
                    <div className="lg:hidden mb-8">
                        <div className="bg-gradient-to-r from-[#D97706] to-[#B45309] rounded-2xl p-6 text-center shadow-xl">
                            <Link href="/" className="inline-block mb-4">
                                <img src="/silah-logo.png" alt="Silah" className="h-12 w-auto mx-auto" />
                            </Link>
                            <h2 className="text-xl font-bold text-white mb-1">{t("auth.createAccount")}</h2>
                            <p className="text-white/80 text-sm">{t("auth.joinThousands")}</p>
                        </div>
                    </div>

                    <div className="hidden lg:block text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#0F2942] font-serif mb-2">{t("auth.createAccount")}</h2>
                        <p className="text-slate-500">{t("auth.joinThousands")}</p>
                    </div>

                    <div className="space-y-5">
                        <button
                            type="button"
                            onClick={signInWithGoogle}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            {t("auth.signUpWithGoogle")}
                        </button>

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">{t("auth.orWithEmail")}</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

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

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.confirmPassword")}</label>
                                <input
                                    type="password"
                                    placeholder={t("auth.confirmPassword")}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    {isRTL ? 'المنظمة' : 'Organization'}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRegistrationType("create")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${registrationType === "create"
                                                ? "border-[#D97706] bg-[#D97706]/5 text-[#D97706]"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                            }`}
                                    >
                                        <Building2 size={24} />
                                        <span className="text-sm font-semibold">
                                            {isRTL ? 'إنشاء منظمة جديدة' : 'Create New'}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRegistrationType("join")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${registrationType === "join"
                                                ? "border-[#D97706] bg-[#D97706]/5 text-[#D97706]"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                            }`}
                                    >
                                        <Users size={24} />
                                        <span className="text-sm font-semibold">
                                            {isRTL ? 'الانضمام لمنظمة' : 'Join Existing'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {registrationType === "create" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {isRTL ? 'اسم المنظمة' : 'Organization Name'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={isRTL ? "مثال: مكتب العدالة للمحاماة" : "e.g. Justice Law Firm"}
                                            className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all bg-white"
                                            {...register("organizationName")}
                                        />
                                        {errors.organizationName && (
                                            <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                                {errors.organizationName.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">
                                            {isRTL ? 'ستصبح مديراً لهذه المنظمة' : 'You will become the admin of this organization'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {isRTL ? 'المستوى' : 'Plan'}
                                        </label>
                                        <select
                                            className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 bg-white transition-all"
                                            {...register("subscriptionTier")}
                                        >
                                            <option value="free">{isRTL ? 'مجاني' : 'Free'}</option>
                                            <option value="premium">{isRTL ? 'مميز' : 'Premium'}</option>
                                            <option value="enterprise">{isRTL ? 'المؤسسات' : 'Enterprise'}</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        {isRTL ? 'اختر المنظمة' : 'Select Organization'}
                                    </label>
                                    <select
                                        className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 bg-white transition-all"
                                        {...register("organizationId")}
                                        disabled={isLoadingOrgs}
                                    >
                                        <option value="">
                                            {isLoadingOrgs
                                                ? (isRTL ? 'جاري التحميل...' : 'Loading...')
                                                : (isRTL ? '-- اختر منظمة --' : '-- Select an organization --')
                                            }
                                        </option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.organizationId && (
                                        <p className="text-sm text-red-500 font-medium mt-2 animate-in slide-in-from-top-1">
                                            {errors.organizationId.message}
                                        </p>
                                    )}
                                    {organizations.length === 0 && !isLoadingOrgs && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            {isRTL ? 'لا توجد منظمات متاحة حالياً' : 'No organizations available'}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth.role")}</label>
                                <select
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 bg-white transition-all"
                                    {...register("role")}
                                >
                                    <option value="lawyer">{t("auth.lawyer")}</option>
                                    <option value="paralegal">{t("auth.paralegal")}</option>
                                    <option value="senior_lawyer">{t("auth.seniorLawyer")}</option>
                                    <option value="clerk">{t("auth.clerk")}</option>
                                    <option value="admin">{t("auth.admin")}</option>
                                </select>
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
                                    {"response" in error ? (error as { response?: { data?: { error?: string } } }).response?.data?.error : t("auth.errorOccurred")}
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
