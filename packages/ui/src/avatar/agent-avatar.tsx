/**
 * `AgentAvatar` — branded avatar for AI agent personas.
 *
 * Renders a colored square (tone derived deterministically from the
 * agent slug) plus a discreet "AI" pill in the corner so users can
 * never mistake an agent reply for a human one. SECURITY rule "AI
 * must never be mistakable for a human" — the pill is high-contrast
 * `bg-primary` regardless of variant.
 *
 * Glyph variants:
 *   - `"svg"` (default): inline-SVG geometric mark selected via
 *     `pickAgentAvatar(agent)`. No human imagery; same slug always
 *     yields the same mark.
 *   - `"letter"`: single-character glyph (`glyph` prop, or first
 *     letter of `agent`). Useful in dense lists where the SVG would
 *     blur at sub-16px sizes.
 *
 * @see ADR-0007.
 */
"use client";

import { Sparkles } from "lucide-react";
import * as React from "react";

import { pickAgentAvatar } from "../assets/agent-avatars";
import { cn } from "../lib/cn";

export interface AgentAvatarProps {
  /** Agent slug ("careers_summarizer", "academy_tutor", ...). */
  agent: string;
  /** Choose SVG mark (default) or single-character letter glyph. */
  glyphVariant?: "svg" | "letter";
  /** Optional single-character glyph — only used when `glyphVariant="letter"`. */
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

/** djb2-ish stable hash for deterministic palette selection. */
function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function AgentAvatar({
  agent,
  glyphVariant = "svg",
  glyph,
  tone,
  size = "md",
  className,
}: AgentAvatarProps) {
  const computedTone =
    tone ?? TONE_PALETTE[stableHash(agent) % TONE_PALETTE.length] ?? TONE_PALETTE[0]!;
  const AvatarMark = pickAgentAvatar(agent);

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
      {glyphVariant === "svg" ? (
        <span aria-hidden className="h-3/5 w-3/5">
          <AvatarMark />
        </span>
      ) : (
        <span aria-hidden>{glyph ?? agent.charAt(0).toUpperCase()}</span>
      )}
      {/*
        AI-agent identifier pill. Per SECURITY.md (rule "AgentAvatar
        must never be mistakable for a human user"), the pill MUST
        have high contrast against the page background — we use
        primary-on-primary-foreground rather than a faint outlined dot.
        The pill is bottom-right at 35% of the avatar's diameter so
        it's clearly visible at every size, regardless of glyphVariant.
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
