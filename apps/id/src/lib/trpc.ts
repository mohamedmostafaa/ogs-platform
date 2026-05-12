/**
 * Browser-side tRPC singleton for the Identity app.
 *
 * Re-exports the typed hooks from `@ogs/api/client`. Components do:
 *
 *   import { trpc } from "~/lib/trpc";
 *   const me = trpc.identity.me.useQuery();
 *
 * The `<TRPCReactProvider>` itself is mounted once in
 * `src/app/layout.tsx`.
 */
"use client";

export { trpc, TRPCReactProvider } from "@ogs/api/client";
