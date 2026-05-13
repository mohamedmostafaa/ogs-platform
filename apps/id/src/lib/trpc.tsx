/**
 * Browser-side tRPC singleton for the Identity app.
 *
 * The shared `@ogs/api/client` exports a `trpc` proxy typed to the
 * package-level `AppRouter` (empty shell in Phase 01). The id app
 * registers its own module routers via `~/lib/app-router.ts`, so it
 * needs a proxy typed to its local {@link IdAppRouter} for the typed
 * hooks to surface `trpc.auth.*`.
 *
 * Components do:
 *
 *   import { trpc } from "~/lib/trpc";
 *   const me = trpc.auth.sessions.list.useQuery();
 *
 * The `<TRPCReactProvider>` itself is mounted once in
 * `src/app/layout.tsx`.
 */
"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import * as React from "react";
import superjson from "superjson";

import { makeQueryClient } from "@ogs/api/query-client";

import type { IdAppRouter } from "~/lib/app-router";

/**
 * Typed React hooks for every procedure registered in {@link IdAppRouter}.
 *
 * Note: typed against the id-app router (not the shared `AppRouter`)
 * so module procedures defined under `apps/id/src/modules/` are visible
 * on the proxy.
 */
export const trpc = createTRPCReact<IdAppRouter>();

/** Per-tab browser QueryClient — re-used across HMR. */
let browserClient: QueryClient | undefined;
function getBrowserQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}

/** Resolve the tRPC endpoint, allowing per-env override. */
function getTrpcUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_TRPC_URL ?? "/api/trpc";
  }
  return (
    process.env.NEXT_PUBLIC_TRPC_URL ??
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/trpc`
  );
}

/**
 * Mount once at the app root, inside `<OgsThemeProvider>` so the theme
 * is available to any error / loading UI the provider renders.
 */
export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getBrowserQueryClient();
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getTrpcUrl(),
          transformer: superjson,
          // Forward auth cookies on cross-origin requests — same
          // narrow cast as `@ogs/api/client` (tRPC's FetchEsque vs.
          // global RequestInit signal-null mismatch under
          // exactOptionalPropertyTypes).
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
