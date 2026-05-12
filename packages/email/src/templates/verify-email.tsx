/**
 * Verify-email template.
 *
 * Used by Better Auth's `sendVerificationEmail` hook when a new
 * email-and-password signup needs to confirm their address.
 */
import { Button, Heading, Section, Text } from "@react-email/components";

import { EmailLayout } from "./_layout";
import type { CSSProperties } from "react";

export interface VerifyEmailProps {
  /** Absolute HTTPS URL the user clicks to confirm their email. */
  verifyUrl: string;
  /** App name shown in the heading. */
  appName: string;
}

export function VerifyEmailEmail({ verifyUrl, appName }: VerifyEmailProps) {
  return (
    <EmailLayout preview={`Confirm your ${appName} email address`}>
      <Heading style={headingStyle}>Confirm your email</Heading>
      <Text style={paragraphStyle}>
        Welcome to {appName}. Click the button below to confirm this is your email address and
        finish setting up your account.
      </Text>

      <Section style={buttonContainerStyle}>
        <Button href={verifyUrl} style={buttonStyle}>
          Confirm email
        </Button>
      </Section>

      <Text style={smallStyle}>
        Or paste this link into your browser:
        <br />
        <span style={linkSpanStyle}>{verifyUrl}</span>
      </Text>

      <Text style={paragraphStyle}>
        This link expires in 24 hours. If you didn&apos;t create an OGS account, you can ignore this
        email.
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
