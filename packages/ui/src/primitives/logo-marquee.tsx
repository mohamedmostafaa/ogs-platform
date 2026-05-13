/**
 * `LogoMarquee` — auto-scrolling grayscale logo row.
 *
 * Used on the careers landing testimonial section (§3.8) and on the
 * hero trust strip. Built on `embla-carousel-react` + `autoplay` in
 * loop mode. Reduced-motion users see a static, manually scrollable
 * row of three logos per viewport.
 *
 * @see docs/design/careers-landing.md §3.8, §9 (a11y).
 */
"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** A single logo entry in the marquee. */
export interface LogoMarqueeItem {
  /** Image source URL. */
  src: string;
  /** Accessible alt text — typically the company name. */
  alt: string;
  /** Optional outbound link. Consumers wrap with `<Link>` if needed. */
  href?: string;
}

/** Public props for the `LogoMarquee` primitive. */
export interface LogoMarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logos to display. Loop length depends on count. */
  logos: LogoMarqueeItem[];
  /**
   * Scroll speed in seconds for one full loop. Defaults to 30. Internally
   * converted to a per-slide autoplay delay of `(speedSec*1000)/logos.length`,
   * clamped to a 1500 ms floor — so a long `logos` list paired with a low
   * `speedSec` will silently saturate at the floor instead of speeding up.
   */
  speedSec?: number;
  /** Accessible label for the carousel landmark. */
  ariaLabel: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export const LogoMarquee = React.forwardRef<HTMLDivElement, LogoMarqueeProps>(
  ({ logos, speedSec = 30, ariaLabel, className, ...rest }, ref) => {
    const reducedMotion = useReducedMotion();

    // Autoplay speed approximation — embla autoplay uses `delay` (ms)
    // between transitions, so we divide the total loop time by slide count
    // to derive a per-slide step.
    const perSlideMs = Math.max(1500, Math.round((speedSec * 1000) / Math.max(logos.length, 1)));

    const plugins = React.useMemo(
      () =>
        reducedMotion
          ? []
          : [Autoplay({ delay: perSlideMs, stopOnInteraction: false, stopOnMouseEnter: true })],
      [perSlideMs, reducedMotion],
    );

    const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: "start" }, plugins);

    // Reduced-motion fallback: a static row with overflow-x scroll and
    // three-per-viewport sizing, no autoplay.
    if (reducedMotion) {
      return (
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          className={cn("w-full overflow-x-auto", className)}
          {...rest}
        >
          <ul className="flex items-center gap-10 px-4">
            {logos.map((logo, index) => (
              <li key={`${logo.src}-${index}`} className="shrink-0 basis-1/3">
                {renderLogo(logo)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className={cn("w-full", className)}
        {...rest}
      >
        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex items-center gap-10 px-4">
            {logos.map((logo, index) => (
              <li
                key={`${logo.src}-${index}`}
                className="shrink-0 grow-0 basis-1/2 sm:basis-1/3 md:basis-1/5"
              >
                {renderLogo(logo)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);
LogoMarquee.displayName = "LogoMarquee";

/** Render a single logo, optionally wrapped in a plain anchor. */
function renderLogo(logo: LogoMarqueeItem): React.ReactElement {
  const img = (
    <img
      src={logo.src}
      alt={logo.alt}
      className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
  );
  if (logo.href) {
    return (
      <a
        href={logo.href}
        className="focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {img}
      </a>
    );
  }
  return img;
}
