# Phase 02 — Identity Hub

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Bring up apps/web-id with Better Auth (email OTP, Google, LinkedIn, 2FA, OIDC provider) and provision Worker public IDs on sign-up. Wire the seven OIDC client apps to the hub. Cross-domain SSO (Flow J) end-to-end on preview.

**Exit criterion.** Signing in at id.ogs-tc.com produces a session at the stub web-careers page that displays the user's Worker public id.

**Window.** Week 2.

**Owning agents.** @auth-engineer, @security-engineer, @notifications-engineer, @code-reviewer.

**Prerequisites.** Phase 01 complete.

**Security gates that apply.** Gate 1 (authorization), Gate 3 (output minimization — never leak password hashes), Gate 7 (CSRF via Better Auth), Gate 8 (secrets), all SECURITY.md §0 standing rules.

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-120 through OGS-161. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- Better Auth instance — Blueprint §6.2.\n- Catch-all auth route — Blueprint §6.3.\n- Per-app OIDC client config — Blueprint §6.4.\n- Browser auth client — Blueprint §6.5.\n- Worker provisioning — Blueprint §6.6.\n- RBAC guards — Blueprint §6.8.\n- Cross-domain SSO flow — Blueprint §6.9.\n- Nodemailer SMTP transport — Blueprint §18.3.\n- Magic OTP email template — Blueprint §18.4.\n- Admin proxy role gate — Blueprint §6.12.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Atomic steps — OGS-150..153 (`@ogs/email` shell + Better Auth OTP wiring)

**Owner:** @notifications-engineer (lead), @auth-engineer (Better Auth integration)
**Reviewer:** @code-reviewer + @security-engineer (SMTP credentials, token leak avoidance)
**Security gates touched:**

- Gate 1 (auth tokens in email body): verification + magic-link URLs use the platform's HTTPS base URL.
- Gate 2 (input validation): every `sendEmail({...})` call's payload is Zod-validated.
- Gate 8 (secrets): SMTP_PASS read once at module load, never logged, never echoed.

**Blueprint sections:** §18.3 (transport), §18.4 (templates + dispatcher), §6.2 (OTP send hook).

### Prerequisites verified

