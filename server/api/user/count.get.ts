import { sql } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async () => {
    const [{ count }] = await useDrizzle()
      .select({ count: sql<number>`count(*)` })
      .from(userTable);

    return { count };
  })
);
