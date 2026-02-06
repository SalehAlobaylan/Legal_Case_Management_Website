"use client";

import { useRouter } from "next/navigation";

/**
 * Hook for handling Google OAuth Sign-In flow
 *
 * This hook provides a function to initiate the Google OAuth flow
 * by redirecting the user to the backend's OAuth endpoint.
 *
 * The flow is:
 * 1. User clicks "Sign in with Google"
 * 2. Frontend redirects to backend /api/auth/google
 * 3. Backend redirects to Google consent screen
 * 4. After approval, Google redirects to backend callback
 * 5. Backend generates JWT and redirects to frontend /auth/callback
 * 6. Frontend stores token and redirects to dashboard
 */
export function useGoogleSignIn() {
  const router = useRouter();

  /**
   * Initiates the Google OAuth sign-in flow
   * Redirects the browser to the backend OAuth endpoint
   */
  const signInWithGoogle = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return { signInWithGoogle };
}
