"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCases } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils/cn";

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    specialization: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mock activity data
const RECENT_ACTIVITY = [
    { title: "Al-Amoudi vs. TechSolutions", time: "2h ago", type: "case", action: "Updated Case File" },
    { title: "Labor Law Amendment", time: "5h ago", type: "regulation", action: "Reviewed Amendment" },
    { title: "Court Filing #2024-156", time: "1d ago", type: "document", action: "Uploaded Document" },
];

export default function ProfilePage() {
    const { user } = useAuthStore();
    const { data: cases } = useCases();
    const { t, isRTL } = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            phone: "+966 50 123 4567",
            bio: "",
            location: isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
            specialization: isRTL ? "القانون التجاري" : "Commercial Law",
        },
    });

    // Calculate stats
    const totalCases = cases?.length || 24;
    const activeCases = cases?.filter(c => c.status === 'open' || c.status === 'in_progress').length || 12;
    const closedCases = cases?.filter(c => c.status === 'closed').length || 10;
    const pendingCases = cases?.filter(c => c.status === 'pending_hearing').length || 2;

    const stats = {
        winRate: 87,
        winRateChange: 5,
        avgCaseDuration: 45,
        avgDurationChange: -8,
        clientSatisfaction: 94,
        satisfactionChange: 3,
        regulationsReviewed: 156,
        aiSuggestionsAccepted: 78,
        documentsProcessed: 342,
        totalBillableHours: 1240,
        thisMonthHours: 168,
        hoursChange: 12,
    };

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

    const onSubmit = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({ title: t("common.save"), description: isRTL ? "تم تحديث الملف الشخصي" : "Profile successfully updated" });
            setIsEditing(false);
        } catch {
            toast({ title: t("common.error"), variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
            {/* Page Header - Minimal & Clean */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-primary">
                        {t("settings.myProfile")}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">
                        {isRTL ? "الملف المهني ولوحة الأداء" : "PROFESSIONAL PROFILE & PERFORMANCE DASHBOARD"}
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
                {/* Left Column: Business Card Profile (3 cols) */}
                <div className="lg:col-span-3">
                    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden sticky top-6 bg-white">
                        <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-secondary w-full" />
                        <CardContent className="p-6 -mt-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white shadow-sm flex items-center justify-center text-brand-primary text-2xl font-serif font-bold">
                                        {userInitials}
                                    </div>
                                    <div className="absolute bottom-1 right-1 p-1 bg-white rounded-full">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-serif font-bold text-brand-primary mb-1">
                                    {user?.fullName || "Faisal Al-Otaibi"}
                                </h2>
                                <Badge variant="secondary" className="mb-6 font-medium text-brand-accent bg-brand-accent/10 border-brand-accent/20">
                                    {formatRole(user?.role || "lawyer")}
                                </Badge>

                                <div className="w-full space-y-4 pt-6 border-t border-border/50 text-left">
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auth.fullName")}</Label>
                                                <Input {...register("fullName")} className="h-9 bg-surface-bg/50" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? "الهاتف" : "Phone"}</Label>
                                                <Input {...register("phone")} className="h-9 bg-surface-bg/50" dir="ltr" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? "الموقع" : "Location"}</Label>
                                                <Input {...register("location")} className="h-9 bg-surface-bg/50" />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button type="submit" size="sm" disabled={isSaving} className="flex-1 bg-brand-primary hover:bg-brand-secondary">
                                                    {isSaving ? "..." : t("common.save")}
                                                </Button>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => { reset(); setIsEditing(false); }} className="rounded-md">
                                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Building2 className="h-4 w-4 text-brand-primary" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-foreground font-medium">{isRTL ? "مكتب الفيصل" : "Al-Faisal Law Firm"}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">ID: #{user?.organizationId || "1001"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Mail className="h-4 w-4 text-brand-primary" />
                                                </div>
                                                <p className="text-sm text-foreground truncate">{user?.email || "faisal@alfaisal.law"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Phone className="h-4 w-4 text-brand-primary" />
                                                </div>
                                                <p className="text-sm text-foreground font-mono" dir="ltr">+966 50 123 4567</p>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <MapPin className="h-4 w-4 text-brand-primary" />
                                                </div>
                                                <p className="text-sm text-foreground">{isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</p>
                                            </div>
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors">
                                                    <Briefcase className="h-4 w-4 text-brand-primary" />
                                                </div>
                                                <p className="text-sm text-foreground">{isRTL ? "القانون التجاري" : "Commercial Law"}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Key Performance Indicators (9 cols) */}
                <div className="lg:col-span-9 space-y-8">

                    {/* Section Title */}
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-serif font-bold text-brand-primary uppercase tracking-wider whitespace-nowrap">
                            {isRTL ? "مؤشرات الأداء الرئيسية" : "Key Performance Indicators"}
                        </h3>
                        <div className="h-px bg-gray-200 w-full" />
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Win Rate */}
                        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.winRateChange}%
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">{stats.winRate}%</p>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{isRTL ? "نسبة النجاح" : "Success Rate"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Satisfaction */}
                        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.satisfactionChange}%
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">{stats.clientSatisfaction}%</p>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{isRTL ? "رضا العملاء" : "Client Satisfaction"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Billable Hours */}
                        <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        {stats.hoursChange}h
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">{stats.thisMonthHours}</p>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{isRTL ? "ساعات الشهر" : "Monthly Hours"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Duration - Highlighted with Gold */}
                        <Card className="rounded-xl border border-orange-100/60 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-orange-50/50 text-brand-accent border-orange-200/60 font-medium">
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                        {Math.abs(stats.avgDurationChange)} days
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-brand-accent mb-1">{stats.avgCaseDuration}<span className="text-lg opacity-70 ml-0.5">d</span></p>
                                    <p className="text-xs font-semibold text-brand-accent/80 uppercase tracking-wide">{isRTL ? "متوسط المدة" : "Avg Case Duration"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section: Case Load Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-serif font-bold text-brand-primary uppercase tracking-wider opacity-80 whitespace-nowrap">
                                    {isRTL ? "توزيع القضايا" : "Caseload Distribution"}
                                </h3>
                                <div className="h-px bg-gray-200 w-full" />
                            </div>

                            <Card className="border border-gray-100 shadow-sm rounded-xl bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <p className="text-4xl font-light text-slate-900">{totalCases}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-1">{isRTL ? "إجمالي القضايا المسجلة" : "Total Registered Cases"}</p>
                                        </div>
                                        <div className="h-14 w-14 rounded-full bg-orange-50/50 border-4 border-white shadow-sm flex items-center justify-center text-brand-accent">
                                            <Scale className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Active */}
                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">{isRTL ? "نشطة وجارية" : "Active & In Progress"}</span>
                                                <span className="font-mono text-slate-900 group-hover:text-brand-primary transition-colors">{activeCases}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-primary transition-all duration-1000 ease-out" style={{ width: `${(activeCases / totalCases) * 100}%` }} />
                                            </div>
                                        </div>

                                        {/* Closed */}
                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">{isRTL ? "مغلقة ومحكومة" : "Closed & Adjudicated"}</span>
                                                <span className="font-mono text-slate-900 group-hover:text-emerald-600 transition-colors">{closedCases}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out delay-100" style={{ width: `${(closedCases / totalCases) * 100}%` }} />
                                            </div>
                                        </div>

                                        {/* Pending */}
                                        <div className="group">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">{isRTL ? "معلقة" : "Pending Action"}</span>
                                                <span className="font-mono text-slate-900 group-hover:text-brand-accent transition-colors">{pendingCases}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-accent transition-all duration-1000 ease-out delay-200" style={{ width: `${(pendingCases / totalCases) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Productivity Metrics */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-serif font-bold text-brand-primary uppercase tracking-wider opacity-80 whitespace-nowrap">
                                    {isRTL ? "الإنتاجية" : "Productivity Metrics"}
                                </h3>
                                <div className="h-px bg-gray-200 w-full" />
                            </div>

                            <div className="grid gap-4">
                                {/* AI Usage */}
                                <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-brand-accent/40 transition-colors group">
                                    <div className="h-12 w-12 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{isRTL ? "مساعدة الذكاء الاصطناعي" : "AI Assistance Rate"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{isRTL ? "الاقتراحات المقبولة" : "Suggestions Accepted"}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-brand-primary">{stats.aiSuggestionsAccepted}%</span>
                                </div>

                                {/* Docs */}
                                <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-brand-accent/40 transition-colors group">
                                    <div className="h-12 w-12 rounded-full bg-orange-50/50 border border-orange-100/50 shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{isRTL ? "المستندات" : "Document Processing"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{isRTL ? "تمت المراجعة هذا الشهر" : "Reviewed this month"}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-brand-primary">{stats.documentsProcessed}</span>
                                </div>

                                {/* Achievement */}
                                <div className="flex items-center p-4 bg-white border border-orange-100 rounded-xl shadow-sm relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50/30 rounded-full -mr-8 -mt-8" />
                                    <div className="h-12 w-12 rounded-full bg-brand-accent text-white shadow-sm flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 relative z-10">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-900">{isRTL ? "أفضل أداء" : "Top Performer Award"}</p>
                                            <Badge variant="outline" className="bg-orange-50/50 text-brand-accent border-orange-200/50 text-[10px] h-5 px-1.5 shadow-none">DEC 2024</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{isRTL ? "تم المنح للأداء المتميز" : "Awarded for excellence"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Activity Log */}
                    <div className="pt-2">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-serif font-bold text-brand-primary uppercase tracking-wider opacity-80 whitespace-nowrap">
                                {isRTL ? "سجل النشاط الأخير" : "Recent Activity Log"}
                            </h3>
                            <div className="h-px bg-gray-200 w-full" />
                            <Link href="/cases" className="text-xs font-semibold text-brand-accent whitespace-nowrap hover:underline">
                                {isRTL ? "عرض السجل الكامل" : "VIEW FULL LOG"}
                            </Link>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                            {RECENT_ACTIVITY.map((item, i) => (
                                <div key={i} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                                    <span className={cn(
                                        "h-2.5 w-2.5 rounded-full mr-5 rtl:ml-5 rtl:mr-0 shrink-0 ring-4 ring-opacity-20",
                                        item.type === 'case' ? "bg-brand-primary ring-brand-primary" :
                                            item.type === 'regulation' ? "bg-brand-accent ring-brand-accent" : "bg-slate-400 ring-slate-400"
                                    )} />
                                    <p className="text-xs font-mono text-muted-foreground uppercase w-24 shrink-0">{item.time}</p>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-primary transition-colors truncate">{item.title}</p>
                                        <p className="text-xs text-muted-foreground flex items-center">{item.action}</p>
                                    </div>
                                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground/50 group-hover:text-brand-primary ml-2 rtl:mr-2 rtl:ml-0 transition-colors", isRTL && "rotate-180")} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
