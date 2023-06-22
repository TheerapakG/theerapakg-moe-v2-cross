import { type } from "arktype";
import { eq, sql } from "drizzle-orm";

const paramValidator = type({
  perm: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(getArkTypeEnumFromDrizzleEnum(UserPermission)),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:list"))
      throw createError({ statusMessage: "no permission" });

    const {
      param: { perm },
    } = await validateEvent({ param: paramValidator }, event);

    const [{ count }] = await useDrizzle()
      .select({
        count: sql<number>`count(*)`,
      })
      .from(userPermissionsTable)
      .where(eq(userPermissionsTable.permission, perm));

    return { count };
  })
);
