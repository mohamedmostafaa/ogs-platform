/**
 * `HeroCarousel` — accessible autoplay image carousel.
 *
 * Powered by `embla-carousel-react` + `embla-carousel-autoplay`.
 * Honors `prefers-reduced-motion: reduce` (autoplay disabled), pauses
 * on hover and focus, supports arrow-key navigation with RTL-correct
 * semantics, and exposes carousel + slide roledescription metadata.
 *
 * @see docs/design/careers-landing.md §3.2, §4 (primitive shopping list).
 */
"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** A single slide rendered inside the carousel. */
export interface HeroCarouselSlide {
  /** Image source URL. */
  src: string;
  /** Accessible alt text for the slide image. */
  alt: string;
}

/** Public props for the `HeroCarousel` primitive. */
export interface HeroCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered list of slides. Must contain at least one slide. */
  slides: HeroCarouselSlide[];
  /** Autoplay interval in milliseconds. Defaults to 6000. */
  intervalMs?: number;
  /** Accessible label describing the carousel for assistive tech. */
  ariaLabel: string;
}

/**
 * Resolve `prefers-reduced-motion: reduce` at mount. SSR-safe — returns
 * `false` on the server and during the first paint, then re-resolves
 * after mount to gate autoplay.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export const HeroCarousel = React.forwardRef<HTMLDivElement, HeroCarouselProps>(
  ({ slides, intervalMs = 6000, ariaLabel, className, ...rest }, ref) => {
    const reducedMotion = useReducedMotion();

    // Autoplay plugin is rebuilt when motion preferences change so the
    // user can toggle the OS setting and have it take effect on remount.
    const autoplayPlugin = React.useMemo(
      () =>
        reducedMotion
          ? []
          : [Autoplay({ delay: intervalMs, stopOnInteraction: false, stopOnMouseEnter: true })],
      [intervalMs, reducedMotion],
    );

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, autoplayPlugin);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    React.useEffect(() => {
      if (!emblaApi) return;
      const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
      onSelect();
      emblaApi.on("select", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
      };
    }, [emblaApi]);

    /**
     * Arrow keys move the carousel. Under `dir="rtl"` the semantics
     * invert so `←` advances forward in reading order.
     */
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!emblaApi) return;
        const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (isRtl) emblaApi.scrollNext();
          else emblaApi.scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          if (isRtl) emblaApi.scrollPrev();
          else emblaApi.scrollNext();
        } else if (event.key === "Home") {
          event.preventDefault();
          emblaApi.scrollTo(0);
        } else if (event.key === "End") {
          event.preventDefault();
          emblaApi.scrollTo(slides.length - 1);
        }
      },
      [emblaApi, slides.length],
    );

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn("relative h-full w-full overflow-hidden focus:outline-none", className)}
        {...rest}
      >
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
                className="relative h-full w-full shrink-0 grow-0 basis-full"
              >
                <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {slides.length > 1 ? (
          <ul className="absolute start-1/2 bottom-4 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => {
              const isActive = index === selectedIndex;
              return (
                <li key={index}>
                  <button
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      isActive ? "bg-accent" : "bg-white/60 hover:bg-white",
                    )}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  },
);
HeroCarousel.displayName = "HeroCarousel";
