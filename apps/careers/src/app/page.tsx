/**
 * OGS Careers — Phase 01 landing page.
 *
 * Branded shell pulled from `@ogs/ui`. Sign-in goes through the
 * identity hub (id.ogs-tc.com) once Phase 02 wires the OIDC client.
 */
import { AppShell } from "@ogs/ui/app-shell";

export default function Page() {
  return (
    <AppShell
      title="OGS Careers"
      tagline="Where verified workers meet hiring companies across the energy sector."
    />
  );
}
