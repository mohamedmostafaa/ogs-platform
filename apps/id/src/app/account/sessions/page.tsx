/**
 * `/account/sessions` — composition-only route.
 *
 * Gates the page with `requireAuth` (Gate 1) and delegates rendering to
 * `<SessionsView>` which fetches via `trpc.auth.sessions.list` under a
 * `<Suspense>` boundary.
 *
 * @see Blueprint §6.11.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthGuardError, requireAuth } from "@ogs/auth/guards";

import { SessionsView } from "~/modules/auth/ui/views/sessions-view";

export const metadata = { title: "Active sessions · OGS Identity" };

export default async function SessionsPage() {
  try {
    await requireAuth(await headers());
  } catch (err) {
    if (err instanceof AuthGuardError) redirect("/login?callbackURL=/account/sessions");
    throw err;
  }
  return <SessionsView />;
}
