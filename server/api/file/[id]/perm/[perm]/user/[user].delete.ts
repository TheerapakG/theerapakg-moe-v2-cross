import { and, eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const { edit } = await checkFileUserPerm(id, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const _perm = event.context.params?.perm;
    if (!_perm) throw createError({ statusMessage: "invalid perm" });
    const perm = `file!:${_perm}`;

    const targetId = event.context.params?.user;
    if (!targetId) throw createError({ statusMessage: "invalid user" });

    await useDrizzle()
      .delete(fileUserPermissionsTable)
      .where(
        and(
          eq(fileUserPermissionsTable.file_id, id),
          eq(fileUserPermissionsTable.user_id, targetId),
          eq(
            fileUserPermissionsTable.permission,
            perm as (typeof FilePermission.enumValues)[number]
          )
        )
      );

    return {};
  })
);
