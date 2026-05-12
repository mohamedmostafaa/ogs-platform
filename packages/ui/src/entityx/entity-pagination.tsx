/**
 * `EntityPagination` — cursor-based pagination control.
 *
 * Wraps the canonical OGS pagination contract: `cursor: string | null`
 * + `nextCursor: string | null` returned by every list endpoint.
 * `@ogs/config` PAGINATION constants drive the page-size selector.
 */
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { PAGE_SIZE_OPTIONS, type PageSize } from "@ogs/config";

import { Button } from "../primitives/button";
import { cn } from "../lib/cn";

export interface EntityPaginationProps {
  /** Optional total count when known (server-side counted). */
  totalCount?: number | null;
  /** Active page size. */
  pageSize: PageSize;
  /** Callback when the user picks a different page size. */
  onPageSizeChange: (size: PageSize) => void;
  /** Provided by the previous page's response; null = on first page. */
  prevCursor: string | null;
  /** Provided by the current page's response; null = no more pages. */
  nextCursor: string | null;
  /** Called with the cursor when the user navigates. */
  onNavigate: (cursor: string | null) => void;
  className?: string;
}

export function EntityPagination({
  totalCount,
  pageSize,
  onPageSizeChange,
  prevCursor,
  nextCursor,
  onNavigate,
  className,
}: EntityPaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <label htmlFor="entityx-page-size" className="text-xs">
          Per page
        </label>
        <select
          id="entityx-page-size"
          className="border-input bg-background text-foreground h-8 rounded-md border px-2"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        {totalCount !== null && totalCount !== undefined ? (
          <span className="ms-3 text-xs">{totalCount.toLocaleString()} total</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={prevCursor === null}
          onClick={() => onNavigate(prevCursor)}
        >
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={nextCursor === null}
          onClick={() => onNavigate(nextCursor)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
