import nextConfig from "@ogs/eslint-config/next.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
