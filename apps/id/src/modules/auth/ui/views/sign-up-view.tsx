/**
 * `<SignUpView>` — composes the `(auth)/signup` page.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ogs/ui/primitives";

import { SignUpForm } from "~/modules/auth/ui/components/sign-up-form";

export function SignUpView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>One sign-in for every OGS app.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
