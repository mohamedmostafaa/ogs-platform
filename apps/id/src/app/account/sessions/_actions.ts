/**
 * `revokeSessionAction` — server action used by `RevokeButton`.
 *
 * Re-runs `requireAuth` so the call is gated by the current session
 * (Gate 1) even though it's a client trigger. After the API call,
 * `revalidatePath` refreshes the table without a full page reload.
 *
 * @see Blueprint §6.11.
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AuthGuardError, requireAuth } from "@ogs/auth/guards";
import { auth } from "@ogs/auth/server";

// We don't validate session-token *ownership* in this layer — Better
// Auth scopes `revokeSession` to the authenticated user's own sessions
// at the API layer. The Zod check exists only to keep malformed input
// out of the API call, not as an authz boundary.
const SessionIdSchema = z.string().min(1).max(256);

export async function revokeSessionAction(sessionId: string): Promise<void> {
  const parsed = SessionIdSchema.safeParse(sessionId);
  if (!parsed.success) return; // silent no-op — the button only emits real IDs.

  const h = await headers();
  try {
    await requireAuth(h);
  } catch (err) {
    if (err instanceof AuthGuardError) redirect("/login?callbackURL=/account/sessions");
    throw err;
  }

  await auth.api.revokeSession({
    body: { token: parsed.data },
    headers: h,
  });
  revalidatePath("/account/sessions");
}
