import { eq } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import path from "path";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const { owner } = await checkFileUserPerm(id, user);

    const _file = await useDrizzle().transaction(async (tx) => {
      const _file = await tx
        .select()
        .from(fileTable)
        .where(eq(fileTable.id, id))
        .limit(1);

      return _file;
    });

    const file: (typeof _file)[number] | undefined = _file[0];

    if (file) {
      return {
        name: path.basename(file.dir),
        owner,
        size: (await fs.promises.stat(file.dir)).size,
        created: file.created,
        modified: file.modified,
        mime: mime.getType(file.dir) ?? "",
        url: `/api/file/${id}/download`,
      };
    }
  })
);
