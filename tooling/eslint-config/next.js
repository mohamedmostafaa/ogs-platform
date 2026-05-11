/**
 * Shared ESLint flat config for Next.js apps. Extends the library config with
 * Next.js-specific rules. The Next.js plugin is wired by the consuming app
 * (each app installs eslint-config-next as a devDep).
 *
 * @see CODE_STANDARDS.md §0.1
 */
import library from "./library.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...library,
  // Next.js-specific overlays are added when each app installs eslint-config-next.
];
