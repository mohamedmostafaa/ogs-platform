# OGS Platform — Security Charter

> Security is the **top priority** of every agent on every task. It supersedes velocity, elegance, and convenience. When in doubt, choose the more secure path.

## 0. Standing security rules — read every session

Every agent reads and confirms understanding of this section at the start of every task.

1. **Trust no input.** Every value crossing a trust boundary (HTTP request, webhook body, file upload, AI-generated text, database query parameter) is untrusted until validated by a Zod schema or an explicit allow-list.
2. **Authorization is explicit, never implicit.** Every tRPC procedure uses one of `protectedProcedure`, `tenantProcedure`, `employerProcedure`, `enterpriseProcedure`, `adminProcedure`, or `quotaProcedure`. `baseProcedure` is for truly public reads only and must declare zero side-effects.
3. **Tenant scope is enforced at the database layer.** Application code never adds `tenantId` filters by hand. The Prisma `tenantScopeExtension` does it. Bypass is forbidden except through the `$bypassTenantScope` helper, callable only from `packages/auth` and `apps/web-admin`.
4. **Soft delete and audit log are invariants.** Sensitive tables never accept a hard delete. Every write to a sensitive table produces an `AuditLog` row through the extension. No code path bypasses this.
5. **Secrets never enter the repository.** `.env*` files, generated Prisma clients, signing keys, vendor tokens, customer PII — all blocked by `.gitignore` + gitleaks pre-commit + CI scan.
6. **Per-tenant secrets live encrypted in `SecretCredential`.** AES-256-GCM with key-id rotation. Encryption is owned by `@ogs/security/encryption`. No other code calls a cipher primitive directly.
7. **Webhooks verify signatures and store idempotency.** Every webhook receiver runs the five-step canonical pattern (verify → parse → idempotency → dispatch → mark processed). No exceptions.
8. **PII never reaches logs.** `console.log`, structured logger, and Sentry events go through a scrubbing layer that strips emails, phone numbers, national IDs, and payment fields.
9. **AI outputs pass guardrails.** Every `runAITask` response is checked for PII leakage and prompt-injection markers before returning. Violations throw `GuardrailError` and are logged as `GUARDRAIL_BLOCK`.
10. **Two-person rule for destructive operations.** Refund > USD 10k, delete worker, override KYC, key rotation, impersonation, payment-provider switch — all require 2FA step-up and an audit log entry naming both approvers.

11. **Arcjet is mandatory on every Next.js app's `proxy.ts`.** Shield + bot detection + rate limiting + email validation are primary controls, not optional. See §6 for the canonical client and per-app composition. No agent disables, weakens, or bypasses Arcjet without an Architecture Reviewer ADR.

    > **Naming note (Next.js 16+).** The `middleware` file convention was deprecated and renamed to `proxy` in Next.js 16.0. Every reference to `middleware.ts` / `export function middleware(...)` / `skipMiddlewareUrlNormalize` in this document, in the blueprint, in the phase plans, and in any agent charter MUST read `proxy.ts` / `export function proxy(...)` / `skipProxyUrlNormalize`. Use the codemod `npx @next/codemod@canary middleware-to-proxy .` on any pre-existing file. The function name is `proxy` (or default export); the request type stays `NextRequest`; the shorthand type is `NextProxy`.

## 1. Security as a top-priority gate

These checks are gates on every PR. A failed gate is grounds for immediate rejection by the Code Reviewer agent and a re-route to the Security Engineer agent.

### Gate 1 — Authorization
- [ ] Every new procedure uses the correct base procedure (table in §0 rule 2).
- [ ] Every authorization decision is justified by membership/role/tenant checks against the active session.
- [ ] Object-level authorization: `where: { id, tenantId }` (or equivalent) on every query that returns or mutates a tenant-scoped record.

### Gate 2 — Input validation
- [ ] Every procedure input is a Zod schema imported from `modules/<x>/schema.ts`.
- [ ] Free-text fields have max-length bounds.
- [ ] Enums use `z.enum`, never `z.string` with a runtime check.
- [ ] Numeric fields have `min` / `max`.

### Gate 3 — Output minimization
- [ ] Procedures return the minimum fields needed by the caller. Use `select:` in Prisma.
- [ ] Never return password hashes, raw OTP values, encryption ciphertext, or full tokens.
- [ ] Never return another tenant's data.

