/**
 * Role Definitions & Access Control Matrix (Backend Config)
 *
 * Easily extensible for adding new roles (e.g. bendahara, sekretaris, mitra).
 */
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  PENGURUS: 'pengurus',
  USER: 'user',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    label: 'Super Admin',
    canManageUsers: true,
    canManageContent: true,
    canAccessAdminPanel: true,
    dashboardRoute: '/admin/dashboard',
  },
  [ROLES.ADMIN]: {
    label: 'Administrator',
    canManageUsers: true,
    canManageContent: true,
    canAccessAdminPanel: true,
    dashboardRoute: '/admin/dashboard',
  },
  [ROLES.PENGURUS]: {
    label: 'Pengurus Karang Taruna',
    canManageUsers: false,
    canManageContent: false,
    canAccessAdminPanel: false,
    canAccessPengurusPanel: true,
    dashboardRoute: '/pengurus/dashboard',
  },
  [ROLES.USER]: {
    label: 'Warga / Pengunjung',
    canManageUsers: false,
    canManageContent: false,
    canAccessAdminPanel: false,
    canAccessPengurusPanel: false,
    dashboardRoute: '/user/profile',
  },
};

const getRoleConfig = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER];
};

module.exports = { ROLES, ROLE_PERMISSIONS, getRoleConfig };
