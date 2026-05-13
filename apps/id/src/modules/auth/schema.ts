/**
 * Zod schemas + uniform-failure strings for the `auth` module.
 *
 * Single source of truth — every procedure, hook, and form pulls from
 * this file. Keeping schemas in one place means client-side RHF
 * validation and server-side tRPC validation share the same rules
 * (per CODE_STANDARDS §5.3 — never inline a Zod schema in a procedure).
 *
 * @see Blueprint §6.1, SECURITY.md Gate 2 (input validation) + Gate 3
 * (uniform error messages — never echo back offending bytes).
 */
import { z } from "zod";

// Conservative password floor; matches Better Auth's default 8.
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

const passwordField = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);

/**
 * Sign-in payload. `callbackURL` is validated separately via
 * {@link safeCallbackURL} on the client before navigation — we never
 * trust it inside the procedure.
 */
export const SignInSchema = z.object({
  email: z.string().email(),
  password: passwordField,
});

/**
 * Sign-up payload — adds a `confirmPassword` field that the refine()
 * ties to `password`. The procedure only forwards `name + email +
 * password` to Better Auth.
 */
export const SignUpSchema = z
  .object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    password: passwordField,
    confirmPassword: passwordField,
  })
  .refine((v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

/**
 * Forgot-password payload. We accept *any* string and let Better Auth
 * decide (so timing is constant-ish regardless of whether the email
 * parses) — but the form-side schema still validates `.email()` so the
 * RHF input shows the field-level hint locally. The server procedure
 * uses a permissive schema; see `server/procedures.ts`.
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * Server-side variant used by `authRouter.forgotPassword`. Permissive
 * `z.string()` (no `.email()`) so a malformed input still incurs the
 * full Better-Auth round-trip — defeats the trivial timing oracle
 * where a Zod-fail short-circuit responds instantly. The client form
 * still validates with the strict {@link ForgotPasswordSchema} so the
 * user sees inline guidance before submit.
 *
 * Kept in this file (the single-source-of-truth) per CODE_STANDARDS
 * §5.3 — schemas never live inline in a procedure.
 */
export const ServerForgotPasswordSchema = z.object({
  email: z.string(),
});

/** Reset-password payload — token rides along from the email link. */
export const ResetPasswordSchema = z.object({
  // Better Auth issues hex/base64-style tokens; we never inspect the
  // contents — just hand them back to the API.
  token: z.string().min(8).max(512),
  password: passwordField,
});

/**
 * Revoke-session payload. Better Auth scopes `revokeSession` to the
 * authenticated user, so the token field is a *target selector*, not
 * an authz boundary.
 */
export const RevokeSessionSchema = z.object({
  token: z.string().min(1).max(256),
});

/** Uniform message for sign-in failures (Gate 3 — no enumeration leak). */
export const SIGN_IN_FAILURE = "Email and password do not match.";

/** Uniform message for sign-up failures. */
export const SIGN_UP_FAILURE =
  "We couldn't create that account. Please double-check the form and try again.";

/** Uniform message for forgot-password — same regardless of whether the email exists. */
export const FORGOT_PASSWORD_OK =
  "If an account exists for that email, a reset link is on its way. Check your inbox.";

/** Uniform message for reset-password failures (bad/expired token, weak password). */
export const RESET_PASSWORD_FAILURE =
  "We couldn't reset your password. The link may have expired — request a new one.";

/**
 * Same-origin callback-URL guard.
 *
 * Returns the URL when it's a relative path (starts with `/` but not
 * `//`), otherwise `"/"`. Blocks open-redirect via
 * `?callbackURL=https://evil.com`.
 *
 * @param raw  The unsafe input — typically pulled from `searchParams`.
 * @returns    A relative URL safe to `router.push()`.
 */
export function safeCallbackURL(raw: string | null | undefined): string {
  if (typeof raw !== "string") return "/";
  if (raw.length === 0 || raw.length > 256) return "/";
  // Reject control characters / whitespace — header-injection defence in
  // depth even though Next normalises the destination.
  if (/[\x00-\x1f\x7f]/.test(raw)) return "/";
  if (raw.includes("\\")) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw;
}
