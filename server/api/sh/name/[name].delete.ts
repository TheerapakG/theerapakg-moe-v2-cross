import { type } from "arktype";
import { eq } from "drizzle-orm";

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
      param: { name },
    } = await validateEvent({ param: paramValidator }, event);

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof shDocument>("shs")
      .deleteDocument(name);

    await useDrizzle().delete(shTable).where(eq(shTable.from, name));

    return {};
  })
);
