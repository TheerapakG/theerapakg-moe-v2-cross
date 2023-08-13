import { type } from "arktype";

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
      .insert(fileUserPermissionsTable)
      .values({
        file_id: id,
        user_id: target,
        permission: `file!:${perm}`,
      });

    return {};
  }),
);
