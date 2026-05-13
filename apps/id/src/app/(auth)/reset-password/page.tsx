/**
 * `/reset-password` — composition-only route.
 */
import { ResetPasswordView } from "~/modules/auth/ui/views/reset-password-view";

export const metadata = { title: "Reset password · OGS Identity" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  return <ResetPasswordView token={sp.token} />;
}
