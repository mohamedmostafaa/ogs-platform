/**
 * `@ogs/config` — pure constants and enums consumed by every workspace.
 *
 * Zero runtime dependencies by design — this package must be safe to
 * import from anywhere (client, server, edge, tests, migration scripts).
 *
 * @see Blueprint §4, §11.1.
 */
export * from "./apps";
export * from "./enums";
export * from "./pagination";
