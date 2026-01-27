import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "../custom-hooks/usePermissions";

/**
 * Component to guard routes based on permissions
 * @param {Object} props
 * @param {string} props.permission - Required permission code (e.g., "active_users.view")
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: "/")
 */
function PermissionGuard({ permission, children, redirectTo = "/" }) {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const location = useLocation();

  // No permission required - allow everyone
  if (!permission) {
    return children;
  }

  // Super admin has all permissions
  if (isSuperAdmin) {
    return children;
  }

  // Check if user has the required permission
  if (hasPermission(permission)) {
    return children;
  }

  // Redirect to home or specified path if unauthorized
  return <Navigate to={redirectTo} state={{ from: location }} replace />;
}

export default PermissionGuard;
