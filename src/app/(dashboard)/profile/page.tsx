"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
    Mail,
    Building2,
    Phone,
    FileText,
    Camera,
    MapPin,
    Briefcase,
    Award,
    Clock,
    TrendingUp,
    Target,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Scale,
    ChevronRight,
    XCircle,
    UserCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCases } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useProfileStats, useProfileActivities, useUpdateProfile, useUploadAvatar } from "@/lib/hooks/use-profile";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils/cn";
import { ProfileStats } from "@/lib/api/profile";

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    specialization: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user } = useAuthStore();
    const { data: cases } = useCases();
    const { t, isRTL } = useI18n();
    const [isEditing, setIsEditing] = useState(false);

    // Hooks
    const { data: statsData, isLoading: isStatsLoading } = useProfileStats();
    const { data: activitiesData, isLoading: isActivitiesLoading } = useProfileActivities();
    const updateProfile = useUpdateProfile();
    const uploadAvatar = useUploadAvatar();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
            location: user?.location || (isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"),
            specialization: "Commercial Law", // This could come from user object if added
        },
    });

    // Default stats if loading or error
    const defaultStats: ProfileStats = {
        activeCases: 12,
        totalClients: 28,
        winRate: 87,
        avgCaseDuration: 45,
        winRateChange: 5,
        avgDurationChange: -8,
        clientSatisfaction: 94,
        satisfactionChange: 3,
        regulationsReviewed: 156,
        aiSuggestionsAccepted: 78,
        documentsProcessed: 342,
        thisMonthHours: 168,
        hoursChange: 12
    };

    const stats = statsData?.stats || defaultStats;
    const activities = activitiesData?.activities || [];

    // Calculate derived case stats from local cases if needed, but we use server stats mostly
    const totalCasesLocal = cases?.length || 24;
    const activeCasesLocal = cases?.filter(c => c.status === 'open' || c.status === 'in_progress').length || 12;
    const closedCasesLocal = cases?.filter(c => c.status === 'closed').length || 10;
    const pendingCasesLocal = cases?.filter(c => c.status === 'pending_hearing').length || 2;

    const userInitials = user?.fullName
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "FA";

    const formatRole = (role: string) => {
        const roleMap: Record<string, { en: string; ar: string }> = {
            admin: { en: "Administrator", ar: "مدير" },
            senior_lawyer: { en: "Senior Partner", ar: "شريك أول" },
            lawyer: { en: "Attorney at Law", ar: "محامٍ" },
            paralegal: { en: "Paralegal", ar: "مساعد قانوني" },
        };
        const formatted = roleMap[role?.toLowerCase()];
        return formatted ? (isRTL ? formatted.ar : formatted.en) : "Attorney at Law";
    };

    const onSubmit = (data: ProfileFormData) => {
        updateProfile.mutate(data, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadAvatar.mutate(file);
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">
                        {t("settings.myProfile")}
                    </h1>
<p className="text-[var(--color-text-muted)] mt-2 text-sm font-medium tracking-wide">
                        {isRTL ? t("settings.professionalProfile") : "PROFESSIONAL PROFILE & PERFORMANCE DASHBOARD"}
                    </p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-brand-primary text-white hover:bg-brand-secondary transition-colors rounded-md px-6 shadow-sm"
                    >
                        {t("common.edit")}
                    </Button>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden sticky top-6 bg-surface-card">
                        <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-secondary w-full" />
                        <CardContent className="p-6 -mt-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4 group cursor-pointer" onClick={handleAvatarClick}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="w-24 h-24 rounded-full bg-surface-muted border-4 border-surface-card shadow-sm object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-surface-muted border-4 border-surface-card shadow-sm flex items-center justify-center text-[var(--color-text-primary)] text-2xl font-serif font-bold">
                                            {userInitials}
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 p-1 bg-surface-card rounded-full group-hover:scale-110 transition-transform">
                                        <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center border-2 border-surface-card text-white">
                                            {uploadAvatar.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                                        </div>
                                    </div>
                                    {uploadAvatar.isPending && (
                                        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-1">
                                    {user?.fullName || "Faisal Al-Otaibi"}
                                </h2>
                                <Badge variant="secondary" className="mb-6 font-medium text-brand-accent bg-brand-accent/10 border-brand-accent/20">
                                    {formatRole(user?.role || "lawyer")}
                                </Badge>

                                <div className="w-full space-y-4 pt-6 border-t border-border/50 text-left">
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{t("auth.fullName")}</Label>
                                                <Input {...register("fullName")} className="h-9 bg-surface-bg/50" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{isRTL ? "الهاتف" : "Phone"}</Label>
                                                <Input {...register("phone")} className="h-9 bg-surface-bg/50" dir="ltr" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{isRTL ? "الموقع" : "Location"}</Label>
                                                <Input {...register("location")} className="h-9 bg-surface-bg/50" />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" size="sm" disabled={updateProfile.isPending} className="flex-1 bg-brand-primary hover:bg-brand-secondary">
                                                    {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                                    {t("common.save")}
                                                </Button>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => { reset(); setIsEditing(false); }} className="rounded-md">
                                                    <XCircle className="h-4 w-4 text-[var(--color-text-muted)]" />
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Building2 className="h-4 w-4 text-[var(--color-text-primary)]" />
                                                </div>
<div className="text-sm">
                                                    <p className="text-[var(--color-text-primary)] font-medium">{user?.organization?.name || (isRTL ? "مكتب الفيصل" : "Al-Faisal Law Firm")}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t("settings.id")}: #{user?.organizationId || "1001"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Mail className="h-4 w-4 text-[var(--color-text-primary)]" />
                                                </div>
                                                <p className="text-sm text-[var(--color-text-primary)] truncate">{user?.email || "faisal@alfaisal.law"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Phone className="h-4 w-4 text-[var(--color-text-primary)]" />
                                                </div>
                                                <p className="text-sm text-[var(--color-text-primary)] font-mono" dir="ltr">{user?.phone || "+966 50 123 4567"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <MapPin className="h-4 w-4 text-[var(--color-text-primary)]" />
                                                </div>
                                                <p className="text-sm text-[var(--color-text-primary)]">{user?.location || (isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia")}</p>
                                            </div>
<div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Briefcase className="h-4 w-4 text-[var(--color-text-primary)]" />
                                                </div>
                                                <p className="text-sm text-[var(--color-text-primary)]">{user?.specialization || (isRTL ? t("settings.commercialLaw") : "Commercial Law")}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-9 space-y-8">

                    <div className="flex items-center gap-4">
<h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] uppercase tracking-wider whitespace-nowrap">
                            {t("settings.keyPerformanceIndicators")}
                        </h3>
                        <div className="h-px bg-gray-200 w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-surface-card group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.winRateChange}%
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.winRate}%</p>
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{t("settings.successRate")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-surface-card group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.satisfactionChange}%
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.clientSatisfaction}%</p>
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{t("settings.clientSatisfaction")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-surface-card group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.hoursChange}h
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.thisMonthHours}</p>
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{t("settings.monthlyHours")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border bg-surface-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-[var(--color-warning-bg)] text-brand-accent border-brand-accent/30 font-medium">
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                        {Math.abs(stats.avgDurationChange || 0)} days
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.avgCaseDuration}<span className="text-lg opacity-70 ml-0.5">d</span></p>
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{t("settings.avgCaseDuration")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
<h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-80 whitespace-nowrap">
                                    {t("settings.caseloadDistribution")}
                                </h3>
                                <div className="h-px bg-gray-200 w-full" />
                            </div>

                            <Card className="border border-border shadow-sm rounded-xl bg-surface-card">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <p className="text-4xl font-light text-[var(--color-text-primary)]">{totalCasesLocal}</p>
                                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium mt-1">{t("settings.totalRegisteredCases")}</p>
                                        </div>
                                        <div className="h-14 w-14 rounded-full bg-[var(--color-warning-bg)] border-4 border-surface-card shadow-sm flex items-center justify-center text-brand-accent">
                                            <Scale className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-[var(--color-text-primary)]">{isRTL ? "نشطة وجارية" : t("settings.activeInProgress")}</span>
                                                <span className="font-mono text-[var(--color-text-primary)] group-hover:text-brand-accent transition-colors">{activeCasesLocal}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-primary transition-all duration-1000 ease-out" style={{ width: `${(activeCasesLocal / totalCasesLocal) * 100}%` }} />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-[var(--color-text-primary)]">{isRTL ? "مغلقة ومحكومة" : "Closed & Adjudicated"}</span>
                                                <span className="font-mono text-[var(--color-text-primary)] group-hover:text-success-text transition-colors">{closedCasesLocal}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out delay-100" style={{ width: `${(closedCasesLocal / totalCasesLocal) * 100}%` }} />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-[var(--color-text-primary)]">{t("settings.pendingAction")}</span>
                                                <span className="font-mono text-[var(--color-text-primary)] group-hover:text-brand-accent transition-colors">{pendingCasesLocal}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-accent transition-all duration-1000 ease-out delay-200" style={{ width: `${(pendingCasesLocal / totalCasesLocal) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-80 whitespace-nowrap">
                                    {isRTL ? "الإنتاجية" : "Productivity Metrics"}
                                </h3>
                                <div className="h-px bg-gray-200 w-full" />
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center p-4 bg-surface-card border border-border rounded-xl shadow-sm hover:border-brand-accent/40 transition-colors group">
                                    <div className="h-12 w-12 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{isRTL ? "مساعدة الذكاء الاصطناعي" : "AI Assistance Rate"}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{isRTL ? "الاقتراحات المقبولة" : "Suggestions Accepted"}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.aiSuggestionsAccepted}%</span>
                                </div>

                                <div className="flex items-center p-4 bg-surface-card border border-border rounded-xl shadow-sm hover:border-brand-accent/40 transition-colors group">
                                    <div className="h-12 w-12 rounded-full bg-[var(--color-warning-bg)] border border-brand-accent/20 shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{isRTL ? "المستندات" : "Document Processing"}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{isRTL ? "تمت المراجعة هذا الشهر" : "Reviewed this month"}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.documentsProcessed}</span>
                                </div>

                                <div className="flex items-center p-4 bg-surface-card border border-border rounded-xl shadow-sm relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-[var(--color-warning-bg)]/30 rounded-full -mr-8 -mt-8" />
                                    <div className="h-12 w-12 rounded-full bg-brand-accent text-white shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 relative z-10">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[var(--color-text-primary)]">{isRTL ? "أفضل أداء" : "Top Performer Award"}</p>
                                            <Badge variant="outline" className="bg-[var(--color-warning-bg)] text-brand-accent border-brand-accent/30 text-[10px] h-5 px-1.5 shadow-none">DEC 2024</Badge>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{isRTL ? "تم المنح للأداء المتميز" : "Awarded for excellence"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-80 whitespace-nowrap">
                                {isRTL ? "سجل النشاط الأخير" : "Recent Activity Log"}
                            </h3>
                            <div className="h-px bg-border w-full" />
                            <Link href="/cases" className="text-xs font-semibold text-brand-accent whitespace-nowrap hover:underline">
                                {isRTL ? "عرض السجل الكامل" : "VIEW FULL LOG"}
                            </Link>
                        </div>

                        <div className="bg-surface-card border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden min-h-[100px]">
                            {isActivitiesLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
                                </div>
                            ) : activities.length > 0 ? (
                                activities.map((item, i) => (
                                    <div key={i} className="flex items-center p-4 hover:bg-surface-muted transition-colors group">
                                        <span className={cn(
                                            "h-2.5 w-2.5 rounded-full mr-5 rtl:ml-5 rtl:mr-0 shrink-0 ring-4 ring-opacity-20",
                                            item.type === 'case' ? "bg-brand-primary ring-brand-primary" :
                                                item.type === 'regulation' ? "bg-brand-accent ring-brand-accent" : "bg-[var(--color-text-muted)] ring-[var(--color-text-muted)]"
                                        )} />
                                        <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase w-24 shrink-0">
                                            {/* Simple relative time formatting - in real app, use date-fns/formatDistance */}
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-brand-accent transition-colors truncate">{item.title || item.description}</p>
                                            <p className="text-xs text-[var(--color-text-muted)] flex items-center">{item.action || item.description}</p>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4 text-[var(--color-text-muted)] opacity-50 group-hover:text-brand-accent ml-2 rtl:mr-2 rtl:ml-0 transition-colors", isRTL && "rotate-180")} />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">
                                    {isRTL ? "لا يوجد نشاط حديث" : "No recent activity"}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
