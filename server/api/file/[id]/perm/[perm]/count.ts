import { and, eq, sql } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    await checkFileUserPerm(id, user);

    const _perm = event.context.params?.perm;
    if (!_perm) throw createError({ statusMessage: "invalid perm" });
    const perm = `file!:${_perm}`;

    const [{ count }] = await useDrizzle()
      .select({
        count: sql`count(*)`,
      })
      .from(fileUserPermissionsTable)
      .where(
        and(
          eq(fileUserPermissionsTable.file_id, id),
          eq(
            fileUserPermissionsTable.permission,
            perm as (typeof FilePermission.enumValues)[number]
          )
        )
      );

    return { count: typeof count === "string" ? parseInt(count) : 0 };
  })
);
