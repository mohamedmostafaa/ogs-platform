/**
 * `SectionShell` — semantic marketing `<section>` wrapper with eyebrow,
 * H2, lede, and a content slot.
 *
 * Keeps the careers landing section rhythm consistent: every section is
 * an aria-labelled landmark with a kicker, a heading, and an optional
 * lede paragraph above its content body.
 *
 * @see docs/design/careers-landing.md §3 (section-by-section), §2 (visual system).
 */
import * as React from "react";

import { cn } from "../lib/cn";

/** Surface variants mapping to token-driven background + foreground pairs. */
export type SectionShellSurface = "default" | "muted" | "navy";

/** Public props for the `SectionShell` primitive. */
export interface SectionShellProps extends React.HTMLAttributes<HTMLElement> {
  /** Uppercase tracked kicker label above the heading. */
  eyebrow?: string;
  /** Section heading text rendered as the section's H2. */
  title: string;
  /** Optional supporting paragraph below the heading. */
  lede?: string;
  /** Horizontal alignment of the header block. Defaults to `start`. */
  align?: "center" | "start";
  /**
   * Token-driven surface variant.
   * - `default` → `bg-background text-foreground`
   * - `muted`   → `bg-muted text-foreground`
   * - `navy`    → `bg-primary text-primary-foreground`
   */
  surface?: SectionShellSurface;
  /** Stable id used to wire `aria-labelledby` to the section heading. */
  id?: string;
  children: React.ReactNode;
}

const surfaceClass: Record<SectionShellSurface, string> = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  navy: "bg-primary text-primary-foreground",
};

export const SectionShell = React.forwardRef<HTMLElement, SectionShellProps>(
  (
    {
      eyebrow,
      title,
      lede,
      align = "start",
      surface = "default",
      id,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // Auto-generate a stable id when the caller omits one; aria-labelledby
    // still needs to bind to a real DOM id.
    const reactId = React.useId();
    const sectionId = id ?? `section-${reactId}`;
    const titleId = `${sectionId}-title`;

    const isCentered = align === "center";

    return (
      <section
        ref={ref}
        id={sectionId}
        aria-labelledby={titleId}
        className={cn("w-full py-16 md:py-22", surfaceClass[surface], className)}
        {...rest}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <header
            className={cn(
              "flex flex-col gap-3",
              isCentered ? "items-center text-center" : "items-start text-start",
            )}
          >
            {eyebrow ? (
              <span
                className={cn(
                  "text-[0.75rem] font-semibold tracking-[0.1em] uppercase",
                  surface === "navy" ? "text-accent" : "text-accent",
                )}
              >
                {eyebrow}
              </span>
            ) : null}
            <h2
              id={titleId}
              className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-tight"
            >
              {title}
            </h2>
            {lede ? (
              <p
                className={cn(
                  "max-w-2xl text-[0.9375rem] leading-[1.55]",
                  surface === "navy" ? "text-primary-foreground/85" : "text-muted-foreground",
                )}
              >
                {lede}
              </p>
            ) : null}
          </header>
          <div className="mt-10">{children}</div>
        </div>
      </section>
    );
  },
);
SectionShell.displayName = "SectionShell";
