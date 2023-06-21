import { eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:edit"))
      throw createError({ statusMessage: "no permission" });

    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof shDocument>("shs")
      .deleteDocument(event.context.params.name);

    await useDrizzle()
      .delete(shTable)
      .where(eq(shTable.from, event.context.params.name));

    return {};
  })
);
