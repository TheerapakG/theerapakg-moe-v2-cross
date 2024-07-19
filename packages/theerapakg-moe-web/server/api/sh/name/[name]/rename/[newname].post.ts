import { type } from "arktype";
import { eq } from "drizzle-orm";

const paramValidator = type({
  name: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(/^\w+$/),
  ],
  newname: [
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
      param: { name, newname },
    } = await validateEvent({ param: paramValidator }, event);

    const [update] = await useDrizzle()
      .update(shTable)
      .set({
        from: newname,
      })
      .where(eq(shTable.from, name))
      .returning({
        name: shTable.from,
        to: shTable.to,
      });

    if (update) {
      const index = useMeili(useRuntimeConfig().meiliApiKey).index<
        typeof shDocument
      >("shs");
      index.addDocuments([update], { primaryKey: "name" });
      index.deleteDocument(name);
    }

    return {};
  }),
);
