/**
 * OGS Platform — root ESLint flat config (ESLint 10).
 *
 * Composes the shared @ogs/eslint-config library + next presets, then disables
 * stylistic rules that conflict with Prettier. Legacy .eslintrc is forbidden
 * (removed in ESLint 10 — see blueprint §3.1.1).
 *
 * @see CODE_STANDARDS.md §3 (TypeScript), §0.1 (locked-major conventions)
 */
import library from "@ogs/eslint-config/library.js";
import next from "@ogs/eslint-config/next.js";
import prettier from "eslint-config-prettier";

export default [
  ...library,
  ...next,
  prettier,
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "packages/db/src/generated/**",
      "node_modules/**",
    ],
  },
];
