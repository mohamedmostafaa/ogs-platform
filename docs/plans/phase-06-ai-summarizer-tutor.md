# Phase 06 — AI Summarizer + Tutor

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Ship the summarize-live-session Inngest function, the RAG retrieval pipeline, the in-course AI tutor (Stream Chat webhook → runAITask), the runAITask runtime, the prompt registry, and guardrails.

**Exit criterion.** A completed cohort session produces a saved Markdown summary; a worker chats with the AI tutor inside a course and receives RAG-grounded answers tagged with prompt id and cost recorded in AIInteraction.

**Window.** Week 8.

**Owning agents.** @ai-engineer, @inngest-engineer, @live-video-engineer, @security-engineer, @code-reviewer.

**Prerequisites.** Phase 05 complete.

**Security gates that apply.** Gate 9 (no PII in logs), guardrails are a SECURITY.md §0 standing rule..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-400 through OGS-424. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- summarize-live-session Inngest fn — Blueprint §13.5.\n- runAITask runtime — Blueprint §14.3.\n- Handlebars + prompt registry — Blueprint §14.2.\n- Guardrails — Blueprint §14.4.\n- RAG retrieve + embed — Blueprint §14.5.\n- AI cost rate table — Blueprint §14.6.

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

- OGS-425  Wrap every `runAITask`-consuming tRPC procedure with the in-handler Arcjet `aiEndpoint` token bucket (`refillRate: 10`, `interval: 1m`, `capacity: 20`). The middleware-level limit stays; this is defense in depth aligned to the per-MAU AI cost budget. See `SECURITY.md` §6.4.
- OGS-426  Apply the same `aiEndpoint` rule set to AI-consuming Inngest function steps via an Arcjet decision on the originating user id stored on the event payload.

## stream-chat-react v14 migration notes

When implementing the in-call AI tutor (AC-20), use the v14 names:

- `MessageInput` is now `MessageComposer`. Hook `useMessageInputContext` is `useMessageComposerContext`.
- `Channel` no longer accepts component override props directly. Wrap with `<WithComponents overrides={{ ... }}>` and pass overrides there.
- `ChannelList` no longer injects default query limits — pass `filters`, `sort`, `options.limit` explicitly.
- `withChannelStateContext` / `withChatContext` / `withMessageContext` HOC wrappers are removed. Use `useChannelStateContext` / `useChatContext` / `useMessageContext` hooks instead.
- `ChannelPreview` → `ChannelListItem`. `ChannelListMessenger` → `ChannelListUI`.
