/**
 * `useConfirm` — promise-based confirmation dialog.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm("Delete this job posting?", { destructive: true });
 *   if (!ok) return;
 *
 * Mounts a single `<AlertDialog>` via `<ConfirmProvider>` (re-exported
 * by `@ogs/ui/theme`). Resolving the promise on dismiss means call
 * sites never have to thread state — match the Blueprint §10.3
 * contract.
 *
 * @see Blueprint §10.3.
 */
"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../primitives/alert-dialog";
import { buttonVariants } from "../primitives/button";
import { cn } from "../lib/cn";

export interface ConfirmOptions {
  title?: string;
  message: string;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

type Resolver = (value: boolean) => void;

interface PendingConfirm extends ConfirmOptions {
  resolve: Resolver;
}

interface ConfirmContextValue {
  /** Open the dialog; resolves true on confirm, false on cancel/dismiss. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null);

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      }),
    [],
  );

  // Use the functional updater so concurrent calls (e.g. user clicks
  // Confirm AND Radix fires onOpenChange(false) synchronously as the
  // dialog closes) see the latest value — guarantees single-flight
  // resolution. The first call resolves and returns null; subsequent
  // calls see `cur === null` and become no-ops.
  const handleDismiss = (result: boolean) => {
    setPending((cur) => {
      if (!cur) return null;
      cur.resolve(result);
      return null;
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          // Closing without click (esc, overlay) counts as cancel.
          if (!open) handleDismiss(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title ?? "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>{pending?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDismiss(false)}>
              {pending?.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDismiss(true)}
              className={cn(pending?.destructive && buttonVariants({ variant: "destructive" }))}
            >
              {pending?.confirmLabel ?? (pending?.destructive ? "Delete" : "Continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm must be used inside <ConfirmProvider> (mount via <OgsUIProviders>).",
    );
  }
  return ctx.confirm;
}
