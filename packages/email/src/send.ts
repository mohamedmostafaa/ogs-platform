/**
 * `sendEmail` — public dispatch API + typed convenience wrappers
 * for each canonical template.
 *
 * Every wrapper:
 *   - Validates inputs with Zod.
 *   - Renders the React Email template to HTML + text.
 *   - Adds correlation/X-OGS headers for log threading.
 *   - Hands the message to the pooled Nodemailer transporter.
 *
 * Errors propagate to the caller (Better Auth's send hooks). We do
 * NOT log the email body content — only structural metadata
 * (`messageId`, `to` redacted to local-part length) for forensics.
 *
 * @see Blueprint §18.4, SECURITY.md Gate 8.
 */
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import { getSmtpConfig } from "./env";
import { renderEmail } from "./render";
import {
  MagicOtpEmail,
  type MagicOtpEmailProps,
  PasswordResetEmail,
  type PasswordResetEmailProps,
  VerifyEmailEmail,
  type VerifyEmailProps,
  WelcomeEmail,
  type WelcomeEmailProps,
} from "./templates";
import { getTransporter } from "./transport";

const SendInputSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).max(998),
  replyTo: z.string().email().optional(),
  // Constrain correlation id to header-safe characters so it cannot
  // smuggle CR/LF/colons into the SMTP headers we emit (Gate 2).
  correlationId: z
    .string()
    .max(64)
    .regex(/^[A-Za-z0-9._:-]+$/, "correlationId must match /^[A-Za-z0-9._:-]+$/")
    .optional(),
});

export interface SendEmailInput extends z.infer<typeof SendInputSchema> {
  react: ReactElement;
}

export interface SendEmailResult {
  messageId: string;
}

/**
 * Core dispatcher. Use the per-template wrappers below for typed
 * payload validation; call this directly only for ad-hoc messaging
 * (admin tooling, one-off announcements).
 *
 * Rate limiting: none at this layer. Inbound abuse (e.g. sign-up
 * flood triggering verification emails) is throttled at the Arcjet
 * edge in `apps/web-id/src/proxy.ts` (SECURITY.md §6.3 — Gate 9).
 * Adding a second token-bucket here would double-count quota and
 * is intentionally avoided.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const parsed = SendInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`[@ogs/email] sendEmail input invalid: ${parsed.error.message}`);
  }

  const cfg = getSmtpConfig();
  const { html, text } = await renderEmail(input.react);

  const info = await getTransporter().sendMail({
    from: cfg.from,
    to: parsed.data.to,
    subject: parsed.data.subject,
    html,
    text,
    replyTo: parsed.data.replyTo ?? cfg.replyTo,
    headers: parsed.data.correlationId
      ? { "X-OGS-Correlation-Id": parsed.data.correlationId }
      : undefined,
  });

  return { messageId: info.messageId };
}

// ---- Typed convenience wrappers --------------------------------------------

export interface SendOTPEmailInput extends MagicOtpEmailProps {
  to: string;
  correlationId?: string;
}

export async function sendOTPEmail(input: SendOTPEmailInput): Promise<SendEmailResult> {
  return sendEmail({
    to: input.to,
    subject: `Your ${input.appName} sign-in code`,
    react: createElement(MagicOtpEmail, { code: input.code, appName: input.appName }),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
}

export interface SendVerifyEmailInput extends VerifyEmailProps {
  to: string;
  correlationId?: string;
}

export async function sendVerifyEmail(input: SendVerifyEmailInput): Promise<SendEmailResult> {
  return sendEmail({
    to: input.to,
    subject: `Confirm your ${input.appName} email`,
    react: createElement(VerifyEmailEmail, {
      verifyUrl: input.verifyUrl,
      appName: input.appName,
    }),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
}

export interface SendPasswordResetEmailInput extends PasswordResetEmailProps {
  to: string;
  correlationId?: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<SendEmailResult> {
  return sendEmail({
    to: input.to,
    subject: `Reset your ${input.appName} password`,
    react: createElement(PasswordResetEmail, {
      resetUrl: input.resetUrl,
      appName: input.appName,
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
    }),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
}

export interface SendWelcomeEmailInput extends WelcomeEmailProps {
  to: string;
  correlationId?: string;
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<SendEmailResult> {
  return sendEmail({
    to: input.to,
    subject: "Welcome to OGS",
    react: createElement(WelcomeEmail, {
      ...(input.firstName ? { firstName: input.firstName } : {}),
      tenantSlug: input.tenantSlug,
    }),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
}
