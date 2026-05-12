import library from "@ogs/eslint-config/library.js";

export default [
  ...library,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
