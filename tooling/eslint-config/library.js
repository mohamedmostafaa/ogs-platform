/**
 * Shared ESLint flat config (ESLint 10) for non-Next.js workspaces.
 *
 * Enforces:
 *   - TypeScript-aware parsing
 *   - Import ordering (third-party → @ogs/* → relative)
 *   - No console (warn/error allowed only)
 *   - No unused vars (with _ prefix escape hatch)
 *
 * Pair with eslint-config-prettier to silence stylistic rules.
 *
 * @see CODE_STANDARDS.md §3 (TypeScript), §1.3 (naming)
 */
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [{ pattern: "@ogs/**", group: "internal", position: "before" }],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
