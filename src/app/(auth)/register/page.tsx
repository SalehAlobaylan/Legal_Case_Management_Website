"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/use-auth";
import { ArrowLeft, ShieldCheck } from "lucide-react";

// Schema matching backend requirements
const registerSchema = z
    .object({
        fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
        email: z.string().email("البريد الإلكتروني غير صحيح"),
        organizationId: z.coerce.number().min(1, "رقم المنشأة مطلوب"),
        role: z.string().default("lawyer"),
        password: z
            .string()
            .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
            .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
            .regex(/[0-9]/, "يجب أن تحتوي على رقم"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const { mutate: registerUser, isPending, error } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: z.infer<typeof registerSchema>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registerPayload } = data;
        registerUser(registerPayload);
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-2">
            {/* Right Side - Form (Action Area) */}
            <div className="flex h-full flex-col items-center justify-center bg-white px-6 py-12 lg:px-24 dark:bg-slate-950" dir="rtl">
                <div className="w-full max-w-[540px] space-y-8">
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-3 lg:hidden mb-10 justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-lg shadow-orange-900/20">
                            <span className="text-2xl font-bold">م</span>
                        </div>
                        <span className="font-serif text-3xl font-bold text-[#0F2942] dark:text-white">
                            مدار
                        </span>
                    </div>

                    <div className="space-y-3 text-center lg:text-right">
                        <h1 className="font-serif text-4xl font-bold text-[#0F2942] tracking-tight dark:text-white">
                            إنشاء حساب جديد
                        </h1>
                        <p className="text-slate-500 text-lg dark:text-slate-400">
                            ابدأ تجربتك مع مدار لإدارة القضايا بذكاء
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-3">
                            <Label htmlFor="fullName" className="text-base font-semibold text-[#0F2942] dark:text-slate-200">
                                الاسم الكامل
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="الاسم الثلاثي"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-right text-base transition-all duration-200 hover:border-[#D97706]/50 focus:border-[#D97706] focus:bg-white focus:ring-4 focus:ring-[#D97706]/10 dark:border-slate-800 dark:bg-slate-900"
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                    {errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-base font-semibold text-[#0F2942] dark:text-slate-200">
                                    البريد الإلكتروني
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-right text-base transition-all duration-200 hover:border-[#D97706]/50 focus:border-[#D97706] focus:bg-white focus:ring-4 focus:ring-[#D97706]/10 dark:border-slate-800 dark:bg-slate-900"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="orgId" className="text-base font-semibold text-[#0F2942] dark:text-slate-200">
                                    رقم المنشأة
                                </Label>
                                <Input
                                    id="orgId"
                                    type="number"
                                    placeholder="1"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-right text-base transition-all duration-200 hover:border-[#D97706]/50 focus:border-[#D97706] focus:bg-white focus:ring-4 focus:ring-[#D97706]/10 dark:border-slate-800 dark:bg-slate-900"
                                    {...register("organizationId")}
                                />
                                {errors.organizationId && (
                                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                        {errors.organizationId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-base font-semibold text-[#0F2942] dark:text-slate-200">
                                    كلمة المرور
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-right text-base transition-all duration-200 hover:border-[#D97706]/50 focus:border-[#D97706] focus:bg-white focus:ring-4 focus:ring-[#D97706]/10 dark:border-slate-800 dark:bg-slate-900"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 font-medium whitespace-pre-line animate-in slide-in-from-top-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="confirmPassword" className="text-base font-semibold text-[#0F2942] dark:text-slate-200">
                                    تأكيد كلمة المرور
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-right text-base transition-all duration-200 hover:border-[#D97706]/50 focus:border-[#D97706] focus:bg-white focus:ring-4 focus:ring-[#D97706]/10 dark:border-slate-800 dark:bg-slate-900"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20 text-center shadow-sm">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(error as any).response?.data?.error || "حدث خطأ أثناء إنشاء الحساب"}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="group h-12 w-full mt-4 rounded-xl bg-[#0F2942] text-lg font-bold text-white transition-all duration-300 hover:bg-[#1E3A56] hover:shadow-xl hover:shadow-[#0F2942]/20 hover:-translate-y-0.5 active:translate-y-0"
                            disabled={isPending}
                        >
                            {isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
                            {!isPending && <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />}
                        </Button>

                        <div className="text-center text-sm text-slate-500 mt-6 font-medium">
                            بالتسجيل فإنك توافق على{" "}
                            <Link href="#" className="font-semibold text-[#0F2942] transition-colors hover:text-[#D97706] hover:underline dark:text-slate-300">
                                شروط الخدمة
                            </Link>{" "}
                            و{" "}
                            <Link href="#" className="font-semibold text-[#0F2942] transition-colors hover:text-[#D97706] hover:underline dark:text-slate-300">
                                سياسة الخصوصية
                            </Link>
                        </div>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 font-medium text-slate-500 dark:bg-slate-950">
                                لديك حساب بالفعل؟
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-base font-bold text-[#D97706] transition-colors hover:text-[#B45309] hover:underline"
                        >
                            تسجيل الدخول
                        </Link>
                    </div>
                </div>
            </div>

            {/* Left Side - Visual */}
            <div className="hidden h-full flex-col justify-between bg-[#0F2942] p-16 text-white lg:flex relative overflow-hidden">
                {/* Background Pattern & Gradient */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F2942] via-[#0F2942] to-[#0a1c2e]" />
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#D97706] opacity-10 blur-3xl" />
                <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[#1E3A56] opacity-20 blur-3xl" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D97706] text-white shadow-2xl shadow-orange-900/30 ring-1 ring-white/10">
                        <span className="text-3xl font-bold">م</span>
                    </div>
                    <span className="font-serif text-4xl font-bold tracking-wide text-white drop-shadow-md">
                        مدار
                    </span>
                </div>

                <div className="relative z-10 mx-auto max-w-lg text-center">
                    <div className="mb-10 flex justify-center">
                        <div className="rounded-full bg-white/5 p-8 backdrop-blur-md ring-1 ring-white/10 shadow-2xl">
                            <ShieldCheck className="h-20 w-20 text-[#D97706] drop-shadow-lg" />
                        </div>
                    </div>
                    <h2 className="font-serif text-5xl font-bold leading-tight mb-8 drop-shadow-lg">
                        أمان وثقة <br />
                        <span className="text-[#D97706]">لك ولعملائك.</span>
                    </h2>
                    <p className="text-xl text-blue-100/90 leading-relaxed font-light">
                        نحن نلتزم بأعلى معايير الأمان وحماية البيانات لضمان خصوصية جميع معلومات القضايا والعملاء.
                    </p>
                </div>

                <div className="relative z-10 text-center text-sm font-medium text-blue-200/60">
                    <p>© 2026 مدار. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </div>
    );
}
