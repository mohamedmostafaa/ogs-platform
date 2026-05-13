/**
 * Shared shell for `(auth)` pages — centred card on a neutral page
 * with the brand header + theme toggle in the top bar.
 *
 * No data, no env. Pure presentation.
 */
import type { ReactNode } from "react";
import Link from "next/link";

import { ThemeToggle } from "@ogs/ui/theme";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          OGS Identity
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="text-muted-foreground px-6 py-4 text-center text-xs">
        OGS workforce-trust platform
      </footer>
    </div>
  );
}
