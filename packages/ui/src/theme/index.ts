/**
 * `@ogs/ui/theme` — theme provider + toggle.
 *
 * Mount `<OgsThemeProvider>` once in every app's root layout. Place
 * `<ThemeToggle>` wherever a user-facing theme switcher belongs
 * (usually the global header).
 */
export { OgsThemeProvider } from "./provider";
export { ThemeToggle } from "./theme-toggle";
export { resolveBrand, type BrandTokens } from "./brand";
