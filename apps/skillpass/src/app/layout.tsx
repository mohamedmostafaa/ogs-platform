import "@ogs/ui/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { OgsThemeProvider } from "@ogs/ui/theme";

export const metadata: Metadata = {
  title: "OGS SkillPass",
  description: "OGS SkillPass — Portable, verifiable credentials for oil-and-gas workers.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <OgsThemeProvider>{children}</OgsThemeProvider>
      </body>
    </html>
  );
}
