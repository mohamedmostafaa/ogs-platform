/**
 * `EntityList<T>` — generic vertical list of card-style rows.
 *
 * For tabular data with sortable columns, use `DataTable` instead.
 * For ad-hoc grids of cards (e.g. course tiles), compose `Card`
 * directly.
 *
 * @example
 *   <EntityList
 *     items={jobs}
 *     getKey={(j) => j.id}
 *     renderItem={(j) => <JobRow job={j} />}
 *     emptyView={<EntityEmptyView title="No open jobs" />}
 *   />
 */
import * as React from "react";

import { cn } from "../lib/cn";

export interface EntityListProps<T> {
  items: ReadonlyArray<T>;
  /** Stable React key for each row. */
  getKey: (item: T, index: number) => React.Key;
  /** Renderer for an individual row. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Shown when `items` is empty. */
  emptyView?: React.ReactNode;
  /** Optional header / filter row that scrolls with the content. */
  header?: React.ReactNode;
  className?: string;
}

export function EntityList<T>({
  items,
  getKey,
  renderItem,
  emptyView,
  header,
  className,
}: EntityListProps<T>) {
  if (items.length === 0 && emptyView) {
    return <>{emptyView}</>;
  }
  return (
    <div className={cn("flex flex-col", className)}>
      {header}
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={getKey(item, index)}>{renderItem(item, index)}</li>
        ))}
      </ul>
    </div>
  );
}
