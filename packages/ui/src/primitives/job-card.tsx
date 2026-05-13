/**
 * `JobCard` — single live-job listing tile.
 *
 * Renders a real `<article>` with: company logo + name + country flag +
 * role-family chip on top; H3 title middle (whole card clickable via a
 * stretched anchor overlay); posted-at relative time bottom-left;
 * optional teal "Verified employer" pill bottom-right when the company
 * is verified. The verified-employer badge is gated by the Founder
 * decision in spec §7 (4) — it appears only when `verifiedEmployer` is
 * explicitly true.
 *
 * @see docs/design/careers-landing.md §3.4 (Open roles), §4 row 14, §7 (4).
 */
import { CheckCircle2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

import { Badge } from "./badge";

/** ISO-3166-1 alpha-2 codes for the six MENA markets on the careers surface. */
export type JobCardCountryCode = "EG" | "IQ" | "AE" | "SA" | "OM" | "LY";

/** Role taxonomy mirrored from spec §3.3 (Browse-by-role). */
export type JobCardRoleFamily =
  | "metering"
  | "qa-qc"
  | "inspection"
  | "hse"
  | "sustainability"
  | "operations";

/** Public props for the `JobCard` primitive. */
export interface JobCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "id"> {
  /** Stable identifier — used for React keys upstream and `aria` plumbing. */
  id: string;
  /** Job title rendered as an H3 (and as the clickable card overlay label). */
  title: string;
  /** Hiring company display name. */
  company: string;
  /** Optional logo URL. When absent, an initials avatar renders as fallback. */
  companyLogoSrc?: string;
  /** ISO country code surfaced as a regional-indicator flag emoji. */
  country: JobCardCountryCode;
  /** Role family — drives the chip label and is reused for filter URLs. */
  roleFamily: JobCardRoleFamily;
  /** Posting date — rendered as `Posted <relative>` (e.g. "Posted 3 days ago"). */
  postedAt: Date | string;
  /** Destination href — typically `/jobs/<slug>`. */
  href: string;
  /** When `true`, renders the teal "Verified employer" pill (spec §7 (4)). */
  verifiedEmployer?: boolean;
}

const COUNTRY_NAME: Record<JobCardCountryCode, string> = {
  EG: "Egypt",
  IQ: "Iraq",
  AE: "UAE",
  SA: "KSA",
  OM: "Oman",
  LY: "Libya",
};

const ROLE_FAMILY_LABEL: Record<JobCardRoleFamily, string> = {
  metering: "Metering & Integrity",
  "qa-qc": "QA/QC",
  inspection: "Inspection",
  hse: "HSE",
  sustainability: "Sustainability",
  operations: "Operations",
};

// Convert ISO alpha-2 to the matching unicode regional-indicator pair.
// Mirrors the helper in `country-flag-strip.tsx` — kept inline rather
// than cross-imported to keep this primitive self-contained.
function codeToFlagEmoji(code: JobCardCountryCode): string {
  const base = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(code.charCodeAt(0) + base, code.charCodeAt(1) + base);
}

// Compute a short initials string (max 2 chars) from a company name for
// the fallback avatar tile when no logo is supplied.
function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/u)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${(parts[0] ?? "").charAt(0)}${(parts[1] ?? "").charAt(0)}`.toUpperCase();
}

// Relative-date formatter using the platform Intl.RelativeTimeFormat.
// Returns strings like "3 days ago" or "just now". Kept inline — the
// primitive must not introduce a new runtime dep.
function formatRelativeDate(input: Date | string): { label: string; iso: string } {
  const date = input instanceof Date ? input : new Date(input);
  const iso = isNaN(date.getTime()) ? "" : date.toISOString();
  if (!iso) return { label: "Recently", iso: "" };

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;
  if (absMs < minute) {
    return { label: "just now", iso };
  } else if (absMs < hour) {
    value = Math.round(diffMs / minute);
    unit = "minute";
  } else if (absMs < day) {
    value = Math.round(diffMs / hour);
    unit = "hour";
  } else if (absMs < week) {
    value = Math.round(diffMs / day);
    unit = "day";
  } else if (absMs < month) {
    value = Math.round(diffMs / week);
    unit = "week";
  } else if (absMs < year) {
    value = Math.round(diffMs / month);
    unit = "month";
  } else {
    value = Math.round(diffMs / year);
    unit = "year";
  }

  return { label: rtf.format(value, unit), iso };
}

export const JobCard = React.forwardRef<HTMLElement, JobCardProps>(
  (
    {
      id,
      title,
      company,
      companyLogoSrc,
      country,
      roleFamily,
      postedAt,
      href,
      verifiedEmployer,
      className,
      ...rest
    },
    ref,
  ) => {
    const countryName = COUNTRY_NAME[country];
    const roleLabel = ROLE_FAMILY_LABEL[roleFamily];
    const { label: relative, iso } = formatRelativeDate(postedAt);
    const titleId = `job-card-${id}-title`;

    return (
      <article
        ref={ref}
        aria-labelledby={titleId}
        className={cn(
          "group bg-background text-foreground border-border hover:border-accent/60 focus-within:ring-ring relative flex h-full flex-col gap-3 rounded-lg border p-4 shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-offset-2 hover:shadow-md",
          className,
        )}
        {...rest}
      >
        {/* Top row: logo + company + country + role chip */}
        <div className="flex items-start gap-3">
          {companyLogoSrc ? (
            <img
              src={companyLogoSrc}
              alt=""
              aria-hidden="true"
              className="border-border h-10 w-10 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="bg-muted text-muted-foreground border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[0.75rem] font-semibold"
            >
              {initialsFor(company)}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="text-muted-foreground flex items-center gap-2 text-[0.8125rem] font-medium">
              <span className="text-foreground truncate">{company}</span>
              <span aria-label={countryName} role="img" className="leading-none">
                {codeToFlagEmoji(country)}
              </span>
              <span className="sr-only">{countryName}</span>
            </div>
            <span className="bg-muted text-accent w-fit rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Middle: title with stretched-link overlay for whole-card clickability. */}
        <h3 id={titleId} className="text-foreground text-[1.125rem] leading-tight font-semibold">
          <a
            href={href}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none"
          >
            {title}
          </a>
        </h3>

        {/* Bottom row: posted-at + verified pill */}
        <div className="text-muted-foreground mt-auto flex items-center justify-between gap-3 text-[0.8125rem]">
          <span>
            Posted {iso ? <time dateTime={iso}>{relative}</time> : <span>{relative}</span>}
          </span>
          {verifiedEmployer ? (
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground hover:bg-accent/90 relative z-10 gap-1 border-0"
            >
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              Verified employer
            </Badge>
          ) : null}
        </div>
      </article>
    );
  },
);
JobCard.displayName = "JobCard";
