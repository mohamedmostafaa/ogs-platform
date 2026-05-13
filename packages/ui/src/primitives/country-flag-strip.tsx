/**
 * `CountryFlagStrip` — horizontal row of MENA country flags + caption.
 *
 * Centralizes flag ordering across the hero trust strip, the final CTA
 * footnote and the marketing footer. v1 uses unicode regional-indicator
 * emoji — same approach as `ogs-tc.com`.
 *
 * @see docs/design/careers-landing.md §3.2, §3.10, §3.11.
 */
import * as React from "react";

import { cn } from "../lib/cn";

/** ISO-3166-1 alpha-2 country codes supported on the careers surface. */
export type SupportedCountryCode = "EG" | "IQ" | "AE" | "SA" | "OM" | "LY";

/** Human-readable country names keyed by ISO code. */
const COUNTRY_NAME: Record<SupportedCountryCode, string> = {
  EG: "Egypt",
  IQ: "Iraq",
  AE: "UAE",
  SA: "KSA",
  OM: "Oman",
  LY: "Libya",
};

/**
 * Convert an ISO-3166-1 alpha-2 code to the matching unicode regional-
 * indicator emoji pair. Regional-indicator codepoints start at U+1F1E6
 * for `A` and run alphabetically, so we offset the char code by
 * `0x1F1E6 - 'A'.charCodeAt(0)` and emit two codepoints.
 */
function codeToFlagEmoji(code: SupportedCountryCode): string {
  const base = 0x1f1e6 - "A".charCodeAt(0);
  const first = code.charCodeAt(0) + base;
  const second = code.charCodeAt(1) + base;
  return String.fromCodePoint(first, second);
}

/** Public props for the `CountryFlagStrip` primitive. */
export interface CountryFlagStripProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered list of country codes to display. */
  countries: SupportedCountryCode[];
  /** Optional caption (e.g. "Regional Presence") rendered above the strip. */
  label?: string;
}

export const CountryFlagStrip = React.forwardRef<HTMLDivElement, CountryFlagStripProps>(
  ({ countries, label, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-2 text-[0.8125rem]", className)}
        {...rest}
      >
        {label ? (
          <span className="text-muted-foreground font-medium tracking-[0.1em] uppercase">
            {label}
          </span>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {countries.map((code) => {
            const name = COUNTRY_NAME[code];
            return (
              <li key={code} className="flex items-center gap-2">
                <span aria-label={name} role="img" className="text-[1.25rem] leading-none">
                  {codeToFlagEmoji(code)}
                </span>
                <span className="text-foreground/80">{name}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
CountryFlagStrip.displayName = "CountryFlagStrip";
