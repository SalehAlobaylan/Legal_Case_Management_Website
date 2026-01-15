"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLogin } from "@/lib/hooks/use-auth";
import { Scale, Award, Star } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0F2942] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D97706]/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#1E3A56] rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6 backdrop-blur-md">
            <Award size={14} className="text-[#D97706]" />
            <span className="text-xs font-bold tracking-wide uppercase">Award Winning Platform</span>
          </div>
          <h2 className="text-5xl font-bold font-serif mb-6 leading-tight">Welcome back to your workspace.</h2>
          <p className="text-blue-200 text-lg leading-relaxed">&quot;Silah allows us to focus on strategy rather than endless research. It&apos;s an indispensable tool for our firm.&quot;</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-[#0F2942] bg-slate-200"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0F2942] bg-slate-300"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0F2942] bg-slate-400"></div>
            </div>
            <div className="text-sm">
              <p className="font-bold">Trusted by 500+ Lawyers</p>
              <div className="flex text-[#D97706]">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex bg-[#0F2942] p-3 rounded-xl shadow-lg mb-4">
              <Scale size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F2942] font-serif">Sign in to Silah</h2>
            <p className="text-slate-500 mt-2">Enter your credentials to access your dashboard.</p>
          </div>

          <div className="space-y-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">Or with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@firm.com"
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <Link href="#" className="text-xs font-bold text-[#D97706] hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-slate-300 text-[#D97706] focus:ring-[#D97706]"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 font-medium">Remember me for 30 days</label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center shadow-sm">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(error as any).response?.data?.error || "An error occurred during sign in"}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0F2942] hover:bg-[#1E3A56] text-white p-3.5 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02]"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#D97706] font-bold hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
