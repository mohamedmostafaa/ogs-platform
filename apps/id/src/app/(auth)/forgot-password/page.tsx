/**
 * `/forgot-password` — composition-only route.
 */
import { ForgotPasswordView } from "~/modules/auth/ui/views/forgot-password-view";

export const metadata = { title: "Forgot password · OGS Identity" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
