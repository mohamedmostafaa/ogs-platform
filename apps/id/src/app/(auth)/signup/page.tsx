/**
 * `/signup` — composition-only route.
 *
 * @see Blueprint §6.1.
 */
import { SignUpView } from "~/modules/auth/ui/views/sign-up-view";

export const metadata = { title: "Create account · OGS Identity" };

export default function SignupPage() {
  return <SignUpView />;
}
