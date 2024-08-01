import { type } from "arktype";
import { count, eq } from "drizzle-orm";

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
      if (!(await checkUserPerm(user)).includes("container:list"))
        throw createError({ statusMessage: "no permission" });
    }

    const [{ countValue }] = await useDrizzle()
      .select({
        countValue: count(),
      })
      .from(containerTable)
      .where(eq(containerTable.owner, target));

    return { count: countValue };
  }),
);
