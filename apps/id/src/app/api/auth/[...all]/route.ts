/**
 * Better Auth catch-all route for the Identity app.
 *
 * Mounts every Better Auth endpoint (`/api/auth/sign-in`,
 * `/api/auth/get-session`, OIDC discovery, etc.) at `/api/auth/*`.
 *
 * Identity is the ONLY app that hosts the server-side handler — the
 * other 7 apps consume it as an OIDC client.
 */
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@ogs/auth/server";

// Better Auth reads cookies on every request — never statically render.
// `dynamic` also tells Next.js's data-collection phase to skip executing
// the module against a build-time env (so the DB client doesn't fire).
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth.handler);
