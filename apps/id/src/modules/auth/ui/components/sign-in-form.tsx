/**
 * `<SignInForm>` — react-hook-form + zod email/password form.
 *
 * Per CODE_STANDARDS §4.5 forms use RHF + zod via `@hookform/resolvers`.
 * The schema lives in `modules/auth/schema.ts` (single source of truth).
 *
 * Submission flows through `useSignIn`, which posts to
 * `trpc.auth.signIn` and routes to `callbackURL` on success. Errors
 * surface as a toast AND inline beside the submit button.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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

import { useSignIn } from "~/modules/auth/hooks/use-sign-in";
import { SignInSchema } from "~/modules/auth/schema";
import type { SignInInput } from "~/modules/auth/types";

/**
 * Sign-in form rendered inside the `(auth)/login` page.
 *
 * @param props.callbackURL  Same-origin relative path to navigate to on
 *                           success — already validated upstream by
 *                           `safeCallbackURL` in the route component.
 */
export function SignInForm({ callbackURL }: { callbackURL: string }) {
  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signIn = useSignIn({ callbackURL });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground text-xs hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {signIn.error ? (
          <Alert variant="destructive">
            <AlertDescription>{signIn.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" disabled={signIn.isPending}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          New here?{" "}
          <Link href="/signup" className="hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </Form>
  );
}
