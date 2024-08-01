import { count } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async () => {
    const [{ countValue }] = await useDrizzle()
      .select({ countValue: count() })
      .from(userTable);

    return { count: countValue };
  }),
);
