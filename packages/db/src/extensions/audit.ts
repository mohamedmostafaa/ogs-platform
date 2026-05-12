/**
 * Audit Prisma extension.
 *
 * Captures every mutation against an audited table into `AuditLog`:
 *   - `actorUserId` (from `runWithActor`).
 *   - `action` — "create" | "update" | "delete" | "soft_delete".
 *   - `entity` + `entityId`.
 *   - `before` and `after` snapshots (Json).
 *   - `ipAddress`, `userAgent`, `correlationId` when provided.
 *
 * Models that are themselves bookkeeping (`AuditLog`, `WebhookEvent`,
 * `Session`, `Verification`) are excluded to prevent infinite recursion
 * and pointless noise.
 *
 * @see Blueprint §16.4.
 */
import { Prisma } from "../generated/prisma/client.js";
import { getActor } from "../run-with-actor.js";

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
        await writeAuditLog(this as never, {
          model: model!,
          operation,
          args,
          result,
        }).catch((err) => {
          // Audit failures must NEVER break the originating request.
          // Once @ogs/observability lands, the Sentry path swaps in here.
          console.error("[@ogs/db][audit] failed to write audit log:", err);
        });
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
  // Outside of runWithActor — skip rather than spam audit rows with "system".
  if (!ctx) return;
  // Without a tenant, we can't legally write an AuditLog row — bail.
  if (ctx.tenantId === null) return;

  const action = mapAction(operation, result);
  const entityId = extractEntityId(result, args);
  const after = isObjectLike(result) ? (result as Record<string, unknown>) : null;

  await (
    prismaProxy as {
      auditLog: { create: (a: unknown) => Promise<unknown> };
    }
  ).auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      actorUserId: ctx.actorUserId,
      action,
      entity: model,
      entityId,
      before: null, // before-snapshot capture is a Phase 02 follow-up.
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
  return "";
}

function isObjectLike(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
