# ADR-0007: Agent-avatar artwork ships as inline-SVG React components, not `.svg` files

## Status

Accepted (2026-05-13)

## Context

Blueprint §9.4 calls for "12 neutral geometric SVGs in
`src/assets/agent-avatars/`" and TASKS.md OGS-104 schedules a turbo
task to copy those files into each app's `public/` directory so
`<img src="/agent-avatars/N.svg">` resolves at runtime.

Two reasons that plan is suboptimal in 2026 / Next 16:

1. **Asset duplication.** Every app gets a copy of the same 12 SVGs in
   its `public/` — eight copies in this monorepo, with a turbo build
   task to keep them in sync. Drift risk every time the design team
   adds an avatar.
2. **Foregoes Next 16 import semantics.** Next.js 16 + Turbopack
   handle `import` of SVG-as-component natively (via a built-in SVGR
   when configured, or trivially via inline `<svg>` JSX). React 19
   server components ship the inline SVG with the HTML — no separate
   network round-trip, no FOUC, no cache header drift between apps.

The Phase-A audit reviewer flagged the missing OGS-100 SVG bundle as
a `SHOULD-FIX`. Rather than ship the original "copy 12 files to
8 apps" plan, we re-spec it.

## Decision

Ship the 12 agent avatars as **inline-SVG React components** exported
from `@ogs/ui/assets/agent-avatars/`:

- One file per avatar (`Avatar01.tsx` through `Avatar12.tsx`), each
  exporting a `React.FC<SVGProps<SVGSVGElement>>` that returns an
  inline `<svg>` element.
- An `index.ts` that exports each component by name AND a
  `pickAgentAvatar(slug: string): ComponentType<SVGProps>` helper
  that selects deterministically via a stable hash of the agent slug.
- `AgentAvatar` (the high-level branded component) gains a
  `glyphVariant?: "svg" | "letter"` prop, default `"svg"`. The "AI"
  pill stays `bg-primary text-primary-foreground` in BOTH variants —
  SECURITY.md rule "AgentAvatar must never be mistakable for a human
  user" holds regardless of variant.

OGS-104 (turbo asset-copy task) is **abandoned** with this ADR as the
reason. TASKS.md marks it `[-]` and links here.

## Consequences

- ✅ Single source of truth for the SVG artwork — one workspace, zero
  copies.
- ✅ Tree-shakeable: apps that don't render AgentAvatar don't ship the
  SVG bytes.
- ✅ Server components stream the SVG markup with the initial HTML —
  no extra network request, no `<img>` decode latency.
- ✅ TypeScript types each SVG component, so a stale `<Avatar99>`
  reference would be a compile error.
- ⚠️ Authoring needs hand-typed JSX (not a designer pasting `.svg`).
  Mitigation: each Avatar file is < 30 lines and the JSX is
  near-verbatim from the SVG export.
- ⚠️ Bundle weight: inline SVG is in JS, not a cached `.svg` file.
  Each avatar ≈ 600 B minified. 12 × 600 B = ~7 kB on the apps that
  import them — negligible.

## Alternatives considered

1. **Ship as `.svg` files, copy via turbo task to each app's `public/`**
   (the original blueprint § 9.4 plan). Rejected — see Context for
   the drift + duplication concerns.
2. **SVGR via Next.js `next.config.ts`.** Adds a webpack/turbopack
   loader for `.svg` imports. Rejected — adds a build-config knob
   per app vs. zero-config inline-JSX. Re-evaluate in Phase 02 if a
   non-trivial number of SVG assets appears.
3. **Sprite sheet (`<svg><use href>`).** Rejected — single point of
   failure for the entire sprite if one icon malforms. Inline-JSX
   per-avatar makes each one independent.

## Implementation plan

1. Write 12 `AvatarNN.tsx` files under
   `packages/ui/src/assets/agent-avatars/`.
2. Write `index.ts` with named exports + `pickAgentAvatar()` hash
   helper (use the same `stableHash` already in
   `packages/ui/src/avatar/agent-avatar.tsx`).
3. Update `AgentAvatar` to accept `glyphVariant?: "svg" | "letter"`
   (default `"svg"`). When `"svg"`, render
   `pickAgentAvatar(agent)` inside the colored square.
4. Update the `/ui-smoke` route to demo both variants side-by-side.
5. Mark OGS-100 done in TASKS.md; mark OGS-104 abandoned with link
   here.

## Rollback

`git revert` the commit. The `AgentAvatar`'s `glyphVariant` prop is
additive — removing it via revert leaves the previous letter-glyph
behavior intact. The 12 component files are isolated to
`packages/ui/src/assets/agent-avatars/` and have no consumers outside
`AgentAvatar`.
