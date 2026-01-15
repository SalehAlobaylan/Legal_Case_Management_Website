import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Sparkles,
  Bell,
  LayoutDashboard,
  ChevronRight,
  Play,
  Quote
} from "lucide-react";

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F2942] text-white overflow-hidden relative selection:bg-[#D97706] selection:text-white flex flex-col">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#D97706]/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#1E3A56]/40 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="bg-[#D97706] p-2 rounded-lg shadow-lg shadow-orange-900/20">
            <Scale size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-2xl tracking-wide font-serif">SILAH</h1>
        </Link>
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm font-medium text-blue-200 hover:text-white transition-colors">Features</button>
          <button className="hidden md:block text-sm font-medium text-blue-200 hover:text-white transition-colors">Solutions</button>
          <button className="hidden md:block text-sm font-medium text-blue-200 hover:text-white transition-colors">Pricing</button>
          <Link href="/login" className="text-white/80 hover:text-white text-sm font-bold transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-32 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E3A56]/80 border border-[#2A4D70] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md shadow-lg hover:border-[#D97706]/50 transition-colors cursor-default">
          <Sparkles size={14} className="text-[#D97706] fill-[#D97706]" />
          <span className="text-xs font-bold text-blue-100 tracking-wide uppercase">The #1 Legal AI in Saudi Arabia</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 drop-shadow-2xl">
          Justice, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] to-[#fb923c]">Amplified.</span>
        </h1>
        <p className="text-lg md:text-xl text-blue-200/90 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
          Silah connects your legal expertise with intelligent regulation matching. Manage cases, automate research, and stay ahead of legislative changes in one unified workspace tailored for the Kingdom.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full sm:w-auto">
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-8 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/40 transition-all hover:scale-105 flex items-center justify-center gap-2 group w-full sm:w-auto">
              Start Your Free Trial <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="secondary" className="bg-white text-[#0F2942] hover:bg-blue-50 px-8 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Play size={18} fill="currentColor" /> Watch Demo
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
              <div className="absolute top-10 right-10 z-20 bg-white/90 backdrop-blur border border-[#D97706]/20 p-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-1000 flex items-center gap-4">
                <div className="bg-[#D97706]/10 p-2 rounded-lg"><Sparkles size={20} className="text-[#D97706]" /></div>
                <div>
                  <p className="text-xs font-bold text-[#0F2942]">AI Analysis Complete</p>
                  <p className="text-[10px] text-slate-500">Found 3 relevant regulations</p>
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
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  </div>
                  <div className="h-32 bg-slate-50 rounded-xl border border-slate-200 opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section (White Background) */}
      <div className="bg-white text-[#0F2942] py-24 px-6 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6">Everything you need to win the case</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">Replace fragmented tools with a single intelligent platform designed specifically for modern Saudi legal teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <FeatureCard
              icon={<Sparkles className="text-white" size={28} />}
              title="AI Regulation Matching"
              desc="Automatically link case facts to Saudi Labor, Civil, and Commercial laws with 92% accuracy using our proprietary semantic engine."
              color="bg-[#D97706]"
            />
            <FeatureCard
              icon={<Bell className="text-white" size={28} />}
              title="Live Monitor"
              desc="Get instant alerts when regulations change or new amendments are published by the MOJ. Never rely on outdated articles again."
              color="bg-[#0F2942]"
            />
            <FeatureCard
              icon={<LayoutDashboard className="text-white" size={28} />}
              title="Unified Workspace"
              desc="Manage clients, documents, team tasks, and invoices in one secure, bilingual dashboard optimized for efficiency."
              color="bg-[#1E3A56]"
            />
          </div>

          {/* Social Proof / Trusted By */}
          <div className="border-t border-slate-100 pt-16">
            <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by innovative legal teams across the Kingdom</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Mock Logos */}
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-slate-50 py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-[#0F2942] mb-12 text-center">What our partners say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Silah has completely transformed how we handle labor disputes. The AI suggestions are surprisingly accurate and save us hours of research."
              author="Faisal Al-Otaibi"
              role="Senior Partner, Riyadh"
            />
            <TestimonialCard
              quote="The regulation monitoring feature is a lifesaver. We knew about the new Civil Transactions Law amendments before anyone else."
              author="Sarah Al-Jasser"
              role="Legal Consultant"
            />
            <TestimonialCard
              quote="Finally, a legal tech platform that actually understands Arabic legal context. The UI is beautiful and easy to use."
              author="Mohammed Khalil"
              role="Managing Director"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0F2942] py-24 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A56]/30 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6">Ready to modernize your practice?</h2>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of lawyers who are saving time and winning more cases with Silah.</p>
          <Link href="/register">
            <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-10 py-4 h-auto rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/40 transition-all hover:scale-105">
              Create Free Account
            </Button>
          </Link>
          <p className="text-blue-300/60 text-sm mt-6">No credit card required. 14-day free trial.</p>
        </div>
      </div>

      {/* Footer Simple */}
      <div className="bg-[#0a1c2e] py-12 px-8 border-t border-white/5 text-center">
        <div className="flex justify-center gap-8 mb-8 text-sm text-blue-300">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Support</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-blue-200/40 text-sm">© 2026 Silah Legal Tech. Riyadh, Saudi Arabia.</p>
      </div>
    </div>
  );
}