- `.env.local` contains: `SMTP_HOST=mail.ogs-tc.com`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE=true`, `SMTP_TLS_SERVERNAME=registrar-servers.com`, `SMTP_TLS_REJECT_UNAUTHORIZED=true`, `MAIL_FROM`, `MAIL_TO`. (Confirmed by author before this expansion.)
- Versions verified live via `npm view`: `nodemailer@8.0.7`, `@react-email/components@1.0.12`, `@react-email/render@2.0.8`, `react-email@6.1.3`, `@types/nodemailer@8.0.0`. All match version-check floors.

### File map

| Path                                              | Purpose                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `packages/email/package.json`                     | Workspace manifest                                                                |
| `packages/email/tsconfig.json`                    | Self-contained TS config                                                          |
| `packages/email/eslint.config.mjs`                | Extends `@ogs/eslint-config/library.js`                                           |
| `packages/email/src/env.ts`                       | Read + Zod-validate SMTP env at startup                                           |
| `packages/email/src/transport.ts`                 | Nodemailer pooled `Transporter` singleton (OGS-150)                               |
| `packages/email/src/render.ts`                    | `renderEmail(<Template />)` → `{ html, text }` (OGS-152)                          |
| `packages/email/src/send.ts`                      | `sendEmail({ to, subject, react })` — public API                                  |
| `packages/email/src/templates/magic-otp.tsx`      | React Email template (OGS-151)                                                    |
| `packages/email/src/templates/verify-email.tsx`   | React Email template                                                              |
| `packages/email/src/templates/password-reset.tsx` | React Email template                                                              |
| `packages/email/src/templates/welcome.tsx`        | React Email template                                                              |
| `packages/email/src/templates/_layout.tsx`        | Shared shell (logo + footer)                                                      |
| `packages/email/src/index.ts`                     | Public barrel: `sendEmail`, template types                                        |
| `packages/auth/src/server.ts`                     | Add `emailAndPassword.sendVerificationEmail` + `sendPasswordResetEmail` (OGS-153) |

### Scope decision (loud, in the plan)

OGS-153 says "wire sendOTPEmail into Better Auth `emailOTP.sendVerificationOTP`". Better Auth's email OTP plugin lands in Phase 02 alongside the sign-in UI. **This chunk wires the email-and-password verification + reset hooks now** (because email-and-password is already enabled), and **reserves an exported `sendOTPEmail` helper** ready for the OTP plugin once it lands. The OTP plugin wiring itself is deferred to the same commit that mounts the plugin.

### OGS-150.01 — workspace + env validation

- [ ] Create `packages/email/{package.json, tsconfig.json, eslint.config.mjs}`.
- [ ] Pin: `nodemailer@^8.0.7`, `@types/nodemailer@^8`, `@react-email/components@^1.0.12`, `@react-email/render@^2.0.8`, `react@^19`, `zod@^4`.
- [ ] `src/env.ts` exports `getSmtpConfig()` returning a frozen object: `{ host, port, secure, auth: { user, pass }, tls: { servername, rejectUnauthorized } }` + `from`, `replyTo`. Zod schema enforces required fields; production throws on missing `SMTP_PASS`/`MAIL_FROM`. Build-phase (`NEXT_PHASE=phase-production-build`) tolerates missing values (placeholder transport).
- [ ] No mention of SMTP_PASS in any log line. Wrap secret access in a getter and never return the credential as part of a stringifiable object surface.

### OGS-150.02 — pooled transport

- [ ] `src/transport.ts` exports `getTransporter()` returning a memoised `nodemailer.createTransport(...)` instance.
- [ ] Pool settings: `pool: true, maxConnections: 5, maxMessages: 100` (avoids opening a new TLS handshake per email at burst).
- [ ] At startup, run `transporter.verify()` once and log the result; non-fatal if it fails (offline dev). Failures surface in the first real send.

### OGS-151.01 — Magic OTP template + 3 sibling templates

- [ ] `_layout.tsx` — shared React Email `<Html>/<Head>/<Body>` with the OGS logo header and "you received this because..." footer.
- [ ] `magic-otp.tsx` — 6-digit code in a giant centered tile + a 10-minute-expiry blurb. Props: `{ code: string; appName: string }`.
- [ ] `verify-email.tsx` — link button. Props: `{ verifyUrl: string; appName: string }`.
- [ ] `password-reset.tsx` — link button + security warning. Props: `{ resetUrl: string; appName: string; ipAddress?: string }`.
- [ ] `welcome.tsx` — onboarding pointer. Props: `{ firstName?: string; tenantSlug: string }`.

### OGS-152.01 — render + dispatcher

- [ ] `src/render.ts` exports `renderEmail(react: ReactElement): Promise<{ html: string; text: string }>` using `@react-email/render` (HTML) + plain-text fallback (strip tags + insert line breaks).
- [ ] `src/send.ts` exports:
  ```ts
  sendEmail(opts: {
    to: string | string[];
    subject: string;
    react: ReactElement;
    replyTo?: string;
    correlationId?: string;
  }): Promise<{ messageId: string }>;
  ```
  Internally: render → transporter.sendMail → return messageId.
- [ ] Also exports typed convenience wrappers `sendOTPEmail`, `sendVerifyEmail`, `sendPasswordResetEmail`, `sendWelcomeEmail` that each compose the right template + subject.

### OGS-153.01 — Better Auth hooks (email-and-password flow)

- [ ] `packages/auth/src/server.ts`: add to `emailAndPassword`:
  ```ts
  sendVerificationEmail: async ({ user, url }) =>
    sendVerifyEmail({ to: user.email, verifyUrl: url, appName: "OGS Identity" }),
  sendPasswordResetEmail: async ({ user, url, request }) =>
    sendPasswordResetEmail({
      to: user.email,
      resetUrl: url,
      appName: "OGS Identity",
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    }),
  ```
- [ ] Flip `requireEmailVerification: true` (was `false` in Phase A) — emails actually fire now.
- [ ] Update ADR-0004 footnote to note the change OR add a new ADR if behaviour shifts at runtime in unexpected ways.

### OGS-153.02 — OTP plugin wire (DEFERRED to OTP UI commit)

- The `emailOTP` plugin from `better-auth/plugins` exists, but its UI lands in the sign-in form (same Phase 02 commit). `sendOTPEmail` from `@ogs/email` is exported now; the actual `.use(emailOTP({ sendVerificationOTP: sendOTPEmail }))` call is in a follow-up commit.

### Verification gates (must all PASS before commit)

- [ ] `pnpm version-check` → 66+ green, 0 yellow.
- [ ] `pnpm turbo typecheck` → all packages green.
- [ ] `pnpm turbo build` → 8/8 apps green.
- [ ] `pnpm turbo lint` → all green.
- [ ] `pnpm format:check` → clean.
- [ ] `gitleaks detect --exit-code 1` → 0 leaks.
- [ ] **Live SMTP smoke**: with `.env.local` loaded, `node -e "import('@ogs/email').then(m => m.sendEmail({ to: process.env.MAIL_TO, subject: 'OGS smoke', react: m.welcomeFallback() }))"` (or an explicit `tooling/scripts/smoke-email.mjs`) delivers a message and prints `messageId`. **PASS = real delivery to MAIL_TO.**

### Commit body template

```
feat(email): @ogs/email — Nodemailer 8 + React Email templates + Better Auth verify/reset wiring (OGS-150..153)
```

(walk 10 SECURITY gates inline, document any deferrals.)

---

## Atomic steps — OGS-123, OGS-124, OGS-126, OGS-127 (auth pages — email+password only)

**Owner:** @auth-engineer (lead), @ui-engineer (form components)
**Reviewer:** @code-reviewer + @security-engineer (Gate 1 authz, Gate 2 input validation, Gate 3 output minimisation — never leak existence-of-account, Gate 7 CSRF — Next.js server actions provide built-in tokenisation)
**Security gates touched:**

- Gate 1 (authz): `/account/sessions` is `requireAuth`-gated; unauthenticated request 302s to `/login`.
- Gate 2 (input validation): every server action's payload is Zod-validated; rejected inputs surface a generic error, never echo back the offending bytes.
- Gate 3 (output minimisation): sign-in failures and forgot-password responses are uniform — same wording whether the email exists or not (Gate 1 dovetail: prevent account enumeration via response timing/wording).
- Gate 7 (CSRF): Next.js Server Actions ship with built-in token rotation; we don't roll our own.

**Blueprint sections:** §6.1 (sign-in/sign-up flow), §6.8 (guards + forbidden page), §6.11 (active-session management).

### Prerequisites verified

- `auth.api.signInEmail`, `auth.api.signUpEmail`, `auth.api.forgetPassword`, `auth.api.resetPassword`, `auth.api.listSessions`, `auth.api.revokeSession` all available on the `auth` instance exported from `@ogs/auth/server` (Better Auth 1.6 built-ins + the `emailAndPassword` block we already wired).
- `nextCookies()` plugin already mounted on the server instance → Set-Cookie flows through Server Actions automatically.
- `@ogs/ui` exports `Button`, `Input`, `Label`, `Card*`, `Alert*` — confirmed via barrel inspection before this expansion.

### Scope decision (loud, in the plan)

- **In scope:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account/sessions`, `/forbidden`.
- **DEFERRED:** `/2fa` (OGS-125) — the `twoFactor` plugin is not wired yet (Chunk A — OGS-120/122). Building the page now would mean stubbing a plugin call and we'd come back to rewrite it. The page lands in the same commit that wires `twoFactor`.
- **DEFERRED:** OTP-based passwordless sign-in (the `<input type="otp" />` UI) — same reason; `emailOTP` plugin lands with Chunk A.

