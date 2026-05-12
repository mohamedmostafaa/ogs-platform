/**
 * `@ogs/ui/entityx` — domain-agnostic list / table primitives.
 *
 * EntityX is the "layer 2" component family: built ON TOP of shadcn
 * primitives, consumed BY app-specific list pages (JobList, CourseList,
 * WorkerList…). The contract: cursor-paginated, locale-aware, no
 * data-fetching of their own (callers pass data in).
 */
export { DataTable, type DataTableColumn, type DataTableProps } from "./data-table";
export { EntityEmptyView, type EntityEmptyViewProps } from "./entity-empty-view";
export { EntityHeader, type EntityHeaderProps } from "./entity-header";
export { EntityList, type EntityListProps } from "./entity-list";
export { EntityPagination, type EntityPaginationProps } from "./entity-pagination";
