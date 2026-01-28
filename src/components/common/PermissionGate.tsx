import React, { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  /**
   * Required permission(s) to show children
   * Can be a single permission string or array of permissions
   */
  permissions?: string | string[];

  /**
   * Required role(s) to show children
   * Can be a single role string or array of roles
   */
  roles?: string | string[];

  /**
   * If true, user must have ALL specified permissions/roles
   * If false, user needs ANY of the specified permissions/roles
   * @default false
   */
  requireAll?: boolean;

  /**
   * Required clearance level (1-5)
   * User must have >= this level to see children
   */
  clearanceLevel?: number;

  /**
   * Content to show when user has access
   */
  children: ReactNode;

  /**
   * Optional fallback content when user doesn't have access
   */
  fallback?: ReactNode;

  /**
   * If true, renders nothing when access is denied
   * If false, renders fallback (if provided)
   * @default true
   */
  hideOnDeny?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permissions="matters.create">
 *   <CreateMatterButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGate permissions={["matters.create", "matters.update"]}>
 *   <MatterActions />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ALL)
 * <PermissionGate
 *   permissions={["matters.create", "users.read"]}
 *   requireAll
 * >
 *   <AdvancedFeature />
 * </PermissionGate>
 *
 * @example
 * // Role-based access
 * <PermissionGate roles="Managing Partner">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // Clearance level
 * <PermissionGate clearanceLevel={4}>
 *   <ConfidentialDocument />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate
 *   permissions="matters.delete"
 *   fallback={<p>You don't have permission to delete</p>}
 *   hideOnDeny={false}
 * >
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permissions,
  roles,
  requireAll = false,
  clearanceLevel,
  children,
  fallback = null,
  hideOnDeny = true,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasClearanceLevel,
  } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permissions) {
    const permArray = Array.isArray(permissions) ? permissions : [permissions];

    if (requireAll) {
      hasAccess = hasAccess && hasAllPermissions(permArray);
    } else {
      hasAccess = hasAccess && hasAnyPermission(permArray);
    }
  }

  // Check roles
  if (roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (requireAll) {
      hasAccess = hasAccess && hasAllRoles(roleArray);
    } else {
      hasAccess = hasAccess && hasAnyRole(roleArray);
    }
  }

  // Check clearance level
  if (clearanceLevel !== undefined) {
    hasAccess = hasAccess && hasClearanceLevel(clearanceLevel);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideOnDeny) {
    return null;
  }

  return <>{fallback}</>;
}

/**
 * Higher-order component version of PermissionGate
 * Useful for wrapping entire page components
 *
 * @example
 * export default withPermissions(
 *   MatterDetailPage,
 *   { permissions: "matters.read" }
 * );
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  gateProps: Omit<PermissionGateProps, "children">
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate {...gateProps}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}