### File map

| Path                                                     | Purpose                                                                                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/id/src/app/(auth)/layout.tsx`                      | Shared auth-page shell (centred card, logo header, theme toggle).                              |
| `apps/id/src/app/(auth)/_actions.ts`                     | Server actions: `signInAction`, `signUpAction`, `forgotPasswordAction`, `resetPasswordAction`. |
| `apps/id/src/app/(auth)/_schemas.ts`                     | Zod schemas + a `formStateError` helper for uniform messaging.                                 |
| `apps/id/src/app/(auth)/login/page.tsx`                  | `/login` — server component renders the form; client subcomponent owns useFormState.           |
| `apps/id/src/app/(auth)/login/login-form.tsx`            | Client form. Posts to `signInAction`.                                                          |
| `apps/id/src/app/(auth)/signup/page.tsx`                 | `/signup` — same pattern.                                                                      |
| `apps/id/src/app/(auth)/signup/signup-form.tsx`          | Client form. Posts to `signUpAction`.                                                          |
| `apps/id/src/app/(auth)/forgot-password/page.tsx`        | Server component.                                                                              |
| `apps/id/src/app/(auth)/forgot-password/forgot-form.tsx` | Client form. Posts to `forgotPasswordAction`.                                                  |
| `apps/id/src/app/(auth)/reset-password/page.tsx`         | Reads `?token=` from search params, renders the new-password form.                             |
| `apps/id/src/app/(auth)/reset-password/reset-form.tsx`   | Client form. Posts to `resetPasswordAction`.                                                   |
| `apps/id/src/app/account/sessions/page.tsx`              | `requireAuth`-gated. Lists active sessions, renders Revoke buttons.                            |
| `apps/id/src/app/account/sessions/revoke-button.tsx`     | Client component owning the `revokeSessionAction` call + optimistic-remove.                    |
| `apps/id/src/app/account/sessions/_actions.ts`           | Server action: `revokeSessionAction(sessionId)`.                                               |
| `apps/id/src/app/forbidden/page.tsx`                     | Static — friendly message + link back to home / sign-in.                                       |

### OGS-127.01 — `/forbidden` (smallest, ships first)

- [ ] Static server component. No data fetch. Renders `<Alert variant="destructive">` + a "Return to sign-in" link to `/login`.
- [ ] No tracking, no env. Pure presentation.

### OGS-123.01 — `/login` + action

- [ ] `_schemas.ts`: `SignInSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) })`. Reject everything else with a single string error: `"Email and password do not match."` (uniform regardless of cause — no enumeration leak).
- [ ] `_actions.ts`: `signInAction(prev, formData)`. Validates → calls `auth.api.signInEmail({ body, headers, asResponse: true })` → on success, `redirect("/")` (or `?callbackURL=` if present and same-origin). On failure: return `{ error: "Email and password do not match." }`.
- [ ] `login/page.tsx`: server component rendering `<LoginForm />` (client). Forwards `searchParams.callbackURL` as a hidden input.
- [ ] `login-form.tsx`: client. `useFormState(signInAction, { error: null })` + native `<form action={action}>`. Disabled submit while `useFormStatus().pending`.
- [ ] Same-origin callback-URL guard: reject any value that isn't a relative path starting with `/` and not `//`. Default to `/`.

