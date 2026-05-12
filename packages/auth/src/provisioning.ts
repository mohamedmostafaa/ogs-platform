/**
 * Post-signup provisioning — wires a freshly-signed-up User into the
 * platform's domain model.
 *
 * **Phase 01 stub.** When a User signs up we should:
 *   1. Create a default Worker profile (so the careers / skillpass apps
 *      have something to attach data to).
 *   2. Add a Membership row in the `ogs-internal` tenant with the
 *      default `worker` role.
 *   3. Seed a NotificationPreference set with platform defaults.
 *
 * The real flow lands in Phase 02 once the Identity hub is wired with
 * a "complete your profile" onboarding step. For now this exports the
 * helper signatures so consumers can call them and we get type
 * coverage for Phase 02 changes.
 *
 * @see Blueprint §6.6.
 */
import { basePrisma } from "@ogs/db";

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
 * Idempotent: if the Worker or Membership already exists for this user,
 * the helper returns the existing rows.
 *
 * Uses `basePrisma` (not the composed `prisma`) because this runs
 * BEFORE the user has an actor context — there is no tenantId to scope
 * on yet, and we are establishing the first Membership.
 */
export async function provisionUser(input: ProvisionUserInput): Promise<ProvisionUserResult> {
  const { userId } = input;

  // ---- 1. Worker profile --------------------------------------------------
  const worker = await basePrisma.worker.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  // ---- 2. Membership in ogs-internal (worker role) -----------------------
  const tenant = await basePrisma.tenant.findUnique({
    where: { slug: "ogs-internal" },
    select: { id: true },
  });
  if (!tenant) {
    throw new Error(
      "[@ogs/auth] Default tenant 'ogs-internal' not found — seed the database first.",
    );
  }
  const membership = await basePrisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
    update: {},
    create: { tenantId: tenant.id, userId, role: "worker" },
    select: { id: true },
  });

  // ---- 3. NotificationPreference defaults (in-app on for everything) ----
  // Lands in Phase 02 once the notification taxonomy is locked.
  // for (const type of NOTIFICATION_TYPES) {
  //   await basePrisma.notificationPreference.upsert({ ... });
  // }

  return { workerId: worker.id, membershipId: membership.id };
}
