/**
 * `/forgot-password` — request a password-reset email.
 *
 * Server component. The page response is identical whether the email
 * matches an account or not (Gate 3 — no account enumeration).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Forgot password · OGS Identity" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotForm />
      </CardContent>
    </Card>
  );
}
