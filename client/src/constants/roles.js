/**
 * Role Definitions & Access Control Matrix (Frontend Constants)
 *
 * Easily extensible for adding new roles (e.g. bendahara, sekretaris, mitra).
 */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  PENGURUS: 'pengurus',
  USER: 'user',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    label: 'Super Admin',
    badgeClass: 'admin-badge--accent-light',
    canAccessAdminPanel: true,
    dashboardRoute: '/admin/dashboard',
  },
  [ROLES.ADMIN]: {
    label: 'Administrator',
    badgeClass: 'admin-badge--primary',
    canAccessAdminPanel: true,
    dashboardRoute: '/admin/dashboard',
  },
  [ROLES.PENGURUS]: {
    label: 'Pengurus Karang Taruna',
    badgeClass: 'admin-badge--warning',
    canAccessAdminPanel: true,
    canAccessPengurusPanel: true,
    dashboardRoute: '/pengurus/profile',
  },
  [ROLES.USER]: {
    label: 'Warga / Pengunjung',
    badgeClass: 'admin-badge--success',
    canAccessAdminPanel: false,
    canAccessPengurusPanel: false,
    dashboardRoute: '/user/profile',
  },
};

export const getRoleConfig = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER];
};

export const getDashboardRouteByRole = (role) => {
  const config = getRoleConfig(role);
  return config.dashboardRoute;
};
