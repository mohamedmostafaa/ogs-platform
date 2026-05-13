/**
 * `<ForgotPasswordView>` — composes the `(auth)/forgot-password` page.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { ForgotPasswordForm } from "~/modules/auth/ui/components/forgot-password-form";

export function ForgotPasswordView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
