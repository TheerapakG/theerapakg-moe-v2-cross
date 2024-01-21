import { index, pgEnum, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const UserPermission = pgEnum("userpermission", [
  "sh:list",
  "sh:edit",
  "file:list",
  "file:view",
  "file:edit",
  "container:list",
  "container:inspect",
  "container:manage",
  "perm:list",
  "perm:manage",
  "migrate",
]);

export const userPermissions = pgTable(
  "user_permissions",
  {
    user_id: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    permission: UserPermission("permission").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.user_id, table.permission),
      userIdIdx: index("user_permissions_user_id_idx").on(table.user_id),
      permissionIdx: index("user_permissions_permission_idx").on(
        table.permission,
      ),
    };
  },
);

export { userPermissions as userPermissionsTable };

export type UserPermissionsInfo = typeof userPermissions._.inferSelect;
