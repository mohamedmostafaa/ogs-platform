/**
 * `/account/sessions` — list active sessions for the current user
 * and let them revoke any one.
 *
 * `requireAuth`-gated server component (Gate 1). IPs are masked to
 * `/24` so the rendered HTML doesn't carry an exact PII signal back
 * to anyone who later screen-shares the page (Gate 3).
 *
 * @see Blueprint §6.11.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthGuardError, requireAuth } from "@ogs/auth/guards";
import { auth } from "@ogs/auth/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";
import { Separator } from "@ogs/ui/primitives";

import { RevokeButton } from "./revoke-button";

export const metadata = { title: "Active sessions · OGS Identity" };

/**
 * Mask an IPv4 address to its `/24`. IPv6 → keep the first 4 hextets.
 * Empty / null → `"—"`. Anything malformed → `"—"`.
 */
function maskIp(raw: string | null | undefined): string {
  if (!raw) return "—";
  // IPv4 dotted-quad
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(raw);
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  // IPv6 — display "(IPv6)" rather than risk a malformed mask for
  // short-form addresses like `::1`. Phase-02 stub: we surface enough
  // to let the user spot an unfamiliar device; an exact IP isn't the
  // signal that matters (browser + OS already gives them that).
  if (raw.includes(":")) return "(IPv6)";
  return "—";
}

/** Trim the UA string for display — Chrome on macOS, etc. */
function shortUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  // Pull a coarse signal — browser family + OS — without parsing
  // the whole UA. Good enough for "is this me on my laptop?".
  const browser = /(Chrome|Firefox|Safari|Edge|Opera)/.exec(ua)?.[1] ?? "Browser";
  const os = /(Mac OS X|Windows|Linux|Android|iOS|iPhone|iPad)/.exec(ua)?.[1] ?? "Unknown OS";
  return `${browser} · ${os}`;
}

function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SessionsPage() {
  const h = await headers();
  let session;
  try {
    session = await requireAuth(h);
  } catch (err) {
    if (err instanceof AuthGuardError) redirect("/login?callbackURL=/account/sessions");
    throw err;
  }

  const all = await auth.api.listSessions({ headers: h });
  const currentToken = session.session.token;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Every device that&apos;s currently signed in to your account. Revoke any you don&apos;t
            recognise.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {all.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active sessions.</p>
          ) : (
            all.map((s, i) => {
              const isCurrent = s.token === currentToken;
              return (
                <div key={s.id}>
                  {i > 0 ? <Separator className="mb-4" /> : null}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        {shortUserAgent(s.userAgent)}
                        {isCurrent ? (
                          <span className="text-muted-foreground ml-2 text-xs">(this device)</span>
                        ) : null}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        IP {maskIp(s.ipAddress)} · created {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <RevokeButton sessionId={s.token} isCurrent={isCurrent} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </main>
  );
}
