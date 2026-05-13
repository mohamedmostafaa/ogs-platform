/**
 * tRPC procedures for the `auth` module.
 *
 * Every Better-Auth-backed mutation funnels through this router so the
 * browser only ever sees tRPC's typed surface — never a raw `auth.api`
 * call (CODE_STANDARDS §5). The router is mounted onto the id app's
 * local AppRouter in `~/lib/app-router.ts`.
 *
 * Procedures:
 *   - `signIn`            → email/password sign-in. Uniform failure.
 *   - `signUp`            → account creation. Uniform failure.
 *   - `forgotPassword`    → request reset email. Always returns OK
 *                            (no account enumeration).
 *   - `resetPassword`     → consume token + set new password.
 *   - `sessions.list`     → enumerate the caller's active sessions,
 *                            with IP masking + a `isCurrent` flag.
 *   - `sessions.revoke`   → tear down one session by token.
 *
 * @see Blueprint §6.1, §6.11.
 */
import { TRPCError } from "@trpc/server";

import { auth } from "@ogs/auth/server";
import { protectedProcedure, publicProcedure, router } from "@ogs/api/trpc";

import {
  FORGOT_PASSWORD_OK,
  RESET_PASSWORD_FAILURE,
  ResetPasswordSchema,
  RevokeSessionSchema,
  ServerForgotPasswordSchema,
  SIGN_IN_FAILURE,
  SIGN_UP_FAILURE,
  SignInSchema,
  SignUpSchema,
} from "../schema";
import type { SessionRow } from "../types";

/**
 * Mask an IPv4 address to its `/24`. IPv6 → `"(IPv6)"`. Empty / null /
 * malformed → `"—"`. Keeps the rendered HTML free of exact-IP PII while
 * still letting the user spot an unfamiliar device (Gate 3).
 *
 * @param raw  The session's `ipAddress` field as stored by Better Auth.
 * @returns    A human-friendly masked string.
 */
function maskIp(raw: string | null | undefined): string {
  if (!raw) return "—";
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(raw);
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  if (raw.includes(":")) return "(IPv6)";
  return "—";
}

/**
 * Email/password sign-in. Collapses every Better Auth failure mode
 * (invalid creds, unverified email, rate-limit) into a single uniform
 * message — the client never learns which case applied (Gate 3).
 *
 * Returns `{ ok: true }` on success; the caller hook handles routing
 * with `safeCallbackURL`. Procedures never call `redirect()`.
 */
export const authRouter = router({
  signIn: publicProcedure.input(SignInSchema).mutation(async ({ ctx, input }) => {
    try {
      await auth.api.signInEmail({
        body: input,
        headers: ctx.headers,
      });
    } catch {
      // Uniform failure — every credential / verification / rate-limit
      // error maps to the same string so the response is non-enumerative.
      throw new TRPCError({ code: "UNAUTHORIZED", message: SIGN_IN_FAILURE });
    }
    return { ok: true as const };
  }),

  /**
   * Create a new account. With `emailVerification.sendOnSignUp: true`
   * configured in `@ogs/auth/server`, Better Auth dispatches the verify
   * email automatically; the client hook then routes to
   * `/login?status=check-email`.
   */
  signUp: publicProcedure.input(SignUpSchema).mutation(async ({ ctx, input }) => {
    try {
      await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
        headers: ctx.headers,
      });
    } catch {
      throw new TRPCError({ code: "BAD_REQUEST", message: SIGN_UP_FAILURE });
    }
    return { ok: true as const };
  }),

  /**
   * Request a password-reset email. ALWAYS returns OK — we never reveal
   * whether the email maps to an account (Gate 3, no enumeration).
   *
   * The input is intentionally permissive (`z.string()`) so the round
   * trip happens even for malformed emails — preserves the constant-ish
   * timing property a Zod-fail short-circuit would break.
   */
  forgotPassword: publicProcedure
    .input(ServerForgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await auth.api.requestPasswordReset({
          body: { email: input.email, redirectTo: "/reset-password" },
          headers: ctx.headers,
        });
      } catch {
        // Swallow — same response regardless. Better Auth still logs
        // failures internally for ops review.
      }
      return { ok: true as const, message: FORGOT_PASSWORD_OK };
    }),

  /**
   * Consume the reset token + set a new password. Uniform failure on
   * bad/expired token or rejected new-password complexity.
   */
  resetPassword: publicProcedure.input(ResetPasswordSchema).mutation(async ({ ctx, input }) => {
    try {
      await auth.api.resetPassword({
        body: { newPassword: input.password, token: input.token },
        headers: ctx.headers,
      });
    } catch {
      throw new TRPCError({ code: "BAD_REQUEST", message: RESET_PASSWORD_FAILURE });
    }
    return { ok: true as const };
  }),

  sessions: router({
    /**
     * List every active session for the calling user. The IP field is
     * masked before it leaves the server (Gate 3); raw IPs never reach
     * the browser.
     */
    list: protectedProcedure.query(async ({ ctx }): Promise<SessionRow[]> => {
      const all = await auth.api.listSessions({ headers: ctx.headers });
      const currentToken = ctx.session.session.token;
      return all.map(
        (s): SessionRow => ({
          id: s.id,
          token: s.token,
          userAgent: s.userAgent ?? null,
          ipAddress: maskIp(s.ipAddress),
          createdAt: s.createdAt,
          isCurrent: s.token === currentToken,
        }),
      );
    }),

    /**
     * Revoke a single session by its Better Auth token. Better Auth
     * scopes the call to the authenticated user's own sessions; the
     * input shape exists only to keep malformed strings out of the API.
     */
    revoke: protectedProcedure.input(RevokeSessionSchema).mutation(async ({ ctx, input }) => {
      await auth.api.revokeSession({
        body: { token: input.token },
        headers: ctx.headers,
      });
      return { ok: true as const };
    }),
  }),
});

/** Convenience export — id-app router merges this in. */
export type AuthRouter = typeof authRouter;
