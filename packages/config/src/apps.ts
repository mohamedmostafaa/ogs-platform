/**
 * The eight OGS apps — single source of truth for slug, port, public
 * URL pattern, and human label.
 *
 * Consumed by:
 *   - `mprocs.yaml` (via a generator, when we add one)
 *   - app middleware to choose its OIDC client
 *   - the Admin app's app-selector
 *   - SSO `redirect_uri` registry
 *
 * @see Blueprint §1.2 + §3.3.
 */

export const APP_NAMES = [
  "id",
  "careers",
  "skillpass",
  "academy",
  "eco",
  "enterprise",
  "admin",
  "corporate",
] as const;
export type AppName = (typeof APP_NAMES)[number];

export interface AppDescriptor {
  /** Workspace name — matches `apps/<slug>/package.json` "name". */
  slug: AppName;
  /** Local dev port — matches `mprocs.yaml`. */
  port: number;
  /** Human-readable label for navigation, breadcrumbs, emails. */
  label: string;
  /**
   * Production subdomain under `ogs-tc.com`. The corporate site is the
   * apex (`www`).
   */
  subdomain: string;
}

export const APPS: Record<AppName, AppDescriptor> = {
  id: { slug: "id", port: 3000, label: "OGS Identity", subdomain: "id" },
  careers: { slug: "careers", port: 3001, label: "OGS Careers", subdomain: "careers" },
  skillpass: { slug: "skillpass", port: 3002, label: "OGS SkillPass", subdomain: "skillpass" },
  academy: { slug: "academy", port: 3003, label: "OGS Academy", subdomain: "academy" },
  eco: { slug: "eco", port: 3004, label: "OGS ECO", subdomain: "eco" },
  enterprise: { slug: "enterprise", port: 3005, label: "OGS Enterprise", subdomain: "enterprise" },
  admin: { slug: "admin", port: 3006, label: "OGS Admin", subdomain: "admin" },
  corporate: { slug: "corporate", port: 3007, label: "OGS Corporate", subdomain: "www" },
};
