import type { Role } from '@/types';

export const isAdminRole = (role?: Role) => Boolean(role?.includes('Admin'));

export const isClinicalRole = (role?: Role) => role === 'Dokter' || role === 'Perawat/Tenaga Kesehatan';

export function getRoleHome(role?: Role) {
  if (isClinicalRole(role)) return '/doctor/dashboard';
  if (isAdminRole(role)) return '/admin/dashboard';
  return '/app/dashboard';
}
