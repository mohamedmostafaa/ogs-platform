/**
 * Welcome template — sent once after successful provisioning
 * (provisionUser hook in `@ogs/auth`).
 *
 * Phase-1 stub. Phase 02 will localise the body via next-intl and
 * link to the right next-step depending on the tenant.
 */
import { Heading, Text } from "@react-email/components";

import { EmailLayout } from "./_layout";
import type { CSSProperties } from "react";

export interface WelcomeEmailProps {
  firstName?: string | undefined;
  tenantSlug: string;
}

export function WelcomeEmail({ firstName, tenantSlug }: WelcomeEmailProps) {
  const greeting = firstName ? `Welcome, ${firstName}.` : "Welcome.";
  return (
    <EmailLayout preview={`${greeting} You're all set on OGS.`}>
      <Heading style={headingStyle}>{greeting}</Heading>
      <Text style={paragraphStyle}>
        Your OGS account is ready. You&apos;re now part of the <strong>{tenantSlug}</strong>{" "}
        workspace.
      </Text>
      <Text style={paragraphStyle}>
        Next steps will land in your inbox shortly — verified jobs, training, and credentials, all
        in one place.
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
