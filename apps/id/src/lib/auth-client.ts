/**
 * Browser auth client for the Identity app.
 *
 * Import this from any client component to call sign-in, sign-out,
 * `authClient.useSession()`, etc.
 */
"use client";

import { createOgsAuthClient } from "@ogs/auth/client";

export const authClient = createOgsAuthClient();
