"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Sparkles,
  Bell,
  LayoutDashboard,
  ChevronRight,
  Play,
  Quote,
  Check,
  Shield,
  Zap,
  Users,
  FileText,
  Globe,
  Award,
  ArrowRight
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { LanguageToggle } from "@/components/layout/language-toggle";

// --- Helper Components ---

const FeatureCard = ({
  icon,
  title,
  desc,
  color
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) => (
  <div className="group p-8 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-24 ${color} opacity-[0.03] rounded-bl-full group-hover:scale-150 transition-transform duration-700`}></div>
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#0F2942] mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const TestimonialCard = ({
  quote,
  author,
  role
}: {
  quote: string;
  author: string;
  role: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative">
    <Quote className="absolute top-6 right-6 text-slate-200" size={32} />
    <p className="text-slate-600 italic mb-6 relative z-10 leading-relaxed">&quot;{quote}&quot;</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#0F2942] flex items-center justify-center text-white font-bold text-xs">
        {author.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-[#0F2942] text-sm">{author}</h4>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </div>
  </div>
);

const PricingCard = ({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  ctaText,
  t
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  t: (key: string) => string;
}) => (
  <div className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${highlighted
    ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-2xl scale-105'
    : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'
    }`}>
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D97706] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
        {t("landing.mostPopular")}
      </div>
    )}
    <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-[#0F2942]'}`}>{name}</h3>
    <p className={`text-sm mb-6 ${highlighted ? 'text-blue-200' : 'text-slate-500'}`}>{description}</p>
    <div className="mb-6">
      <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-[#0F2942]'}`}>{price}</span>
      <span className={`text-sm ${highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{period}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, idx) => (
        <li key={idx} className={`flex items-center gap-3 text-sm ${highlighted ? 'text-blue-100' : 'text-slate-600'}`}>
          <Check className={`h-4 w-4 ${highlighted ? 'text-[#D97706]' : 'text-green-500'}`} />
          {feature}
        </li>
      ))}
    </ul>
    <Link href="/register">
      <Button className={`w-full py-3 h-auto rounded-xl font-bold transition-all ${highlighted
        ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
        : 'bg-[#0F2942] hover:bg-[#1E3A56] text-white'
        }`}>
        {ctaText}
      </Button>
    </Link>
  </div>
);

const StatCard = ({
  value,
  label
}: {
  value: string;
  label: string;
}) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</div>
    <div className="text-white/70 text-sm font-medium">{label}</div>
  </div>
);

export default function LandingPage() {
  const { t, isRTL } = useI18n();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2942] text-white overflow-hidden relative selection:bg-[#D97706] selection:text-white flex flex-col">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#D97706]/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#1E3A56]/40 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-white rounded-xl p-1.5 shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
            <img src="/silah-logo.png" alt="Silah" className="h-8 w-auto" />
          </div>
          <h1 className="font-bold text-2xl tracking-wide font-serif text-white">SILAH</h1>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => scrollToSection('features')}
            className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {t("landing.features")}
          </button>
          <button
            onClick={() => scrollToSection('solutions')}
            className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {t("landing.solutions")}
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {t("landing.pricing")}
          </button>
          <LanguageToggle variant="icon" className="text-white/80 hover:text-white hover:bg-white/10" />
          <Link href="/login" className="text-white/80 hover:text-white text-sm font-bold transition-colors">
            {t("auth.signIn")}
          </Link>
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40">
              {t("landing.getStarted")}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-32 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E3A56]/80 border border-[#2A4D70] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md shadow-lg hover:border-[#D97706]/50 transition-colors cursor-default">
          <Sparkles size={14} className="text-[#D97706] fill-[#D97706]" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">{t("landing.tagline")}</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 drop-shadow-2xl text-white">
          {t("landing.heroTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] to-[#fb923c]">{t("landing.heroHighlight")}</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
          {t("landing.heroDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full sm:w-auto">
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-8 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/40 transition-all hover:scale-105 flex items-center justify-center gap-2 group w-full sm:w-auto">
              {t("landing.startFreeTrial")} <ChevronRight size={20} className={`group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Button>
          </Link>
          <Button variant="secondary" className="bg-white text-[#0F2942] hover:bg-slate-100 px-8 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Play size={18} fill="currentColor" /> {t("landing.watchDemo")}
          </Button>
        </div>

        {/* Hero Visual / Glass Card */}
        <div className="mt-24 w-full max-w-6xl aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-white/10 to-white/5 rounded-t-[32px] border-t border-l border-r border-white/20 backdrop-blur-md shadow-2xl p-2 md:p-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative overflow-hidden mx-4">
          <div className="absolute inset-0 bg-[#f8fafc] rounded-t-[24px] top-2 left-2 right-2 flex flex-col overflow-hidden shadow-inner">
            {/* Mock Header */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
              </div>
            </div>
            {/* Mock Body */}
            <div className="flex-1 p-6 md:p-8 bg-slate-50 flex gap-6 overflow-hidden relative">
              {/* Overlay indicating AI Processing */}
              <div className={`absolute top-10 ${isRTL ? 'left-10' : 'right-10'} z-20 bg-white/90 backdrop-blur border border-[#D97706]/20 p-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-1000 flex items-center gap-4`}>
                <div className="bg-[#D97706]/10 p-2 rounded-lg"><Sparkles size={20} className="text-[#D97706]" /></div>
                <div>
                  <p className="text-xs font-bold text-[#0F2942]">{t("landing.aiComplete")}</p>
                  <p className="text-[10px] text-slate-500">{t("landing.foundRegulations")}</p>
                </div>
              </div>

              {/* Sidebar Mock */}
              <div className="w-16 bg-white rounded-xl border border-slate-200 hidden md:flex flex-col items-center py-4 gap-4 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#0F2942] mb-4"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
              </div>

              {/* Main Content Mock */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-[#0F2942] rounded-lg"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-10 w-32 bg-[#D97706] rounded-xl shadow-lg shadow-orange-200"></div>
                </div>

                <div className="grid grid-cols-3 gap-6 h-32">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50"></div>
                    <div className="h-6 w-12 bg-slate-800 rounded"></div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50"></div>
                    <div className="h-6 w-12 bg-slate-800 rounded"></div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50"></div>
                    <div className="h-6 w-12 bg-slate-800 rounded"></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-32 bg-slate-100 rounded"></div>
                    <div className="h-6 w-24 bg-slate-100 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 w-full bg-slate-50 rounded-xl border border-dashed border-slate-200"></div>
                    <div className="h-16 w-full bg-slate-50 rounded-xl border border-dashed border-slate-200"></div>
                  </div>
                </div>
              </div>

              {/* Right Panel Mock */}
              <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hidden lg:block shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-[#D97706] rounded"></div>
                  <div className="w-24 h-4 bg-slate-800 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-slate-50 rounded-xl border border-green-100 relative overflow-hidden">
                    <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-1 h-full bg-green-500`}></div>
                  </div>
                  <div className="h-32 bg-slate-50 rounded-xl border border-slate-200 opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1E3A56] py-16 px-6 md:px-8 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="500+" label={t("landing.statsLawyers")} />
          <StatCard value="10,000+" label={t("landing.statsCases")} />
          <StatCard value="50,000+" label={t("landing.statsRegulations")} />
          <StatCard value="99.9%" label={t("landing.statsUptime")} />
        </div>
      </div>

      {/* Feature Section (White Background) */}
      <div id="features" className="bg-white text-[#0F2942] py-24 px-6 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97706] text-sm font-bold uppercase tracking-widest mb-4">{t("landing.featuresLabel")}</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6">{t("landing.everythingYouNeed")}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">{t("landing.replaceFragmented")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <FeatureCard
              icon={<Sparkles className="text-white" size={28} />}
              title={t("landing.aiMatching")}
              desc={t("landing.aiMatchingDesc")}
              color="bg-[#D97706]"
            />
            <FeatureCard
              icon={<Bell className="text-white" size={28} />}
              title={t("landing.liveMonitor")}
              desc={t("landing.liveMonitorDesc")}
              color="bg-[#0F2942]"
            />
            <FeatureCard
              icon={<LayoutDashboard className="text-white" size={28} />}
              title={t("landing.unifiedWorkspace")}
              desc={t("landing.unifiedWorkspaceDesc")}
              color="bg-[#1E3A56]"
            />
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-100 hover:border-[#D97706]/30 transition-colors group">
              <Shield className="h-8 w-8 text-[#D97706] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-[#0F2942] mb-2">{t("landing.secureStorage")}</h4>
              <p className="text-sm text-slate-500">{t("landing.secureStorageDesc")}</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-100 hover:border-[#D97706]/30 transition-colors group">
              <Zap className="h-8 w-8 text-[#D97706] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-[#0F2942] mb-2">{t("landing.realTimeSync")}</h4>
              <p className="text-sm text-slate-500">{t("landing.realTimeSyncDesc")}</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-100 hover:border-[#D97706]/30 transition-colors group">
              <Users className="h-8 w-8 text-[#D97706] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-[#0F2942] mb-2">{t("landing.teamCollab")}</h4>
              <p className="text-sm text-slate-500">{t("landing.teamCollabDesc")}</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-100 hover:border-[#D97706]/30 transition-colors group">
              <FileText className="h-8 w-8 text-[#D97706] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-[#0F2942] mb-2">{t("landing.docManagement")}</h4>
              <p className="text-sm text-slate-500">{t("landing.docManagementDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div id="solutions" className="bg-slate-50 py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97706] text-sm font-bold uppercase tracking-widest mb-4">{t("landing.solutionsLabel")}</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#0F2942] mb-6">{t("landing.builtForLegal")}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t("landing.builtForLegalDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex items-start gap-6">
                <div className="bg-[#0F2942] p-4 rounded-2xl text-white group-hover:bg-[#D97706] transition-colors">
                  <Scale size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F2942] mb-3">{t("landing.lawFirms")}</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">{t("landing.lawFirmsDesc")}</p>
                  <Link href="/register" className="inline-flex items-center gap-2 text-[#D97706] font-bold text-sm hover:underline">
                    {t("landing.learnMore")} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Solution Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex items-start gap-6">
                <div className="bg-[#0F2942] p-4 rounded-2xl text-white group-hover:bg-[#D97706] transition-colors">
                  <Globe size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F2942] mb-3">{t("landing.legalDepts")}</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">{t("landing.legalDeptsDesc")}</p>
                  <Link href="/register" className="inline-flex items-center gap-2 text-[#D97706] font-bold text-sm hover:underline">
                    {t("landing.learnMore")} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Solution Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex items-start gap-6">
                <div className="bg-[#0F2942] p-4 rounded-2xl text-white group-hover:bg-[#D97706] transition-colors">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F2942] mb-3">{t("landing.soloLawyers")}</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">{t("landing.soloLawyersDesc")}</p>
                  <Link href="/register" className="inline-flex items-center gap-2 text-[#D97706] font-bold text-sm hover:underline">
                    {t("landing.learnMore")} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Solution Card 4 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex items-start gap-6">
                <div className="bg-[#0F2942] p-4 rounded-2xl text-white group-hover:bg-[#D97706] transition-colors">
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F2942] mb-3">{t("landing.consultants")}</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">{t("landing.consultantsDesc")}</p>
                  <Link href="/register" className="inline-flex items-center gap-2 text-[#D97706] font-bold text-sm hover:underline">
                    {t("landing.learnMore")} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97706] text-sm font-bold uppercase tracking-widest mb-4">{t("landing.testimonialsLabel")}</span>
            <h2 className="text-3xl font-bold font-serif text-[#0F2942] mb-4">{t("landing.whatPartnersSay")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote={t("landing.testimonial1")}
              author={t("landing.testimonial1Author")}
              role={t("landing.testimonial1Role")}
            />
            <TestimonialCard
              quote={t("landing.testimonial2")}
              author={t("landing.testimonial2Author")}
              role={t("landing.testimonial2Role")}
            />
            <TestimonialCard
              quote={t("landing.testimonial3")}
              author={t("landing.testimonial3Author")}
              role={t("landing.testimonial3Role")}
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-slate-50 py-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97706] text-sm font-bold uppercase tracking-widest mb-4">{t("landing.pricingLabel")}</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#0F2942] mb-6">{t("landing.simplePricing")}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t("landing.simplePricingDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <PricingCard
              name={t("landing.starterPlan")}
              price={t("landing.starterPrice")}
              period={t("landing.perMonth")}
              description={t("landing.starterDesc")}
              features={[
                t("landing.starterFeature1"),
                t("landing.starterFeature2"),
                t("landing.starterFeature3"),
                t("landing.starterFeature4"),
              ]}
              ctaText={t("landing.getStarted")}
              t={t}
            />
            <PricingCard
              name={t("landing.professionalPlan")}
              price={t("landing.professionalPrice")}
              period={t("landing.perMonth")}
              description={t("landing.professionalDesc")}
              features={[
                t("landing.proFeature1"),
                t("landing.proFeature2"),
                t("landing.proFeature3"),
                t("landing.proFeature4"),
                t("landing.proFeature5"),
              ]}
              highlighted
              ctaText={t("landing.startFreeTrial")}
              t={t}
            />
            <PricingCard
              name={t("landing.enterprisePlan")}
              price={t("landing.enterprisePrice")}
              period={t("landing.perMonth")}
              description={t("landing.enterpriseDesc")}
              features={[
                t("landing.entFeature1"),
                t("landing.entFeature2"),
                t("landing.entFeature3"),
                t("landing.entFeature4"),
                t("landing.entFeature5"),
              ]}
              ctaText={t("landing.contactSales")}
              t={t}
            />
          </div>
        </div>
      </div>

      {/* Social Proof / Trusted By */}
      <div className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t("landing.trustedBy")}</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Mock Logos */}
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0F2942] py-24 px-6 md:px-8 relative overflow-hidden">
        <div className={`absolute top-0 ${isRTL ? 'left-0 -skew-x-12 -translate-x-20' : 'right-0 skew-x-12 translate-x-20'} w-1/2 h-full bg-[#1E3A56]/30 transform`}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-white">{t("landing.readyToModernize")}</h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">{t("landing.joinHundreds")}</p>
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-10 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/40 transition-all hover:scale-105">
              {t("landing.createFreeAccount")}
            </Button>
          </Link>
          <p className="text-white/50 text-sm mt-6">{t("landing.noCreditCard")}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0a1c2e] py-16 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerAbout")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerCareers")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerPress")}</Link></li>
              </ul>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-bold text-white mb-4">{t("landing.footerProduct")}</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.features")}</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.pricing")}</button></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerIntegrations")}</Link></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-4">{t("landing.footerResources")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerDocs")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerHelp")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerBlog")}</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">{t("landing.footerLegal")}</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.privacyPolicy")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.termsOfService")}</Link></li>
                <li><Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">{t("landing.footerSecurity")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#D97706] p-1.5 rounded-lg">
                <Scale size={18} className="text-white" />
              </div>
              <span className="font-bold text-white">SILAH</span>
            </div>
            <p className="text-white/40 text-sm">{t("landing.copyright")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
