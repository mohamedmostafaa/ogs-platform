/**
 * SMTP env-var resolver + Zod validation.
 *
 * Reads the seven SMTP_* keys + MAIL_FROM at module load. In
 * production, missing keys throw immediately; during `next build`
 * (`NEXT_PHASE=phase-production-build`) we return a placeholder
 * config so route metadata can be collected without a real
 * mailbox — the runtime transport never connects with placeholder
 * credentials (a defence-in-depth guard refuses to send if the host
 * still equals the build-time sentinel).
 *
 * **Secret discipline:**
 *   - `SMTP_PASS` is read once into a getter; it is NEVER returned
 *     by a `toJSON()` representation of `SmtpConfig` and NEVER
 *     logged. Use the getter at the call site of `transporter`.
 *   - The frozen `SmtpConfig` object hides the password under a
 *     non-enumerable property.
 *
 * @see Blueprint §18.3, SECURITY.md Gate 8.
 */
import { z } from "zod";

const PLACEHOLDER_HOST = "smtp.build-time-placeholder.invalid";

const SmtpEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  SMTP_TLS_SERVERNAME: z.string().optional(),
  SMTP_TLS_REJECT_UNAUTHORIZED: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
  MAIL_FROM: z.string().email(),
  MAIL_REPLY_TO: z.string().email().optional(),
});

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    /**
     * The password getter — call only at transporter-construction
     * time. The value is intentionally NOT enumerable on the parent
     * object so accidental `console.log(config.auth)` cannot leak it.
     */
    readonly pass: string;
  };
  tls: {
    servername: string | undefined;
    rejectUnauthorized: boolean;
  };
  from: string;
  replyTo: string | undefined;
}

/**
 * Frozen, redaction-safe SMTP config. The password is held in a
 * closure and exposed via a non-enumerable getter so `JSON.stringify`
 * and spread (`...config.auth`) won't carry it.
 */
function buildConfig(env: z.infer<typeof SmtpEnvSchema>): SmtpConfig {
  const password = env.SMTP_PASS;
  const auth = Object.create(null) as { user: string; pass: string };
  auth.user = env.SMTP_USER;
  Object.defineProperty(auth, "pass", {
    enumerable: false,
    configurable: false,
    get() {
      return password;
    },
  });
  return Object.freeze({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: auth as SmtpConfig["auth"],
    tls: Object.freeze({
      servername: env.SMTP_TLS_SERVERNAME,
      rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED,
    }),
    from: env.MAIL_FROM,
    replyTo: env.MAIL_REPLY_TO,
  });
}

let cached: SmtpConfig | undefined;

/**
 * Returns the resolved SMTP config. Cached after first call.
 *
 * Throws in production if a required key is missing. During
 * `next build` returns a placeholder so route discovery doesn't
 * crash.
 */
export function getSmtpConfig(): SmtpConfig {
  if (cached) return cached;

  const parsed = SmtpEnvSchema.safeParse(process.env);
  if (parsed.success) {
    cached = buildConfig(parsed.data);
    return cached;
  }

  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    // Surface which keys are missing without leaking values.
    const missing = parsed.error.issues
      .map((i) => i.path.join("."))
      .filter((p, idx, arr) => arr.indexOf(p) === idx)
      .join(", ");
    throw new Error(
      `[@ogs/email] SMTP env validation failed in production. Missing/invalid: ${missing}.`,
    );
  }

  // Build-time / dev placeholder. The transport refuses to connect
  // when `host` still equals this sentinel (see transport.ts).
  cached = Object.freeze({
    host: PLACEHOLDER_HOST,
    port: 465,
    secure: true,
    auth: Object.freeze({ user: "placeholder", pass: "" }),
    tls: Object.freeze({ servername: undefined, rejectUnauthorized: true }),
    from: "no-reply@build-time-placeholder.invalid",
    replyTo: undefined,
  });
  return cached;
}

/** Exposed for the transport's defence-in-depth check. */
export const SMTP_PLACEHOLDER_HOST = PLACEHOLDER_HOST;
