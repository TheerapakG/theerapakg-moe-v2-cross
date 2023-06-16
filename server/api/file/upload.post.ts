import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

import { FileDocument } from "~/documents/file";

import { file as fileTable } from "~/schema/file";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    const perm = await checkUserPerm(user, "file:edit");

    if (!perm) throw createError({ statusMessage: "no permission" });

    const body = await readBody(event);
    if (!body.content) return;

    const { base, dir } = getFileName(user, body.file);

    await fs.mkdir(base, { recursive: true });

    const fileBody = (await fetch(body.content)).body;

    if (fileBody === null)
      throw createError({
        statusCode: 500,
        statusMessage: "invalid file body",
      });

    await fs.writeFile(dir, fileBody, {
      flag: "wx",
    });

    const stat = await fs.stat(dir);

    const [insert] = await useDrizzle()
      .insert(fileTable)
      .values({
        dir,
        owner: user,
        created: stat.birthtime,
        modified: stat.mtime,
      })
      .returning();

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<FileDocument>("files")
      .addDocuments(
        [
          {
            id: insert.id,
            name: path.basename(insert.dir),
            owner: insert.owner,
            created: insert.created.getTime() / 1000,
            modified: insert.modified.getTime() / 1000,
          },
        ],
        { primaryKey: "id" }
      );

    return {
      name: path.basename(dir),
      size: stat.size,
      url: `/api/file/download/${insert.id}`,
    };
  })
);
