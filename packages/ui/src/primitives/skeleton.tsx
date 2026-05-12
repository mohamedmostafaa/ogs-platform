/**
 * `Skeleton` — loading placeholder rectangle.
 *
 * Use to mask data-fetch suspense boundaries with the right shape so
 * the layout doesn't jump when content arrives.
 *
 * @see https://ui.shadcn.com/docs/components/skeleton
 */
import * as React from "react";

import { cn } from "../lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />;
}
