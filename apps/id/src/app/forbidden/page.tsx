/**
 * `/forbidden` — landing page for `AuthGuardError`s.
 *
 * Server component. No data, no env, no auth-state — guards redirect
 * here when a user is signed in but lacks the required role/feature
 * for the page they tried to reach.
 *
 * @see Blueprint §6.8.
 */
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import { Button } from "@ogs/ui/primitives";

export const metadata = {
  title: "Access denied · OGS Identity",
  description: "You don't have access to this page.",
  // Search engines should not index error pages.
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Alert variant="destructive" className="text-left">
        <AlertTitle>Access denied</AlertTitle>
        <AlertDescription>
          Your account doesn&apos;t have permission to view this page. If you think this is wrong,
          contact the workspace administrator.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/login">Sign in as someone else</Link>
        </Button>
      </div>
    </main>
  );
}
