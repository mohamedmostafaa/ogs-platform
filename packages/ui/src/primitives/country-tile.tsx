/**
 * `CountryTile` — country-flag specialization of `BrowseTile`.
 *
 * Visually identical to `BrowseTile` but swaps the icon for the country's
 * regional-indicator emoji. Renders an `<a>` tile with: flag accent on the
 * leading edge + country name + open-roles count + trailing arrow.
 *
 * @see docs/design/careers-landing.md §3.5 (Browse-by-country), §4 row 16.
 */
import { ArrowRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** ISO-3166-1 alpha-2 codes for the six MENA markets on the careers surface. */
export type CountryTileCode = "EG" | "IQ" | "AE" | "SA" | "OM" | "LY";

/** Public props for the `CountryTile` primitive. */
export interface CountryTileProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  /** ISO-3166-1 alpha-2 country code surfaced as a flag emoji. */
  country: CountryTileCode;
  /** Human-readable country name (e.g. "Egypt"). */
  name: string;
  /** Open-roles count. When defined, renders `<count> open roles`. */
  count?: number;
  /** Destination href — plain anchor target. */
  href: string;
}

// Convert ISO alpha-2 to the matching unicode regional-indicator pair.
function codeToFlagEmoji(code: CountryTileCode): string {
  const base = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(code.charCodeAt(0) + base, code.charCodeAt(1) + base);
}

export const CountryTile = React.forwardRef<HTMLAnchorElement, CountryTileProps>(
  ({ country, name, count, href, className, ...rest }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "group bg-background text-foreground border-border hover:border-accent/60 focus-visible:ring-ring relative flex h-full items-center gap-4 rounded-lg border p-5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          className,
        )}
        {...rest}
      >
        <span aria-label={name} role="img" className="text-[2rem] leading-none">
          {codeToFlagEmoji(country)}
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="text-[1rem] leading-tight font-semibold">{name}</span>
          {count !== undefined ? (
            <span className="text-muted-foreground text-[0.8125rem] font-medium">
              {count} open {count === 1 ? "role" : "roles"}
            </span>
          ) : null}
        </span>
        <ArrowRight
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-accent h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        />
      </a>
    );
  },
);
CountryTile.displayName = "CountryTile";
