import { sql } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:list"))
      throw createError({ statusMessage: "no permission" });

    const [{ count }] = await useDrizzle()
      .select({
        count: sql<number>`count(*)`,
      })
      .from(containerTable);

    return { count };
  })
);