### Gate 4 — Audit log
- [ ] Sensitive writes produce `AuditLog` rows via the extension. No manual writes.
- [ ] The extension's `AUDITED_MODELS` set includes any newly added sensitive table in the same PR.

### Gate 5 — Soft delete
- [ ] New domain tables have `deletedAt DateTime?`.
- [ ] The `softDeleteExtension`'s `SOFT_DELETE_MODELS` set includes them in the same PR.

### Gate 6 — Multi-tenancy
- [ ] New tenant-scoped tables have `tenantId String` indexed.
- [ ] The `tenantScopeExtension`'s `TENANT_SCOPED` set includes them in the same PR.

### Gate 7 — Webhooks
- [ ] Signature verification implemented and tested with a known-good and known-bad signature.
- [ ] `WebhookEvent` idempotency record created before any side-effect.
- [ ] No side-effect runs more than once for the same provider eventId.

### Gate 8 — Secrets
- [ ] No `.env*` file in the diff.
- [ ] No literal API key, secret, password, or signing key in code.
- [ ] New per-tenant secret stored via `storeSecret(...)` into `SecretCredential`, not an env var.

### Gate 9 — Logging and telemetry
- [ ] No `console.log` of an entire request body.
- [ ] PII scrubbed from Sentry events via `beforeSend`.
- [ ] AI calls produce one `AIInteraction` row (telemetry, not PII).

### Gate 10 — Dependency hygiene
- [ ] New dependency is on the locked stack (blueprint §3) or an ADR is linked.
- [ ] Dependency is the canonical owned wrapper (Nodemailer SMTP for email, `@ogs/ai/runtime` for AI, `@ogs/payments` for payments, `@ogs/live-video` for live, `@ogs/video` for VOD).

## 2. Threat model — Wave 1

The threats the team designs against, in priority order:

| # | Threat | Mitigation owner | Canonical controls |
|---|---|---|---|
| T1 | Cross-tenant data leakage | Database Engineer + Security Engineer | Prisma `tenantScopeExtension`; integration test "cross-tenant read returns 404"; tRPC `tenantProcedure` |
| T2 | Hard delete of audit-relevant records | Database Engineer | `softDeleteExtension`; pre-commit guard in CI |
| T3 | Unauthorized escalation to admin | Auth Engineer + Security Engineer | `OGS_*` role gate in `apps/web-admin/proxy.ts`; 2FA mandatory; quarterly access review |
| T4 | Stripe / Lemon / Polar / PayMob webhook replay | Payments Engineer | Signature verification + `WebhookEvent` idempotency |
| T5 | API key leakage via repo or logs | Security Engineer + DevOps Engineer | gitleaks, `.gitignore`, `beforeSend` Sentry scrub, secret-store envelope |
| T6 | Prompt injection extracting cross-user data | AI Engineer | Guardrails on every output; RAG tenant scoping in queries |
| T7 | Account takeover via OTP brute force | Auth Engineer | OTP max 5 attempts, 10-minute window, per-email + per-IP rate limit |
| T8 | XSS via user-supplied content (job description, course body) | UI Engineer + Frontend Feature Engineer | React's default escaping; HTML sanitiser on any `dangerouslySetInnerHTML` (forbidden by default) |
| T9 | CSRF on state-changing routes | Auth Engineer | Better Auth's built-in CSRF; same-site cookies; tRPC mutations require session |
| T10 | Stolen session reuse | Auth Engineer | 1-hour product-app cookie; 30-day refresh on hub; revoke-all on password reset or 2FA change |
| T11 | Compromised dev laptop | DevOps Engineer + Security Engineer | No prod creds on laptops; preview env only; mandatory FDE; SSH key on hardware |
| T12 | Supply-chain compromise | Architecture Reviewer + DevOps Engineer | Locked stack; renovate with manual review of major bumps; npm audit in CI |
| T13 | Customer-paid live video recording leak | Live Video Engineer | Signed playback URLs (Bunny + Stream); per-tenant access control; AuditLog of every view |
| T14 | Proctoring evidence tampering | Live Video Engineer + Security Engineer | Append-only `AssessmentAttempt.proctoringEvidenceUrl`; R2 object lock in W2 |
| T15 | Bulk PII export by a curious staff member | Security Engineer | OGS staff queries audited; download size threshold triggers alert; quarterly review |
| T16 | Volumetric / L7 abuse on public routes (scraping, DDoS, credential stuffing) | Security Engineer + DevOps Engineer | Arcjet Shield + bot detection + rate limiting on every app proxy.ts (§6) |
| T17 | Disposable-email signup floods (fake Workers, AI quota abuse) | Security Engineer + Auth Engineer | Arcjet `protectSignup` + email validation on Flow K and OTP routes (§6) |
| T18 | AI cost spike from a single malicious or buggy client | AI Engineer + Security Engineer | Arcjet `tokenBucket` on AI endpoints (§6.4) + per-tenant USD 200/day Sentry alert |

