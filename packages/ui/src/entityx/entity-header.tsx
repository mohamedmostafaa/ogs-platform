/**
 * `EntityHeader` — page header for any entity list / detail surface.
 *
 * Renders a title, optional description, and an action slot on the
 * right (typically primary CTA + filter button).
 */
import * as React from "react";

import { cn } from "../lib/cn";

export interface EntityHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned slot (buttons, filters, search). */
  actions?: React.ReactNode;
  className?: string;
}

export function EntityHeader({ title, description, actions, className }: EntityHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4 pb-6", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
