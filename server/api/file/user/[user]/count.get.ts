import { type } from "arktype";
import { eq, sql } from "drizzle-orm";

const paramValidator = type({
  user: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { user: target },
    } = await validateEvent({ param: paramValidator }, event);

    if (user !== target) {
      if (!(await checkUserPerm(user)).includes("file:list"))
        throw createError({ statusMessage: "no permission" });
    }

    const [{ count }] = await useDrizzle()
      .select({
        count: sql`count(*)`,
      })
      .from(fileTable)
      .where(eq(fileTable.owner, target));

    return { count: typeof count === "string" ? parseInt(count) : 0 };
  })
);
