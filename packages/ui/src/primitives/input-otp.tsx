/**
 * `InputOTP` — shadcn/ui new-york InputOTP primitive family.
 *
 * Segmented one-time-password / backup-code input built on the
 * `input-otp` library. Used by the auth module for TOTP entry and
 * backup-code redemption (composed as `<InputOTPGroup>` + slots,
 * optionally split 3-3 with `<InputOTPSeparator>`).
 *
 * Theme tokens (`border-input`, `bg-background`, `ring-ring`,
 * `text-foreground`) drive dark-mode + per-tenant brand colours;
 * RTL is handled upstream by `input-otp`'s internal slot ordering.
 *
 * @see https://ui.shadcn.com/docs/components/input-otp
 * @see CODE_STANDARDS.md §2.1 (JSDoc on every exported component)
 */
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "../lib/cn";

/**
 * Root OTP input container. Wraps `OTPInput` from the `input-otp`
 * library and forwards a ref to the underlying hidden input element.
 */
export const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

/**
 * Visual grouping of contiguous `InputOTPSlot`s. Multiple groups can
 * be used together with `InputOTPSeparator` for split layouts.
 */
export const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

/**
 * Individual digit cell. Reads its character and active/caret state
 * from `OTPInputContext` so the parent `InputOTP` controls focus,
 * navigation, and animation centrally.
 */
export const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext.slots[index];
  // `slots` is guaranteed by `OTPInput` to be the same length as `maxLength`;
  // narrow defensively in case a consumer passes an out-of-range index.
  const char = slot?.char ?? null;
  const hasFakeCaret = slot?.hasFakeCaret ?? false;
  const isActive = slot?.isActive ?? false;

  return (
    <div
      ref={ref}
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        "bg-background text-foreground",
        isActive && "ring-ring z-10 ring-1",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground animate-caret-blink h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

/**
 * Optional decorative separator between `InputOTPGroup`s (e.g. the
 * dash in a 3-3 backup-code layout). Marked `role="separator"` for
 * assistive tech.
 */
export const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    {/* Decorative — wrapper carries role="separator"; hide icon from SR. */}
    <Minus aria-hidden="true" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";
