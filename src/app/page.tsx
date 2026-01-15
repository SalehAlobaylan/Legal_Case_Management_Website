import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#0F2942] shadow-md dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D97706] text-white shadow-lg shadow-orange-900/20">
              <span className="text-xl font-bold">م</span>
            </div>
            <span className="font-serif text-2xl font-bold text-white tracking-wide">
              صلة
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/10">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#D97706] text-white hover:bg-[#B45309] shadow-md">
                ابدأ الآن
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#0F2942] py-24 sm:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
          <div className="container relative mx-auto px-4 text-center sm:px-8">
            <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl text-balance leading-tight">
              إدارة القضايا القانونية <br />
              <span className="text-[#D97706]">بذكاء ودقة</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              منصة صلة تمكنك من إدارة ملفات القضايا والبحث في الأنظمة السعودية باستخدام الذكاء الاصطناعي، لتوفير الوقت وزيادة الإنتاجية.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="bg-[#D97706] text-white hover:bg-[#B45309] text-lg px-8 py-6 h-auto shadow-xl shadow-orange-900/20">
                  ابدأ التجربة المجانية <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="link" size="lg" className="text-slate-300 hover:text-white text-lg">
                  تعرف على المزيد <span aria-hidden="true">←</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F2942] dark:text-white sm:text-4xl">
                لماذا تختار صلة؟
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                أدوات مصممة خصيصاً للمحامين والمستشارين القانونيين في المملكة العربية السعودية.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                <div className="relative pl-16">
                  <dt className="text-base font-bold leading-7 text-[#0F2942] dark:text-white text-right pr-14">
                    <div className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F2942] text-white">
                      <Zap className="h-6 w-6 text-[#D97706]" />
                    </div>
                    ذكاء اصطناعي متقدم
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400 text-right pr-14">
                    اقتراحات وتوصيات آلية للأنظمة واللوائح ذات الصلة بقضيتك، مما يسرع عملية البحث القانوني.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base font-bold leading-7 text-[#0F2942] dark:text-white text-right pr-14">
                    <div className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F2942] text-white">
                      <CheckCircle2 className="h-6 w-6 text-[#D97706]" />
                    </div>
                    محدث لحظاً بلحظة
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400 text-right pr-14">
                    تنبيهات فورية عند تحديث أي نظام أو لائحة مرتبطة بقضاياك النشطة لضمان دقة العمل.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base font-bold leading-7 text-[#0F2942] dark:text-white text-right pr-14">
                    <div className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F2942] text-white">
                      <Shield className="h-6 w-6 text-[#D97706]" />
                    </div>
                    أمان وخصوصية
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400 text-right pr-14">
                    بنية تحتية آمنة تحمي بيانات عملائك وملفات القضايا بأعلى معايير التشفير والحماية.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F2942] py-12 text-center text-slate-400 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} صلة. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
