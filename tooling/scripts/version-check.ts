/**
 * tooling/scripts/version-check.ts
 *
 * Verifies that every locked dependency in the OGS monorepo is within an
 * acceptable distance of its latest published version on the npm registry.
 *
 * Exit codes:
 *   0  every locked floor is green (== latest) or yellow (one minor behind)
 *   1  one or more locked floors is orange (one major behind) — warn
 *   2  one or more locked floors is RED (two or more majors behind, or unknown) — block
 *
 * Run:
 *   pnpm version-check                   # human-readable table
 *   pnpm version-check --json            # machine-readable; used by CI
 *   pnpm version-check --fail-on=orange  # also exit non-zero on orange
 *
 * @see Blueprint §3.2.1, AGENTS.md §0 rule -1 (Version currency)
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// =====================================================================
// 1. The locked floor table — kept in sync with blueprint §3.
// =====================================================================

interface Locked {
  name: string;
  floor: string;                    // semver string; major derives from this
  owner: string;                    // agent role for routing failures
}

const LOCKED: readonly Locked[] = [
  // Web framework + language
  { name: "next",                                 floor: "16.2.6",  owner: "@devops-engineer"          },
  { name: "react",                                floor: "19.2.6",  owner: "@ui-engineer"              },
  { name: "react-dom",                            floor: "19.2.6",  owner: "@ui-engineer"              },
  { name: "typescript",                           floor: "6.0.3",   owner: "@devops-engineer"          },
  // UI
  { name: "tailwindcss",                          floor: "4.3.0",   owner: "@ui-engineer"              },
  { name: "@tailwindcss/postcss",                 floor: "4.3.0",   owner: "@ui-engineer"              },
  { name: "tw-animate-css",                       floor: "1.4.0",   owner: "@ui-engineer"              },
  { name: "sonner",                               floor: "2.0.7",   owner: "@ui-engineer"              },
  { name: "nuqs",                                 floor: "2.8.9",   owner: "@ui-engineer"              },
  { name: "next-themes",                          floor: "0.4.6",   owner: "@ui-engineer"              },
  { name: "next-intl",                            floor: "4.11.2",  owner: "@i18n-engineer"            },
  { name: "lucide-react",                         floor: "1.14.0",  owner: "@ui-engineer"              },
  { name: "class-variance-authority",             floor: "0.7.1",   owner: "@ui-engineer"              },
  { name: "clsx",                                 floor: "2.1.1",   owner: "@ui-engineer"              },
  { name: "tailwind-merge",                       floor: "3.6.0",   owner: "@ui-engineer"              },
  // Forms
  { name: "react-hook-form",                      floor: "7.75.0",  owner: "@frontend-feature-engineer" },
  { name: "@hookform/resolvers",                  floor: "5.2.2",   owner: "@frontend-feature-engineer" },
  { name: "zod",                                  floor: "4.4.3",   owner: "@api-engineer"             },
  // API
  { name: "@trpc/server",                         floor: "11.17.0", owner: "@api-engineer"             },
  { name: "@trpc/client",                         floor: "11.17.0", owner: "@api-engineer"             },
  { name: "@trpc/tanstack-react-query",           floor: "11.17.0", owner: "@api-engineer"             },
  { name: "@tanstack/react-query",                floor: "5.100.10",owner: "@api-engineer"             },
  { name: "@tanstack/react-table",                floor: "8.21.3",  owner: "@ui-engineer"              },
  { name: "superjson",                            floor: "2.2.6",   owner: "@api-engineer"             },
  // DB
  { name: "prisma",                               floor: "7.8.0",   owner: "@database-engineer"        },
  { name: "@prisma/client",                       floor: "7.8.0",   owner: "@database-engineer"        },
  { name: "@prisma/adapter-pg",                   floor: "7.8.0",   owner: "@database-engineer"        },
  // Auth
  { name: "better-auth",                          floor: "1.6.10",  owner: "@auth-engineer"            },
  { name: "@better-auth/oauth-provider",          floor: "1.6.10",  owner: "@auth-engineer"            },
  // Security
  { name: "@arcjet/next",                         floor: "1.4.0",   owner: "@security-engineer"        },
  { name: "@arcjet/inspect",                      floor: "1.4.0",   owner: "@security-engineer"        },
  // Jobs
  { name: "inngest",                              floor: "4.3.0",   owner: "@inngest-engineer"         },
  { name: "@inngest/realtime",                    floor: "0.4.7",   owner: "@inngest-engineer"         },
  { name: "inngest-cli",                          floor: "1.19.2",  owner: "@inngest-engineer"         },
  // Live video + chat
  { name: "@stream-io/video-react-sdk",           floor: "1.36.1",  owner: "@live-video-engineer"      },
  { name: "@stream-io/node-sdk",                  floor: "0.7.56",  owner: "@live-video-engineer"      },
  { name: "stream-chat",                          floor: "9.43.2",  owner: "@live-video-engineer"      },
  { name: "stream-chat-react",                    floor: "14.2.0",  owner: "@live-video-engineer"      },
  // Files + VOD
  { name: "@aws-sdk/client-s3",                   floor: "3.1045.0",owner: "@files-vod-engineer"       },
  { name: "@aws-sdk/s3-request-presigner",        floor: "3.1045.0",owner: "@files-vod-engineer"       },
  { name: "hls.js",                               floor: "1.6.16",  owner: "@files-vod-engineer"       },
  // Editor + state
  { name: "@xyflow/react",                        floor: "12.10.2", owner: "@inngest-engineer"         },
  { name: "jotai",                                floor: "2.20.0",  owner: "@inngest-engineer"         },
  // Email
  { name: "nodemailer",                           floor: "8.0.7",   owner: "@notifications-engineer"   },
  { name: "@react-email/components",              floor: "1.0.12",  owner: "@notifications-engineer"   },
  { name: "@react-email/render",                  floor: "2.0.8",   owner: "@notifications-engineer"   },
  // AI
  { name: "ai",                                   floor: "6.0.177", owner: "@ai-engineer"              },
  { name: "@ai-sdk/anthropic",                    floor: "3.0.76",  owner: "@ai-engineer"              },
  { name: "@ai-sdk/openai",                       floor: "3.0.63",  owner: "@ai-engineer"              },
  { name: "@ai-sdk/google",                       floor: "3.0.71",  owner: "@ai-engineer"              },
  { name: "voyageai",                             floor: "0.2.1",   owner: "@ai-engineer"              },
  { name: "handlebars",                           floor: "4.7.9",   owner: "@ai-engineer"              },
  // Payments
  { name: "stripe",                               floor: "22.1.1",  owner: "@payments-engineer"        },
  { name: "@lemonsqueezy/lemonsqueezy.js",        floor: "4.0.0",   owner: "@payments-engineer"        },
  { name: "@polar-sh/sdk",                        floor: "0.47.1",  owner: "@payments-engineer"        },
  // Observability
  { name: "@sentry/nextjs",                       floor: "10.52.0", owner: "@devops-engineer"          },
  // PDF
  { name: "@react-pdf/renderer",                  floor: "4.5.1",   owner: "@docs-writer"              },
  // Lint + format + tooling
  { name: "eslint",                               floor: "10.3.0",  owner: "@devops-engineer"          },
  { name: "prettier",                             floor: "3.8.3",   owner: "@devops-engineer"          },
  { name: "eslint-config-prettier",               floor: "10.1.8",  owner: "@devops-engineer"          },
  { name: "eslint-plugin-import",                 floor: "2.32.0",  owner: "@devops-engineer"          },
  { name: "@typescript-eslint/parser",            floor: "8.59.2",  owner: "@devops-engineer"          },
  { name: "@typescript-eslint/eslint-plugin",     floor: "8.59.2",  owner: "@devops-engineer"          },
  { name: "prettier-plugin-tailwindcss",          floor: "0.8.0",   owner: "@devops-engineer"          },
  { name: "mprocs",                               floor: "0.9.2",   owner: "@devops-engineer"          },
  { name: "turbo",                                floor: "2.9.12",  owner: "@devops-engineer"          },
];

// =====================================================================
// 2. Helpers
// =====================================================================

const args = process.argv.slice(2);
const wantJson = args.includes("--json");
const failOnOrange = args.find((a) => a.startsWith("--fail-on="))?.split("=")[1] === "orange";

interface Row {
  name: string;
  floor: string;
  latest: string;
  status: "GREEN" | "YELLOW" | "ORANGE" | "RED" | "UNKNOWN";
  owner: string;
  delta: string;
}

/** Parse a semver into [major, minor, patch]. Tolerates suffixes (-beta, -rc.1, etc.). */
function parseSemver(v: string): [number, number, number] {
  const cleaned = v.split("-")[0]!.split("+")[0]!;
  const parts = cleaned.split(".").map((n) => Number.parseInt(n, 10));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/** Compare a floor against the latest published version and bucket the result. */
function classify(floor: string, latest: string): Row["status"] {
  if (!latest || latest === "ERR") return "UNKNOWN";
  const [fMaj, fMin] = parseSemver(floor);
  const [lMaj, lMin] = parseSemver(latest);
  if (lMaj > fMaj + 1) return "RED";
  if (lMaj === fMaj + 1) return "ORANGE";
  if (lMaj === fMaj && lMin > fMin) return "YELLOW";
  return "GREEN";
}

/** Query the npm registry for a package's `latest` dist-tag. */
function fetchLatest(name: string): string {
  try {
    return execSync(`npm view ${name} version --silent`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "ERR";
  }
}

// =====================================================================
// 3. Main
// =====================================================================

const rows: Row[] = LOCKED.map((lk) => {
  const latest = fetchLatest(lk.name);
  const status = classify(lk.floor, latest);
  const [fMaj] = parseSemver(lk.floor);
  const [lMaj] = parseSemver(latest === "ERR" ? lk.floor : latest);
  const delta = status === "UNKNOWN" ? "?" : `${lMaj - fMaj} major`;
  return { name: lk.name, floor: lk.floor, latest, status, owner: lk.owner, delta };
});

if (wantJson) {
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), rows }, null, 2));
} else {
  const C = {
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    ORANGE: "\x1b[38;5;208m",
    RED: "\x1b[31m",
    UNKNOWN: "\x1b[35m",
    reset: "\x1b[0m",
  };
  console.log("\nOGS Platform — stack currency check\n");
  console.log(`Date: ${new Date().toISOString()}\n`);
  console.log(`${"PACKAGE".padEnd(40)} ${"LOCKED".padEnd(12)} ${"LATEST".padEnd(12)} ${"STATUS".padEnd(8)} ${"DELTA".padEnd(8)} OWNER`);
  console.log("-".repeat(110));
  for (const r of rows) {
    const c = C[r.status];
    console.log(
      `${r.name.padEnd(40)} ${r.floor.padEnd(12)} ${r.latest.padEnd(12)} ${c}${r.status.padEnd(8)}${C.reset} ${r.delta.padEnd(8)} ${r.owner}`
    );
  }
  console.log();
  const counts = rows.reduce<Record<Row["status"], number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    { GREEN: 0, YELLOW: 0, ORANGE: 0, RED: 0, UNKNOWN: 0 }
  );
  console.log(`Summary: ${counts.GREEN} green · ${counts.YELLOW} yellow · ${counts.ORANGE} orange · ${counts.RED} red · ${counts.UNKNOWN} unknown`);
}

const red = rows.filter((r) => r.status === "RED" || r.status === "UNKNOWN").length;
const orange = rows.filter((r) => r.status === "ORANGE").length;

if (red > 0) {
  console.error(`\n[BLOCK] ${red} package(s) are RED or UNKNOWN. STOP and open an emergency ADR. Owners must be notified.\n`);
  process.exit(2);
}
if (orange > 0 && failOnOrange) {
  console.error(`\n[WARN] ${orange} package(s) are ORANGE (one major behind). --fail-on=orange triggered exit.\n`);
  process.exit(1);
}
if (orange > 0) {
  console.warn(`\n[WARN] ${orange} package(s) are ORANGE (one major behind). Open an ADR within the week.\n`);
}
process.exit(0);
