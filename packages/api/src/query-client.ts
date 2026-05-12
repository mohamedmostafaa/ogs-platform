/**
 * QueryClient factory.
 *
 * Server-side: `getQueryClient()` (`server-helpers.tsx`) caches one per
 * request via React's `cache()` — never share across requests.
 * Client-side: `TRPCReactProvider` instantiates one per browser tab.
 *
 * Both paths use the same factory so the dehydrate/hydrate shape matches.
 *
 * @see Blueprint §7.2.
 */
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 60 s — long enough that fast tab-switches don't refetch,
        // short enough that stale data isn't shown indefinitely.
        staleTime: 60_000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        // Include `pending` queries so the server can stream partial
        // results to the client (React 19 + Suspense path).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
