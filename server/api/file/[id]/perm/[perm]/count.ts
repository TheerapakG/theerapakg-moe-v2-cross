import { type } from "arktype";
import { and, eq, sql } from "drizzle-orm";

const paramValidator = type({
  id: "uuid",
  perm: "'view'|'edit'",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id, perm },
    } = await validateEvent({ param: paramValidator }, event);

    await checkFilesUserPerm([id], user);

    const [{ count }] = await useDrizzle()
      .select({
        count: sql`count(*)`,
      })
      .from(fileUserPermissionsTable)
      .where(
        and(
          eq(fileUserPermissionsTable.file_id, id),
          eq(fileUserPermissionsTable.permission, `file!:${perm}`)
        )
      );

    return { count: typeof count === "string" ? parseInt(count) : 0 };
  })
);
