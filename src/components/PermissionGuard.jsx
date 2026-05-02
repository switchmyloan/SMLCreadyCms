import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "../custom-hooks/usePermissions";

/**
 * Component to guard routes based on permissions.
 *
 * @param {Object} props
 * @param {string} [props.permission]   - Single permission code, e.g. "active_users.view"
 * @param {string[]} [props.anyOf]      - Allow if user has ANY of these
 * @param {string[]} [props.allOf]      - Require ALL of these
 * @param {React.ReactNode} props.children
 * @param {string} [props.redirectTo]   - Path to redirect if unauthorized (default: "/")
 */
function PermissionGuard({
  permission,
  anyOf,
  allOf,
  children,
  redirectTo = "/",
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } =
    usePermissions();
  const location = useLocation();

  // No requirement → allow
  if (!permission && !anyOf?.length && !allOf?.length) {
    return children;
  }

  // Super admin bypass
  if (isSuperAdmin) {
    return children;
  }

  // Evaluate in order: anyOf > allOf > permission
  let allowed = false;
  if (anyOf?.length) {
    allowed = hasAnyPermission(anyOf);
  } else if (allOf?.length) {
    allowed = hasAllPermissions(allOf);
  } else if (permission) {
    allowed = hasPermission(permission);
  }

  if (allowed) return children;

  return <Navigate to={redirectTo} state={{ from: location }} replace />;
}

export default PermissionGuard;
