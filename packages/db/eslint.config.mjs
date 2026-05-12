import library from "@ogs/eslint-config/library.js";

export default [
  ...library,
  {
    ignores: ["src/generated/**", "node_modules/**"],
  },
];
