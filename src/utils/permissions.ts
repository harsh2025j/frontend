import { UserData } from '@/data/features/profile/profile.types';

export type PermissionCheckFn = (user: UserData | null) => boolean;

/**
 * ============================================================================
 * ROLES AND PERMISSIONS CONFIGURATION
 * ============================================================================
 */

export const PERMISSIONS = {
    ARTICLE: {
        CREATE: "create:article",
        READ: "read:article",
        EDIT: "edit:article",
        DELETE: "delete:article",
        PUBLISH: "publish:article",
        READ_PREMIUM: "read:premium",
    },
    SUBSCRIPTION: {
        READ_ALL: "read:all:subscriptions",
        EDIT: "edit:subscription",
        DELETE: "delete:subscription",
    },
    MANAGE: {
        CATEGORIES: "manage:categories",
        TAGS: "manage:tags",
        PLANS: "manage:plans",
        BROADCAST: "manage:broadcast",
        CASES: "manage:cases",
        JUDGES: "manage:judges",
        JUDGMENTS: "manage:judgments",
        TEAMS: "manage:teams",
        USERS: "manage:users",
        ROLE: "manage:roles",
        PERMISSION: "manage:permissions",
        REPORTS: "manage:reports",
        DISPLAY_BOARD: "manage:display_board",
    },

} as const;

export const ROLES = {
    USER: "user",
    EDITOR: "editor",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
    CREATOR: "creator",
    ADVOCATE: "advocate",
    LAWYER: "lawyer",
    LEGAL_ADVISOR: "legal_advisor",
    LAW_STUDENT: "law_student",
    PARALEGAL: "paralegal",
    // JUDGE: "judge",
} as const;

export type PermissionType =
    | typeof PERMISSIONS.ARTICLE.CREATE
    | typeof PERMISSIONS.ARTICLE.READ
    | typeof PERMISSIONS.ARTICLE.EDIT
    | typeof PERMISSIONS.ARTICLE.DELETE
    | typeof PERMISSIONS.ARTICLE.PUBLISH
    | typeof PERMISSIONS.ARTICLE.READ_PREMIUM
    | typeof PERMISSIONS.SUBSCRIPTION.READ_ALL
    | typeof PERMISSIONS.SUBSCRIPTION.EDIT
    | typeof PERMISSIONS.SUBSCRIPTION.DELETE
    | typeof PERMISSIONS.MANAGE.CATEGORIES
    | typeof PERMISSIONS.MANAGE.TAGS
    | typeof PERMISSIONS.MANAGE.PLANS
    | typeof PERMISSIONS.MANAGE.BROADCAST
    | typeof PERMISSIONS.MANAGE.CASES
    | typeof PERMISSIONS.MANAGE.JUDGES
    | typeof PERMISSIONS.MANAGE.JUDGMENTS
    | typeof PERMISSIONS.MANAGE.TEAMS
    | typeof PERMISSIONS.MANAGE.USERS
    | typeof PERMISSIONS.MANAGE.ROLE
    | typeof PERMISSIONS.MANAGE.PERMISSION
    | typeof PERMISSIONS.MANAGE.REPORTS
    | typeof PERMISSIONS.MANAGE.DISPLAY_BOARD;

export type RoleType =
    | typeof ROLES.USER
    | typeof ROLES.EDITOR
    | typeof ROLES.ADMIN
    | typeof ROLES.SUPERADMIN
    | typeof ROLES.CREATOR
    | typeof ROLES.ADVOCATE
    | typeof ROLES.LAWYER
    | typeof ROLES.LEGAL_ADVISOR
    | typeof ROLES.LAW_STUDENT
    | typeof ROLES.PARALEGAL;
// | typeof ROLES.JUDGE;

/**
 * ============================================================================
 * CORE PERMISSION HELPERS
 * ============================================================================
 */

export const getUserRoles = (user: UserData | null): string[] => {
    return user?.roles?.map(r => r.name) || [];
};

export const getUserPermissions = (user: UserData | null): string[] => {
    return user?.permissions?.map(p => p.name) || [];
};

