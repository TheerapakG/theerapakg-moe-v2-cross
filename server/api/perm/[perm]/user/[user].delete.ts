import { and, eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:manage"))
      throw createError({ statusMessage: "no permission" });

    const perm = event.context.params?.perm;
    if (!perm) throw createError({ statusMessage: "invalid perm" });

    const targetId = event.context.params?.user;
    if (!targetId) throw createError({ statusMessage: "invalid user" });

    await useDrizzle()
      .delete(userPermissionsTable)
      .where(
        and(
          eq(userPermissionsTable.user_id, targetId),
          eq(
            userPermissionsTable.permission,
            perm as (typeof UserPermission.enumValues)[number]
          )
        )
      );

    return {};
  })
);
