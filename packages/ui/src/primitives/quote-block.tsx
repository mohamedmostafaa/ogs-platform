/**
 * `QuoteBlock` — centered single-quote testimonial module.
 *
 * Renders a real `<blockquote>` + `<cite>` pair so search engines and
 * assistive tech recognise the attribution. Used on the careers
 * landing testimonial section (§3.8).
 *
 * @see docs/design/careers-landing.md §3.8, §9 (a11y).
 */
import * as React from "react";

import { cn } from "../lib/cn";

/** Public props for the `QuoteBlock` primitive. */
export interface QuoteBlockProps extends React.HTMLAttributes<HTMLElement> {
  /** Quotation body — rendered inside the `<blockquote>`. */
  quote: string;
  /** Speaker's display name. */
  name: string;
  /** Speaker's role / job title. */
  role: string;
  /** Organization the speaker represents. */
  org: string;
  /** Country, surfaced in the attribution line. */
  country: string;
  /** Optional avatar image source for the speaker. */
  avatarSrc?: string;
}

export const QuoteBlock = React.forwardRef<HTMLElement, QuoteBlockProps>(
  ({ quote, name, role, org, country, avatarSrc, className, ...rest }, ref) => {
    return (
      <figure
        ref={ref}
        className={cn(
          "mx-auto flex w-full max-w-[880px] flex-col items-center text-center",
          className,
        )}
        {...rest}
      >
        <blockquote className="text-[clamp(1.5rem,2.5vw,1.875rem)] leading-[1.4] font-medium italic">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="mt-6 flex flex-col items-center gap-3">
          {avatarSrc ? (
            // Plain <img> — primitives don't peer-depend on `next/image`.
            // Consumers wrap with `<Image>` if they want optimization.
            <img
              src={avatarSrc}
              alt=""
              aria-hidden="true"
              className="border-border h-14 w-14 rounded-full border object-cover"
            />
          ) : null}
          <cite className="text-[0.9375rem] leading-[1.55] not-italic">
            <span className="font-semibold">{name}</span>
            <span className="text-muted-foreground">
              {", "}
              {role}, {org}, {country}
            </span>
          </cite>
        </figcaption>
      </figure>
    );
  },
);
QuoteBlock.displayName = "QuoteBlock";
