import { and, eq, inArray } from "drizzle-orm";
import { keyBy as useKeyBy, groupBy as useGroupBy, isEmpty } from "lodash-es";

export const checkFilesUserPerm = async (files: string[], user: string) => {
  if (isEmpty(files)) return [];
  const { fileOwner, userPerms, filePerms } = await useDrizzle().transaction(
    async (tx) => {
      const fileOwner = await tx
        .select({
          id: fileTable.id,
          owner: fileTable.owner,
        })
        .from(fileTable)
        .where(inArray(fileTable.id, files));

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
          id: fileUserPermissionsTable.file_id,
          permission: fileUserPermissionsTable.permission,
        })
        .from(fileUserPermissionsTable)
        .where(
          and(
            eq(fileUserPermissionsTable.user_id, user),
            inArray(fileUserPermissionsTable.file_id, files)
          )
        );

      return { fileOwner, userPerms, filePerms };
    }
  );

  const fileOwnerMap = useKeyBy(fileOwner, "id");
  const filePermsMap = useGroupBy(filePerms, "id");
  const userPermsArr = userPerms.map((perm) => perm.permission);

  return files.map((file) => {
    const owner: string | undefined = fileOwnerMap[file]?.owner;
    const filePermsArr = filePermsMap[file]?.map((perm) => perm.permission);

    if (owner === undefined)
      throw createError({
        statusCode: 404,
        statusMessage: `file ${file} not found`,
      });

    const edit =
      user === owner ||
      userPermsArr.includes("file:edit") ||
      filePermsArr.includes("file!:edit");

    const view =
      edit ||
      userPermsArr.includes("file:view") ||
      filePermsArr.includes("file!:view");

    const visible = view || userPermsArr.includes("file:list");

    if (!visible)
      throw createError({
        statusCode: 404,
        statusMessage: `file ${file} not found`,
      });

    return { owner, perms: { view, edit } };
  });
};
