/**
 * Zod schemas shared by every `(auth)` server action.
 *
 * Kept in a `.ts` (not `.tsx`) so server-only modules can import them
 * without dragging in JSX / React Email surface area.
 *
 * @see SECURITY.md Gate 2 (input validation), Gate 3 (uniform error
 * messages — never echo back the offending bytes).
 */
import { z } from "zod";

/** Conservative password floor — Better Auth's default is 8. */
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

const passwordField = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);

export const SignInSchema = z.object({
  email: z.string().email(),
  password: passwordField,
});

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

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  // Better Auth issues hex/base64-style tokens; we never inspect the
  // contents — just hand them back to the API.
  token: z.string().min(8).max(512),
  password: passwordField,
});

/**
 * Form-state shape consumed by every `useFormState`-driven client form.
 * `error: null` = success / no submission yet; otherwise a uniform
 * string. We never expose structured field errors to the page so the
 * markup can't be used for account-enumeration probes.
 */
export interface FormState {
  error: string | null;
  status?: "ok" | "error";
}

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
 * Same-origin callback-URL guard. Returns the URL if it's a relative
 * path (starts with `/` and not `//`), otherwise returns `"/"`. Blocks
 * open-redirect via `?callbackURL=https://evil.com`.
 */
export function safeCallbackURL(raw: FormDataEntryValue | string | null | undefined): string {
  if (typeof raw !== "string") return "/";
  if (raw.length === 0 || raw.length > 256) return "/";
  // Reject control characters / whitespace — header-injection defence
  // in depth even though Next normalises the destination.

  if (/[\x00-\x1f\x7f]/.test(raw)) return "/";
  if (raw.includes("\\")) return "/"; // anything with a backslash → reject.
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/"; // protocol-relative — treat as off-origin.
  return raw;
}
