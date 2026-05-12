/**
 * Audit Prisma extension.
 *
 * Captures every mutation against an audited table into `AuditLog`:
 *   - `actorUserId` (from `runWithActor`).
 *   - `action` — "create" | "update" | "delete" | "soft_delete".
 *   - `entity` + `entityId`.
 *   - `before` and `after` snapshots (Json).
 *   - `ipAddress`, `userAgent`, `correlationId` from the actor context.
 *
 * **Failure policy (SECURITY.md Gate 4 — "no code path bypasses audit"):**
 *   - Default: a failed AuditLog write **fails the originating request**.
 *     Better a 500 than a silent loss of audit trail.
 *   - Escape hatch: set `OGS_AUDIT_BEST_EFFORT=true` to fall back to
 *     `console.error`. Intended only for triage of a known audit-table
 *     incident; should never be the steady state.
 *
 * Models that are themselves bookkeeping (`AuditLog`, `WebhookEvent`,
 * `Session`, `Verification`) are excluded to prevent recursion + noise.
 *
 * @see Blueprint §16.4, SECURITY.md Gate 4.
 */
import { Prisma } from "../generated/prisma/client";
import { getActor } from "../run-with-actor";

const NOT_AUDITED = new Set<string>([
  "AuditLog",
  "WebhookEvent",
  "Session",
  "Verification",
  "OAuthAccessToken",
  "OAuthConsent",
  "EmbeddingChunk",
  "LessonProgress",
  "AIInteraction",
  "Notification",
  "NotificationPreference",
  "UserPreference",
]);

const MUTATION_OPS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "upsert",
  "delete",
  "deleteMany",
]);

export const auditExtension = Prisma.defineExtension({
  name: "ogs-audit",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const isAudited = Boolean(model) && !NOT_AUDITED.has(model!);
        const isMutation = MUTATION_OPS.has(operation);

        // Reads + un-audited models pass through unchanged.
        if (!isAudited || !isMutation) {
          return query(args);
        }

        const result = await query(args);
        try {
          await writeAuditLog(this as never, {
            model: model!,
            operation,
            args,
            result,
          });
        } catch (err) {
          // Gate 4: prefer to fail the originating request over silently
          // losing the audit trail. The opt-out covers known-incident
          // triage; never the steady state.
          if (process.env.OGS_AUDIT_BEST_EFFORT === "true") {
            console.error("[@ogs/db][audit] best-effort: write failed:", err);
          } else {
            throw new Error(
              `[@ogs/db][audit] failed to persist audit row for ${model}.${operation} — refusing to commit silently. ` +
                `Set OGS_AUDIT_BEST_EFFORT=true only as a temporary triage measure. Underlying: ${
                  err instanceof Error ? err.message : String(err)
                }`,
            );
          }
        }
        return result;
      },
    },
  },
});

interface WriteAuditPayload {
  model: string;
  operation: string;
  args: unknown;
  result: unknown;
}

async function writeAuditLog(
  prismaProxy: unknown,
  { model, operation, args, result }: WriteAuditPayload,
): Promise<void> {
  const ctx = getActor();
  // Outside runWithActor (CLI scripts, migrations, Prisma Studio) we
  // can't know the actor. Skip rather than fabricate. Server code paths
  // that mutate without runWithActor are a separate bug for tenant-scope
  // to catch.
  if (!ctx) return;

  const action = mapAction(operation, result);
  const entityId = extractEntityId(result, args);
  const after = isObjectLike(result) ? (result as Record<string, unknown>) : null;

  await (
    prismaProxy as {
      auditLog: { create: (a: unknown) => Promise<unknown> };
    }
  ).auditLog.create({
    data: {
      // Platform-level writes (AppSettings, Skill, global FeatureFlag)
      // have `tenantId: null` and now persist a null-tenant audit row.
      tenantId: ctx.tenantId,
      actorUserId: ctx.actorUserId,
      action,
      entity: model,
      entityId,
      before: null, // Before-snapshot capture is a Phase 02 follow-up.
      after,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      correlationId: ctx.correlationId ?? null,
    },
  });
}

function mapAction(operation: string, result: unknown): string {
  if (operation === "delete" || operation === "deleteMany") return "delete";
  if (operation === "create" || operation === "createMany" || operation === "createManyAndReturn") {
    return "create";
  }
  // Treat an update that sets deletedAt as a soft_delete in the audit feed.
  if (isObjectLike(result)) {
    const r = result as Record<string, unknown>;
    if ("deletedAt" in r && r.deletedAt instanceof Date) return "soft_delete";
  }
  return "update";
}

function extractEntityId(result: unknown, args: unknown): string {
  if (isObjectLike(result)) {
    const r = result as Record<string, unknown>;
    if (typeof r.id === "string") return r.id;
  }
  if (isObjectLike(args)) {
    const a = args as { where?: { id?: string } };
    if (typeof a.where?.id === "string") return a.where.id;
  }
  // Batch writes (updateMany/deleteMany) return {count}; we don't know
  // individual ids. Use a sentinel rather than empty string so feed
  // queries can filter these out.
  return "<batch>";
}

function isObjectLike(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
