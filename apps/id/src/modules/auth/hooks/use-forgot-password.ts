/**
 * `useForgotPassword` — TanStack-Query mutation wrapping
 * `trpc.auth.forgotPassword`.
 *
 * The procedure always returns `{ ok: true }`; the form transitions to
 * its "check your inbox" state on success regardless of whether the
 * email matches an account (Gate 3 — no enumeration).
 */
"use client";

import { trpc } from "~/lib/trpc";

/**
 * Wraps the forgot-password mutation. Side-effect-free at the hook
 * level — the form decides what to show on `onSuccess` because the
 * inline acknowledgement is part of its own state machine.
 *
 * @returns The raw TanStack mutation.
 */
export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation();
}
