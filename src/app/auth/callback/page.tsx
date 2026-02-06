"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2 } from "lucide-react";

/**
 * OAuth Callback Page Component
 *
 * This component handles the callback from the backend OAuth flow.
 * The backend redirects here with a JWT token in the query params.
 *
 * Flow:
 * 1. Backend redirects to /auth/callback?token=xxx
 * 2. This page extracts the token and fetches the user profile
 * 3. User profile and token are stored in the auth store
 * 4. User is redirected to the dashboard
 *
 * Error handling:
 * - If token is missing, redirect to login with error
 * - If fetching user fails, redirect to login with error
 * - If backend sends error param, redirect to login with error
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.push("/login?error=oauth_failed");
      return;
    }

    if (!token) {
      router.push("/login?error=no_token");
      return;
    }

    // Fetch user profile using the token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        return res.json();
      })
      .then((data) => {
        // Store user and token in auth store
        setUser(data.user, token);
        // Redirect to dashboard
        router.push("/dashboard");
      })
      .catch((err) => {
        console.error("OAuth callback error:", err);
        router.push("/login?error=fetch_user_failed");
      });
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#D97706]" />
        <p className="text-slate-600 font-medium text-lg">
          Completing sign in...
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Please wait while we verify your account
        </p>
      </div>
    </div>
  );
}

/**
 * OAuth Callback Page
 *
 * Wrapper component with Suspense boundary for useSearchParams
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#D97706]" />
          <p className="text-slate-600 font-medium text-lg">
            Loading...
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
