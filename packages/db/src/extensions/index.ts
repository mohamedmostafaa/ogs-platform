/**
 * Barrel for the three OGS Prisma extensions.
 *
 * The order they're composed in `../index.ts` matters:
 *   1. tenant-scope (injects tenantId into where + data)
 *   2. soft-delete  (rewrites delete -> update, filters deletedAt)
 *   3. audit        (writes AuditLog rows AFTER the operation)
 *
 * Reversing this order would, for example, allow a soft-delete to skip
 * the tenantId filter — definitely not what we want.
 */
export { auditExtension } from "./audit.js";
export { softDeleteExtension } from "./soft-delete.js";
export { tenantScopeExtension } from "./tenant-scope.js";