export const isLoggedIn = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
};

export const hasAnyRole = (user: UserData | null, roles: string[]): boolean => {
    const userRoles = getUserRoles(user);
    return roles.some(role => userRoles.includes(role));
};

export const hasAllRoles = (user: UserData | null, roles: string[]): boolean => {
    const userRoles = getUserRoles(user);
    return roles.every(role => userRoles.includes(role));
};

export const hasAnyPermission = (user: UserData | null, permissions: string[]): boolean => {
    const userPermissions = getUserPermissions(user);
    return permissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (user: UserData | null, permissions: string[]): boolean => {
    const userPermissions = getUserPermissions(user);
    return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * ============================================================================
 * PAGE ACCESS EXPORTS (Naming: canAccessPageNamePage)
 * ============================================================================
 */

// 1. Admin Layout Base Access
export const canAccessAdminPanelPage = (user: UserData | null): boolean => {
    return !!user; // Any logged-in user can access the admin shell
};

export const canAccessProfilePage = (user: UserData | null): boolean => {
    return !!user;
};

export const canAccessSavedPostsPage = (user: UserData | null): boolean => {
    return !!user;
};

/** 2. Dashboard Page (Stats/Graphics) */
export const canAccessAdminDashboardPage = (user: UserData | null): boolean => {
    if (!user) return false;
    // Restricted to staff members
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.CREATOR, ROLES.EDITOR]) ||
        hasAnyPermission(user, [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.MANAGE.BROADCAST, PERMISSIONS.MANAGE.CASES])
    );
};

/** 3. Access Control Pages */
export const canAccessManageUserPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.USERS, PERMISSIONS.MANAGE.TEAMS])
    );
};

export const canAccessTeamsPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.TEAMS])
    );
};

export const canAccessRolePermissionPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.ROLE, PERMISSIONS.MANAGE.PERMISSION])
    );
};

export const canAccessPermissionMatrixPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

export const canAccessOfficeManagementPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

export const canAccessPracticeAreaManagementPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

/** 4. Membership & Requests */
export const canAccessMembershipApplicationPage = (user: UserData | null): boolean => {
    if (!user) return false;
    // If they already have staff privileges, they shouldn't apply
    if (canAccessAdminDashboardPage(user)) return false;
    return true;
};

export const canAccessPermissionRequestPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

/** 5. Content Section Pages */
export const canAccessContentManagementPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [
            PERMISSIONS.ARTICLE.CREATE,
            PERMISSIONS.ARTICLE.EDIT,
            PERMISSIONS.ARTICLE.DELETE
        ])
    );
};

export const canAccessCategoryManagementPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.CATEGORIES])
    );
};

export const canAccessContentApprovalPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.ARTICLE.PUBLISH])
    );
};

/** 6. Legal & Management Pages */
export const canAccessPlanManagementPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.PLANS])
    );
};

export const canAccessCasesPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.CASES])
    );
};

export const canAccessJudgmentsPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.JUDGMENTS])
    );
};

export const canAccessJudgesPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.JUDGES])
    );
};

export const canAccessReportsPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAllPermissions(user, [PERMISSIONS.MANAGE.REPORTS]));
};

export const canAccessDisplayBoardPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.DISPLAY_BOARD])
    );
};

export const canAccessBroadcastPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return (
        hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]) ||
        hasAnyPermission(user, [PERMISSIONS.MANAGE.BROADCAST])
    );
};

export const canAccessAdvertisementsPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

export const canAccessSettingsPage = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

/**
 * ============================================================================
 * UTILS & CORE UI HELPERS
 * ============================================================================
 */

export const getUserType = (user: UserData | null): 'guest' | 'user' | 'member' | 'admin' => {
    if (!user) return 'guest';
    if (hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN])) return 'admin';
    if (canAccessContentManagementPage(user)) return 'member';
    return 'user';
};

