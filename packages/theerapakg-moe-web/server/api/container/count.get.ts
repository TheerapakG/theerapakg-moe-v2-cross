import { count } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:list"))
      throw createError({ statusMessage: "no permission" });

    const [{ countValue }] = await useDrizzle()
      .select({
        countValue: count(),
      })
      .from(containerTable);

    return { count: countValue };
  }),
);
