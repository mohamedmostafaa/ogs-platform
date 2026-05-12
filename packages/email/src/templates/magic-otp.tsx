/**
 * Magic OTP email — 6-digit one-time code.
 *
 * Used by Better Auth's emailOTP plugin for the passwordless sign-in
 * flow (Phase 02 sign-in UI). Code is rendered as a giant centered
 * tile so screen readers + scanners pick it up without copy issues.
 *
 * @see Blueprint §18.4, §6.2.
 */
import { Heading, Section, Text } from "@react-email/components";

import { EmailLayout } from "./_layout";
import type { CSSProperties } from "react";

export interface MagicOtpEmailProps {
  /** 6-digit numeric code (Better Auth `emailOTP` generates this). */
  code: string;
  /** App name shown in the heading ("OGS Careers", "OGS Identity", ...). */
  appName: string;
}

export function MagicOtpEmail({ code, appName }: MagicOtpEmailProps) {
  return (
    <EmailLayout preview={`Your ${appName} sign-in code: ${code}`}>
      <Heading style={headingStyle}>Your sign-in code</Heading>
      <Text style={paragraphStyle}>
        Use the code below to finish signing in to {appName}. It expires in 10 minutes.
      </Text>

      <Section style={codeBoxStyle}>
        <Text style={codeStyle}>{code}</Text>
      </Section>

      <Text style={paragraphStyle}>
        If you didn&apos;t request this code, you can ignore this email — your account is safe.
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

const codeBoxStyle: CSSProperties = {
  backgroundColor: "#f5f5f5",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "24px",
  margin: "16px 0 24px",
  textAlign: "center",
};

const codeStyle: CSSProperties = {
  color: "#0a0a0a",
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "0.4em",
  margin: 0,
};
