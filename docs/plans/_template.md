# Phase NN — <Title>

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal.** One sentence describing what this phase produces.

**Exit criterion.** Concrete, testable statement that confirms the phase is done.

**Window.** Week N (or Weeks N-M).

**Owning agents.** Comma-separated list of primary owners.

**Prerequisites.** Phase IDs that must be `[x]` before this one starts.

---

## Tasks

### Task <OGS-NNN>: <Component Name>

**Files:**

- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:line-range`
- Test: `tests/exact/path/to/test.ts`

**Owner:** @role
**Blueprint:** §X.Y
**Security gate:** which gate(s) from `SECURITY.md` §1 apply

- [ ] **Step 1: Write the failing test**

```ts
// tests/...
```

- [ ] **Step 2: Run the test (expect FAIL)**

```bash
pnpm test ...
```

Expected output excerpt:

```
FAIL  tests/...
  ✕ <reason>
```

- [ ] **Step 3: Implement the minimal code**

```ts
// src/...
```

- [ ] **Step 4: Run the test (expect PASS)**

```bash
pnpm test ...
```

Expected output excerpt:

```
PASS  tests/...
```

- [ ] **Step 5: Update TASKS.md**

Change `OGS-NNN` to `[x]` and move to per-phase Done.

- [ ] **Step 6: Commit**

```bash
git add tests/... src/... TASKS.md
git commit -m "<type>(<scope>): <subject> [OGS-NNN.06]"
```

- [ ] **Step 7: Push and open PR**

Body per `.github/PULL_REQUEST_TEMPLATE.md`. Required reviewers per `AGENTS.md` §1.

---

## Done

(Move completed tasks here.)

---

## Retro

(Filled at phase end by the Engineering Lead.)
