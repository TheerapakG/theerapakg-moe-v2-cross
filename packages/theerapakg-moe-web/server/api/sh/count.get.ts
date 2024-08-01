import { count } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:list"))
      throw createError({ statusMessage: "no permission" });

    const [{ countValue }] = await useDrizzle()
      .select({ countValue: count() })
      .from(shTable);

    return { count: countValue };
  }),
);
