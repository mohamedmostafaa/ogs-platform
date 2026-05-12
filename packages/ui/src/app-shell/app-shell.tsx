/**
 * Shared marketing-style shell rendered by every public OGS app's
 * root `page.tsx` in Phase 01.
 *
 * Server component. No env-var access, no auth state — only the
 * brand strings and an optional href for the "Sign in" CTA. The
 * actual sign-in lives at `id.ogs-tc.com` once Phase 02 wires it.
 *
 * Visual identity matches `apps/id/src/app/page.tsx` so the eight
 * apps feel like one platform.
 *
 * @see Blueprint §29.10.
 */
import type { ReactNode } from "react";

import { Button } from "../primitives";
import { ThemeToggle } from "../theme";

// NOTE: Plain `<a>` tags rather than `next/link` so this primitive stays
// framework-agnostic and `@ogs/ui` doesn't need `next` as a peer
// dependency. The Phase-01 stubs have no internal client navigation
// (every link is either home or external to id.ogs-tc.com); when a
// consuming app needs client-side routing it can drop AppShell and
// compose the parts directly.

export interface AppShellProps {
  /** Brand title shown in the header and as the H1's leading anchor. */
  title: string;
  /** One-sentence tagline rendered as the section paragraph. */
  tagline: string;
  /** Where the "Sign in" CTA points. Defaults to the OGS identity hub. */
  signInHref?: string;
  /** Optional extra content rendered below the tagline (e.g. status pill). */
  children?: ReactNode;
}

/**
 * `AppShell` — minimal Phase-01 page body used by every sibling app.
 */
export function AppShell({
  title,
  tagline,
  signInHref = "https://id.ogs-tc.com/login",
  children,
}: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <a href="/" className="text-base font-semibold tracking-tight">
          {title}
        </a>
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-prose">{tagline}</p>
        <div className="flex items-center gap-2">
          <Button asChild>
            {/*
             * `rel="noopener noreferrer"` even without `target="_blank"`
             * — the default `signInHref` is cross-origin (id.ogs-tc.com)
             * and the relation costs nothing; future-proofs against
             * accidental `_blank` adoption.
             */}
            <a href={signInHref} rel="noopener noreferrer">
              Sign in
            </a>
          </Button>
        </div>
        {children}
      </section>

      <footer className="text-muted-foreground px-6 py-4 text-xs">
        OGS workforce-trust platform — Phase 01 shell.
      </footer>
    </main>
  );
}
