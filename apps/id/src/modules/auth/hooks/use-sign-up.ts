/**
 * `useSignUp` — TanStack-Query mutation wrapping `trpc.auth.signUp`.
 *
 * On success: redirects to `/login?status=check-email` because
 * Better Auth dispatches the verification email automatically (with
 * `emailVerification.sendOnSignUp: true` configured server-side).
 * On error: surfaces the uniform `SIGN_UP_FAILURE` string via toast.
 */
"use client";

import { useRouter } from "next/navigation";

import { toast } from "@ogs/ui/primitives";

import { trpc } from "~/lib/trpc";

/**
 * Wraps the sign-up mutation with the standard success/failure UX.
 *
 * @returns The raw TanStack mutation — caller reads `isPending` for
 *          the submit button's disabled state.
 */
export function useSignUp() {
  const router = useRouter();
  return trpc.auth.signUp.useMutation({
    onSuccess: () => {
      router.push("/login?status=check-email");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
