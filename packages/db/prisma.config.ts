/**
 * Prisma 7 configuration — replaces the legacy schema-level `url` /
 * `directUrl` settings.
 *
 * Key Prisma 7 behaviours:
 *   - **Multi-file schema** under `prisma/schema/`.
 *   - **Driver adapter** is mandatory — `@prisma/adapter-pg` here for
 *     migrations / studio / introspection. The runtime PrismaClient
 *     instantiates its own adapter in `src/client.ts`.
 *   - **dotenv** is loaded explicitly — Prisma 7 no longer auto-loads
 *     `.env.local`.
 *
 * @see Blueprint §5.4.1, §29.5.
 */
import { config as loadDotenv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { defineConfig } from "prisma/config";

// Load .env.local from the repo root (Prisma 7 doesn't auto-load it).
loadDotenv({ path: new URL("../../.env.local", import.meta.url).pathname });
// Fall back to .env in the same dir if .env.local isn't present.
loadDotenv();

// DIRECT_URL may be present-but-empty (an unfilled placeholder); fall
// back to DATABASE_URL in that case. `??` does not handle the empty
// string, so we explicitly coerce to undefined first.
//
// `prisma generate` does NOT connect to the database — it only reads
// the schema. So we use a sentinel placeholder URL when nothing is
// set, which lets CI run `prisma generate` without `.env.local`.
// `prisma migrate dev` / `prisma studio` will fail loudly when the
// sentinel hits real database I/O — that's the right failure shape.
const resolvedUrl =
  (process.env.DIRECT_URL && process.env.DIRECT_URL.length > 0
    ? process.env.DIRECT_URL
    : undefined) ?? process.env.DATABASE_URL;
const directUrl =
  resolvedUrl && resolvedUrl.length > 0
    ? resolvedUrl
    : "postgresql://generate-only-no-db@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema",
  datasource: {
    /** Migrations + studio use the non-pooled connection. */
    url: directUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  /**
   * Adapter used by `prisma migrate`, `prisma studio`, and other CLI
   * commands. The PrismaClient at runtime instantiates its own adapter
   * inside `src/client.ts`.
   */
  adapter: async () => new PrismaPg({ connectionString: directUrl }),
});
