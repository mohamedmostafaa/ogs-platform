/**
 * `<SignInView>` — composes the `(auth)/login` page.
 *
 * The route file in `app/` is composition-only (~10 lines). All
 * presentational decisions — card chrome, status banners, callback
 * sanitisation — live here.
 */
import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { SignInForm } from "~/modules/auth/ui/components/sign-in-form";
import { safeCallbackURL } from "~/modules/auth/schema";

/**
 * @param props.callbackURL  Raw `?callbackURL=…` value from the URL —
 *                           re-sanitised here so the prop interface
 *                           accepts the unfiltered string.
 * @param props.status       Optional banner key (`"check-email"` after
 *                           signup, `"password-reset"` after a reset).
 */
export function SignInView({
  callbackURL,
  status,
}: {
  callbackURL?: string | undefined;
  status?: string | undefined;
}) {
  const safe = safeCallbackURL(callbackURL);
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
        <SignInForm callbackURL={safe} />
      </CardContent>
    </Card>
  );
}
