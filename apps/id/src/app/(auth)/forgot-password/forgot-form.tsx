/**
 * Client form for `/forgot-password`. On submit we always show the
 * uniform success message — server logic does the same.
 */
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import { Button, Input, Label } from "@ogs/ui/primitives";

import { FORGOT_PASSWORD_OK, forgotPasswordAction } from "../_actions";
import type { FormState } from "../_schemas";

const INITIAL: FormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPasswordAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.status === "ok" ? (
        <Alert>
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>{FORGOT_PASSWORD_OK}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>
      <SubmitButton />
      <p className="text-muted-foreground text-center text-xs">
        <Link href="/login" className="hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
