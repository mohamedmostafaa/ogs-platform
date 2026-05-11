<!--
OGS Pull Request — MANDATORY template.

Do not delete sections. Empty a section only if it is genuinely not applicable, and explain why.
A PR without the required sections will be rejected by CI.
-->

## Summary

<!-- One paragraph. What changes and why. -->

## Linked tasks

<!-- One task id per line, in the form OGS-NNN. CI checks that at least one is listed. -->

- OGS-NNN

## Blueprint references

<!-- One or more section ids that this PR implements or affects. -->

- §X.Y

## Stack currency

<!--
MANDATORY. Confirm you ran the version check and the result was acceptable.
-->

- [ ] I ran `pnpm version-check` at the start of this work.
- [ ] No package my code touches is RED or UNKNOWN in the latest check.
- [ ] I am writing against the canonical conventions for every major locked in blueprint §3.1.1 (Next.js 16 proxy.ts + async APIs; Prisma 7 `prisma-client` + `prisma.config.ts` + `@prisma/adapter-pg`; Vercel AI SDK v6 `generateText` with `output`; Inngest v4 triggers-in-options + `INNGEST_DEV=1` local; Stripe 22 `2026-03-25.dahlia`; Better Auth `@better-auth/oauth-provider`; ESLint 10 flat config; pnpm 11 `.npmrc` rules; next-intl 4 `requestLocale` + `NextIntlClientProvider`; stream-chat-react 14 `MessageComposer` + `WithComponents`; react-resizable-panels 4 `Group`/`Separator`; react-day-picker 10 `startMonth`/`endMonth`).

## Skills invoked

<!--
MANDATORY. List every superpowers:* skill you invoked while preparing this change.
CI fails the PR if this section is missing or empty.
-->

- superpowers:using-superpowers
- superpowers:...
- superpowers:...

## TASKS.md update

<!-- MANDATORY when this PR changes apps/** or packages/**. The diff must be in this PR. -->

- [ ] I have updated `TASKS.md` to mark the linked task(s).

## Security checklist (blueprint §23.9)

- [ ] Does this PR touch a sensitive table? If yes, the AuditLog row is emitted by the extension (no direct AuditLog writes).
- [ ] Does this PR add a new tRPC procedure? If yes, the right base procedure is used.
- [ ] Does this PR add a new webhook route? If yes, signature verification + idempotency on stored `WebhookEvent`.
- [ ] Does this PR add a new external API call? If yes, per-tenant secrets are in `SecretCredential`, not env vars.
- [ ] Does this PR log PII or secrets? If yes, scrubbed.
- [ ] Does this PR add a new env var? If yes, added to `.env.example` and `turbo.json#tasks.build.env`.

## Required reviewers

<!-- Per AGENTS.md §1 ownership table. The Code Reviewer is implied on every PR. -->

- @code-reviewer
- @...

## Tests

<!-- Describe the tests added. If no tests are needed, justify. -->

## Screenshots / recordings (UI changes only)

<!-- Attach. -->

## Rollback plan

<!-- One sentence describing how to revert. -->

---

_By submitting this PR I confirm I have read `AGENTS.md`, the relevant blueprint chapter, and the agent charter for my role._
