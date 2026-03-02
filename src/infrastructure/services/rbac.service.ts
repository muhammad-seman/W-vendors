import type { User } from '@/src/entities/models/user';

/**
 * RBAC Permission Map
 * 
 * Maps resources to which roles are ALLOWED.
 * Add new resources/permissions here as the app grows.
 */
export const PERMISSIONS = {
  // User Management — dev & admin
  'users:read':   ['dev', 'admin'],
  'users:create': ['dev', 'admin'],
  'users:update': ['dev', 'admin'],
  'users:delete': ['dev'],            // Only dev can delete

  // Dashboard — everyone
  'dashboard:read': ['dev', 'admin', 'vendor'],

  // Products
  // Vendor can only manage their OWN products (scoping enforced at page/service level)
  // dev and admin have full access to ALL vendors' products
  'products:read':      ['dev', 'admin', 'vendor'],
  'products:create':    ['dev', 'admin', 'vendor'],
  'products:update':    ['dev', 'admin', 'vendor'],
  'products:delete':    ['dev', 'admin', 'vendor'],
  'products:read_all':  ['dev', 'admin'],   // dev/admin see all vendors; vendor sees own only

  // Categories (master data) — dev and admin only
  'categories:read':   ['dev', 'admin'],
  'categories:create': ['dev', 'admin'],
  'categories:update': ['dev', 'admin'],
  'categories:delete': ['dev', 'admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user has the given permission.
 */
export function hasPermission(user: Pick<User, 'role'>, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(user.role);
}

/**
 * Assert that a user has permission — throws ForbiddenError if not.
 */
export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Access denied. Required permission: ${permission}`);
    this.name = 'ForbiddenError';
  }
}

export function assertPermission(user: Pick<User, 'role'>, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(permission);
  }
}
