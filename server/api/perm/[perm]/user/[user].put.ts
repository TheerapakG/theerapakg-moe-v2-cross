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
      .insert(userPermissionsTable)
      .values({
        user_id: targetId,
        permission: perm as (typeof UserPermission.enumValues)[number],
      });

    return {};
  })
);
