import crypto from "crypto";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { FileDocument, useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await readBody(event);

    if (!body.content) return;

    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:file:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const base = path.resolve(
      useRuntimeConfig().downloadPath ?? "./.dist/files",
      `./${getSafeIdFromIdObject<"user:id">(user)}`
    );
    const dir = path.resolve(base, body.file);
    const relative = path.relative(base, dir);

    if (!(relative && !relative.startsWith("..") && !path.isAbsolute(relative)))
      throw createError({
        statusCode: 500,
        statusMessage: "invalid file name",
      });

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(dir, (await fetch(body.content)).body, {
      flag: "wx",
    });
    const id = crypto.randomUUID();
    await useRedis()
      .multi()
      .hset(`file:${id}`, "dir", dir, "owner", user)
      .zadd(`file:${user}:ids`, 1, `file:${id}`)
      .zadd("file:ids", 1, `file:${id}`)
      .exec();

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<FileDocument>("files")
      .addDocuments(
        [
          {
            id,
            name: path.basename(dir),
            owner: getSafeIdFromIdObject<"user:id">(user),
          },
        ],
        { primaryKey: "id" }
      );

    return {
      name: path.basename(dir),
      size: (await fs.promises.stat(dir)).size,
      url: `/api/file/download/${id}`,
    };
  })
);
