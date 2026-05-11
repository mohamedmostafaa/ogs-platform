# Phase 09 — Admin App + Payments Hardening

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Bring up every admin section listed in blueprint §4.3, implement Lemon Squeezy / Polar / PayMob adapters, the admin payment-provider switcher with 2FA step-up, refund + reverse ledger flow, the encryption envelope (AES-256-GCM with key rotation), and the workflow editor canvas.

**Exit criterion.** Admin can search any user, refund an order with a reverse ledger entry, switch the active payment provider per env/tenant/product (with 2FA), and replay any stored webhook from a stored WebhookEvent.

**Window.** Week 11.

**Owning agents.** @payments-engineer, @security-engineer, @frontend-feature-engineer, @inngest-engineer, @ui-engineer, @auth-engineer, @code-reviewer.

**Prerequisites.** Phase 08 complete.

**Security gates that apply.** All gates 1–10; 2FA step-up on switcher writes (SECURITY.md §0 rule 10)..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-500 through OGS-553. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- Provider router — Blueprint §19.1.\n- Unified checkout — Blueprint §19.2.\n- Lemon, Polar, PayMob adapters — Blueprint §19.4–§19.6.\n- Webhook receivers — Blueprint §19.7.\n- Admin switcher UI — Blueprint §19.8.\n- Refund + reverse ledger — Blueprint §19.9.\n- Encryption envelope — Blueprint §15.2.\n- Workflow editor — Blueprint §17.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
