import { useAuth } from "./useAuth";

/**
 * Hook to check user permissions
 * @returns {Object} Permission checking utilities
 */
export function usePermissions() {
  const { user } = useAuth();

  // Get permissions array from user data
  const permissions = user?.permissions || [];

  /**
   * Check if user has a specific permission
   * @param {string} permissionCode - e.g., "active_users.view"
   * @returns {boolean}
   */
  const hasPermission = (permissionCode) => {
    if (!permissionCode) return true;
    // Super admin has all permissions
    if (user?.role === 'super-admin') return true;
    return permissions.includes(permissionCode);
  };

  /**
   * Check if user has any of the given permissions
   * @param {string[]} permissionCodes - Array of permission codes
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionCodes) => {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    if (user?.role === 'super-admin') return true;
    return permissionCodes.some(code => permissions.includes(code));
  };

  /**
   * Check if user has all of the given permissions
   * @param {string[]} permissionCodes - Array of permission codes
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionCodes) => {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    if (user?.role === 'super-admin') return true;
    return permissionCodes.every(code => permissions.includes(code));
  };

  /**
   * Check if user can access a module (has view permission)
   * @param {string} moduleKey - e.g., "ACTIVE_USERS", "LEAD_MANAGEMENT"
   * @returns {boolean}
   */
  const canAccessModule = (moduleKey) => {
    if (!moduleKey) return true;
    if (user?.role === 'super-admin') return true;
    const viewPermission = `${moduleKey.toLowerCase()}.view`;
    return permissions.includes(viewPermission);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isSuperAdmin: user?.role === 'super-admin',
  };
}
