import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const { edit } = await checkFileUserPerm(id, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);
    const name = decodeURIComponent(query.name as string);
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
          { primaryKey: "id" }
        );

      await useDrizzle()
        .update(fileTable)
        .set({ dir })
        .where(eq(fileTable.id, id));

      return {};
    }
  })
);
