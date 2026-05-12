/**
 * Browser-side tRPC client + provider.
 *
 * Each app's root layout wraps its children in `<TRPCReactProvider>`
 * which builds a per-tab `QueryClient` and the typed `trpcClient`.
 * Components then use the typed hooks via:
 *
 *   import { trpc } from "@ogs/api/client";
 *   const me = trpc.identity.me.useQuery();
 *
 * This file is `"use client"` and MUST NOT pull in `appRouter` (server
 * only). The router shape comes through purely via `AppRouter` type.
 *
 * @see Blueprint §7.4.
 */
"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import * as React from "react";
import superjson from "superjson";

import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./root";

/**
 * Typed React hooks for every procedure in `appRouter`.
 * Consume in components: `trpc.identity.me.useQuery()`.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Browser-side per-tab QueryClient — re-uses the singleton across HMR
 * but builds a fresh one for each browser session.
 */
let browserClient: QueryClient | undefined;
function getBrowserQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always make a new one per render (handled by getQueryClient
    // in server-helpers — this branch only fires for accidental imports).
    return makeQueryClient();
  }
  browserClient ??= makeQueryClient();
  return browserClient;
}

/** Resolve the tRPC endpoint, allowing per-app override. */
function getTrpcUrl(): string {
  if (typeof window !== "undefined") {
    // Same-origin (default) — works for SSR + browser via relative path.
    return process.env.NEXT_PUBLIC_TRPC_URL ?? "/api/trpc";
  }
  // SSR rendering on the server — absolute URL is required.
  return (
    process.env.NEXT_PUBLIC_TRPC_URL ??
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/trpc`
  );
}

/**
 * Mount once at the app root, inside `<OgsThemeProvider>` so the
 * theme is available to any error / loading UI the provider renders.
 */
export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getBrowserQueryClient();
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          // Log dev-mode errors only; in production we'll wire Sentry here.
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getTrpcUrl(),
          transformer: superjson,
          // Forward auth cookies on cross-origin requests (sibling apps
          // calling Identity's tRPC will need this for the OIDC flow).
          //
          // The trailing `as RequestInit` quiets `exactOptionalPropertyTypes`:
          // tRPC's FetchEsque passes `init.signal: AbortSignal | undefined`,
          // but global `RequestInit.signal` is `AbortSignal | null`. The
          // runtime accepts undefined; only the strict optional-property
          // check trips. One narrow output cast is preferable to casting
          // `init` itself (which would mask future type drift).
          fetch: (input, init) => fetch(input, { ...init, credentials: "include" } as RequestInit),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
