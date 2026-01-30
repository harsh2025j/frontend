import { useAppSelector } from "@/data/redux/hooks";
import { useCallback, useMemo } from "react";

/**
 * Hook to check user permissions
 * Supports wildcard patterns like "matters.*" or "users.*.read"
 */
export function usePermissions() {
  const { user } = useAppSelector((state) => state.auth);

  const userPermissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  const userRoles = useMemo(() => {
    return user?.roles || [];
  }, [user?.roles]);

  /**
   * Check if user has a specific permission
   * Supports wildcards:
   * - "matters.*" matches "matters.read", "matters.create", etc.
   * - "*.read" matches "matters.read", "users.read", etc.
   * - "*" matches everything
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return false;
      if (!userPermissions || userPermissions.length === 0) return false;

      // Check for exact match
      if (userPermissions.some((p: any) => p.name === permission)) {
        return true;
      }

      // Check for wildcard matches
      return userPermissions.some((userPerm: any) => {
        const permName = userPerm.name || userPerm;
        // Convert wildcard pattern to regex
        const pattern = permName
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*");
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(permission);
      });
    },
    [userPermissions]
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.some(hasPermission);
    },
    [hasPermission]
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!permissions || permissions.length === 0) return true;
      return permissions.every(hasPermission);
    },
    [hasPermission]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!role) return false;
      if (!userRoles || userRoles.length === 0) return false;
      return userRoles.some((r: any) => r.name === role);
    },
    [userRoles]
  );

  /**
   * Check if user has ANY of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!roles || roles.length === 0) return false;
      return roles.some(hasRole);
    },
    [hasRole]
  );

  /**
   * Check if user has ALL of the specified roles
   */
  const hasAllRoles = useCallback(
    (roles: string[]): boolean => {
      if (!roles || roles.length === 0) return true;
      return roles.every(hasRole);
    },
    [hasRole]
  );

  /**
   * Check if user is admin (has admin or super-admin role)
   */
  const isAdmin = useCallback((): boolean => {
    return hasAnyRole(["admin", "super-admin", "Admin", "Super Admin"]);
  }, [hasAnyRole]);

  /**
   * Check if user is managing partner
   */
  const isManagingPartner = useCallback((): boolean => {
    return hasAnyRole(["Managing Partner", "managing-partner"]);
  }, [hasAnyRole]);

  /**
   * Check if user is partner
   */
  const isPartner = useCallback((): boolean => {
    return hasAnyRole(["Partner", "partner", "Managing Partner", "managing-partner"]);
  }, [hasAnyRole]);

  /**
   * Get user's clearance level
   */
  const getClearanceLevel = useCallback((): number => {
    return user?.clearanceLevel || 2; // Default to level 2 (Internal)
  }, [user?.clearanceLevel]);

  /**
   * Check if user has sufficient clearance level
   */
  const hasClearanceLevel = useCallback(
    (requiredLevel: number): boolean => {
      const userLevel = getClearanceLevel();
      return userLevel >= requiredLevel;
    },
    [getClearanceLevel]
  );

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Convenience checks
    isAdmin,
    isManagingPartner,
    isPartner,

    // Clearance level checks
    getClearanceLevel,
    hasClearanceLevel,

    // Raw data
    permissions: userPermissions,
    roles: userRoles,
  };
}
