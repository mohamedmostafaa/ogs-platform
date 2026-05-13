/**
 * `useSignIn` — TanStack-Query mutation wrapping `trpc.auth.signIn`.
 *
 * On success: routes to the caller-supplied `callbackURL` (already
 * passed through `safeCallbackURL` upstream).
 * On error: surfaces the uniform `SIGN_IN_FAILURE` string via a sonner
 * toast AND propagates `error.message` so the form can render an
 * inline alert beside the submit button.
 *
 * @see CODE_STANDARDS §4.5 (forms — hooks own mutation + toast).
 */
"use client";

import { useRouter } from "next/navigation";

import { toast } from "@ogs/ui/primitives";

import { trpc } from "~/lib/trpc";
import { safeCallbackURL } from "~/modules/auth/schema";

export interface UseSignInOptions {
  /** Where to navigate on success — must be a same-origin relative path. */
  callbackURL: string;
}

/**
 * Wraps the sign-in mutation with the standard success/failure UX.
 *
 * @param options.callbackURL  Destination after a successful sign-in.
 * @returns                    The raw TanStack mutation result for the
 *                             form to read `isPending` + `error` from.
 */
export function useSignIn({ callbackURL }: UseSignInOptions) {
  const router = useRouter();
  return trpc.auth.signIn.useMutation({
    onSuccess: () => {
      // Belt-and-suspenders: the view already pre-sanitises, but
      // `callbackURL` reaches the hook as a plain `string`, so we
      // re-run the open-redirect guard here. Security-engineer
      // review (Gate 10, defence-in-depth) on this PR.
      router.push(safeCallbackURL(callbackURL));
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
