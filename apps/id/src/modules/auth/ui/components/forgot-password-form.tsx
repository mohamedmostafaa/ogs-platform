/**
 * `<ForgotPasswordForm>` — react-hook-form + zod password-reset request.
 *
 * On success the form transitions to its "check your inbox" state. The
 * acknowledgement is identical regardless of whether the email matches
 * an account (Gate 3 — no enumeration).
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@ogs/ui/primitives";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@ogs/ui/primitives";

import { useForgotPassword } from "~/modules/auth/hooks/use-forgot-password";
import { FORGOT_PASSWORD_OK, ForgotPasswordSchema } from "~/modules/auth/schema";
import type { ForgotPasswordInput } from "~/modules/auth/types";

/** Forgot-password form rendered inside the `(auth)/forgot-password` page. */
export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgot = useForgotPassword();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => forgot.mutate({ email: values.email }))}
        className="flex flex-col gap-4"
        noValidate
      >
        {forgot.isSuccess ? (
          <Alert>
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>{FORGOT_PASSWORD_OK}</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" inputMode="email" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending ? "Sending…" : "Send reset link"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          <Link href="/login" className="hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
