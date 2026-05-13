/**
 * `<ResetPasswordForm>` — react-hook-form + zod password-reset form.
 *
 * Token is a prop (read from `searchParams` upstream) and never
 * surfaces in the DOM beyond the hidden form value RHF manages. On
 * success the hook routes to `/login?status=password-reset`.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@ogs/ui/primitives";
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

import { useResetPassword } from "~/modules/auth/hooks/use-reset-password";
import { ResetPasswordSchema } from "~/modules/auth/schema";
import type { ResetPasswordInput } from "~/modules/auth/types";

/**
 * Reset-password form. The token comes in from `?token=…` (Better Auth's
 * `forgetPassword`-with-redirectTo flow) and rides along as a hidden
 * value inside the RHF state — never rendered in the DOM.
 *
 * @param props.token  The opaque Better Auth reset token.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const reset = useResetPassword();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => reset.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {reset.error ? (
          <Alert variant="destructive">
            <AlertDescription>{reset.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {reset.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  );
}
