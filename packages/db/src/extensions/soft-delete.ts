/**
 * Soft-delete Prisma extension.
 *
 * Every model with a `deletedAt: DateTime?` column participates:
 *   - `delete()`     → rewritten to `update({ data: { deletedAt: new Date() } })`.
 *   - `deleteMany()` → rewritten to `updateMany(... deletedAt: now)`.
 *   - `find*()`      → automatically filters out rows where
 *                      `deletedAt IS NOT NULL` unless the caller passes
 *                      an explicit `deletedAt` predicate (escape hatch
 *                      for restore / admin tooling).
 *
 * Models that opt OUT (Verification, AuditLog, WebhookEvent, etc.) are
 * listed in {@link OPTED_OUT_MODELS}.
 *
 * @see Blueprint §16.2.
 */
import { Prisma } from "../generated/prisma/client.js";

/**
 * Models that do NOT have a `deletedAt` column. Every other model
 * inherits soft-delete behaviour.
 */
const OPTED_OUT_MODELS = new Set<string>([
  "Verification",
  "AuditLog",
  "WebhookEvent",
  "EmbeddingChunk",
  "Endorsement",
  "Payment",
  "AppSettings",
  "FeatureFlag",
  "OAuthApplication",
  "OAuthAccessToken",
  "OAuthConsent",
  "Session",
  "Account",
  "AIInteraction",
  "EvalRun",
  "PromptVersion",
  "LessonProgress",
  "Notification",
  "NotificationPreference",
  "UserPreference",
]);

const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);
const UNIQUE_READ_OPS = new Set(["findUnique", "findUniqueOrThrow"]);

export const softDeleteExtension = Prisma.defineExtension({
  name: "ogs-soft-delete",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || OPTED_OUT_MODELS.has(model)) {
          return query(args);
        }

        // Reads — filter out tombstones.
        if (READ_OPS.has(operation)) {
          (args as { where?: Record<string, unknown> }).where = mergeDeletedAtFilter(
            (args as { where?: Record<string, unknown> }).where,
          );
          return query(args);
        }

        // findUnique can't take a deletedAt clause (unique index only),
        // so we post-filter the result instead.
        if (UNIQUE_READ_OPS.has(operation)) {
          const row = (await query(args)) as { deletedAt?: Date | null } | null;
          if (row?.deletedAt) {
            if (operation === "findUniqueOrThrow") {
              throw new Error(`[soft-delete] ${model} row is soft-deleted`);
            }
            return null as never;
          }
          return row as never;
        }

        // Block hard deletes on soft-delete-aware models. Application
        // code must use `update({ where, data: { deletedAt: new Date() } })`
        // explicitly so the intent is obvious in code review.
        if (operation === "delete" || operation === "deleteMany") {
          throw new Error(
            `[soft-delete] ${model}.${operation}() is disabled — set deletedAt via update() instead.`,
          );
        }

        // Updates: filter out already-deleted rows by default.
        if (operation === "update" || operation === "updateMany") {
          (args as { where?: Record<string, unknown> }).where = mergeDeletedAtFilter(
            (args as { where?: Record<string, unknown> }).where,
          );
        }

        return query(args);
      },
    },
  },
});

function mergeDeletedAtFilter(where: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!where) return { deletedAt: null };
  if ("deletedAt" in where) return where;
  return { ...where, deletedAt: null };
}
