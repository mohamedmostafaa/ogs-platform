# Phase 07 — AI Proctoring + Oral Viva

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Ship SP-07 oral viva (assessor + worker on a Stream call, transcript piped to the attempt), SP-08 AI-proctored MCQ with anomaly detection, open-ended grading via ASSESSMENT_GRADE_V1, and the human reviewer queue in admin.

**Exit criterion.** Oral viva runs end-to-end and the assessor finalises a score that writes AssessmentAttempt.passed; AI-proctored MCQ records camera/screen anomalies to AssessmentAttempt.proctoringEvidenceUrl.

**Window.** Week 9.

**Owning agents.** @live-video-engineer, @ai-engineer, @api-engineer, @security-engineer, @code-reviewer.

**Prerequisites.** Phase 06 complete.

**Security gates that apply.** Gate 4 (audit), Gate 9 (logs), proctoring evidence append-only invariant..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-440 through OGS-462. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- Proctor server module — Blueprint §12.7.\n- ASSESSMENT_GRADE_V1 task — Blueprint §14.7.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
