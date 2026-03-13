/**
 * Re-export Prisma-generated User type so the rest of the codebase can
 * continue to import from this path without change.
 */
export { User } from '@prisma/client';

/**
 * UserRole mirrors the column values stored in the `role` varchar column.
 * Prisma uses plain String for roles (MSSQL does not support enums).
 * Application-level validation enforces only these two values.
 */
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}
