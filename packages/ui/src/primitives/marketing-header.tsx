/**
 * `MarketingHeader` — sticky public-marketing site header.
 *
 * Sticky on scroll; gains a thin teal keyline + drop shadow once
 * `scrollY > 8`. The keyline state is driven by a single passive
 * scroll listener debounced through `requestAnimationFrame` so there
 * is no per-pixel re-render.
 *
 * Renders no `next/link` imports — primitives don't peer-depend on
 * `next`. Consumers wrap nav links via the `asChild` pattern if they
 * need client routing.
 *
 * @see docs/design/careers-landing.md §3.1.
 */
"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/** A single primary-nav entry. */
export interface MarketingHeaderNavItem {
  /** Visible link label. */
  label: string;
  /** Destination href — plain anchor target. */
  href: string;
}

/** Public props for the `MarketingHeader` primitive. */
export interface MarketingHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo home href. Defaults to `/`. */
  logoHref?: string;
  /** Primary nav links rendered to the right of the logo (LTR). */
  nav: MarketingHeaderNavItem[];
  /** Optional right-aligned cluster — typically sign-in + primary CTA. */
  rightCluster?: React.ReactNode;
}

export const MarketingHeader = React.forwardRef<HTMLElement, MarketingHeaderProps>(
  ({ logoHref = "/", nav, rightCluster, className, children, ...rest }, ref) => {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        // rAF-debounce — coalesce paint reads to one per frame.
        frame = window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 8);
          frame = 0;
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (frame) window.cancelAnimationFrame(frame);
      };
    }, []);

    return (
      <header
        ref={ref}
        className={cn(
          "bg-primary text-primary-foreground sticky top-0 z-40 w-full transition-shadow",
          scrolled && "ring-accent/30 shadow-md ring-1",
          className,
        )}
        {...rest}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 px-6">
          <a
            href={logoHref}
            className="focus-visible:ring-ring text-base font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {children ?? "OGS Careers"}
          </a>
          <nav aria-label="Primary" className="hidden flex-1 md:block">
            <ul className="flex items-center gap-6">
              {nav.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <a
                    href={item.href}
                    className="text-primary-foreground/85 hover:text-accent focus-visible:ring-ring text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-3">{rightCluster}</div>
        </div>
      </header>
    );
  },
);
MarketingHeader.displayName = "MarketingHeader";
