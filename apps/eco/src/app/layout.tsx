import "@ogs/ui/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { OgsThemeProvider } from "@ogs/ui/theme";

export const metadata: Metadata = {
  title: "OGS Eco",
  description: "OGS Eco — Ecosystem hub for partners and developers building on OGS.",
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