## 3. Required security training (per agent, every quarter)

Every agent reviews:
- This file.
- Blueprint Chapter 6 (auth), 15 (encryption), 16 (Prisma extensions), 20 (webhooks), 23.9 (review checklist).
- The OWASP Top 10 in its current published year.
- The Wave-1 threat model above.

## 4. Incident response

Owned by the Security Engineer and the Engineering Lead. Runbook at `docs/runbooks/incident-response.md` (created in Phase 1).

- **Severity 1.** Active breach, PII exfiltration, money loss, or any visible service outage. Pager-equivalent within 10 minutes. Engineering Lead briefs the Founder within 30 minutes.
- **Severity 2.** Suspected breach, single-customer outage, data integrity event with no confirmed loss. Same-day response.
- **Severity 3.** Latent vulnerability discovered, no exploitation evidence. Within 5 working days.

Each incident produces a post-mortem in `docs/incidents/YYYY-MM-DD-<slug>.md` within 5 working days of closure. The post-mortem is blameless and focuses on system fixes.

## 5. Compliance-readiness posture

- **ISO 17024** (personnel certification body) — soft-delete + audit-log + AI/verified segregation are the load-bearing controls. Wave 2+ formal application.
- **ISO 27001** — Wave 3 readiness. Maintain control documentation under `docs/compliance/iso27001/` as we go.
- **SOC 2 Type 1** — Year-2 readiness.
- **GDPR + regional privacy** — implemented in Wave 1 (TR-08 right-to-be-forgotten, TR-09 retention, TR-03 cookie consent).

## 6. Arcjet — bot detection, rate limiting, signup protection, shield

> **Locked into the stack.** Arcjet (`@arcjet/next`) is mandatory on every Next.js app's `proxy.ts`. It is a primary security control, not a feature flag. No agent disables, weakens, or routes around Arcjet rules without an Architecture Reviewer ADR.

Arcjet provides four protections OGS depends on. None of them are optional.

| Protection | Where applied | Why |
|---|---|---|
| **Shield (WAF)** | Every Next.js app proxy.ts, every route | Blocks common attacks (SQLi attempts, traversal, suspicious payloads) before they reach our code. |
| **Bot detection** | Public routes (`/jobs`, `/apply/[slug]`, `/p/[slug]`, marketing, course catalog) | Stops scrapers, credential stuffers, and automated form-fill abuse on Flow K (Sara). |
| **Rate limiting (token bucket + fixed window)** | Auth endpoints, AI-consuming procedures, mutation procedures | Caps OTP brute-force (T7), AI cost runaway (R-03), and abusive write traffic. |
| **Email / sensitive-info validation** | Public signup + Flow K apply | Rejects disposable / no-MX / known-spammer emails on first-touch. |

### 6.1 Required package

`@arcjet/next` is the only Arcjet dependency. Installed once in `packages/security` and re-exported.

```bash
pnpm --filter @ogs/security add @arcjet/next @arcjet/inspect
```

### 6.2 Canonical client + rule sets

File: `packages/security/src/arcjet/index.ts` — the single source of truth for every Arcjet rule in every app.

