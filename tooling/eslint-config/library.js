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

/**
 * NOTE: `eslint-plugin-import` 2.32 still calls APIs that ESLint 10
 * removed (`sourceCode.getTokenOrCommentBefore`). Until the plugin
 * publishes an ESLint-10-compatible release, we omit `import/order`.
 * Next.js's own linter (eslint-config-next) covers basic ordering for
 * apps; we'll re-enable here once upstream lands the fix.
 *
 * Tracking: https://github.com/import-js/eslint-plugin-import/issues
 */
export default [
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
