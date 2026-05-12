/**
 * `useErrorModal` — promise-based error display.
 *
 * Usage:
 *   const showError = useErrorModal();
 *   try { await mutate(...); }
 *   catch (err) { await showError({ title: "Couldn't save", message: err.message }); }
 *
 * Mounted via `<ErrorModalProvider>` from `@ogs/ui/theme` index. The
 * promise resolves on dismiss, so call sites can `await` to know the
 * user has acknowledged before continuing.
 *
 * @see Blueprint §9.5.
 */
"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog";
import { Button } from "../primitives/button";

export interface ErrorModalOptions {
  title?: string;
  message: string;
  dismissLabel?: string;
}

type Resolver = () => void;

interface PendingError extends ErrorModalOptions {
  resolve: Resolver;
}

interface ErrorModalContextValue {
  showError: (options: ErrorModalOptions) => Promise<void>;
}

const ErrorModalContext = React.createContext<ErrorModalContextValue | null>(null);

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingError | null>(null);

  const showError = React.useCallback(
    (options: ErrorModalOptions) =>
      new Promise<void>((resolve) => {
        setPending({ ...options, resolve });
      }),
    [],
  );

  // Functional updater for single-flight resolution under rapid clicks
  // / overlapping events (button click + onOpenChange close fire in
  // sequence). See use-confirm.tsx for the same pattern + rationale.
  const handleDismiss = () => {
    setPending((cur) => {
      if (!cur) return null;
      cur.resolve();
      return null;
    });
  };

  return (
    <ErrorModalContext.Provider value={{ showError }}>
      {children}
      <Dialog open={pending !== null} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.title ?? "Something went wrong"}</DialogTitle>
            <DialogDescription>{pending?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDismiss}>{pending?.dismissLabel ?? "Dismiss"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorModalContext.Provider>
  );
}

export function useErrorModal(): ErrorModalContextValue["showError"] {
  const ctx = React.useContext(ErrorModalContext);
  if (!ctx) {
    throw new Error(
      "useErrorModal must be used inside <ErrorModalProvider> (mount via <OgsUIProviders>).",
    );
  }
  return ctx.showError;
}
