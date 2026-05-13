/**
 * `JobSearchBar` — hero search affordance for the careers landing.
 *
 * Single horizontal control: keyword input + country select + submit
 * button. Renders as a plain `<form method="GET">` so the page submits
 * to `/jobs?q=...&country=...` without any client-side state. Consumers
 * can swap to a JS-driven flow later; this primitive stays pure HTML.
 * Used inside `MarketingHero`'s `searchBar` slot and also reusable as a
 * standalone affordance on `/jobs`.
 *
 * @see docs/design/careers-landing.md §3.2 (Hero), §4 row 13.
 */
"use client";

import * as React from "react";

import { cn } from "../lib/cn";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/** ISO-3166-1 alpha-2 country codes supported by the country select. */
export type JobSearchCountryCode = "" | "EG" | "IQ" | "AE" | "SA" | "OM" | "LY";

/** Public props for the `JobSearchBar` primitive. */
export interface JobSearchBarProps extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "action"
> {
  /** Initial keyword/title value, used as the `defaultValue` of the text input. */
  defaultQ?: string;
  /** Initial country ISO code (or empty string for "All countries"). */
  defaultCountry?: JobSearchCountryCode;
  /** Submission target. Defaults to `/jobs`. */
  action?: string;
  /** Submit button label. Defaults to `Search jobs`. */
  submitLabel?: string;
}

// Order matches spec §3.2: All countries, Egypt, Iraq, UAE, KSA, Oman, Libya.
const COUNTRY_OPTIONS: ReadonlyArray<{ value: JobSearchCountryCode; label: string }> = [
  { value: "", label: "All countries" },
  { value: "EG", label: "Egypt" },
  { value: "IQ", label: "Iraq" },
  { value: "AE", label: "UAE" },
  { value: "SA", label: "KSA" },
  { value: "OM", label: "Oman" },
  { value: "LY", label: "Libya" },
];

// shadcn's Radix Select cannot use the empty string as an item value, so the
// "All countries" entry maps to a sentinel internally and is serialized to a
// hidden input under the real `country` name expected by `/jobs`.
const ALL_COUNTRIES_SENTINEL = "__all__";

export const JobSearchBar = React.forwardRef<HTMLFormElement, JobSearchBarProps>(
  (
    {
      defaultQ,
      defaultCountry = "",
      action = "/jobs",
      submitLabel = "Search jobs",
      className,
      ...rest
    },
    ref,
  ) => {
    const initialSelect = defaultCountry === "" ? ALL_COUNTRIES_SENTINEL : defaultCountry;
    const [selected, setSelected] = React.useState<string>(initialSelect);

    // The real submitted value: empty string for the sentinel, the ISO code otherwise.
    const submittedCountry = selected === ALL_COUNTRIES_SENTINEL ? "" : selected;

    return (
      <form
        ref={ref}
        method="GET"
        action={action}
        aria-label="Find verified energy jobs across MENA"
        className={cn(
          "bg-background text-foreground border-border flex w-full flex-col gap-2 rounded-lg border p-2 shadow-md md:flex-row md:items-center md:gap-2",
          className,
        )}
        {...rest}
      >
        <label htmlFor="job-search-q" className="sr-only">
          Job title or keyword
        </label>
        <input
          id="job-search-q"
          type="text"
          name="q"
          placeholder="e.g. Metering Engineer, QA/QC Inspector"
          {...(defaultQ !== undefined ? { defaultValue: defaultQ } : {})}
          className="placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full flex-1 rounded-md bg-transparent px-3 text-[0.9375rem] focus-visible:ring-2 focus-visible:outline-none md:border-0"
        />

        {/* Hidden input carries the canonical `country` value to the GET target. */}
        <input type="hidden" name="country" value={submittedCountry} />

        <label htmlFor="job-search-country" className="sr-only">
          Country
        </label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger
            id="job-search-country"
            aria-label="Country"
            className="h-11 w-full md:w-[180px]"
          >
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value || ALL_COUNTRIES_SENTINEL}
                value={opt.value === "" ? ALL_COUNTRIES_SENTINEL : opt.value}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="submit"
          className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-ring inline-flex h-11 shrink-0 items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {submitLabel}
        </button>
      </form>
    );
  },
);
JobSearchBar.displayName = "JobSearchBar";