```ts
/**
 * Arcjet — canonical OGS security proxy primitives (Next.js 16 proxy.ts).
 *
 * Provides four pre-built rule sets that every app composes into its proxy.ts:
 *
 *   - publicShield        Shield only. For static / marketing routes that do not accept user input.
 *   - publicForm          Shield + Bot + Email validation + low rate-limit. For Flow K public apply
 *                         and signup forms. Includes signup-flood protection.
 *   - authEndpoint        Shield + Bot + tight rate-limit. For /api/auth/**.
 *   - mutation            Shield + Bot + per-user rate-limit. For tRPC mutations on tenant data.
 *   - aiEndpoint          Shield + per-user rate-limit aligned to AI cost budget. For procedures
 *                         and Inngest handlers that call runAITask.
 *
 * Every app's proxy.ts composes one or more of these. Apps never call arcjet() directly.
 *
 * @see SECURITY.md §6
 */
import arcjet, {
  shield,
  detectBot,
  fixedWindow,
  tokenBucket,
  validateEmail,
  protectSignup,
} from "@arcjet/next";

const KEY = process.env.ARCJET_KEY;
if (!KEY) {
  throw new Error("ARCJET_KEY is required at startup");
}

/** Identify the actor: prefer authenticated user id, fall back to IP. */
const characteristics = ["ip.src", "http.request.headers.x-ogs-user-id"];

/* ------------------------------------------------------------------ */
/* publicShield — minimal protection for static reads                  */
/* ------------------------------------------------------------------ */
export const publicShield = arcjet({
  key: KEY,
  characteristics,
  rules: [shield({ mode: "LIVE" })],
});

/* ------------------------------------------------------------------ */
/* publicForm — Flow K and any other public form                      */
/* ------------------------------------------------------------------ */
export const publicForm = arcjet({
  key: KEY,
  characteristics,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: { mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] },
      rateLimit: { mode: "LIVE", interval: "10m", max: 5 }, // 5 signups / 10 min per IP
    }),
  ],
});

/* ------------------------------------------------------------------ */
/* authEndpoint — OTP, login, password reset                          */
/* ------------------------------------------------------------------ */
export const authEndpoint = arcjet({
  key: KEY,
  characteristics,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    fixedWindow({ mode: "LIVE", window: "1m", max: 10 }),    // 10 req / min / actor
    fixedWindow({ mode: "LIVE", window: "10m", max: 30 }),   // 30 req / 10 min / actor
  ],
});

/* ------------------------------------------------------------------ */
/* mutation — every authenticated mutation route                       */
/* ------------------------------------------------------------------ */
export const mutation = arcjet({
  key: KEY,
  characteristics,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 30,          // tokens per interval
      interval: "1m",
      capacity: 60,            // burst
    }),
  ],
});

/* ------------------------------------------------------------------ */
/* aiEndpoint — runAITask-consuming procedures                         */
/* ------------------------------------------------------------------ */
export const aiEndpoint = arcjet({
  key: KEY,
  characteristics,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,          // 10 AI calls / minute / user, burst 20
      interval: "1m",
      capacity: 20,
    }),
  ],
});

export { type ArcjetNextRequest } from "@arcjet/next";
```

### 6.3 Per-app proxy.ts composition

Every app has a `src/proxy.ts` that runs Arcjet **before** any other logic. Note that in Next.js 16 the proxy runs on the **Node.js runtime, not Edge** — `runtime: "edge"` is unsupported and configuring it throws at startup. This is fine for Arcjet, which always supported Node.

File: `apps/web-careers/src/proxy.ts` — example.

```ts
/**
 * Careers app proxy.ts. Routes:
 *
 *   /apply/**           → publicForm (Flow K)
 *   /api/auth/**        → authEndpoint
 *   /api/trpc/**        → mutation (cheap; finer-grained limits inside procedures)
 *   /jobs/**, /p/**     → publicShield
 *   everything else     → publicShield (defense in depth)
 *
 * Arcjet decisions:
 *   - denied  → return the Arcjet-provided 4xx response.
 *   - errored → log to Sentry and FAIL OPEN for read-only routes; FAIL CLOSED for auth/mutation.
 *
 * @see SECURITY.md §6
 */
import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  publicShield,
  publicForm,
  authEndpoint,
  mutation,
} from "@ogs/security/arcjet";

const FAIL_CLOSED_PATHS = [/^\/api\/auth\//, /^\/api\/trpc\//];

function shouldFailClosed(path: string): boolean {
  return FAIL_CLOSED_PATHS.some((re) => re.test(path));
}

function pickClient(path: string) {
  if (path.startsWith("/apply/"))    return publicForm;
  if (path.startsWith("/api/auth/")) return authEndpoint;
  if (path.startsWith("/api/trpc/")) return mutation;
  return publicShield;
}

export async function proxy(req: NextRequest) {
  const aj = pickClient(req.nextUrl.pathname);

  try {
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      // Optional: redirect to a friendly page for public routes.
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: "TOO_MANY_REQUESTS" }, { status: 429 });
      }
      if (decision.reason.isBot()) {
        return NextResponse.json({ error: "BOT_BLOCKED" }, { status: 403 });
      }
      if (decision.reason.isEmail()) {
        return NextResponse.json({ error: "EMAIL_REJECTED", detail: decision.reason }, { status: 400 });
      }
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.next();
  } catch (err) {
    Sentry.captureException(err, { tags: { arcjet: "errored" } });
    if (shouldFailClosed(req.nextUrl.pathname)) {
      return NextResponse.json({ error: "SECURITY_BACKEND_UNAVAILABLE" }, { status: 503 });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 6.4 In-procedure rate limit (defense in depth)

For tRPC procedures that call `runAITask` or perform high-cost work, the procedure also applies Arcjet's per-user rate limit inside the handler. This is in addition to the proxy-level rate limit.

```ts
import { aiEndpoint } from "@ogs/security/arcjet";

