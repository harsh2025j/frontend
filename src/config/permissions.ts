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
    },
    BROADCAST: {
        CREATE: "create:broadcast",
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
    JUDGE: "judge",
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
    | typeof PERMISSIONS.BROADCAST.CREATE;

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
    | typeof ROLES.PARALEGAL
    | typeof ROLES.JUDGE;
