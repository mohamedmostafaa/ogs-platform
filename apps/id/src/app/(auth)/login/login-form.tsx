/**
 * Client form for `/login`. Uses `useActionState` (React 19) to
 * surface the uniform error message from `signInAction`.
 */
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert, AlertDescription } from "@ogs/ui/primitives";
import { Button, Input, Label } from "@ogs/ui/primitives";

import { signInAction } from "../_actions";
import type { FormState } from "../_schemas";

const INITIAL: FormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ callbackURL }: { callbackURL: string }) {
  const [state, action] = useActionState(signInAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="callbackURL" value={callbackURL} />
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-muted-foreground text-xs hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <SubmitButton />
      <p className="text-muted-foreground text-center text-xs">
        New here?{" "}
        <Link href="/signup" className="hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
