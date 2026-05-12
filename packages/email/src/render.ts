/**
 * Render a React Email component to `{ html, text }`.
 *
 * Uses `@react-email/render` for both — the text alternative is the
 * inline `pretty: false` plain-text serializer the library ships,
 * which most email clients prefer over a JSX-stripped fallback.
 *
 * @see Blueprint §18.4.
 */
import { render } from "@react-email/render";
import type { ReactElement } from "react";

export interface RenderedEmail {
  html: string;
  text: string;
}

export async function renderEmail(react: ReactElement): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(react, { pretty: false }),
    render(react, { plainText: true }),
  ]);
  return { html, text };
}
