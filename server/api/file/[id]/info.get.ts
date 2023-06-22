import { type } from "arktype";
import { eq } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import path from "path";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const { owner } = await checkFileUserPerm(id, user);

    const _file = await useDrizzle()
      .select()
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .limit(1);

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
