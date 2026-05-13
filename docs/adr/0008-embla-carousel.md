# ADR-0008: Adopt `embla-carousel-react` + `embla-carousel-autoplay` for marketing carousels

## Status

Proposed (2026-05-13)

## Context

Phase 02 PR A adds the generic marketing primitive set to `@ogs/ui`.
Two primitives in that set need a real carousel engine:

1. **`HeroCarousel`** — full-bleed photographic hero with multiple
   slides, used as the image layer of `MarketingHero` when more than
   one slide is passed. Needs: keyboard navigation, swipe on touch,
   `prefers-reduced-motion` handling, RTL support, and a way to
   cross-fade or slide between images without a layout thrash.
2. **`LogoMarquee`** — auto-scrolling grayscale logo row used on the
   careers landing trust strip and testimonial section (§3.8). Needs:
   continuous loop autoplay, pause-on-hover, dragFree manual scrolling
   when autoplay is suppressed, and a no-autoplay fallback under
   reduced motion.

Charter rule 8 (`packages/ui` may not introduce new runtime deps
without an ADR) gates the merge. This document is that gate.

## Decision

Adopt the two-package Embla split:

- **`embla-carousel-react`** — the headless carousel core + React hook
  (`useEmblaCarousel`).
- **`embla-carousel-autoplay`** — the official autoplay plugin,
  consumed only inside `LogoMarquee`.

Both packages land as direct dependencies of `@ogs/ui`. Consumers
(apps, feature modules) never import Embla directly — they import
`HeroCarousel` / `LogoMarquee` from `@ogs/ui/primitives`.

Status is **Proposed**; sign-off from the architecture reviewer is the
gate to flip this to `Accepted`.

## Consequences

- ✅ Headless API — Embla ships no opinionated DOM or CSS, so it
  composes cleanly with our Tailwind v4 + shadcn "new-york" tokens
  without an override layer.
- ✅ Accessibility primitives are built in: focusable slides, keyboard
  navigation (arrow keys + Home/End), `prefers-reduced-motion`
  detection hooks, and a `direction: "rtl"` option for Arabic.
- ✅ Shadcn's `carousel` recipe is an Embla wrapper
  (https://ui.shadcn.com/docs/components/carousel, retrieved 2026-05-13).
  Aligns with our "stay on the shadcn path" rule — not a first-party
  shadcn primitive, but the canonical recipe.
- ✅ MIT license (verified via `pnpm view embla-carousel-react license`
  on 2026-05-13). Widely used (npm-trends.com → embla-carousel-react,
  retrieved 2026-05-13). Zero runtime deps of its own beyond a small
  reactive-utils first-party helper (the core is ~10 kB gz per
  bundlephobia.com/package/embla-carousel-react@8.6.0, retrieved
  2026-05-13).
- ✅ The two-package split is the canonical pattern Embla documents:
  the autoplay plugin is opt-in by importing it, so `HeroCarousel`
  (which never autoplays) pays zero bytes for autoplay code.
- ⚠️ Two packages instead of one. Mitigated: only `LogoMarquee`
  imports `embla-carousel-autoplay`, and re-implementing autoplay
  manually would re-create the same surface (timer + pause-on-hover +
  reduced-motion guard) with worse test coverage.
- ⚠️ Locks marketing carousels to an external library. Mitigated:
  both consumers are wrapped behind primitives we own
  (`HeroCarousel`, `LogoMarquee`), so a future swap is a single-file
  change per primitive.

## Alternatives considered

1. **Swiper.** Larger bundle (~35 kB gz core), opinionated DOM and
   CSS that fights Tailwind, and a license change in v9 that requires
   ongoing review. Rejected.
2. **Keen-Slider.** Comparable feature set, MIT, smaller community —
   fewer Stack Overflow answers and fewer Next.js + RTL bug reports
   surfaced in 2025/2026. Rejected on ecosystem depth alone.
3. **Hand-rolled.** A `setInterval` + `transform: translateX` marquee
   plus a `<button>`-driven hero slider. Rejected — re-implements
   keyboard nav, RTL flip, reduced-motion handling, and pause-on-hover
   that Embla gives us for free, with worse a11y and zero shared
   bug-fix surface.
4. **Native `scroll-snap`.** No JS, but no programmatic
   "advance to next slide" trigger for the hero, no autoplay, and the
   reduced-motion fallback path needs JS anyway. Rejected for the
   hero use case; the `LogoMarquee` reduced-motion branch already
   uses a `scroll-snap`-style overflow-x layout as its fallback.

## Consumers

- `packages/ui/src/primitives/hero-carousel.tsx` — `useEmblaCarousel`
  with `loop: true`, no autoplay.
- `packages/ui/src/primitives/logo-marquee.tsx` — `useEmblaCarousel`
  with `loop: true, dragFree: true, align: "start"` plus
  `Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true })`.
  Autoplay is suppressed entirely under `prefers-reduced-motion`.

## Rollback

`git revert` the commit that adds the dependency. Both consumers
(`HeroCarousel` + `LogoMarquee`) are isolated to
`packages/ui/src/primitives/`. Removing them via revert leaves the
rest of the marketing primitive set intact; the only downstream
surfaces would be the careers landing page sections that opted into
those two primitives, which would fall back to single-slide static
renders (`MarketingHero` already takes a `slides.length === 1`
short-circuit path that renders a plain `<img>`).

**Estimated rollback cost:** ≈ 1 dev-day to revert + restore the
single-slide static-render path on every consumer + replace any
in-flight `<LogoMarquee>` usage with a static logo row using
`overflow-x: auto` + CSS `scroll-snap` (the reduced-motion fallback
already implemented in `logo-marquee.tsx` is the model). No data
migration, no API surface change.
