import { eq, sql } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:list"))
      throw createError({ statusMessage: "no permission" });

    const perm = event.context.params?.perm;
    if (!perm) throw createError({ statusMessage: "invalid perm" });

    const [{ count }] = await useDrizzle()
      .select({
        count: sql<number>`count(*)`,
      })
      .from(userPermissionsTable)
      .where(
        eq(
          userPermissionsTable.permission,
          perm as (typeof UserPermission.enumValues)[number]
        )
      );

    return { count };
  })
);
