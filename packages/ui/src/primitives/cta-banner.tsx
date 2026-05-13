/**
 * `CtaBanner` — full-bleed colored banner with dual CTA cluster.
 *
 * Used on the careers landing final CTA section (§3.10) and on future
 * `/employers` / `/workers` surfaces. Two-column desktop, stacked on
 * mobile. Optional footnote rendered beneath the buttons.
 *
 * @see docs/design/careers-landing.md §3.10.
 */
import * as React from "react";

import { cn } from "../lib/cn";

/** Surface variant — `navy` for the careers final CTA, `accent` for teal. */
export type CtaBannerSurface = "navy" | "accent";

/** Public props for the `CtaBanner` primitive. */
export interface CtaBannerProps extends React.HTMLAttributes<HTMLElement> {
  /** Token-driven surface variant. */
  surface: CtaBannerSurface;
  /** Banner heading rendered at H2 visual size. */
  title: string;
  /** Supporting paragraph beneath the heading. */
  sub: string;
  /** Primary CTA node — consumer provides a `<Button>`. */
  primaryCta: React.ReactNode;
  /** Optional secondary CTA slot. */
  secondaryCta?: React.ReactNode;
  /** Optional footnote (e.g. country list) rendered beneath the buttons. */
  footnote?: React.ReactNode;
}

const surfaceClass: Record<CtaBannerSurface, string> = {
  navy: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
};

export const CtaBanner = React.forwardRef<HTMLElement, CtaBannerProps>(
  ({ surface, title, sub, primaryCta, secondaryCta, footnote, className, ...rest }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("w-full py-16 md:py-22", surfaceClass[surface], className)}
        {...rest}
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="flex flex-col gap-3 md:max-w-2xl">
            <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-[1rem] leading-[1.5] opacity-90">{sub}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap items-center gap-3">
              {primaryCta}
              {secondaryCta}
            </div>
            {footnote ? (
              <div className="text-[0.8125rem] font-medium tracking-[0.1em] uppercase opacity-80">
                {footnote}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  },
);
CtaBanner.displayName = "CtaBanner";
