/**
 * `/signup` — email-and-password account creation.
 *
 * Server component; the client form lives in `./signup-form.tsx`.
 * Successful submission redirects to `/login?status=check-email`
 * because `emailVerification.sendOnSignUp: true` dispatches the
 * verify-email automatically.
 *
 * @see Blueprint §6.1.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account · OGS Identity" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>One sign-in for every OGS app.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
