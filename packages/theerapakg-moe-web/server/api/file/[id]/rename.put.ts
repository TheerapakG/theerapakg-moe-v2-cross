import { type } from "arktype";
import { eq } from "drizzle-orm";
import fs from "fs";
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

    const { base, dir } = getFileName(user, name);

    const _oldDir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .limit(1);

    const oldDir: string | undefined = _oldDir[0]?.dir;

    if (oldDir) {
      await fs.promises.mkdir(base, { recursive: true });
      await fs.promises.rename(oldDir, dir);

      await useMeili(useRuntimeConfig().meiliApiKey)
        .index("files")
        .updateDocuments(
          [
            {
              id,
              name: path.basename(dir),
            },
          ],
          { primaryKey: "id" },
        );

      await useDrizzle()
        .update(fileTable)
        .set({ dir })
        .where(eq(fileTable.id, id));

      return {};
    }
  }),
);
