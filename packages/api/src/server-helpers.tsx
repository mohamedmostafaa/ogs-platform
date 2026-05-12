/**
 * Server-only tRPC helpers.
 *
 *   - `getQueryClient()` — per-request cached QueryClient (server).
 *   - `createCaller()`   — direct in-process router invocation from
 *                          a server component / Route Handler /
 *                          Inngest worker.
 *   - `HydrateClient`    — wraps server-rendered children so the
 *                          client picks up prefetched data without
 *                          re-fetching.
 *
 * Do NOT import this file from a client component — it pulls in the
 * server-only `appRouter`, which depends on `@ogs/db`.
 *
 * @see Blueprint §7.3.
 */
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { cache } from "react";
import type { ReactNode } from "react";

import { createTRPCContext } from "./context";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./root";
import { createCallerFactory } from "./trpc";

/**
 * Per-request memoised QueryClient. React's `cache()` ties the result
 * to the current request scope so prefetches and `HydrateClient`
 * dehydrate share the exact same instance.
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side caller — invokes procedures in-process. Useful for:
 *   - Pre-rendering server components that need data.
 *   - Inngest worker functions that re-use the router for cross-cutting
 *     logic (audit, tenant-scope) without HTTP overhead.
 */
export async function createCaller() {
  const ctx = await createTRPCContext({ headers: await headers() });
  return createCallerFactory(appRouter)(ctx);
}

/**
 * Server component that dehydrates the per-request QueryClient and
 * embeds it into the client tree. Pair with `TRPCReactProvider`
 * (`client.tsx`) on the browser side.
 */
export function HydrateClient({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
