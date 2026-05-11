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

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)

## Mandatory Arcjet tasks (added v2)

- OGS-162  Compose Arcjet `authEndpoint` over `/api/auth/**` in `apps/web-id/src/proxy.ts` (replace the Phase-0 `publicShield` default with route-aware selection). Verify OTP brute-force is denied after the 11th call inside one minute. See `SECURITY.md` §6.3.
- OGS-163  Compose Arcjet `publicForm` on `/login`, `/signup`, `/forgot-password` in `apps/web-id` so disposable-email signups and bot UA strings are blocked at the edge. See `SECURITY.md` §6.2 (`protectSignup`).
- OGS-164  Wire Sentry breadcrumb tagging for denied Arcjet decisions (`arcjet.denied` with `reason`, `path`, `ip` tags). Add a saved Sentry search "Arcjet denials last 24h" used in the weekly security sync.
