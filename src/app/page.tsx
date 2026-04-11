"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Sparkles,
  Bell,
  LayoutDashboard,
  ChevronRight,
  Check,
  Zap,
  Users,
  FileText,
  Shield,
  Search,
  BarChart3,
  Clock,
  Languages,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { LanguageToggle } from "@/components/layout/language-toggle";

// --- Helper Components ---

// [HIDDEN FOR GRADUATION PRESENTATION — re-enable when payment is ready]
// const PricingCard = ({ ... }) => ( ... );

export default function LandingPage() {
  const { t, isRTL } = useI18n();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F2942] overflow-hidden relative selection:bg-[#D97706] selection:text-white flex flex-col">
      {/* Navbar + Hero wrapper with navy gradient */}
      <div className="bg-gradient-to-b from-[#0F2942] via-[#0F2942] to-[#f8fafc] relative">
        {/* Background accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[60%] bg-[#D97706]/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-[#1E3A56]/40 rounded-full blur-[100px]"></div>
        </div>

        {/* Navbar */}
        <nav className="relative z-20 flex justify-between items-center px-6 md:px-8 py-5 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-white rounded-xl p-1.5 shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
              <Image
                src="/silah-logo.svg"
                alt="Silah"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <h1 className="font-bold text-2xl tracking-wide font-serif text-white">
              {t("landing.appName")}
            </h1>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {t("landing.features")}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {t("landing.technologyLabel")}
            </button>
            {/* [HIDDEN FOR GRADUATION PRESENTATION] Pricing nav link
            <button
              onClick={() => scrollToSection("pricing")}
              className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {t("landing.pricing")}
            </button>
            */}
            <LanguageToggle
              variant="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
            />
            <Link
              href="/login"
              className="text-white/80 hover:text-white text-sm font-bold transition-colors"
            >
              {t("auth.signIn")}
            </Link>
            <Link href="/register">
              <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20">
                {t("landing.getStarted")}
              </Button>
            </Link>
          </div>
        </nav>

        {/* ════════════════════════════════════════ */}
        {/* HERO — Split layout: text + app preview */}
        {/* ════════════════════════════════════════ */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-10 md:pb-80">
          <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Text side */}
            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-[1.1] text-white">
                {t("landing.heroTitle")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] to-[#fb923c]">
                  {t("landing.heroHighlight")}
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
                {t("landing.heroDescription")}
              </p>
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <Link href="/register">
                <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-8 py-3.5 h-auto rounded-2xl font-bold text-base shadow-xl shadow-orange-900/20 transition-all hover:scale-105 flex items-center justify-center gap-2 group w-full sm:w-auto">
                  {t("landing.startFreeTrial")}{" "}
                  <ChevronRight
                    size={18}
                    className={`group-hover:translate-x-1 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
                  />
                </Button>
              </Link>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all"
              >
                {t("landing.technologyLabel")}
              </button>
            </div>

            {/* Inline stats */}
            <div className={`flex flex-wrap gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/10 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 min-w-[120px]">
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{isRTL ? "OCR عربي" : "Arabic OCR"}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-medium leading-snug">{isRTL ? "ماسح مستندات عربي من شركة عمق" : "Powered by Deep Document Scanner"}</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{isRTL ? "+20 نظام" : "20+ Systems"}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-medium leading-snug">{isRTL ? "أكثر من 20 نظام متكامل لخدمتك" : "More than 20 systems in the platform"}</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{isRTL ? "50 ألف قضية" : "About 50K Cases"}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-medium leading-snug">{isRTL ? "دُربت لتناسب النظام السعودي" : "Trained on about 50k Saudi legal cases"}</div>
              </div>
            </div>
          </div>

          {/* App preview side */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="bg-white rounded-2xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
              {/* Window chrome */}
              <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              {/* App mock */}
              <div className="p-5 md:p-6 bg-slate-50">
                {/* Case header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">OPEN</span>
                    <span className="text-xs text-slate-400 font-mono">#CASE-2025-001</span>
                  </div>
                  <h3 className="font-bold text-[#0F2942] text-base mb-1">
                    {t("landing.heroCaseTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("landing.heroCaseDesc")}
                  </p>
                </div>

                {/* AI suggestions */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-[#D97706]" />
                    <h4 className="font-bold text-[#0F2942] text-sm">
                      {t("landing.heroAiAnalysis")}
                    </h4>
                    <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {t("landing.aiComplete")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#0F2942]">
                          <Scale size={12} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F2942]">{t("landing.heroSuggestion1")}</p>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{t("landing.heroMatch")}</span>
                        </div>
                      </div>
                      <Check size={14} className="text-green-500" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#0F2942]">
                          <Scale size={12} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F2942]">{t("landing.heroSuggestion2")}</p>
                          <span className="text-[10px] font-bold text-[#D97706] bg-orange-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                            <Bell size={8} /> {t("landing.heroUpdateBadge")}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 ${isRTL ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center">{t("landing.foundRegulations")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ══════════════════════ */}
      {/* FEATURES — Clean grid */}
      {/* ══════════════════════ */}
      <div id="features" className="bg-white py-20 md:py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0F2942] mb-4">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles size={22} />, title: t("landing.aiMatching"), desc: t("landing.aiMatchingDesc"), color: "bg-[#D97706]" },
              { icon: <Bell size={22} />, title: t("landing.regulationAlerts"), desc: t("landing.regulationAlertsDesc"), color: "bg-[#0F2942]" },
              { icon: <LayoutDashboard size={22} />, title: t("landing.caseManagement"), desc: t("landing.caseManagementDesc"), color: "bg-[#1E3A56]" },
              { icon: <FileText size={22} />, title: t("landing.documentProcessing"), desc: t("landing.documentProcessingDesc"), color: "bg-[#D97706]" },
              { icon: <Zap size={22} />, title: t("landing.realTimeUpdates"), desc: t("landing.realTimeUpdatesDesc"), color: "bg-[#0F2942]" },
              { icon: <Users size={22} />, title: t("landing.teamManagement"), desc: t("landing.teamManagementDesc"), color: "bg-[#1E3A56]" },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#D97706]/20 hover:shadow-lg transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════ */}
      {/* HOW IT WORKS — 3-step pipeline */}
      {/* ═══════════════════════════════ */}
      <div id="how-it-works" className="bg-gradient-to-b from-[#f0f4fa] to-white py-20 md:py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[#D97706] text-xs font-bold uppercase tracking-widest mb-3">
              {t("landing.technologyLabel")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0F2942] mb-4">
              {t("landing.technologyTitle")}
            </h2>
            <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
              {t("landing.technologySubtitle")}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { step: "1", icon: <Search size={24} />, title: t("landing.step1Title"), desc: t("landing.step1Desc") },
              { step: "2", icon: <BarChart3 size={24} />, title: t("landing.step2Title"), desc: t("landing.step2Desc") },
              { step: "3", icon: <Shield size={24} />, title: t("landing.step3Title"), desc: t("landing.step3Desc") },
            ].map((item, idx) => (
              <div key={idx} className="relative bg-[#0F2942] p-7 rounded-2xl group hover:bg-[#1E3A56] transition-all shadow-lg">
                <div className="absolute -top-3 left-7 bg-[#D97706] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#D97706] mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tech highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Languages size={20} />, title: t("landing.techBilingual"), desc: t("landing.techBilingualDesc") },
              { icon: <Clock size={20} />, title: t("landing.techSpeed"), desc: t("landing.techSpeedDesc") },
              { icon: <Shield size={20} />, title: t("landing.techSecurity"), desc: t("landing.techSecurityDesc") },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <div className="text-[#D97706] shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-[#0F2942] text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* [HIDDEN FOR GRADUATION PRESENTATION] Pricing section — re-enable when payment is ready
      <div id="pricing" className="bg-slate-50 py-20 md:py-24 px-6 md:px-8">
        ...
      </div>
      */}

      {/* ═════════════════ */}
      {/* CTA — Final push */}
      {/* ═════════════════ */}
      <div className="bg-[#0F2942] py-20 md:py-24 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} w-1/3 h-full bg-[#1E3A56]/30`}></div>
          <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[60%] bg-[#D97706]/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-5 text-white">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t("landing.ctaDescription")}
          </p>
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-10 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/40 transition-all hover:scale-105">
              {t("landing.createFreeAccount")}
            </Button>
          </Link>
          {/* [HIDDEN FOR GRADUATION PRESENTATION] No credit card line
          <p className="text-white/40 text-sm mt-5">
            {t("landing.noCreditCard")}
          </p>
          */}
        </div>
      </div>

      {/* ════════ */}
      {/* FOOTER   */}
      {/* ════════ */}
      <div className="bg-[#0a1c2e] py-14 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerAbout")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerCareers")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerPress")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">{t("landing.footerProduct")}</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection("features")} className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.features")}</button></li>
                {/* [HIDDEN FOR GRADUATION PRESENTATION] Pricing footer link
                <li><button onClick={() => scrollToSection("pricing")} className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.pricing")}</button></li>
                */}
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerIntegrations")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">{t("landing.footerResources")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerDocs")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerHelp")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerBlog")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">{t("landing.footerLegal")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.privacyPolicy")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.termsOfService")}</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">{t("landing.footerSecurity")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1">
                <Image src="/silah-logo.svg" alt="Silah" width={20} height={20} className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-sm">{t("landing.appName")}</span>
            </div>
            <p className="text-white/30 text-xs">{t("landing.copyright")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
