import { and, eq, inArray } from "drizzle-orm";

import { file as fileTable } from "~/schema/file";
import { fileUserPermissions as fileUserPermisionsTable } from "~/schema/file_permission";
import { userPermissions as userPermisionsTable } from "~/schema/user_permission";

export const checkFileUserPerm = async (file: string, user: string) => {
  const { _fileOwner, userPerms, filePerms } = await useDrizzle().transaction(
    async (tx) => {
      const _fileOwner = await tx
        .select({
          owner: fileTable.owner,
        })
        .from(fileTable)
        .where(eq(fileTable.id, file))
        .limit(1);

      const userPerms = await tx
        .select({
          permission: userPermisionsTable.permission,
        })
        .from(userPermisionsTable)
        .where(
          and(
            eq(userPermisionsTable.user_id, user),
            inArray(userPermisionsTable.permission, ["file:view", "file:edit"])
          )
        );

      const filePerms = await tx
        .select({
          permission: fileUserPermisionsTable.permission,
        })
        .from(fileUserPermisionsTable)
        .where(
          and(
            eq(fileUserPermisionsTable.user_id, user),
            eq(fileUserPermisionsTable.file_id, file)
          )
        );

      return { _fileOwner, userPerms, filePerms };
    }
  );

  const owner: string | undefined = _fileOwner[0]?.owner;
  const userPermsArr = userPerms.map((perm) => perm.permission);
  const filePermsArr = filePerms.map((perm) => perm.permission);

  if (!owner) throw createError({ statusMessage: "file not found" });

  const edit =
    user === owner ||
    "file:edit" in userPermsArr ||
    "file!:edit" in filePermsArr;

  const view =
    edit || "file:view" in userPermsArr || "file!:view" in filePermsArr;

  const visible = view || "file:list" in userPermsArr;

  if (visible) return { owner, view, edit };
  throw createError({ statusMessage: "file not found" });
};
