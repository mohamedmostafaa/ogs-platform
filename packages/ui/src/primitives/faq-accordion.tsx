/**
 * `FaqAccordion` — a11y wrapper over the shadcn `Accordion`.
 *
 * Wraps the underlying Radix Accordion in a `<section>` and renders
 * plus/minus iconography (instead of the default chevron) keyed to
 * open/closed state. The first item opens by default unless the
 * caller pins one explicitly. Accessibility is provided by Radix
 * Accordion's built-in `aria-expanded` on triggers and `region` role
 * on content panels — no `<dl>`/`<dt>`/`<dd>` wrapping needed (those
 * are not valid direct children of the Radix-wrapped item anyway).
 *
 * @see docs/design/careers-landing.md §3.9.
 */
"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/** A single FAQ entry. */
export interface FaqAccordionItem {
  /** Stable identifier — used as the Radix accordion item value. */
  id: string;
  /** Question text rendered as the trigger label. */
  q: string;
  /** Answer body rendered in the expandable panel. */
  a: string;
}

/** Public props for the `FaqAccordion` primitive. */
export interface FaqAccordionProps {
  /** Ordered list of FAQ items. */
  items: FaqAccordionItem[];
  /** Item id to expand on first paint. Defaults to the first item's id. */
  defaultOpenId?: string;
  /** Accessible label describing the FAQ region. */
  ariaLabel?: string;
}

export const FaqAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  FaqAccordionProps
>(({ items, defaultOpenId, ariaLabel }, ref) => {
  const firstId = items[0]?.id;
  const initialOpen = defaultOpenId ?? firstId;

  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="single"
      collapsible
      defaultValue={initialOpen}
      aria-label={ariaLabel}
      className="mx-auto flex w-full max-w-[880px] flex-col"
    >
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.id} value={item.id} className="border-border border-b">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(
                "group text-foreground hover:text-accent focus-visible:ring-ring flex flex-1 items-center justify-between gap-4 py-5 text-start text-[1.0625rem] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              <span>{item.q}</span>
              <Plus
                aria-hidden="true"
                className="text-accent h-5 w-5 shrink-0 transition-opacity group-data-[state=open]:hidden"
              />
              <Minus
                aria-hidden="true"
                className="text-accent hidden h-5 w-5 shrink-0 transition-opacity group-data-[state=open]:block"
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-[0.9375rem] leading-[1.55]">
            <div className="pb-5">{item.a}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
});
FaqAccordion.displayName = "FaqAccordion";