// Section Visibility Helpers
export const canSeeAccessControlSection = (user: UserData | null): boolean => {
    return (
        canAccessManageUserPage(user) ||
        canAccessTeamsPage(user) ||
        canAccessRolePermissionPage(user) ||
        canAccessPermissionMatrixPage(user) ||
        canAccessOfficeManagementPage(user) ||
        canAccessPracticeAreaManagementPage(user)
    );
};

export const canSeeContentSection = (user: UserData | null): boolean => {
    return (
        canAccessContentManagementPage(user) ||
        canAccessCategoryManagementPage(user) ||
        canAccessContentApprovalPage(user)
    );
};

export const isAdmin = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [ROLES.ADMIN, ROLES.SUPERADMIN]);
};

export const isAdvocate = (user: UserData | null): boolean => {
    if (!user) return false;
    return hasAnyRole(user, [
        ROLES.ADVOCATE,
        ROLES.LAWYER,
        ROLES.LEGAL_ADVISOR,
        ROLES.LAW_STUDENT
    ]);
};

/**
 * ============================================================================
 * ROUTE PROTECTION MAP
 * ============================================================================
 * Maps URL paths to their respective permission check functions.
 */
export const ROUTE_PROTECTION_MAP: Record<string, PermissionCheckFn> = {
    // 1. Core & Support Pages
    "/admin": canAccessAdminDashboardPage,
    "/admin/profile": canAccessProfilePage,
    "/admin/profile/[username]": canAccessProfilePage,
    "/profile/[username]": canAccessProfilePage,
    "/admin/membership": canAccessMembershipApplicationPage,
    "/admin/saved-posts": canAccessSavedPostsPage,
    "/admin/requests": canAccessPermissionRequestPage,

    // 2. Content Management
    "/admin/content-management": canAccessContentManagementPage,
    "/admin/categories": canAccessCategoryManagementPage,
    "/admin/content-approval": canAccessContentApprovalPage,
    "/admin/advertisements": canAccessAdvertisementsPage,
    "/admin/advertisements/create": canAccessAdvertisementsPage,
    "/admin/advertisements/edit/[id]": canAccessAdvertisementsPage,
    "/admin/create-content": canAccessContentManagementPage,
    "/admin/create-content/[id]": canAccessContentManagementPage,

    // 3. User & Access Control
    "/admin/users": canAccessManageUserPage,
    "/admin/teams": canAccessTeamsPage,
    "/admin/teams/edit": canAccessTeamsPage,
    "/admin/teams/edit/[id]": canAccessTeamsPage,
    "/admin/teams/add-new-member": canAccessTeamsPage,
    "/admin/roles-permissions": canAccessRolePermissionPage,
    "/admin/permission-matrix": canAccessPermissionMatrixPage,
    "/admin/audit-logs": isAdmin, // Restricted to Admins/Superadmins

    // 4. Legal & Office Management
    "/admin/cases": canAccessCasesPage,
    "/admin/cases/create": canAccessCasesPage,
    "/admin/cases/[id]": canAccessCasesPage,
    "/admin/cases/[id]/team": canAccessCasesPage,
    "/admin/judgments": canAccessJudgmentsPage,
    "/admin/judgments/create": canAccessJudgmentsPage,
    "/admin/judgments/[id]": canAccessJudgmentsPage,
    "/admin/judges": canAccessJudgesPage,
    "/admin/judges/create": canAccessJudgesPage,
    "/admin/judges/[id]": canAccessJudgesPage,
    "/admin/offices": canAccessOfficeManagementPage,
    "/admin/practice-areas": canAccessPracticeAreaManagementPage,

    // 5. Plans & Reports
    "/admin/plans": canAccessPlanManagementPage,
    "/admin/plans/add-new-plan": canAccessPlanManagementPage,
    "/admin/reports": canAccessReportsPage,
    "/admin/reports/create": canAccessReportsPage,
    "/admin/display-boards": canAccessDisplayBoardPage,

    // 6. Communication
    "/admin/broadcast": canAccessBroadcastPage,
    "/admin/broadcast/create": canAccessBroadcastPage,

    // 7. System
    "/admin/settings": canAccessSettingsPage,
};
