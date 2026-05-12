/**
 * Tenant-scope Prisma extension.
 *
 * Every model with a `tenantId` column is auto-scoped:
 *   - Reads (`find*`, `count`, `aggregate`) get `where: { tenantId }`
 *     injected from the active `runWithActor` context.
 *   - Writes (`create`, `createMany`, `update*`, `upsert`) get the
 *     active tenantId stamped onto `data.tenantId`.
 *
 * When NO actor context is present, the extension is a no-op (so
 * migrations and Studio still work). When an actor context exists but
 * `tenantId` is null, writes fail loudly — explicit platform-level
 * work must opt out by calling `basePrisma` directly.
 *
 * Implementation note: we use `$allOperations` (a single unified
 * interceptor) rather than per-operation hooks, because Prisma 7's
 * typed `$allModels` surface enumerates writes via a different
 * branch — `$allOperations` keeps a single, switch-style dispatch.
 *
 * @see Blueprint §16.3.
 */
import { Prisma } from "../generated/prisma/client";
import { getActor } from "../run-with-actor";

/**
 * Models that do NOT have a `tenantId` column. Anything else is
 * tenant-scoped. Keep this in sync with the schema files.
 */
const NO_TENANT_MODELS = new Set<string>([
  "User",
  "Account",
  "Session",
  "Verification",
  "OAuthApplication",
  "OAuthAccessToken",
  "OAuthConsent",
  "UserPreference",
  "PromptVersion",
  "AppSettings",
  "WebhookEvent",
  "Skill",
  "Tenant",
  "Membership",
  "FeatureFlag",
]);

const READ_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);
const WRITE_OPS = new Set([
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

export const tenantScopeExtension = Prisma.defineExtension({
  name: "ogs-tenant-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || NO_TENANT_MODELS.has(model)) {
          return query(args);
        }

        // Prisma 7's narrowed operation union excludes create/createMany/
        // upsert from $allOperations, but those operations DO fire at
        // runtime. Cast through string so the create-aware branches
        // type-check while remaining accurate at runtime.
        const op: string = operation;

        if (READ_OPS.has(op)) {
          const tenantId = currentTenantOrSkip();
          if (tenantId) {
            (args as { where?: Record<string, unknown> }).where = withTenantWhere(
              (args as { where?: Record<string, unknown> }).where,
              tenantId,
            );
          }
          return query(args);
        }

        if (WRITE_OPS.has(op)) {
          const tenantId = currentTenantOrFail(model);

          // Stamp data on creates and upserts.
          if (op === "create" || op === "createMany" || op === "createManyAndReturn") {
            const data = (args as { data?: unknown }).data;
            if (Array.isArray(data)) {
              (args as { data: unknown }).data = data.map((row) =>
                withTenantData(row as Record<string, unknown>, tenantId),
              );
            } else if (data) {
              (args as { data: unknown }).data = withTenantData(
                data as Record<string, unknown>,
                tenantId,
              );
            }
          }

          if (op === "upsert") {
            const a = args as { where?: Record<string, unknown>; create?: Record<string, unknown> };
            a.where = withTenantWhere(a.where, tenantId);
            if (a.create) a.create = withTenantData(a.create, tenantId);
          }

          // Filter writes (update, updateMany, delete, deleteMany) by tenant.
          if (
            op === "update" ||
            op === "updateMany" ||
            op === "updateManyAndReturn" ||
            op === "delete" ||
            op === "deleteMany"
          ) {
            const a = args as { where?: Record<string, unknown> };
            a.where = withTenantWhere(a.where, tenantId);
          }

          return query(args);
        }

        return query(args);
      },
    },
  },
});

function currentTenantOrSkip(): string | undefined {
  const ctx = getActor();
  if (!ctx) return undefined;
  if (ctx.tenantId === null) return undefined;
  return ctx.tenantId;
}

function currentTenantOrFail(model: string): string {
  const ctx = getActor();
  if (!ctx || ctx.tenantId === null) {
    throw new Error(
      `[@ogs/db] Cannot write to ${model}: no tenant in actor context. ` +
        `Wrap the operation in runWithActor({ tenantId, ... }, ...).`,
    );
  }
  return ctx.tenantId;
}

function withTenantWhere(
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Record<string, unknown> {
  if (!where) return { tenantId };
  if ("tenantId" in where) return where;
  return { ...where, tenantId };
}

function withTenantData<T extends Record<string, unknown>>(data: T, tenantId: string): T {
  if ("tenantId" in data) return data;
  return { ...data, tenantId };
}
