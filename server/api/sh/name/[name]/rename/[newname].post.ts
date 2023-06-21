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

    const [update] = await useDrizzle()
      .update(shTable)
      .set({
        from: event.context.params.newname,
      })
      .where(eq(shTable.from, event.context.params.name))
      .returning({
        name: shTable.from,
        to: shTable.to,
      });

    if (update) {
      const index = useMeili(useRuntimeConfig().meiliApiKey).index<
        typeof shDocument
      >("shs");
      index.addDocuments([update], { primaryKey: "name" });
      index.deleteDocument(event.context.params.name);
    }

    return {};
  })
);
