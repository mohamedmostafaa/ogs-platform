/**
 * `<SignUpForm>` — react-hook-form + zod account-creation form.
 *
 * Mirrors `<SignInForm>` in shape but adds `name` + `confirmPassword`.
 * The `SignUpSchema.refine()` couples `password === confirmPassword`
 * and surfaces the mismatch on the `confirmPassword` field.
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

import { useSignUp } from "~/modules/auth/hooks/use-sign-up";
import { SignUpSchema } from "~/modules/auth/schema";
import type { SignUpInput } from "~/modules/auth/types";

/** Sign-up form rendered inside the `(auth)/signup` page. */
export function SignUpForm() {
  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signUp = useSignUp();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" required maxLength={120} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>Password</FormLabel>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
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
        {signUp.error ? (
          <Alert variant="destructive">
            <AlertDescription>{signUp.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" disabled={signUp.isPending}>
          {signUp.isPending ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          Already have an account?{" "}
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
