/**
 * `AgentAvatar` — branded avatar for AI agent personas.
 *
 * Renders a colored square with the agent's emoji or first letter,
 * plus a discreet "AI" pill in the corner so users can never mistake
 * an agent reply for a human one (accessibility + safety requirement
 * from blueprint §6 and SECURITY.md §9).
 */
"use client";

import { Sparkles } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface AgentAvatarProps {
  /** Agent slug ("careers_summarizer", "academy_tutor", ...). */
  agent: string;
  /** Optional emoji / single character to render inside the square. */
  glyph?: string;
  /**
   * Tailwind class controlling the background tint — defaults to a
   * stable hash of `agent`, but pass an explicit class to override.
   */
  tone?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClassNames: Record<NonNullable<AgentAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const TONE_PALETTE = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
];

export function AgentAvatar({ agent, glyph, tone, size = "md", className }: AgentAvatarProps) {
  const computedTone = tone ?? TONE_PALETTE[stableHash(agent) % TONE_PALETTE.length];
  const display = glyph ?? agent.charAt(0).toUpperCase();
  return (
    <div
      role="img"
      aria-label={`AI agent ${agent}`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-md font-semibold",
        sizeClassNames[size],
        computedTone,
        className,
      )}
    >
      <span aria-hidden>{display}</span>
      {/*
        AI-agent identifier pill. Per SECURITY.md (rule "AgentAvatar
        must never be mistakable for a human user"), the pill MUST
        have high contrast against the page background — we use
        primary-on-primary-foreground rather than a faint outlined dot.
        The pill is bottom-right at 35% of the avatar's diameter so
        it's clearly visible at every size.
      */}
      <span
        aria-hidden
        className="bg-primary text-primary-foreground ring-background absolute -right-1 -bottom-1 inline-flex h-[35%] min-h-[14px] w-[35%] min-w-[14px] items-center justify-center rounded-full ring-2"
        title="AI agent"
      >
        <Sparkles className="h-[60%] w-[60%]" aria-hidden />
      </span>
    </div>
  );
}

/** Tiny non-cryptographic hash for deterministic palette selection. */
function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
