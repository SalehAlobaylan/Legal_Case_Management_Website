"use client";

/*
 * File: src/providers/query-provider.tsx
 *
 * Purpose :
 *  - Provide a shared TanStack Query client so hooks like useQuery/useMutation work.
 *  - Central place to configure how we cache/refetch API data (server state).
 *
 * Why TanStack Query:
 *  - Before: each component did fetch + useState/useEffect manually.
 *  - Now: TanStack Query handles caching, deduping, retries, and background refetch for us.
 */

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazily create the QueryClient once per browser session.
  // It stores the cache and configuration for all queries/mutations in the app.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long fetched data is considered "fresh" before it becomes stale.
            staleTime: 60 * 1000, // 1 minute
            // How long unused query data stays in the cache before garbage collection.
            gcTime: 5 * 60 * 1000, // 5 minutes
            // Retry failed queries once before surfacing an error.
            retry: 1,
            // Disable automatic refetch when the browser window regains focus.
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools: debug panel for queries/mutations (dev only). */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}


