/**
 * Shared React Email layout — every transactional message renders
 * inside `<EmailLayout>`, which provides the OGS header logo, a
 * preview-text slot, and a compliance footer.
 *
 * Preview text is the first ~140 chars an inbox client shows next
 * to the subject; we expose it as a prop so each template picks
 * one suited to its message.
 */
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import type { CSSProperties } from "react";

export interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={brandStyle}>OGS</Text>
          </Section>

          <Section>{children}</Section>

          <Hr style={hrStyle} />

          <Section>
            <Text style={footerStyle}>
              You received this email because someone (hopefully you) used your address with the OGS
              platform. If you don&apos;t recognise this activity, you can safely ignore this
              message.
            </Text>
            <Text style={footerStyle}>OGS — Oil & Gas Smart Solutions · ogs-tc.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: CSSProperties = {
  backgroundColor: "#fafafa",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "32px 0",
};

const containerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const headerStyle: CSSProperties = {
  paddingBottom: "16px",
};

const brandStyle: CSSProperties = {
  color: "#0a0a0a",
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  margin: 0,
};

const hrStyle: CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const footerStyle: CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
};
