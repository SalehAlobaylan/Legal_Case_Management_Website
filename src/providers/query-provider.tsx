"use client";

/*
 * File: src/providers/query-provider.tsx
 *
 * Provides a shared TanStack Query client with:
 *  - Global error handling via QueryCache + MutationCache `onError`.
 *  - Automatic destructive toast on mutation failure (opt-out via
 *    `meta: { silent: true }` or by defining the mutation's own `onError`).
 *  - Locale-aware error messages resolved via `getErrorMessage()`.
 *
 * The cache callbacks read the locale from `useUIStore.getState()` which
 * works outside of React (the hook form is not available here).
 */

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "@/lib/api/ApiError";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { toast } from "@/components/ui/use-toast";
import { useUIStore } from "@/lib/store/ui-store";

function currentLocale() {
  return useUIStore.getState().locale ?? "en";
}

function shouldSkipGlobalToast(error: unknown): boolean {
  // 401 is already handled by the axios interceptor (logout + redirect).
  if (error instanceof ApiError && error.status === 401) return true;
  return false;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const queryCache = new QueryCache({
      onError: (error, query) => {
        if ((query.meta as { silent?: boolean } | undefined)?.silent) return;
        if (shouldSkipGlobalToast(error)) return;
        toast({
          variant: "destructive",
          title: getErrorMessage(error, currentLocale()),
        });
      },
    });

    const mutationCache = new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if ((mutation.meta as { silent?: boolean } | undefined)?.silent) return;
        // If the mutation defines its own onError, let it own the UX
        // (prevents double-toast when callers already show specific feedback).
        if (mutation.options.onError) return;
        if (shouldSkipGlobalToast(error)) return;
        toast({
          variant: "destructive",
          title: getErrorMessage(error, currentLocale()),
        });
      },
    });

    return new QueryClient({
      queryCache,
      mutationCache,
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