export const askTutorRouter = createTRPCRouter({
  ask: protectedProcedure
    .input(z.object({ courseId: z.string(), question: z.string().max(2000) }))
    .mutation(async ({ ctx, input }) => {
      // Convert the tRPC fetch Request into a NextRequest-compatible object.
      // Arcjet accepts the bare Request.
      const decision = await aiEndpoint.protect(ctx.req, {
        requested: 1,
        characteristics: { "http.request.headers.x-ogs-user-id": ctx.session.user.id },
      });
      if (decision.isDenied()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "QUOTA_EXCEEDED:AI_CALL_PER_DAY" });
      }
      return runAITask("COURSE_TUTOR_V1", { ... }, { task: "COURSE_TUTOR_V1", userId: ctx.session.user.id });
    }),
});
```

### 6.5 Failure policy

- **Read-only public routes (publicShield):** fail OPEN on Arcjet errors so a transient Arcjet outage does not take the marketing site down. Log to Sentry with tag `arcjet: errored`.
- **Auth and mutation routes:** fail CLOSED. A 503 is preferable to letting an unprotected mutation through.
- **AI endpoints:** fail CLOSED. Cost runaway is the bigger risk.

### 6.6 What Arcjet does NOT replace

Arcjet sits in front of these; it is additive, not a substitute:

- **Better Auth's CSRF + session checks.** Auth correctness lives in Better Auth.
- **tRPC's authorization (`protectedProcedure` / `tenantProcedure` etc.).** Authorization decisions are still ours.
- **Webhook signature verification.** Arcjet is for inbound HTTP; vendor webhooks remain signature-verified per `SECURITY.md` §1 Gate 7.
- **Prisma extensions** (soft-delete, tenant-scope, audit). Database-layer invariants stand.
- **Cloudflare Turnstile.** Optional interactive challenge for the rare case Arcjet's bot score is borderline; gated on a feature flag (`OGS-FLAG-TURNSTILE`).
- **AI guardrails (`runAITask`).** PII + prompt-injection detection on outputs is still in `@ogs/ai/runtime`.

### 6.7 Env vars

Added to `.env.example` and `turbo.json#tasks.build.env`:

```
ARCJET_KEY=                          # one key per environment (dev / preview / staging / prod)
```

### 6.8 Owning agent and reviews

`packages/security/src/arcjet/**` is owned by the **Security Engineer**. Every change to a rule set requires Security Engineer + Architecture Reviewer + Code Reviewer approval. Adjusting a rate limit downward in production requires an additional Engineering Lead approval.

### 6.9 Monitoring

Arcjet decisions stream to the Arcjet console; OGS additionally pipes denied decisions to Sentry as tagged breadcrumbs (`arcjet.denied` events). A weekly dashboard in `admin.ogs-tc.com/security/arcjet` (Phase 9 task) surfaces:

- Top blocked IPs and ASNs.
- Top denied paths.
- Rate-limit hit ratios per endpoint.
- Email-validation rejections by category.

## 7. Version control of this file

Owned by the Security Engineer. Edits require Security Engineer + Architecture Reviewer + Engineering Lead approval. Version of this document: **v2** (Arcjet added).
