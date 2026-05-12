# Phase 04 — Careers Vertical Slice

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Ship the worker-profile + cv-upload-parsing + employer-onboarding + jobs + applications + Flow K (public applicant) + candidate-search + ai-matching + interview-scheduling + Stripe-path-payments + notifications modules in apps/web-careers, end-to-end.

**Exit criterion.** An employer can post a job (with AI description), a worker can apply via the public Flow K link, an AI match score appears, the recruiter advances the stage and schedules an interview that opens in the live-video shell.

**Window.** Weeks 4–5.

**Owning agents.** @frontend-feature-engineer, @api-engineer, @ai-engineer, @inngest-engineer, @payments-engineer, @notifications-engineer, @ui-engineer, @qa-engineer, @code-reviewer.

**Prerequisites.** Phase 03 complete.

**Security gates that apply.** All gates 1–10. Flow K is a public route that creates accounts; rate-limit and captcha required (Gate 1 + Gate 2)..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-200 through OGS-282. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- modules/<x>/{schema, types, params, hooks, server, ui} canonical shape — Blueprint §4.4–§4.5.\n- Data fetching pattern — Blueprint Chapter 8.\n- Forms — Blueprint Chapter 10.\n- AI runtime — Blueprint §14.3.\n- CV_PARSE_V1 and JOB_MATCH_V1 prompt definitions — Blueprint §14.7.\n- Stripe adapter — Blueprint §19.3.\n- Notification orchestrator — Blueprint §18.

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

- OGS-247 Apply Arcjet `publicForm` on `apps/web-careers/src/app/(public)/apply/[slug]/page.tsx` (Flow K). Reject disposable-email applicants; rate-limit signups to 5 / 10 min / IP. See `SECURITY.md` §6.2.
- OGS-248 Apply Arcjet `mutation` token-bucket inside the `application.create` tRPC procedure (per-user) as defense in depth on top of the middleware. See `SECURITY.md` §6.4.
- OGS-249 Apply Arcjet `mutation` on `cv-upload-parsing` upload-presign tRPC procedure so CV-upload abuse is rate-limited per user. See `SECURITY.md` §6.4.
