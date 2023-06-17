import { and, eq, inArray } from "drizzle-orm";

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
          permission: userPermissionsTable.permission,
        })
        .from(userPermissionsTable)
        .where(
          and(
            eq(userPermissionsTable.user_id, user),
            inArray(userPermissionsTable.permission, ["file:view", "file:edit"])
          )
        );

      const filePerms = await tx
        .select({
          permission: fileUserPermissionsTable.permission,
        })
        .from(fileUserPermissionsTable)
        .where(
          and(
            eq(fileUserPermissionsTable.user_id, user),
            eq(fileUserPermissionsTable.file_id, file)
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
