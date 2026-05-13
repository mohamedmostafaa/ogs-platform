/**
 * `FeatureCard` — equal-height icon-top value-prop card.
 *
 * Single source of truth for value-prop cards across the careers
 * landing's "Why ogscareers.com" grid (§3.6) and analogous marketing
 * surfaces.
 *
 * @see docs/design/careers-landing.md §3.6, §4 (primitive shopping list).
 */
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** Accent color of the icon swatch at the card top. */
export type FeatureCardAccent = "teal" | "navy";

/** Public props for the `FeatureCard` primitive. */
export interface FeatureCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Lucide icon component rendered at 40px in the card's accent color. */
  icon: LucideIcon;
  /** Card title rendered as an H3. */
  title: string;
  /** Supporting body copy under the title. */
  body: string;
  /** Accent tone for the icon swatch. Defaults to `teal`. */
  accent?: FeatureCardAccent;
}

const accentClass: Record<FeatureCardAccent, string> = {
  teal: "text-accent",
  navy: "text-primary",
};

export const FeatureCard = React.forwardRef<HTMLElement, FeatureCardProps>(
  ({ icon: Icon, title, body, accent = "teal", className, ...rest }, ref) => {
    return (
      <article
        ref={ref}
        className={cn(
          "border-border bg-background flex h-full flex-col gap-3 rounded-lg border p-6",
          className,
        )}
        {...rest}
      >
        <Icon aria-hidden="true" className={cn("h-10 w-10", accentClass[accent])} />
        <h3 className="text-foreground text-[1.125rem] leading-tight font-semibold">{title}</h3>
        <p className="text-muted-foreground text-[0.9375rem] leading-[1.55]">{body}</p>
      </article>
    );
  },
);
FeatureCard.displayName = "FeatureCard";
