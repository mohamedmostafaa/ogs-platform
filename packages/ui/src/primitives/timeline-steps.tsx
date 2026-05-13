/**
 * `TimelineSteps` — vertical numbered timeline for "how it works" rails.
 *
 * Used twice on the careers landing in the dual How-It-Works section
 * (§3.7). The affordance is the step NUMBER, not the color, so the
 * timeline is colorblind-safe.
 *
 * @see docs/design/careers-landing.md §3.7, §9 (a11y).
 */
import * as React from "react";

import { cn } from "../lib/cn";

/** A single step inside a `TimelineSteps`. */
export interface TimelineStepItem {
  /** Step heading, rendered as an H4. */
  title: string;
  /** Supporting paragraph under the step heading. */
  body: string;
}

/** Accent color of the numbered disc. */
export type TimelineStepsAccent = "teal" | "navy";

/** Public props for the `TimelineSteps` primitive. */
export interface TimelineStepsProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** Ordered list of timeline steps. Auto-numbered 1..N. */
  steps: TimelineStepItem[];
  /** Disc + keyline accent color. Defaults to `teal`. */
  accent?: TimelineStepsAccent;
  /** Accessible label describing the timeline for assistive tech. */
  "aria-label"?: string;
}

const accentBgClass: Record<TimelineStepsAccent, string> = {
  teal: "bg-accent text-accent-foreground",
  navy: "bg-primary text-primary-foreground",
};

const accentLineClass: Record<TimelineStepsAccent, string> = {
  teal: "bg-accent/30",
  navy: "bg-primary/30",
};

export const TimelineSteps = React.forwardRef<HTMLOListElement, TimelineStepsProps>(
  ({ steps, accent = "teal", className, ...rest }, ref) => {
    return (
      <ol ref={ref} className={cn("relative flex flex-col gap-8", className)} {...rest}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const stepNumber = index + 1;
          return (
            <li key={`${step.title}-${stepNumber}`} className="relative ps-14">
              {/* Vertical keyline between steps. Hidden on the final step. */}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-[19px] top-10 bottom-[-2rem] w-[2px]",
                    accentLineClass[accent],
                  )}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute start-0 top-0 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                  accentBgClass[accent],
                )}
              >
                {stepNumber}
              </span>
              <h4 className="text-foreground text-[1.125rem] leading-tight font-semibold">
                {step.title}
              </h4>
              <p className="text-muted-foreground mt-1 text-[0.9375rem] leading-[1.55]">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    );
  },
);
TimelineSteps.displayName = "TimelineSteps";
