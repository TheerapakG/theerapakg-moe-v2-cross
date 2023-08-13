import { type } from "arktype";

const queryValidator = type({
  target: "string",
});

const paramValidator = type({
  name: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(/^\w+$/),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:edit"))
      throw createError({ statusMessage: "no permission" });

    const {
      query: { target },
      param: { name },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event,
    );

    const [insert] = await useDrizzle()
      .insert(shTable)
      .values({
        from: name,
        to: target,
      })
      .onConflictDoUpdate({
        target: shTable.from,
        set: { to: target },
      })
      .returning({
        name: shTable.from,
        to: shTable.to,
      });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof shDocument>("shs")
      .addDocuments([insert], { primaryKey: "name" });

    return {};
  }),
);
