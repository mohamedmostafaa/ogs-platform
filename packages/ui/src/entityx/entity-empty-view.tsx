/**
 * `EntityEmptyView` — friendly placeholder shown when a list is empty.
 *
 * Use cases:
 *   - No items yet (post-onboarding) → with a primary CTA.
 *   - No items matching the current filter → with a secondary clear button.
 *   - Loading / error states use Skeleton / Alert instead.
 */
import * as React from "react";

import { cn } from "../lib/cn";

export interface EntityEmptyViewProps {
  /** Optional icon element (Lucide icon recommended, ~48px). */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** CTA buttons. */
  action?: React.ReactNode;
  className?: string;
}

export function EntityEmptyView({
  icon,
  title,
  description,
  action,
  className,
}: EntityEmptyViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-base font-medium">{title}</h3>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
