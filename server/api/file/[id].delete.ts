import { eq } from "drizzle-orm";
import fs from "fs/promises";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const { edit } = await checkFileUserPerm(id, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof fileDocument>("files")
      .deleteDocument(id);

    const _fileDir = await useDrizzle().transaction(async (tx) => {
      await tx
        .delete(fileUserPermissionsTable)
        .where(eq(fileUserPermissionsTable.file_id, id));
      const _fileDir = await tx
        .delete(fileTable)
        .where(eq(fileTable.id, id))
        .returning({ dir: fileTable.dir });

      return _fileDir;
    });

    const fileDir: string | undefined = _fileDir[0]?.dir;

    await fs.unlink(fileDir);

    return {};
  })
);
