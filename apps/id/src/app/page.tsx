/**
 * OGS Identity — landing page.
 *
 * Phase 01 shell. Renders the brand header, theme toggle, and a
 * disabled "Sign in" CTA that becomes live in Phase 02 (Identity hub).
 */
import Link from "next/link";

import { Button } from "@ogs/ui/primitives";
import { ThemeToggle } from "@ogs/ui/theme";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          OGS Identity
        </Link>
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">One sign-in for every OGS app.</h1>
        <p className="text-muted-foreground max-w-prose">
          Identity, careers, certifications, training, and enterprise tooling — all behind a single
          OIDC-compatible sign-in.
        </p>
        <div className="flex items-center gap-2">
          <Button disabled title="Sign-in arrives in Phase 02">
            Sign in
          </Button>
          <Button asChild variant="ghost">
            <Link href="/ui-smoke">UI smoke →</Link>
          </Button>
        </div>
      </section>

      <footer className="text-muted-foreground px-6 py-4 text-xs">
        OGS workforce-trust platform — Phase 01 shell.
      </footer>
    </main>
  );
}
