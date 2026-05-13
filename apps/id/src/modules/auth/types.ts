/**
 * Typed re-exports for the `auth` module.
 *
 * Components, hooks, and procedures import types from here rather than
 * re-declaring `z.infer<...>` at every call site (per CODE_STANDARDS
 * §1.1 — one place per concern).
 */
import type { z } from "zod";

import type {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RevokeSessionSchema,
  SignInSchema,
  SignUpSchema,
} from "./schema";

/** Inferred input type for `auth.signIn`. */
export type SignInInput = z.infer<typeof SignInSchema>;

/** Inferred input type for `auth.signUp`. */
export type SignUpInput = z.infer<typeof SignUpSchema>;

/** Inferred input type for `auth.forgotPassword` (client-form schema). */
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/** Inferred input type for `auth.resetPassword`. */
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

/** Inferred input type for `auth.sessions.revoke`. */
export type RevokeSessionInput = z.infer<typeof RevokeSessionSchema>;

/**
 * Row shape rendered in `/account/sessions`.
 *
 * `ipAddress` is masked to `/24` for IPv4 / `"(IPv6)"` for IPv6 — we
 * never surface the raw value to the client (Gate 3).
 */
export interface SessionRow {
  id: string;
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  isCurrent: boolean;
}
