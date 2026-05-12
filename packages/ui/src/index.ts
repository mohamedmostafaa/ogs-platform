/**
 * `@ogs/ui` — OGS design system root barrel.
 *
 * Most consumers should import from the sub-paths:
 *   - `@ogs/ui/primitives` — shadcn primitives.
 *   - `@ogs/ui/entityx`    — list / table primitives.
 *   - `@ogs/ui/avatar`     — branded avatars.
 *   - `@ogs/ui/theme`      — provider + toggle.
 *
 * This root export re-exports the whole surface for convenience.
 */
export * from "./primitives";
export * from "./entityx";
export * from "./avatar";
export * from "./theme";
export { cn } from "./lib/cn";
