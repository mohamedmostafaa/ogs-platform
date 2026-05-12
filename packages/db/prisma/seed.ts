/**
 * Minimal Prisma seed.
 *
 * Idempotent: re-running upserts every row. Production-safe (refuses
 * to run unless `OGS_ALLOW_SEED=1`).
 *
 * Creates:
 *   - Default `Tenant` "ogs-internal".
 *   - Default `AppSettings` singleton.
 *   - A handful of canonical `Skill` rows.
 *
 * Run: `pnpm --filter @ogs/db seed`.
 *
 * @see Blueprint §5.
 */
import { config as loadDotenv } from "dotenv";

// Load env vars BEFORE importing the client, so basePrisma can read
// DATABASE_URL at module-load time.
loadDotenv({ path: new URL("../../../.env.local", import.meta.url).pathname });

const { getBasePrisma } = await import("../src/client.js");
const basePrisma = getBasePrisma();

if (process.env.NODE_ENV === "production" && process.env.OGS_ALLOW_SEED !== "1") {
  console.error("[seed] refusing to seed production — set OGS_ALLOW_SEED=1 to override.");
  process.exit(1);
}

async function main(): Promise<void> {
  console.log("[seed] starting...");

  await basePrisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      paymentProvider: "stripe",
      supportEmail: "support@ogs-tc.com",
      rootDomain: "ogs-tc.com",
    },
  });
  console.log("[seed] AppSettings ✓");

  const ogsInternal = await basePrisma.tenant.upsert({
    where: { slug: "ogs-internal" },
    update: {},
    create: { name: "OGS Internal", slug: "ogs-internal" },
  });
  console.log(`[seed] Tenant ogs-internal ✓ (${ogsInternal.id})`);

  const skills = [
    { name: "Well control — L1", discipline: "drilling", level: "level_1" },
    { name: "Well control — L2", discipline: "drilling", level: "level_2" },
    { name: "MWD operations", discipline: "drilling", level: "level_2" },
    { name: "Cementing operations", discipline: "drilling", level: "level_2" },
    { name: "Production logging", discipline: "production", level: "level_2" },
    { name: "Process safety management", discipline: "hse", level: "level_3" },
    { name: "Subsea installations", discipline: "subsea", level: "level_3" },
    { name: "EPC project controls", discipline: "epc", level: "level_2" },
  ];
  for (const s of skills) {
    await basePrisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log(`[seed] Skills ✓ (${skills.length})`);

  console.log("[seed] DONE.");
}

main()
  .catch((err) => {
    console.error("[seed] FAILED:", err);
    process.exit(1);
  })
  .finally(() => basePrisma.$disconnect());
