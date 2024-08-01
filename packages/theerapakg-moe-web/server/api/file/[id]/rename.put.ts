import { type } from "arktype";
import { eq } from "drizzle-orm";
import path from "path";

const queryValidator = type({
  name: "string",
});

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query: { name },
      param: { id },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event,
    );

    const [
      {
        perms: { edit },
      },
    ] = await checkFilesUserPerm([id], user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index("files")
      .updateDocuments(
        [
          {
            id,
            name: path.basename(name),
          },
        ],
        { primaryKey: "id" },
      );

    await useDrizzle()
      .update(fileTable)
      .set({ name })
      .where(eq(fileTable.id, id));

    return {};
  }),
);
