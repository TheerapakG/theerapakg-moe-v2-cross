import { type } from "arktype";
import { and, eq } from "drizzle-orm";

const paramValidator = type({
  perm: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(getArkTypeEnumFromDrizzleEnum(UserPermission)),
  ],
  user: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:manage"))
      throw createError({ statusMessage: "no permission" });

    const {
      param: { perm, user: target },
    } = await validateEvent({ param: paramValidator }, event);

    await useDrizzle()
      .delete(userPermissionsTable)
      .where(
        and(
          eq(userPermissionsTable.user_id, target),
          eq(userPermissionsTable.permission, perm)
        )
      );

    return {};
  })
);
