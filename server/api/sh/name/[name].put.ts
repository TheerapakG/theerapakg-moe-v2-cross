export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:edit"))
      throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    const to = decodeURIComponent(query.target as string);

    const [insert] = await useDrizzle()
      .insert(shTable)
      .values({
        from: event.context.params.name,
        to,
      })
      .onConflictDoUpdate({
        target: shTable.from,
        set: { to },
      })
      .returning({
        name: shTable.from,
        to: shTable.to,
      });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof shDocument>("shs")
      .addDocuments([insert], { primaryKey: "name" });

    return {};
  })
);
