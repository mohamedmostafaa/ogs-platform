/**
 * `<ResetPasswordView>` — composes the `(auth)/reset-password` page.
 *
 * When `?token` is missing the user is shown a friendly error with a
 * link back to `/forgot-password`. The token never appears in the
 * rendered DOM beyond the hidden RHF field.
 */
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ogs/ui/primitives";

import { ResetPasswordForm } from "~/modules/auth/ui/components/reset-password-form";

/**
 * @param props.token  Raw `?token=…` value. When absent we show the
 *                     missing-token alert.
 */
export function ResetPasswordView({ token }: { token?: string | undefined }) {
  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link not valid</CardTitle>
          <CardDescription>The reset link is missing required information.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertTitle>Missing token</AlertTitle>
            <AlertDescription>
              Request a new reset link from the forgot-password page.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Pick a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
