/**
 * `Sonner` — shadcn's modern toast primitive (replaces the legacy
 * `Toast`). Bridges Sonner's theme prop to next-themes so toasts
 * track light/dark mode.
 *
 * Mount `<Toaster />` once in the app root.
 *
 * @see https://ui.shadcn.com/docs/components/sonner
 */
"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  // next-themes may return `undefined` before the provider hydrates;
  // `exactOptionalPropertyTypes` rejects passing that through.
  // Narrow to Sonner's exact union or fall back to "system".
  const { theme } = useTheme();
  const resolvedTheme: "system" | "dark" | "light" =
    theme === "dark" || theme === "light" ? theme : "system";

  return (
    <SonnerToaster
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { toast } from "sonner";
