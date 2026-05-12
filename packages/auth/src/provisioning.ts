/**
 * Post-signup provisioning — wires a freshly-signed-up User into the
 * platform's domain model.
 *
 * Steps:
 *   1. Resolve the default `ogs-internal` tenant (must be seeded).
 *   2. Inside a `runWithActor` scope (so audit + tenant-scope fire),
 *      upsert a default Worker, then a Membership with the `worker`
 *      role.
 *   3. (Phase 02) Seed NotificationPreference defaults.
 *
 * Idempotent: re-running on an already-provisioned user returns the
 * existing rows. Called from Better Auth's `databaseHooks.user.create.after`
 * — see `server.ts`.
 *
 * @see Blueprint §6.6, SECURITY.md Gate 4 (audit).
 */
import { basePrismaClient, prisma, runWithActor } from "@ogs/db";

export interface ProvisionUserInput {
  userId: string;
  /** Pre-pick locale from sign-up form (defaults to platform default). */
  locale?: string;
}

export interface ProvisionUserResult {
  workerId: string;
  membershipId: string;
}

/**
 * Idempotent provisioning. Runs inside `runWithActor` so the audit +
 * tenant-scope extensions can stamp every write — even the very first
 * one — with the new user as the actor and `ogs-internal` as the
 * tenant. The Worker / Membership / future Notification rows therefore
 * leave a proper audit trail (SECURITY.md Gate 4).
 */
export async function provisionUser(input: ProvisionUserInput): Promise<ProvisionUserResult> {
  const { userId } = input;

  // Tenant resolution must run OUTSIDE the actor scope: we need to read
  // the Tenant row before we know its id (and the Tenant model is in
  // NO_TENANT_MODELS anyway, so the extension is a no-op).
  // basePrismaClient() is the un-extended client — explicit, audited.
  const baseClient = basePrismaClient();
  const tenant = await baseClient.tenant.findUnique({
    where: { slug: "ogs-internal" },
    select: { id: true },
  });
  if (!tenant) {
    throw new Error(
      "[@ogs/auth] Default tenant 'ogs-internal' not found — seed the database first.",
    );
  }

  return runWithActor(
    {
      tenantId: tenant.id,
      actorUserId: userId,
      correlationId: "signup",
    },
    async () => {
      // ---- 1. Worker profile --------------------------------------------
      // Prisma's typed `create` requires tenantId at compile time even
      // though our tenant-scope extension would stamp it at runtime.
      // Pass it explicitly for type safety.
      const worker = await prisma.worker.upsert({
        where: { userId },
        update: {},
        create: { userId, tenantId: tenant.id },
        select: { id: true },
      });

      // ---- 2. Membership in ogs-internal --------------------------------
      // Membership is in NO_TENANT_MODELS (intentional — admin views cross
      // tenants), so we pass tenantId explicitly here.
      const membership = await prisma.membership.upsert({
        where: { tenantId_userId: { tenantId: tenant.id, userId } },
        update: {},
        create: { tenantId: tenant.id, userId, role: "worker" },
        select: { id: true },
      });

      // ---- 3. NotificationPreference defaults — Phase 02 ---------------

      return { workerId: worker.id, membershipId: membership.id };
    },
  );
}
