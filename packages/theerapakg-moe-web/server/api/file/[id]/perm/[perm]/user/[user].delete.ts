import { type } from "arktype";
import { and, eq } from "drizzle-orm";

const paramValidator = type({
  id: "uuid",
  perm: "'view'|'edit'",
  user: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id, perm, user: target },
    } = await validateEvent({ param: paramValidator }, event);

    const [
      {
        perms: { edit },
      },
    ] = await checkFilesUserPerm([id], user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    await useDrizzle()
      .delete(fileUserPermissionsTable)
      .where(
        and(
          eq(fileUserPermissionsTable.file_id, id),
          eq(fileUserPermissionsTable.user_id, target),
          eq(fileUserPermissionsTable.permission, `file!:${perm}`),
        ),
      );

    return {};
  }),
);
