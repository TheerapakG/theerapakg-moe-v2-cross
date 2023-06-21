import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("file:edit"))
      throw createError({ statusMessage: "no permission" });

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
      .index<typeof fileDocument>("files")
      .addDocuments(
        [
          {
            id: insert.id as ReturnType<typeof crypto.randomUUID>,
            name: path.basename(insert.dir),
            owner: insert.owner as ReturnType<typeof crypto.randomUUID>,
            created: insert.created.getTime() / 1000,
            modified: insert.modified.getTime() / 1000,
          },
        ],
        { primaryKey: "id" }
      );

    return {
      id: insert.id,
      name: path.basename(dir),
      size: stat.size,
      url: `/api/file/download/${insert.id}`,
    };
  })
);
