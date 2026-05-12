/**
 * `@ogs/ui/hooks` — UI behaviour hooks + composition-root providers.
 *
 * Each app mounts `<OgsUIProviders>` once near the root (inside
 * `<OgsThemeProvider>`); components then call the hooks freely.
 */
export { OgsUIProviders } from "./providers";
export { ConfirmProvider, useConfirm, type ConfirmOptions } from "./use-confirm";
export { useEntitySearch, type UseEntitySearchResult } from "./use-entity-search";
export { ErrorModalProvider, useErrorModal, type ErrorModalOptions } from "./use-error-modal";
