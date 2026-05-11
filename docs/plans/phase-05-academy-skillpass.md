# Phase 05 — Academy + SkillPass

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Ship the courses, lessons (Bunny VOD), enrollments (Flow G pre/post loop), live-cohort sessions, MCQ + scenario assessments, certifications, and instructor / assessor portals. Bilingual certificate PDFs render correctly in EN and AR.

**Exit criterion.** A worker enrolls in a course, takes the pre-assessment, watches a Bunny-served lesson, attends a live cohort session, takes the post-assessment, sees their learning gain, and downloads a bilingual certificate PDF.

**Window.** Weeks 6–7.

**Owning agents.** @frontend-feature-engineer, @files-vod-engineer, @api-engineer, @inngest-engineer, @ai-engineer, @ui-engineer, @i18n-engineer, @code-reviewer.

**Prerequisites.** Phase 04 complete.

**Security gates that apply.** All gates 1–10. Bunny signed playback URLs are sensitive (Gate 3); proctoring evidence is append-only (Gate 4)..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-300 through OGS-382. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- Bunny.net Stream client — Blueprint §11.5.\n- Bunny webhook receiver — Blueprint §11.6.\n- VOD player — Blueprint §11.7.\n- Flow G pedagogy — Blueprint Chapter 25 Flow G.\n- Bilingual certificate PDF — Blueprint §21.6.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
