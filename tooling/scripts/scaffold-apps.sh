#!/usr/bin/env bash
#
# OGS Platform — scaffold the 8 Next.js 16 apps with minimal hello-world shells.
#
# Idempotent: skips any app whose package.json already exists.
# Each app gets: package.json, next.config.ts, tsconfig.json, eslint.config.mjs,
# src/app/layout.tsx, src/app/page.tsx, .gitignore.
#
# @see Blueprint §29 (scaffolding) and TASKS OGS-019 / OGS-020.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

# name:port:title pairs — matches mprocs.yaml.
APPS=(
  "id:3000:OGS Identity"
  "careers:3001:OGS Careers"
  "skillpass:3002:OGS SkillPass"
  "academy:3003:OGS Academy"
  "eco:3004:OGS ECO"
  "enterprise:3005:OGS Enterprise"
  "admin:3006:OGS Admin"
  "corporate:3007:OGS Corporate"
)

for entry in "${APPS[@]}"; do
  name="${entry%%:*}"
  rest="${entry#*:}"
  port="${rest%%:*}"
  title="${rest#*:}"
  dir="apps/${name}"

  if [ -f "${dir}/package.json" ]; then
    echo "[scaffold] ${name}: exists, skipping."
    continue
  fi

  echo "[scaffold] ${name} (port ${port})..."
  mkdir -p "${dir}/src/app"

  # ---- package.json ----
  cat > "${dir}/package.json" <<EOF
{
  "name": "@ogs/${name}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --turbo --port ${port}",
    "build": "next build",
    "start": "next start --port ${port}",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@ogs/eslint-config": "workspace:*",
    "@ogs/tsconfig": "workspace:*",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^10.3.0",
    "eslint-config-next": "16.2.6",
    "typescript": "^6.0.3"
  }
}
EOF

  # ---- tsconfig.json ----
  cat > "${dir}/tsconfig.json" <<'EOF'
{
  "extends": "@ogs/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", ".next"]
}
EOF

  # ---- next.config.ts ----
  cat > "${dir}/next.config.ts" <<'EOF'
import type { NextConfig } from "next";

/**
 * Per-app Next.js 16 config.
 * Keep this minimal — shared behaviour lives in @ogs/* packages.
 */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
};

export default config;
EOF

  # ---- eslint.config.mjs ----
  cat > "${dir}/eslint.config.mjs" <<'EOF'
import nextConfig from "@ogs/eslint-config/next.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
EOF

  # ---- .gitignore ----
  cat > "${dir}/.gitignore" <<'EOF'
.next/
out/
next-env.d.ts
.vercel/
EOF

  # ---- src/app/layout.tsx ----
  cat > "${dir}/src/app/layout.tsx" <<EOF
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${title}",
  description: "${title} — OGS workforce-trust platform.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF

  # ---- src/app/page.tsx ----
  cat > "${dir}/src/app/page.tsx" <<EOF
/**
 * Hello-world landing page for the ${name} app.
 *
 * This is intentionally minimal — it exists only to verify that the
 * monorepo wiring, Vercel project, and DNS record all resolve end-to-end.
 * Replace during Phase 1 with the real app shell.
 */
export default function Page() {
  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>${title}</h1>
      <p style={{ marginTop: "0.75rem", color: "#666" }}>
        OGS workforce-trust platform — port ${port}. Phase 0 hello-world shell.
      </p>
    </main>
  );
}
EOF

done

echo
echo "[scaffold] DONE. Run 'pnpm install' to link the new workspace packages."