### OGS-124.01 — `/signup` + action

- [ ] `SignUpSchema = z.object({ email, password, confirmPassword, name })` — refine `password === confirmPassword`. Server-side password rule: ≥ 8 chars, ≥ 1 letter + 1 digit (kept identical to Better Auth's default but enforced before we hit the API).
- [ ] `signUpAction(prev, formData)` → `auth.api.signUpEmail({ body, headers, asResponse: true })`. With `emailVerification.sendOnSignUp: true`, Better Auth dispatches the verify-email automatically. On success: redirect to `/login?status=check-email` (uniform; no per-user data in URL).
- [ ] On `auth.api.signUpEmail` rejection (duplicate, weak password, rate-limited), return `{ error: "We couldn't create that account. Please double-check the form and try again." }` — uniform message.

### OGS-126.01 — `/account/sessions`

- [ ] Page is server component. `await requireAuth(await headers())` — on `AuthGuardError` redirect to `/login?callbackURL=/account/sessions`.
- [ ] `const sessions = await auth.api.listSessions({ headers })` — render rows with user-agent / created-at / ip (when present) + a Revoke button per row. **Mask IP to /24 in render** (Gate 3: minimise PII surface — the user already knows their own IP roughly).
- [ ] `revokeSessionAction(sessionId)`: re-runs `requireAuth`, then `auth.api.revokeSession({ headers, body: { token: sessionId } })`. Refreshes the page via `revalidatePath("/account/sessions")`.

### OGS-126.02 — forgot-password + reset-password pages

- [ ] `/forgot-password`: form posts an email. Server action calls `auth.api.forgetPassword({ body: { email, redirectTo: "/reset-password" }, headers })`. Returns a uniform success message regardless of whether the email exists. No timing-side-channel: do NOT branch on the API response — always return the same shape after a fixed Better Auth call.
- [ ] `/reset-password?token=…`: server component reads `token` from `searchParams`. If missing/empty, render an error card. Form posts new password + token → action calls `auth.api.resetPassword({ body: { newPassword, token }, headers })`. Success → redirect `/login?status=password-reset`.

### Verification gates (must all PASS before commit)

- [ ] `pnpm turbo typecheck` → all packages green.
- [ ] `pnpm turbo build` → 8/8 apps green; new `/login`, `/signup`, etc. show in apps/id's route table.
- [ ] `pnpm turbo lint` → all green.
- [ ] `pnpm format:check` → clean.
- [ ] `gitleaks detect --exit-code 1` → 0 leaks.
- [ ] **Manual smoke (dev):** boot `pnpm --filter=@ogs/id dev`, sign up at `/signup`, receive verify email (real SMTP from previous chunk), click verify link, sign in at `/login`, land on `/`, visit `/account/sessions` and see one row, revoke it → cookie cleared → 302 to `/login`.

### Commit body template

```
feat(id): /login + /signup + /forgot-password + /reset-password + /account/sessions + /forbidden (OGS-123, 124, 126, 127)
```

(walk 10 SECURITY gates inline, document /2fa + OTP deferrals.)

---

## Atomic steps — OGS-120, OGS-122, OGS-153 (emailOTP + twoFactor plugins + auth-client extension)

**Owner:** @auth-engineer (lead), @database-engineer (TwoFactor table migration)
**Reviewer:** @code-reviewer + @security-engineer (Gate 1 enforcement still holds with new flows, Gate 8 — OTP secret + TOTP secret never logged, Gate 9 — emailOTP allowedAttempts caps brute-force at the application layer too)
**Security gates touched:**

- Gate 1 (authz): twoFactor introduces a post-password gate. Sessions issued before 2FA verification carry `session.twoFactorVerified === false` and our guards must treat them as unauthenticated for `/account/*` routes (DEFERRED to the 2FA-UI commit — flagged loud).
- Gate 8 (secrets): TOTP secret stored encrypted in the new `TwoFactor.secret` column; Better Auth applies its standard `secret` encryption when `storeOTP` defaults remain. Backup codes stored as a JSON array of hashed strings.
- Gate 9 (rate limiting): emailOTP `allowedAttempts: 3` caps app-layer brute-force; the Arcjet `authEndpoint` rule (OGS-162, Chunk D) caps edge-layer brute-force. Both layers in defence-in-depth.

**Blueprint sections:** §6.2 (Better Auth instance), §6.5 (browser client), §18.4 (emailOTP send hook).

### Prerequisites verified

- `packages/auth/src/server.ts` already wires `oauthProvider` + `jwt` plugins; this chunk adds two more.
- `@ogs/email` exports `sendOTPEmail` (Phase 02 §OGS-152) — ready to pass to `emailOTP.sendVerificationOTP`.
- Better Auth's emailOTP plugin requires no extra DB table (re-uses the existing `Verification` model).
- Better Auth's twoFactor plugin requires a new `TwoFactor` model + `User.twoFactorEnabled` Boolean (confirmed via `node_modules/.../two-factor/schema.d.mts`).

### Scope decision (loud, in the plan)

- **In scope:** wire both plugins server-side, extend `createOgsAuthClient` with `emailOTPClient`, `twoFactorClient`, and `genericOAuthClient`, add the `TwoFactor` model + `twoFactorEnabled` user field + Prisma migration, dispatch the OTP email via the new plugin (OGS-153 closes now).
- **DEFERRED to a follow-up commit:**
  - `/2fa` UI page (OGS-125) — the plugins are wired; the page can land next.
  - "Sign-in-with-OTP" UI on `/login` — current `/login` only does email+password. A new tabbed UI is a UX-level decision and ships separately.
  - Updating `requireAuth` / `requireRole` to reject sessions where `twoFactorVerified === false` — this is a security-policy change with downstream effects on every protected route; ships with the 2FA UI in the same commit so it's testable end-to-end.

### File map

| Path                                              | Purpose                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `packages/db/prisma/schema/auth.prisma`           | Add `twoFactorEnabled` to `User`; add `TwoFactor` model.                                                    |
| `packages/db/prisma/migrations/.../migration.sql` | Generated via `pnpm --filter @ogs/db prisma:migrate dev --name add_two_factor`.                             |
| `packages/auth/src/server.ts`                     | Import + register `emailOTP({ sendVerificationOTP, allowedAttempts: 3 })` and `twoFactor({ issuer })`.      |
| `packages/auth/src/client-config.ts`              | Import + register `emailOTPClient()`, `twoFactorClient()`, `genericOAuthClient()` in `createOgsAuthClient`. |

### OGS-153.02 — wire `sendOTPEmail` into `emailOTP.sendVerificationOTP`

- [ ] On `packages/auth/src/server.ts`, import `emailOTP` from `better-auth/plugins` and `sendOTPEmail` from `@ogs/email`.
- [ ] Add to `plugins: [...]`:
  ```ts
  emailOTP({
    otpLength: 6,
    expiresIn: 600, // 10 minutes
    allowedAttempts: 3,
    sendVerificationOTP: async ({ email, otp, type }) => {
      // We map all four BA flows (sign-in / email-verification /
      // forget-password / change-email) to the same template; the
      // subject is set per-type so the inbox makes sense.
      await sendOTPEmail({
        to: email,
        code: otp,
        appName: "OGS Identity",
      });
    },
  }),
  ```
- [ ] **Type-level guard:** assert the callback param shape is inferred (no hand-typing) so a future BA upgrade that renames `otp` to e.g. `code` would break the build instead of silently no-op-ing.

### OGS-120.01 — wire the `twoFactor` plugin

- [ ] On `packages/auth/src/server.ts`, import `twoFactor` from `better-auth/plugins`.
- [ ] Add to `plugins: [...]`:
  ```ts
  twoFactor({
    issuer: "OGS Identity",
  }),
  ```
- [ ] No `skipVerificationOnEnable` (default `false`) — users must complete TOTP setup before 2FA is active on their account.

### OGS-040-equivalent migration — add `TwoFactor` model

- [ ] In `packages/db/prisma/schema/auth.prisma`:

  ```prisma
  model User {
    // ...existing fields...
    twoFactorEnabled Boolean @default(false)
    twoFactor TwoFactor[]
  }

  model TwoFactor {
    id          String  @id @default(cuid())
    secret      String
    backupCodes String
    verified    Boolean @default(false)
    userId      String
    user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@map("twoFactor")
  }
  ```

- [ ] Run `pnpm --filter @ogs/db prisma:migrate dev --name add_two_factor`. Commit the generated `migration.sql`.

### OGS-122.01 — extend `createOgsAuthClient` with all three plugins

- [ ] On `packages/auth/src/client-config.ts`, import:
  ```ts
  import { emailOTPClient, twoFactorClient, genericOAuthClient } from "better-auth/client/plugins";
  ```
- [ ] Add to the `createBetterAuthClient({ ... })` call:
  ```ts
  plugins: [emailOTPClient(), twoFactorClient(), genericOAuthClient()],
  ```
- [ ] Update the JSDoc to call out the three new client plugins.

### Verification gates (must all PASS before commit)

- [ ] `pnpm version-check` → 66+ green, 0 yellow.
- [ ] `pnpm --filter @ogs/db prisma:validate` passes after schema change.
- [ ] Migration file exists under `packages/db/prisma/migrations/` and is committed.
- [ ] `pnpm turbo typecheck build lint` → all green (38/38).
- [ ] `pnpm format:check` → clean.
- [ ] `gitleaks detect --exit-code 1` → 0 leaks.
- [ ] **Dispatch the `superpowers:code-reviewer` subagent BEFORE push.** Apply BLOCKERS inline; loud-defer SHOULDs not landing in this commit.

### Commit body template

```
feat(auth): emailOTP + twoFactor plugins + auth-client extension (OGS-120, OGS-122, OGS-153)
```

(walk 10 SECURITY gates inline; document /2fa-UI deferral.)

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)

## Mandatory Arcjet tasks (added v2)

- OGS-162 Compose Arcjet `authEndpoint` over `/api/auth/**` in `apps/web-id/src/proxy.ts` (replace the Phase-0 `publicShield` default with route-aware selection). Verify OTP brute-force is denied after the 11th call inside one minute. See `SECURITY.md` §6.3.
- OGS-163 Compose Arcjet `publicForm` on `/login`, `/signup`, `/forgot-password` in `apps/web-id` so disposable-email signups and bot UA strings are blocked at the edge. See `SECURITY.md` §6.2 (`protectSignup`).
- OGS-164 Wire Sentry breadcrumb tagging for denied Arcjet decisions (`arcjet.denied` with `reason`, `path`, `ip` tags). Add a saved Sentry search "Arcjet denials last 24h" used in the weekly security sync.
