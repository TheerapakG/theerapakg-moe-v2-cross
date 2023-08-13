import { type } from "arktype";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import fetch from "node-fetch";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const [
      {
        perms: { edit },
      },
    ] = await checkFilesUserPerm([id], user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const body = await readBody(event);
    if (!body.content) return;

    const _dir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .limit(1);

    const dir: string | undefined = _dir[0]?.dir;

    if (dir) {
      const fileBody = (await fetch(body.content)).body;

      if (fileBody === null)
        throw createError({
          statusCode: 500,
          statusMessage: "invalid file body",
        });

      await fs.writeFile(dir, fileBody, {
        flag: "w",
      });
      const stat = await fs.stat(dir);

      const [update] = await useDrizzle()
        .update(fileTable)
        .set({
          modified: stat.mtime,
        })
        .where(eq(fileTable.id, id))
        .returning({
          id: fileTable.id,
          modified: fileTable.modified,
        });

      await useMeili(useRuntimeConfig().meiliApiKey)
        .index("files")
        .updateDocuments(
          [
            {
              id: update.id,
              modified: update.modified.getTime() / 1000,
            },
          ],
          { primaryKey: "id" },
        );

      return {};
    }
  }),
);
