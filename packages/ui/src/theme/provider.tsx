/**
 * `OgsThemeProvider` — wraps `next-themes` with OGS defaults.
 *
 * - `attribute="class"` — dark mode toggles a `.dark` class on <html>,
 *   matching the CSS variables in `styles/globals.css`.
 * - `defaultTheme="system"` — respects OS preference until the user
 *   picks an explicit theme.
 * - `disableTransitionOnChange` — avoids the flash of un-themed content
 *   when toggling.
 *
 * Mount once in every app's root layout, ABOVE every other client
 * provider so children can read the active theme.
 */
"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import * as React from "react";

export function OgsThemeProvider({ children, ...rest }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...rest}
    >
      {children}
    </NextThemesProvider>
  );
}
