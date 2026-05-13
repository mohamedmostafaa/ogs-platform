/**
 * `BrowseTile` — generic browse-by-X tile for the careers landing.
 *
 * Renders an `<a>` tile: optional Lucide icon top-left + label + open-roles
 * count in muted style + trailing arrow that animates on hover. 1px border,
 * rounded corners, focus ring tied to the accent token. The `count` slot is
 * deliberately optional — when `undefined` no count text renders, so the
 * primitive serves both data-bound listings and copy-only navigation.
 *
 * @see docs/design/careers-landing.md §3.3 (Browse-by-role), §4 row 15.
 */
import { ArrowRight, type LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** Accent tone for the leading icon swatch. */
export type BrowseTileAccent = "teal" | "navy";

/** Public props for the `BrowseTile` primitive. */
export interface BrowseTileProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  /** Lucide icon component, or `null` to omit the icon slot entirely. */
  icon?: LucideIcon | null;
  /** Tile label rendered as the primary line. */
  label: string;
  /** Open-roles count. When defined, renders `<count> open roles`. */
  count?: number;
  /** Destination href — plain anchor target. */
  href: string;
  /** Accent tone for the icon. Defaults to `teal`. */
  accent?: BrowseTileAccent;
}

const accentClass: Record<BrowseTileAccent, string> = {
  teal: "text-accent",
  navy: "text-primary",
};

export const BrowseTile = React.forwardRef<HTMLAnchorElement, BrowseTileProps>(
  ({ icon: Icon, label, count, href, accent = "teal", className, ...rest }, ref) => {
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
        {Icon ? (
          <Icon aria-hidden="true" className={cn("h-7 w-7 shrink-0", accentClass[accent])} />
        ) : null}
        <span className="flex flex-1 flex-col gap-1">
          <span className="text-[1rem] leading-tight font-semibold">{label}</span>
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
BrowseTile.displayName = "BrowseTile";
