/**
 * `OgsUIProviders` — single composition root for the UI-layer
 * providers each app needs:
 *
 *   - `<TooltipProvider>`  — globally one Radix tooltip context.
 *   - `<ConfirmProvider>`  — promise-based confirm dialog.
 *   - `<ErrorModalProvider>` — promise-based error display.
 *
 * Mount once inside `<OgsThemeProvider>` and ABOVE the per-app data
 * providers (TRPCReactProvider, etc.) so toasts/dialogs are reachable
 * from any tree depth.
 */
"use client";

import * as React from "react";

import { TooltipProvider } from "../primitives/tooltip";
import { ConfirmProvider } from "./use-confirm";
import { ErrorModalProvider } from "./use-error-modal";

export function OgsUIProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <ErrorModalProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ErrorModalProvider>
    </TooltipProvider>
  );
}
