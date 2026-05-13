/**
 * `MarketingFooter` — public-marketing site footer.
 *
 * Five-column desktop layout collapsing to per-column accordion items
 * on mobile via the shared `@ogs/ui` `Accordion` primitive.
 * Renders an optional bottom strip (flag row provided by the consumer
 * via `children`) above the legal row.
 *
 * @see docs/design/careers-landing.md §3.11.
 */
"use client";

import * as React from "react";

import { cn } from "../lib/cn";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

/** A single link inside a footer column. */
export interface MarketingFooterLink {
  label: string;
  href: string;
}

/** A single footer column. */
export interface MarketingFooterColumn {
  /** Stable identifier — also used as the mobile accordion item value. */
  id: string;
  /** Column heading. */
  label: string;
  /** Links rendered under the heading. */
  links: MarketingFooterLink[];
}

/** Legal row — copyright text + a row of small footer links. */
export interface MarketingFooterLegal {
  copyright: string;
  links: MarketingFooterLink[];
}

/** Public props for the `MarketingFooter` primitive. */
export interface MarketingFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered list of footer columns — typically 5. */
  columns: MarketingFooterColumn[];
  /** Legal row at the bottom of the footer. */
  legal: MarketingFooterLegal;
  /**
   * Optional slot rendered above the legal row — typically a
   * `<CountryFlagStrip>` or equivalent regional-presence band.
   */
  children?: React.ReactNode;
}

export const MarketingFooter = React.forwardRef<HTMLElement, MarketingFooterProps>(
  ({ columns, legal, children, className, ...rest }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn("bg-primary text-primary-foreground w-full", className)}
        {...rest}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 py-12">
          {/* Desktop: 5-col grid. Mobile: accordion. */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-8">
            {columns.map((col) => (
              <FooterColumn key={col.id} column={col} />
            ))}
          </div>
          <div className="md:hidden">
            <Accordion type="single" collapsible className="flex flex-col">
              {columns.map((col) => (
                <AccordionItem
                  key={col.id}
                  value={col.id}
                  className={cn("border-primary-foreground/15")}
                >
                  <AccordionTrigger className="text-start text-sm font-semibold tracking-wide uppercase">
                    {col.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-2">
                      {col.links.map((link) => (
                        <li key={`${col.id}-${link.href}`}>
                          <FooterLink {...link} />
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {children ? (
            <div className="border-primary-foreground/15 mt-10 flex w-full justify-center border-t pt-8">
              {children}
            </div>
          ) : null}

          <div className="border-primary-foreground/15 text-primary-foreground/75 mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 text-[0.8125rem] md:flex-row md:items-center">
            <p>{legal.copyright}</p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legal.links.map((link) => (
                <li key={`legal-${link.href}`}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    );
  },
);
MarketingFooter.displayName = "MarketingFooter";

/** Render a single footer column on desktop. */
function FooterColumn({ column }: { column: MarketingFooterColumn }): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase">{column.label}</h3>
      <ul className="flex flex-col gap-2">
        {column.links.map((link) => (
          <li key={`${column.id}-${link.href}`}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Render a single footer link. */
function FooterLink({ label, href }: MarketingFooterLink): React.ReactElement {
  return (
    <a
      href={href}
      className="text-primary-foreground/85 hover:text-accent focus-visible:ring-ring text-[0.875rem] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {label}
    </a>
  );
}
