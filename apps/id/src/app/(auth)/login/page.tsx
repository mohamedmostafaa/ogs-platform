/**
 * `/login` — email-and-password sign-in.
 *
 * Server component. The client form is broken out into
 * `./login-form.tsx` so we can use `useFormState` + `useFormStatus`.
 *
 * `searchParams.callbackURL` is sanitised on the server (relative-path
 * only — open-redirect guard) and forwarded as a hidden input.
 *
 * `searchParams.status` lets us render success banners after
 * round-trips (`check-email` after signup, `password-reset` after a
 * successful reset).
 *
 * @see Blueprint §6.1.
 */
import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { safeCallbackURL } from "../_schemas";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ callbackURL?: string; status?: string }>;
}

export const metadata = { title: "Sign in · OGS Identity" };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackURL: raw, status } = await searchParams;
  const callbackURL = safeCallbackURL(raw);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your OGS account to continue.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "check-email" ? (
          <Alert>
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              We sent a verification link to your email. Click it to finish setting up your account,
              then sign in below.
            </AlertDescription>
          </Alert>
        ) : null}
        {status === "password-reset" ? (
          <Alert>
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription>You can sign in with your new password.</AlertDescription>
          </Alert>
        ) : null}
        <LoginForm callbackURL={callbackURL} />
      </CardContent>
    </Card>
  );
}
