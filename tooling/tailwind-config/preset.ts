/**
 * Shared Tailwind v4 preset for OGS apps and @ogs/ui.
 *
 * Tailwind v4 prefers CSS-side config via @theme blocks in globals.css; this
 * file is the place to declare shared content paths and any JS-side extension.
 * The OGS palette + dark-mode variables live in @ogs/ui/src/theme/tokens.css.
 *
 * @see Blueprint §3.5
 */
import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  content: [
    "../../packages/ui/src/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx,mdx}",
    "./app/**/*.{ts,tsx,mdx}",
  ],
  darkMode: ["class"],
};

export default preset;
