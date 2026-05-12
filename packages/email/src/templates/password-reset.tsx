/**
 * Password-reset template.
 *
 * Used by Better Auth's `sendPasswordResetEmail` hook. The optional
 * `ipAddress` field surfaces a security cue — users who didn't
 * request the reset can see WHO did.
 */
import { Button, Heading, Section, Text } from "@react-email/components";

import { EmailLayout } from "./_layout";
import type { CSSProperties } from "react";

export interface PasswordResetEmailProps {
  /** Absolute HTTPS URL with the reset token. */
  resetUrl: string;
  /** App name shown in the heading. */
  appName: string;
  /** Caller IP from the reset request (when known). */
  ipAddress?: string | undefined;
}

export function PasswordResetEmail({ resetUrl, appName, ipAddress }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview={`Reset your ${appName} password`}>
      <Heading style={headingStyle}>Reset your password</Heading>
      <Text style={paragraphStyle}>
        Someone requested a password reset for your {appName} account
        {ipAddress ? (
          <>
            {" "}
            from <strong>{ipAddress}</strong>
          </>
        ) : null}
        . Click the button below to set a new password.
      </Text>

      <Section style={buttonContainerStyle}>
        <Button href={resetUrl} style={buttonStyle}>
          Reset password
        </Button>
      </Section>

      <Text style={smallStyle}>
        Or paste this link into your browser:
        <br />
        <span style={linkSpanStyle}>{resetUrl}</span>
      </Text>

      <Text style={paragraphStyle}>
        This link expires in 1 hour and can only be used once. If you didn&apos;t request a reset,
        ignore this email — your existing password keeps working.
      </Text>
    </EmailLayout>
  );
}

const headingStyle: CSSProperties = {
  color: "#0a0a0a",
  fontSize: "22px",
  fontWeight: 600,
  margin: "0 0 16px",
};
const paragraphStyle: CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};
const buttonContainerStyle: CSSProperties = {
  margin: "24px 0",
  textAlign: "center",
};
const buttonStyle: CSSProperties = {
  backgroundColor: "#0a0a0a",
  borderRadius: "6px",
  color: "#fafafa",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};
const smallStyle: CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 16px",
};
const linkSpanStyle: CSSProperties = {
  color: "#404040",
  wordBreak: "break-all",
};
