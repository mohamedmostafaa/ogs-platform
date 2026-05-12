/**
 * Cross-cutting enums consumed by db, api, ui packages alike.
 *
 * These are duplicated in `prisma/schema/*` because Prisma needs them
 * at schema-parse time. When they change here, update the Prisma
 * enum too — the version-check workflow will catch divergence.
 *
 * @see Blueprint §4.
 */

/**
 * App-supported locales. Adding a new locale here also requires:
 *   1. A new translation file under `apps/<app>/messages/<locale>.json`.
 *   2. A NextIntl matcher update in `apps/<app>/proxy.ts`.
 *
 * Order matters: the first entry is the platform default.
 */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Reading direction per locale — drives the `<html dir>` attribute and
 * any conditional RTL logic in the design system.
 */
export const LOCALE_DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/**
 * Cross-cutting role taxonomy. The auth layer maps Better Auth roles
 * onto these strings; tRPC `requireRole(...)` guards consume them.
 */
export const ROLES = [
  "worker",
  "recruiter",
  "academy_admin",
  "enterprise_admin",
  "platform_admin",
] as const;
export type Role = (typeof ROLES)[number];
