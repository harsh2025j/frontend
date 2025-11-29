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
} as const;

export const ROLES = {
    USER: "user",
    SUBSCRIBER: "subscriber",
    EDITOR: "editor",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
    STAFF: "staff",
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
    | typeof PERMISSIONS.MANAGE.PLANS;

export type RoleType =
    | typeof ROLES.USER
    | typeof ROLES.SUBSCRIBER
    | typeof ROLES.EDITOR
    | typeof ROLES.ADMIN
    | typeof ROLES.SUPERADMIN
    | typeof ROLES.STAFF;
