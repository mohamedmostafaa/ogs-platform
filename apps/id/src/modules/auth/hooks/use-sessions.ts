/**
 * `useSuspenseSessions` + `useRevokeSession` — list and revoke active
 * sessions for the calling user.
 *
 * The list uses `useSuspenseQuery` so the rendering page wraps it in
 * `<Suspense>` and Better Auth's `auth.api.listSessions` round-trip is
 * never visible as a loading flicker on the client (CODE_STANDARDS §4.2).
 *
 * The revoke mutation invalidates the list query on success so the
 * revoked row disappears without a manual refetch.
 *
 * @see Blueprint §6.11.
 */
"use client";

import { toast } from "@ogs/ui/primitives";

import { trpc } from "~/lib/trpc";

/**
 * Suspense-bound list of active sessions for the current user.
 *
 * Throws to the nearest `<Suspense>` boundary while the query is
 * pending; thereafter the data is always defined.
 *
 * @returns The TanStack suspense-query result.
 */
export function useSuspenseSessions() {
  return trpc.auth.sessions.list.useSuspenseQuery();
}

/**
 * Mutation that revokes one session by token. On success, invalidates
 * the list query so the table reflects the new state immediately.
 *
 * @returns The raw TanStack mutation — the button reads `isPending`
 *          to disable itself while in flight.
 */
export function useRevokeSession() {
  const utils = trpc.useUtils();
  return trpc.auth.sessions.revoke.useMutation({
    onSuccess: async () => {
      // Refetch the list so the revoked row drops. The current-session
      // case (sign-out from this tab) also benefits: the next refetch
      // will return UNAUTHORIZED and bubble up to an error boundary.
      await utils.auth.sessions.list.invalidate();
      toast.success("Session revoked.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
