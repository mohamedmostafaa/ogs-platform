/**
 * `useEntitySearch` — debounced search-input hook used by every list
 * surface (Careers, Workers, Courses, Audit, …).
 *
 * Returns:
 *   - `query`           : the immediate input value (controlled).
 *   - `setQuery`        : the change handler.
 *   - `debouncedQuery`  : the value after `delayMs` of inactivity —
 *                         use this for the actual server call.
 *   - `isDebouncing`    : true while `query !== debouncedQuery` so
 *                         consumers can render a tiny spinner.
 *
 * Default debounce is 500 ms — the blueprint §9.6 contract.
 *
 * @see Blueprint §9.6.
 */
"use client";

import * as React from "react";

export interface UseEntitySearchResult {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedQuery: string;
  isDebouncing: boolean;
}

export function useEntitySearch(initial = "", delayMs = 500): UseEntitySearchResult {
  const [query, setQuery] = React.useState(initial);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initial);

  React.useEffect(() => {
    if (query === debouncedQuery) return undefined;
    const handle = setTimeout(() => setDebouncedQuery(query), delayMs);
    return () => clearTimeout(handle);
  }, [query, debouncedQuery, delayMs]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isDebouncing: query !== debouncedQuery,
  };
}
