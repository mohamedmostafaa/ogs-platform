/**
 * `cn` — class-name merger used by every shadcn primitive in this
 * package.
 *
 * Combines `clsx` (for conditional class arrays) with `tailwind-merge`
 * (for deduplicating Tailwind utility conflicts — `"p-2"` + `"p-4"`
 * collapses to `"p-4"`).
 *
 * @example
 *   cn("p-2", isActive && "p-4 bg-primary")
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
