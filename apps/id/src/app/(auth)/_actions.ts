/**
 * Server actions for the `(auth)` route group.
 *
 * Every action:
 *   1. Reads the FormData.
 *   2. Zod-validates the payload (Gate 2).
 *   3. Calls `auth.api.*` — Better Auth owns CSRF, cookie issuance,
 *      and rate-limit decisions.
 *   4. Returns a uniform `FormState` on failure (Gate 3) or redirects
 *      on success.
 *
 * Cookies returned by Better Auth flow back to the browser via the
 * `nextCookies()` plugin already mounted in `@ogs/auth/server`.
 *
 * @see Blueprint §6.1.
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@ogs/auth/server";

import {
  FORGOT_PASSWORD_OK,
  type FormState,
  RESET_PASSWORD_FAILURE,
  ResetPasswordSchema,
  SIGN_IN_FAILURE,
  SIGN_UP_FAILURE,
  SignInSchema,
  SignUpSchema,
  safeCallbackURL,
} from "./_schemas";

/**
 * `/login` submission. On success: redirect to the (validated)
 * callback URL or `/`. On failure: render the uniform message.
 */
export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: SIGN_IN_FAILURE, status: "error" };

  const callbackURL = safeCallbackURL(formData.get("callbackURL"));

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch {
    // Better Auth surfaces invalid-creds / unverified-email / rate-limit
    // as exceptions. Collapse all of them to the uniform failure (Gate 3).
    return { error: SIGN_IN_FAILURE, status: "error" };
  }
  redirect(callbackURL);
}

/**
 * `/signup` submission. With `emailVerification.sendOnSignUp: true`,
 * Better Auth dispatches the verify email automatically — we redirect
 * to `/login?status=check-email` regardless.
 */
export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: SIGN_UP_FAILURE, status: "error" };

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch {
    return { error: SIGN_UP_FAILURE, status: "error" };
  }
  redirect("/login?status=check-email");
}

/**
 * `/forgot-password` submission. Always returns the uniform success
 * shape — never reveal whether the email maps to an account.
 */
export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = formData.get("email");
  // Always hit the Better Auth endpoint — even with a malformed email —
  // so the response time is independent of whether the address parses
  // (closes the trivial timing oracle a Zod-only short-circuit creates).
  // Better Auth itself returns OK for unknown emails, so this also
  // preserves the non-enumeration property.
  const email = typeof raw === "string" ? raw : "";
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch {
    // Swallow — same response regardless. Failures still get logged
    // by Better Auth internally for ops review.
  }
  return { error: null, status: "ok" };
}

/**
 * `/reset-password` submission. Token comes from the email link's
 * query string; client posts it back as a hidden input.
 */
export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: RESET_PASSWORD_FAILURE, status: "error" };

  try {
    await auth.api.resetPassword({
      body: { newPassword: parsed.data.password, token: parsed.data.token },
      headers: await headers(),
    });
  } catch {
    return { error: RESET_PASSWORD_FAILURE, status: "error" };
  }
  redirect("/login?status=password-reset");
}

// Re-export the constant so client subcomponents can reference the same
// uniform string without duplicating it.
export { FORGOT_PASSWORD_OK };
