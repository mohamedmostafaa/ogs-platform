/**
 * `<RevokeButton>` — client-side trigger for the session-revoke
 * mutation. Disabled while the mutation is pending so double-clicks
 * cannot race the API call.
 *
 * The current-session variant renders as `destructive` to flag the
 * "you're signing yourself out from this tab" case.
 */
"use client";

import { Button } from "@ogs/ui/primitives";

import { useRevokeSession } from "~/modules/auth/hooks/use-sessions";

/**
 * @param props.token      The Better Auth session token to revoke.
 * @param props.isCurrent  Whether this row represents the calling
 *                         session — changes button copy + variant.
 */
export function RevokeButton({ token, isCurrent }: { token: string; isCurrent: boolean }) {
  const revoke = useRevokeSession();
  return (
    <Button
      size="sm"
      variant={isCurrent ? "destructive" : "outline"}
      disabled={revoke.isPending}
      onClick={() => revoke.mutate({ token })}
    >
      {revoke.isPending ? "Revoking…" : isCurrent ? "Sign out here" : "Revoke"}
    </Button>
  );
}
