/**
 * Pagination constants shared by every list endpoint + UI list view.
 *
 * Keep these stable — they shape both API contracts (tRPC procedures
 * advertise `cursor` paging with these defaults) and UI components
 * (`EntityPagination`, `DataTable`).
 *
 * @see Blueprint §11.1.
 */

/** Default page size when the caller doesn't specify one. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard upper bound. Requests above this are clamped server-side. */
export const MAX_PAGE_SIZE = 100;

/** Choices surfaced in the UI page-size selector. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * The first page of a cursor-paginated list always passes `cursor: null`.
 * Subsequent pages pass the `nextCursor` returned by the prior page.
 */
export const PAGINATION_FIRST_PAGE_CURSOR: string | null = null;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
