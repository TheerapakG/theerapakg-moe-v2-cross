import { InferModel } from "drizzle-orm";
import { index, pgEnum, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { file } from "./file";
import { user } from "./user";

export const FilePermission = pgEnum("filepermission", [
  "file!:view",
  "file!:edit",
]);

export const fileUserPermissions = pgTable(
  "file_user_permissions",
  {
    file_id: uuid("file_id")
      .references(() => file.id)
      .notNull(),
    user_id: uuid("user_id")
      .references(() => user.id)
      .notNull(),
    permission: FilePermission("permission").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.file_id, table.user_id, table.permission),
      fileIdUserIdIdx: index("file_user_permissions_file_id_user_id_idx").on(
        table.user_id,
        table.file_id
      ),
      fileIdpermissionIdx: index(
        "file_user_permissions_file_id_permission_idx"
      ).on(table.file_id, table.permission),
    };
  }
);

export { fileUserPermissions as fileUserPermissionsTable };

export type FileUserPermissionsInfo = InferModel<typeof fileUserPermissions>;
