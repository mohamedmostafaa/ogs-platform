# ADR-0002: Arcjet rule-set naming + scope expansion

## Status

Accepted (2026-05-12)

## Context

Blueprint §6 / SECURITY.md §6.2 originally named five canonical Arcjet rule sets:

| Blueprint name | Surface                                | Mitigates            |
| -------------- | -------------------------------------- | -------------------- |
| `publicShield` | every public route (proxy.ts baseline) | T1, T2, T16          |
| `publicForm`   | unauthenticated form submission        | T3                   |
| `authEndpoint` | `/api/auth/**`                         | T7 (OTP brute force) |
| `mutation`     | authenticated POST / PUT / DELETE      | T2                   |
| `aiEndpoint`   | routes invoking paid LLMs              | T18 (AI cost spike)  |

The Phase-0 implementation deviated:

| Implementation  | Mapped (mostly) to                       | Notes                                                                                                               |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `publicShield`  | blueprint `publicShield`                 | matches                                                                                                             |
| `authProtect`   | blueprint `publicForm` + signup-specific | broader                                                                                                             |
| `apiProtect`    | blueprint `mutation`                     | requires `userId` characteristic                                                                                    |
| `mediaUpload`   | (new)                                    | per-user upload throttle                                                                                            |
| `webhookVerify` | (new)                                    | inbound webhook receivers                                                                                           |
| —               | `authEndpoint`                           | **missing** — was the gap that left Identity's `/api/auth/**` mounted under `publicShield`, violating T7 mitigation |
| —               | `aiEndpoint`                             | **missing** — T18 unprotected                                                                                       |

The Phase-A audit caught both gaps (blockers B12 and the missing
`aiEndpoint`) and additionally flagged the loose `protectInProxy` signature
that accepts rule sets needing `userId` props.

## Decision

1. **Add `authEndpoint`** as a new module (`packages/security/src/arcjet/auth-endpoint.ts`). It is the canonical Arcjet client for `/api/auth/**` and is mounted by `apps/id/src/proxy.ts` via path dispatch.
2. **Add `aiEndpoint`** (`packages/security/src/arcjet/ai-endpoint.ts`). Token-bucket 20/2-per-min for paid-LLM calls. Mounted from route handlers with `aj.protect(req, { userId })`.
3. **Keep the Phase-0 names** `authProtect`, `apiProtect`, `mediaUpload`, `webhookVerify`. They cover surfaces the blueprint didn't enumerate (signup-specific email blocking, webhooks, uploads) and renaming would burn churn for no gain.
4. **Tighten `protectInProxy`** to accept only `NoPropsArcjet = ArcjetNext<{}>`. Rule sets with custom characteristics (`apiProtect`, `mediaUpload`, `aiEndpoint`, `authProtect`) can no longer be mounted from `proxy.ts` — they must be invoked from route handlers with the required prop, eliminating the silent "rate limit keyed by undefined" footgun.
5. **`arcjetMode()` now returns `LIVE` in preview** (`VERCEL_ENV=preview`) per blueprint §6 — preview must enforce rules so they're verified before promotion.
6. **`publicShield` allow-list** adds `CATEGORY:SOCIAL` (LinkedIn, Facebook, Slack unfurlers) — critical for Careers SEO that the Phase-0 spec omitted.
7. **`mediaUpload` switches `fixedWindow` → `slidingWindow`** to avoid the boundary-doubling failure mode.
8. **`mapDecisionToResponse`** now returns `400` for `isEmail()` / `isSensitiveInfo()` denies (better UX on form errors).

## Consequences

- ✅ T7 (OTP brute force) and T18 (AI cost spike) actually mitigated.
- ✅ Type-safe rule-set / proxy pairing — can't accidentally mount a `userId`-keyed bucket on the public proxy.
- ✅ Preview deployments now exercise live Arcjet decisions; we'll catch tightened rules in PR review, not after promotion.
- ⚠️ Two extra rule sets to maintain. `getArcjetKey()` is invoked once per module on import; with 7 rule sets, that's 7 invocations on cold start. Acceptable.
- ⚠️ Existing TASKS.md OGS-027 description ("5 canonical rule sets") is now 7. Updated in the matching commit.

## Alternatives considered

1. **Rename Phase-0 names to match blueprint exactly** (e.g. `authProtect` → `publicForm`). Rejected — `authProtect`'s scope (signup with email + bot + rate-limit) is a superset of `publicForm`; the name communicates the surface better.
2. **Mount `apiProtect` from `proxy.ts` with default `userId = "anon"`** to avoid the route-handler indirection. Rejected — that's the silent rate-limit-keyed-by-string-constant bug we are explicitly fixing. Better to keep the type error so callers must do the right thing.
3. **Drop `webhookVerify` and rely on Inngest's built-in idempotency.** Rejected — webhook receivers need Shield + abuse rate limit; Inngest dedup runs _after_ delivery.

## Implementation plan

1. Add `authEndpoint`, `aiEndpoint` modules.
2. Tighten `protectInProxy` signature with `NoPropsArcjet` type.
3. Update `apps/id/src/proxy.ts` for path dispatch.
4. Update `arcjetMode()` resolution (LIVE in preview).
5. Update `publicShield` allow-list to include SOCIAL.
6. Update `mediaUpload` to sliding window.
7. Expand `mapDecisionToResponse` to handle email / sensitive info.
8. Update `index.ts` barrel + JSDoc index of all 7 rule sets.
9. Build + typecheck + lint — 34/34 green required.

## Rollback plan

Revert the commit; the deleted `authEndpoint` / `aiEndpoint` modules
disappear; `apps/id/src/proxy.ts` reverts to the publicShield-only
form. Type-tightening rollback is a one-line `type NoPropsArcjet = ArcjetNext<any>`.
