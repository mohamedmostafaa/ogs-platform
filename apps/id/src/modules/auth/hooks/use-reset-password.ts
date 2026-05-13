/**
 * `useResetPassword` — TanStack-Query mutation wrapping
 * `trpc.auth.resetPassword`.
 *
 * On success: routes to `/login?status=password-reset` so the user
 * lands on the sign-in page with an acknowledgement banner.
 * On error: surfaces the uniform failure string via toast.
 */
"use client";

import { useRouter } from "next/navigation";

import { toast } from "@ogs/ui/primitives";

import { trpc } from "~/lib/trpc";

/**
 * Wraps the reset-password mutation with the standard UX.
 *
 * @returns The raw TanStack mutation — the form reads `isPending`
 *          for the submit button.
 */
export function useResetPassword() {
  const router = useRouter();
  return trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      router.push("/login?status=password-reset");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
