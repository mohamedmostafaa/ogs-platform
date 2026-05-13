/**
 * `/forbidden` — composition-only route.
 *
 * @see Blueprint §6.8.
 */
import { ForbiddenView } from "~/modules/auth/ui/views/forbidden-view";

export const metadata = {
  title: "Access denied · OGS Identity",
  description: "You don't have access to this page.",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return <ForbiddenView />;
}
