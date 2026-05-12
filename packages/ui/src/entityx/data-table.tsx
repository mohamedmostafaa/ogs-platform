/**
 * `DataTable<T>` — minimal data-driven table built on the `<Table>`
 * primitives.
 *
 * Intentionally NOT @tanstack/react-table-based — this phase 01 cut
 * exists for plain tabular lists where you control sort + filter via
 * URL state. The richer client-side table (faceted filters, column
 * pinning, etc.) is a Phase 02 follow-up that wraps tanstack/table.
 */
import * as React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../primitives/table";
import { cn } from "../lib/cn";

export interface DataTableColumn<T> {
  /** Stable column key — used as React key + header label fallback. */
  key: string;
  /** Optional header content; defaults to `key`. */
  header?: React.ReactNode;
  /** Row cell renderer. */
  cell: (row: T, index: number) => React.ReactNode;
  /** Tailwind classes applied to both header and cell `<td>`/`<th>`. */
  className?: string;
}

export interface DataTableProps<T> {
  data: ReadonlyArray<T>;
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** Stable React key for each row. */
  getRowKey: (row: T, index: number) => React.Key;
  /** Optional empty state — receives no rows but mounts inside the table. */
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyState,
  className,
}: DataTableProps<T>) {
  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c.key} className={c.className}>
              {c.header ?? c.key}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-muted-foreground py-12 text-center">
              {emptyState ?? "No results."}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, i) => (
            <TableRow key={getRowKey(row, i)}>
              {columns.map((c) => (
                <TableCell key={c.key} className={c.className}>
                  {c.cell(row, i)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
