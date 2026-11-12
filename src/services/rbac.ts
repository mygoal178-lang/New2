/**
 * OrderFlow Role-Based Access Control (RBAC)
 *
 * owner  — full control (billing, team, integrations, finance, destructive actions)
 * admin  — operations + finance + integrations; no billing / workspace destroy
 * manager— day-to-day ops (orders, inventory, customers, couriers); limited finance
 * staff  — fulfillment only (orders status, view inventory/customers, book courier)
 */

import type { Role } from '../types';

/** App tabs / modules */
export type AppTab =
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'couriers'
  | 'integrations'
  | 'analytics'
  | 'expenses'
  | 'settings'
  | 'handover';

/** Fine-grained actions */
export type Permission =
  | 'tab:dashboard'
  | 'tab:orders'
  | 'tab:inventory'
  | 'tab:customers'
  | 'tab:couriers'
  | 'tab:integrations'
  | 'tab:analytics'
  | 'tab:expenses'
  | 'tab:settings'
  | 'tab:handover'
  | 'orders:create'
  | 'orders:edit'
  | 'orders:delete'
  | 'orders:update_status'
  | 'inventory:create'
  | 'inventory:edit'
  | 'inventory:delete'
  | 'inventory:adjust_stock'
  | 'customers:create'
  | 'customers:edit'
  | 'customers:delete'
  | 'couriers:configure'
  | 'couriers:book'
  | 'integrations:manage'
  | 'integrations:sync'
  | 'expenses:manage'
  | 'analytics:view_financial'
  | 'settings:workspace'
  | 'settings:team'
  | 'settings:billing'
  | 'settings:whitelabel'
  | 'workspace:create'
  | 'workspace:reset_demo'
  | 'role:switch_test'; // demo role switcher (owner/admin only in prod feel)
  ;

const ALL: Permission[] = [
  'tab:dashboard',
  'tab:orders',
  'tab:inventory',
  'tab:customers',
  'tab:couriers',
  'tab:integrations',
  'tab:analytics',
  'tab:expenses',
  'tab:settings',
  'tab:handover',
  'orders:create',
  'orders:edit',
  'orders:delete',
  'orders:update_status',
  'inventory:create',
  'inventory:edit',
  'inventory:delete',
  'inventory:adjust_stock',
  'customers:create',
  'customers:edit',
  'customers:delete',
  'couriers:configure',
  'couriers:book',
  'integrations:manage',
  'integrations:sync',
  'expenses:manage',
  'analytics:view_financial',
  'settings:workspace',
  'settings:team',
  'settings:billing',
  'settings:whitelabel',
  'workspace:create',
  'workspace:reset_demo',
  'role:switch_test'
];

const ADMIN: Permission[] = ALL.filter(
  (p) =>
    p !== 'settings:billing' &&
    p !== 'workspace:reset_demo' &&
    p !== 'settings:whitelabel'
);

const MANAGER: Permission[] = [
  'tab:dashboard',
  'tab:orders',
  'tab:inventory',
  'tab:customers',
  'tab:couriers',
  'tab:analytics',
  'orders:create',
  'orders:edit',
  'orders:update_status',
  'inventory:create',
  'inventory:edit',
  'inventory:adjust_stock',
  'customers:create',
  'customers:edit',
  'couriers:book',
  'analytics:view_financial',
  'role:switch_test'
];

const STAFF: Permission[] = [
  'tab:dashboard',
  'tab:orders',
  'tab:inventory',
  'tab:customers',
  'tab:couriers',
  'orders:create',
  'orders:update_status',
  'inventory:adjust_stock',
  'customers:edit',
  'couriers:book'
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL,
  admin: ADMIN,
  manager: MANAGER,
  staff: STAFF
};

export function getPermissions(role: Role | string | undefined): Set<Permission> {
  const r = (role || 'staff') as Role;
  const list = ROLE_PERMISSIONS[r] || STAFF;
  return new Set(list);
}

export function can(role: Role | string | undefined, permission: Permission): boolean {
  return getPermissions(role).has(permission);
}

export function canAccessTab(role: Role | string | undefined, tab: string): boolean {
  return can(role, `tab:${tab}` as Permission);
}

/** First tab a role is allowed to see (fallback when current tab is forbidden) */
export function defaultTabForRole(role: Role | string | undefined): AppTab {
  const order: AppTab[] = [
    'dashboard',
    'orders',
    'inventory',
    'customers',
    'couriers',
    'analytics',
    'expenses',
    'integrations',
    'settings',
    'handover'
  ];
  for (const tab of order) {
    if (canAccessTab(role, tab)) return tab;
  }
  return 'dashboard';
}

export function roleLabel(role: Role | string | undefined): string {
  switch (role) {
    case 'owner':
      return 'Owner — full control';
    case 'admin':
      return 'Admin — operations & finance';
    case 'manager':
      return 'Manager — day-to-day ops';
    case 'staff':
      return 'Staff — fulfillment';
    default:
      return String(role || 'staff');
  }
}

export const RBAC_MATRIX_SUMMARY = {
  owner: 'All modules + billing + white-label + reset demo',
  admin: 'All ops modules except billing, white-label, reset demo',
  manager: 'Orders, inventory, customers, couriers, analytics — no settings/integrations/expenses',
  staff: 'Dashboard, orders (status), inventory (stock), customers (edit), couriers (book)'
} as const;
