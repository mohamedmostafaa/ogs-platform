/**
 * `/reset-password` — consume the token from the email link, set a
 * new password.
 *
 * The token comes in via `?token=…` (Better Auth's
 * `forgetPassword`-with-redirectTo flow). We surface a friendly
 * error if the token is absent — never echo the token in the page.
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

import { ResetForm } from "./reset-form";

interface ResetPageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = { title: "Reset password · OGS Identity" };

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const { token } = await searchParams;

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
        <ResetForm token={token} />
      </CardContent>
    </Card>
  );
}
