import "@ogs/ui/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Toaster } from "@ogs/ui/primitives";
import { OgsThemeProvider } from "@ogs/ui/theme";

import { TRPCReactProvider } from "~/lib/trpc";

export const metadata: Metadata = {
  title: "OGS Identity",
  description: "OGS Identity — workforce-trust SSO hub.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <OgsThemeProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors closeButton />
        </OgsThemeProvider>
      </body>
    </html>
  );
}
