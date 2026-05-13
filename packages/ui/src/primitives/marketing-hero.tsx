/**
 * `MarketingHero` — full-bleed photographic marketing hero.
 *
 * Lays a navy-to-transparent gradient over the photo, places the
 * headline cluster on the dark side (LTR: left, RTL: right via logical
 * `me-auto` / `ms-auto`), and slots the search bar and trust strip
 * beneath. Single-slide inputs render a static `<img>` to skip the
 * carousel weight; multi-slide inputs delegate to `<HeroCarousel>`.
 *
 * @see docs/design/careers-landing.md §3.2.
 */
"use client";

import * as React from "react";

import { cn } from "../lib/cn";

import { HeroCarousel, type HeroCarouselSlide } from "./hero-carousel";

/** Public props for the `MarketingHero` primitive. */
export interface MarketingHeroProps extends React.HTMLAttributes<HTMLElement> {
  /** Background image slides. Length 1 = static `<img>`; >1 = carousel. */
  slides: HeroCarouselSlide[];
  /** Uppercase tracked kicker label above the headline. */
  eyebrow: string;
  /** Hero H1 headline copy. */
  headline: string;
  /** Supporting paragraph beneath the headline. */
  sub: string;
  /** Required primary CTA node — consumer provides a `<Button>`. */
  primaryCta: React.ReactNode;
  /** Optional secondary CTA slot. */
  secondaryCta?: React.ReactNode;
  /** Optional trust-strip slot (e.g. country flags + client logos). */
  trustStrip?: React.ReactNode;
  /** Optional search-bar slot rendered directly under the sub copy. */
  searchBar?: React.ReactNode;
}

export const MarketingHero = React.forwardRef<HTMLElement, MarketingHeroProps>(
  (
    {
      slides,
      eyebrow,
      headline,
      sub,
      primaryCta,
      secondaryCta,
      trustStrip,
      searchBar,
      className,
      ...rest
    },
    ref,
  ) => {
    const firstSlide = slides[0];

    return (
      <section
        ref={ref}
        className={cn(
          "bg-primary text-primary-foreground relative isolate w-full overflow-hidden",
          "aspect-[4/5] md:aspect-[16/7]",
          className,
        )}
        {...rest}
      >
        {/* Image layer */}
        <div className="absolute inset-0 -z-20">
          {slides.length > 1 ? (
            <HeroCarousel slides={slides} ariaLabel="Hero image carousel" />
          ) : firstSlide ? (
            <img src={firstSlide.src} alt={firstSlide.alt} className="h-full w-full object-cover" />
          ) : null}
        </div>
        {/* Gradient overlay — token-driven via inline style is forbidden
            by primitive rules, so we use HSLA values inside a Tailwind
            arbitrary background-image utility (navy hue mirrors
            `--primary` under `[data-surface="careers"]`). Direction flips
            under RTL so the dark side always sits beneath the headline
            cluster (which uses logical `me-auto`). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(215_60%_14%_/_0.82),hsl(215_60%_14%_/_0.45))] rtl:bg-[linear-gradient(to_left,hsl(215_60%_14%_/_0.82),hsl(215_60%_14%_/_0.45))]"
        />
        {/* Content layer */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col justify-end px-6 py-10 md:justify-center">
          <div className="me-auto flex max-w-2xl flex-col gap-5 text-start rtl:ms-auto rtl:me-0">
            <span className="text-accent text-[0.75rem] font-semibold tracking-[0.1em] uppercase">
              {eyebrow}
            </span>
            <h1 className="text-[clamp(2.25rem,4vw,3rem)] leading-tight font-bold tracking-tight">
              {headline}
            </h1>
            <p className="text-primary-foreground/85 max-w-xl text-[1rem] leading-[1.5]">{sub}</p>
            {searchBar ? <div className="mt-2">{searchBar}</div> : null}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {primaryCta}
              {secondaryCta}
            </div>
          </div>
          {trustStrip ? <div className="mt-8 md:mt-10">{trustStrip}</div> : null}
        </div>
      </section>
    );
  },
);
MarketingHero.displayName = "MarketingHero";
