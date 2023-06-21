import { sql } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("file:list"))
      throw createError({ statusMessage: "no permission" });

    const [{ count }] = await useDrizzle()
      .select({ count: sql<number>`count(*)` })
      .from(fileTable);

    return { count };
  })
);
