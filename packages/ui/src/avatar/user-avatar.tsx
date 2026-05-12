/**
 * `UserAvatar` — branded user avatar with initials fallback.
 *
 * Per blueprint §10: no DiceBear, no generated artwork. We show the
 * user's uploaded image when present, falling back to a deterministic
 * initials chip derived from their name (or email).
 *
 * Sizes: sm (32px), md (40px), lg (56px).
 */
"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../primitives/avatar";
import { cn } from "../lib/cn";

export interface UserAvatarProps {
  /** Display name — used for accessibility + initials fallback. */
  name: string;
  /** Public URL of the avatar image, when one has been uploaded. */
  imageUrl?: string | null;
  /** Email — used only when `name` is empty. */
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClassNames: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function UserAvatar({ name, imageUrl, email, size = "md", className }: UserAvatarProps) {
  const initials = deriveInitials(name || email || "?");
  return (
    <Avatar className={cn(sizeClassNames[size], className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
      <AvatarFallback aria-label={name}>{initials}</AvatarFallback>
    </Avatar>
  );
}

/**
 * Two-letter initials from a display name. Falls back to the first
 * grapheme of an email local-part.
 */
function deriveInitials(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "?";
  if (trimmed.includes("@")) {
    return trimmed.charAt(0).toUpperCase();
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return (words[0]?.slice(0, 2) ?? "?").toUpperCase();
  }
  return ((words[0]?.charAt(0) ?? "") + (words[words.length - 1]?.charAt(0) ?? "")).toUpperCase();
}
