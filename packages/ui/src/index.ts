/**
 * `@ogs/ui` — OGS design system root barrel.
 *
 * Most consumers should import from the sub-paths:
 *   - `@ogs/ui/primitives`           — shadcn primitives.
 *   - `@ogs/ui/entityx`              — list / table primitives.
 *   - `@ogs/ui/avatar`               — branded avatars.
 *   - `@ogs/ui/theme`                — provider + toggle + brand resolver.
 *   - `@ogs/ui/hooks`                — useConfirm, useErrorModal, useEntitySearch,
 *                                       OgsUIProviders composition root.
 *   - `@ogs/ui/assets/agent-avatars` — 12 inline-SVG mark components.
 */
export * from "./primitives";
export * from "./entityx";
export * from "./avatar";
export * from "./theme";
export * from "./hooks";
export { cn } from "./lib/cn";
