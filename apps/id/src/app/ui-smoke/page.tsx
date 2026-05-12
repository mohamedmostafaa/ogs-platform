/**
 * `/ui-smoke` — visual smoke route for `@ogs/ui` design system.
 *
 * Gated:
 *   - Production deploys must opt in with `OGS_UI_SMOKE=1`. Without it,
 *     the route 404s to keep sample data ("Aramco", "Halliburton", ...)
 *     out of the public surface.
 *   - The route is `robots: noindex, nofollow` regardless.
 *
 * The actual rendering lives in `./smoke-client.tsx` because the
 * page uses client-side `useState`.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SmokeClient } from "./smoke-client";

export const metadata: Metadata = {
  title: "UI smoke",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function UiSmokePage() {
  if (process.env.NODE_ENV === "production" && process.env.OGS_UI_SMOKE !== "1") {
    notFound();
  }
  return <SmokeClient />;
}
