/**
 * URL-state parsers for the `auth` module.
 *
 * The Phase-02 auth flows expose two query-string parameters worth
 * naming: `callbackURL` on `/login` and `status` for round-trip
 * banners (`check-email`, `password-reset`). Both are read inline in
 * the page composition with `await searchParams`, so no nuqs adapter
 * is needed yet.
 *
 * TODO(OGS-310): when `/account/sessions` grows pagination, define
 * `sessionsListParams` here following the canonical nuqs pattern from
 * blueprint §8.4.
 */
export {};
