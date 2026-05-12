/**
 * 12 neutral-geometric agent-avatar SVGs as React components.
 *
 * Each Avatar* is a 64×64 viewBox using `currentColor` so the parent's
 * text color (set by `AgentAvatar`'s tone palette) defines the fill.
 * Backgrounds are intentionally transparent — the parent `<div>` in
 * `AgentAvatar` provides the colored square. No human imagery anywhere.
 *
 * `pickAgentAvatar(slug)` returns one of the 12 components
 * deterministically via a stable hash of the slug — same agent slug
 * always renders the same avatar across sessions.
 *
 * See ADR-0007 for why these ship as components, not `.svg` files.
 */
import type { ReactElement, SVGProps } from "react";

type SVG = (props: SVGProps<SVGSVGElement>) => ReactElement;

const baseSvgProps = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 64 64",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
} as const;

export const Avatar01: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <circle cx="32" cy="32" r="18" />
  </svg>
);

export const Avatar02: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <rect x="14" y="14" width="36" height="36" rx="4" />
  </svg>
);

export const Avatar03: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <polygon points="32,12 52,48 12,48" />
  </svg>
);

export const Avatar04: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <polygon points="32,10 54,32 32,54 10,32" />
  </svg>
);

export const Avatar05: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <polygon points="32,10 50,22 50,42 32,54 14,42 14,22" />
  </svg>
);

export const Avatar06: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <circle cx="22" cy="32" r="10" />
    <circle cx="42" cy="32" r="10" />
  </svg>
);

export const Avatar07: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <rect x="12" y="24" width="40" height="16" rx="8" />
  </svg>
);

export const Avatar08: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <polygon points="32,10 54,54 10,54" />
    <circle cx="32" cy="34" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
  </svg>
);

export const Avatar09: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="6" />
  </svg>
);

export const Avatar10: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <rect x="14" y="14" width="14" height="14" />
    <rect x="36" y="14" width="14" height="14" />
    <rect x="14" y="36" width="14" height="14" />
    <rect x="36" y="36" width="14" height="14" />
  </svg>
);

export const Avatar11: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M14 50 L32 14 L50 50 Z M22 50 L32 30 L42 50 Z" fillRule="evenodd" />
  </svg>
);

export const Avatar12: SVG = (props) => (
  <svg {...baseSvgProps} {...props}>
    <circle cx="32" cy="20" r="6" />
    <circle cx="32" cy="44" r="6" />
    <circle cx="20" cy="32" r="6" />
    <circle cx="44" cy="32" r="6" />
  </svg>
);

const AVATARS: ReadonlyArray<SVG> = [
  Avatar01,
  Avatar02,
  Avatar03,
  Avatar04,
  Avatar05,
  Avatar06,
  Avatar07,
  Avatar08,
  Avatar09,
  Avatar10,
  Avatar11,
  Avatar12,
];

/** djb2-ish stable hash; same string → same index. */
function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Pick the same avatar component for the same agent slug, every time.
 * `agentSlug` is typically the agent's stable identifier ("careers_summarizer",
 * "academy_tutor", etc.).
 */
export function pickAgentAvatar(agentSlug: string): SVG {
  const idx = stableHash(agentSlug) % AVATARS.length;
  // `AVATARS` is non-empty by construction; the modulo result is a
  // valid index, but `noUncheckedIndexedAccess` widens the inference
  // to `SVG | undefined`. Assert the non-undefined case explicitly.
  const component = AVATARS[idx];
  if (!component) {
    throw new Error(`pickAgentAvatar: unreachable — index ${idx} out of range`);
  }
  return component;
}
