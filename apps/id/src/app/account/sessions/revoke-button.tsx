/**
 * Client-side trigger for `revokeSessionAction`. Disabled while
 * the transition is pending so double-clicks can't race.
 */
"use client";

import { useTransition } from "react";

import { Button } from "@ogs/ui/primitives";

import { revokeSessionAction } from "./_actions";

export function RevokeButton({ sessionId, isCurrent }: { sessionId: string; isCurrent: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={isCurrent ? "destructive" : "outline"}
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          // The action calls `revalidatePath("/account/sessions")` on
          // success, which causes the row to disappear — that's the
          // user-facing acknowledgement. Errors surface in the dev
          // console; richer error UI lands when we add toasts in the
          // sign-in-UI follow-up commit.
          void revokeSessionAction(sessionId);
        });
      }}
    >
      {pending ? "Revoking…" : isCurrent ? "Sign out here" : "Revoke"}
    </Button>
  );
}
