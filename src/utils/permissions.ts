import { ROLES, PERMISSIONS } from '@/config/permissions';
import { UserData } from '@/data/features/profile/profile.types';

/**
 * Determines the user type based on roles and permissions
 * @returns 'guest' | 'user' | 'member' | 'admin'
 */
export const getUserType = (user: UserData | null): 'guest' | 'user' | 'member' | 'admin' => {
    if (!user) return 'guest';

    const roles = user.roles?.map(r => r.name) || [];
    const permissions = user.permissions?.map(p => p.name) || [];

    // Admin check - highest priority
    if (roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPERADMIN)) {
        return 'admin';
    }

    // Member check - has content creation/editing permissions
    const hasContentPermissions =
        roles.includes(ROLES.CREATOR) ||
        roles.includes(ROLES.EDITOR) ||
        permissions.includes(PERMISSIONS.ARTICLE.CREATE) ||
        permissions.includes(PERMISSIONS.ARTICLE.EDIT) ||
        permissions.includes(PERMISSIONS.ARTICLE.PUBLISH);

    if (hasContentPermissions) {
        return 'member';
    }

    // Normal user - only has 'user' role with no special permissions
    return 'user';
};

/**
 * Checks if user has access to the dashboard
 * @returns true for members and admins, false for normal users
 */
export const hasDashboardAccess = (user: UserData | null): boolean => {
    const userType = getUserType(user);
    return userType === 'admin' || userType === 'member';
};

/**
 * Checks if user has admin privileges
 */
export const isAdmin = (user: UserData | null): boolean => {
    return getUserType(user) === 'admin';
};

/**
 * Checks if user is a member (has content permissions)
 */
export const isMember = (user: UserData | null): boolean => {
    const userType = getUserType(user);
    return userType === 'member' || userType === 'admin';
};

/**
 * Checks if user is a normal user (no special permissions)
 */
export const isNormalUser = (user: UserData | null): boolean => {
    return getUserType(user) === 'user';
};
