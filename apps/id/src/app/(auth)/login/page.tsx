/**
 * `/login` — composition-only route. The view lives in
 * `~/modules/auth/ui/views/sign-in-view.tsx` per CODE_STANDARDS §1.1.
 *
 * @see Blueprint §6.1.
 */
import { SignInView } from "~/modules/auth/ui/views/sign-in-view";

export const metadata = { title: "Sign in · OGS Identity" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string; status?: string }>;
}) {
  const sp = await searchParams;
  return <SignInView callbackURL={sp.callbackURL} status={sp.status} />;
}
