/**
 * Pooled Nodemailer transport singleton.
 *
 * Created lazily on first use — `next build`'s module-load phase
 * never opens a connection. Pool settings cap parallel TLS handshakes
 * during signup-burst traffic (one connection per signup would
 * exhaust the mail server's max-connections-per-IP limit).
 *
 * Defence-in-depth: if the SMTP host still equals the build-time
 * placeholder at SEND time, refuse and throw — never silently send
 * to a sinkhole.
 *
 * @see Blueprint §18.3.
 */
import nodemailer, { type Transporter } from "nodemailer";

import { SMTP_PLACEHOLDER_HOST, getSmtpConfig } from "./env";

declare global {
  var __ogsMailTransport: Transporter | undefined;
}

function buildTransporter(): Transporter {
  const cfg = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.auth.user,
      pass: cfg.auth.pass,
    },
    tls: {
      // Override servername when the mail server's TLS cert is issued
      // to a hosting-provider name (Namecheap private email, for
      // example, uses registrar-servers.com).
      servername: cfg.tls.servername,
      rejectUnauthorized: cfg.tls.rejectUnauthorized,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  // Fire-and-forget verify; do NOT block startup. Surface a structured
  // log line so ops can grep for it. We never log the password — the
  // SmtpConfig getter shape keeps it non-enumerable.
  transporter
    .verify()
    .then(() => {
      // eslint-disable-next-line no-console
      console.info("[@ogs/email] SMTP transport verified", { host: cfg.host, port: cfg.port });
    })
    .catch((err: unknown) => {
      // Log only structured failure code/name — never the raw error
      // message, which on Nodemailer auth failures can echo the
      // username back into logs (Gate 8: minimise PII in logs).
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : err instanceof Error
            ? err.name
            : "unknown";
      console.warn("[@ogs/email] SMTP transport verify failed (will retry on first send)", {
        host: cfg.host,
        port: cfg.port,
        code,
      });
    });

  return transporter;
}

/**
 * Lazily resolve the singleton transporter. Cached on globalThis so
 * Next.js HMR doesn't leak a connection pool per reload.
 */
export function getTransporter(): Transporter {
  // Hard-fail if a real send is attempted with the build-time
  // placeholder host. This prevents a misconfigured prod from
  // silently delivering to a sinkhole.
  const cfg = getSmtpConfig();
  if (cfg.host === SMTP_PLACEHOLDER_HOST) {
    throw new Error(
      "[@ogs/email] SMTP transport requested with build-time placeholder host. " +
        "Configure SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_FROM in the runtime env.",
    );
  }
  if (!globalThis.__ogsMailTransport) {
    globalThis.__ogsMailTransport = buildTransporter();
  }
  return globalThis.__ogsMailTransport;
}
