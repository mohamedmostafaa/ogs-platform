/**
 * `@ogs/email` — transactional email surface for OGS.
 *
 * Public API:
 *   - `sendEmail(...)`              — generic dispatcher.
 *   - `sendOTPEmail(...)`           — magic 6-digit OTP.
 *   - `sendVerifyEmail(...)`        — email confirmation link.
 *   - `sendPasswordResetEmail(...)` — password reset link.
 *   - `sendWelcomeEmail(...)`       — post-provisioning welcome.
 *
 * Internals (`env.ts`, `transport.ts`, `render.ts`, `templates/`)
 * stay private; consumers should never need to import them.
 */
export {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendVerifyEmail,
  sendWelcomeEmail,
  type SendEmailInput,
  type SendEmailResult,
  type SendOTPEmailInput,
  type SendPasswordResetEmailInput,
  type SendVerifyEmailInput,
  type SendWelcomeEmailInput,
} from "./send";

export type {
  MagicOtpEmailProps,
  PasswordResetEmailProps,
  VerifyEmailProps,
  WelcomeEmailProps,
} from "./templates";
