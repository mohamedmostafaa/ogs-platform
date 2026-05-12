/**
 * `@ogs/api` — root barrel.
 *
 * Sub-paths reflect the server-only / client-safe split:
 *   - `@ogs/api/trpc`           — server: initTRPC + procedures
 *   - `@ogs/api/root`           — server: appRouter + AppRouter type
 *   - `@ogs/api/context`        — server: createTRPCContext
 *   - `@ogs/api/server-helpers` — server-only (uses @ogs/db)
 *   - `@ogs/api/client`         — `"use client"` browser hooks
 *   - `@ogs/api/query-client`   — isomorphic factory
 *
 * The root barrel re-exports only the AppRouter TYPE (safe everywhere)
 * to keep accidental imports of the server router from client code at
 * bay. If you need the actual router object, import from
 * `@ogs/api/root` explicitly.
 */
export type { AppRouter } from "./root";
