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

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)

## Mandatory Arcjet tasks (added v2)

- OGS-162 Compose Arcjet `authEndpoint` over `/api/auth/**` in `apps/web-id/src/proxy.ts` (replace the Phase-0 `publicShield` default with route-aware selection). Verify OTP brute-force is denied after the 11th call inside one minute. See `SECURITY.md` §6.3.
- OGS-163 Compose Arcjet `publicForm` on `/login`, `/signup`, `/forgot-password` in `apps/web-id` so disposable-email signups and bot UA strings are blocked at the edge. See `SECURITY.md` §6.2 (`protectSignup`).
- OGS-164 Wire Sentry breadcrumb tagging for denied Arcjet decisions (`arcjet.denied` with `reason`, `path`, `ip` tags). Add a saved Sentry search "Arcjet denials last 24h" used in the weekly security sync.
