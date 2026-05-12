#!/usr/bin/env node
/**
 * Live SMTP smoke test for @ogs/email.
 *
 * Dispatches a verify-email template to MAIL_TO and prints the
 * messageId. Exits non-zero on transport / send failure. No DB
 * writes, no Better Auth coupling.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx tooling/scripts/smoke-email.mjs
 *
 *   `--env-file` (Node 20+) loads SMTP_* from .env.local.
 *   `--import tsx` lets the dynamic `import(...packages/email/src/index.ts)`
 *      below resolve the TypeScript source. Without it Node refuses
 *      to load `.ts` and the script aborts with ERR_UNKNOWN_FILE_EXTENSION.
 */
const { sendVerifyEmail } = await import("../../packages/email/src/index.ts");

const to = process.env.MAIL_TO;
if (!to) {
  console.error("[smoke] MAIL_TO not set — pass --env-file=.env.local");
  process.exit(1);
}

const startedAt = Date.now();
console.log(`[smoke] dispatch → ${to} via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);

try {
  const { messageId } = await sendVerifyEmail({
    to,
    verifyUrl: "https://id.ogs-tc.com/verify?token=smoke-test",
    appName: "OGS Smoke",
    correlationId: `smoke-${Date.now()}`,
  });
  console.log(`[smoke] DELIVERED in ${Date.now() - startedAt}ms — messageId=${messageId}`);
  process.exit(0);
} catch (err) {
  console.error(`[smoke] FAILED in ${Date.now() - startedAt}ms`);
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
