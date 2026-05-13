/**
 * `<SessionsView>` — `/account/sessions` composition.
 *
 * Renders the suspense-bound list under a `<Suspense>` boundary so the
 * card chrome shows immediately and the rows stream in as soon as
 * `auth.sessions.list` resolves (CODE_STANDARDS §4.2).
 *
 * @see Blueprint §6.11.
 */
"use client";

import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";
import { Skeleton } from "@ogs/ui/primitives";

import { SessionRow } from "~/modules/auth/ui/components/session-row";
import { useSuspenseSessions } from "~/modules/auth/hooks/use-sessions";

/** Suspense-bound list — separated so the boundary fallback shows. */
function SessionsList() {
  const [sessions] = useSuspenseSessions();

  if (sessions.length === 0) {
    return <p className="text-muted-foreground text-sm">No active sessions.</p>;
  }

  return (
    <>
      {sessions.map((s, i) => (
        <SessionRow key={s.id} session={s} showSeparator={i > 0} />
      ))}
    </>
  );
}

/** Skeleton used during the initial fetch. */
function SessionsListFallback() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function SessionsView() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Every device that&apos;s currently signed in to your account. Revoke any you don&apos;t
            recognise.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense fallback={<SessionsListFallback />}>
            <SessionsList />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
