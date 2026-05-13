/**
 * `<SessionRow>` — single row in the active-sessions table.
 *
 * Split from `<SessionsList>` for testability — the row's user-facing
 * format helpers (UA short-form, date format) can be exercised in
 * isolation, and a presentational unit test for the "(this device)"
 * badge doesn't need the surrounding TanStack-Query plumbing.
 */
"use client";

import { Separator } from "@ogs/ui/primitives";

import { RevokeButton } from "./revoke-button";

import type { SessionRow as SessionRowType } from "~/modules/auth/types";

/**
 * Trim a User-Agent string for display: browser-family + OS, e.g.
 * `"Chrome · Mac OS X"`. Falls back to `"Unknown device"` when the UA
 * is absent. Coarse on purpose — good enough for "is this me on my
 * laptop?" without parsing the whole UA grammar.
 */
function shortUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  const browser = /(Chrome|Firefox|Safari|Edge|Opera)/.exec(ua)?.[1] ?? "Browser";
  const os = /(Mac OS X|Windows|Linux|Android|iOS|iPhone|iPad)/.exec(ua)?.[1] ?? "Unknown OS";
  return `${browser} · ${os}`;
}

/** Format a date for the session-row display. */
function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Render one session row. The leading `<Separator>` is rendered by the
 * parent for every row after the first — we don't decide that here.
 */
export function SessionRow({
  session,
  showSeparator,
}: {
  session: SessionRowType;
  showSeparator: boolean;
}) {
  return (
    <div>
      {showSeparator ? <Separator className="mb-4" /> : null}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {shortUserAgent(session.userAgent)}
            {session.isCurrent ? (
              <span className="text-muted-foreground ml-2 text-xs">(this device)</span>
            ) : null}
          </p>
          <p className="text-muted-foreground text-xs">
            IP {session.ipAddress ?? "—"} · created {formatDate(session.createdAt)}
          </p>
        </div>
        <RevokeButton token={session.token} isCurrent={session.isCurrent} />
      </div>
    </div>
  );
}
