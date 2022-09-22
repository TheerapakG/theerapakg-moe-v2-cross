import crypto from "crypto";
import fs from "fs";
import path from "path";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromIdObject } from "~~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await useBody(event);

    if (!body.content) return;

    const user = await getUser(event);
    if ((await useRedis().sismember(`${user}:perms`, "perms:file:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const base = path.resolve(
      process.env.DOWNLOAD_PATH ?? "./.dist/files",
      `./${getSafeIdFromIdObject<"user">(user)}`
    );
    const dir = path.resolve(base, body.file);
    const relative = path.relative(base, dir);

    if (!(relative && !relative.startsWith("..") && !path.isAbsolute(relative)))
      throw createError({
        statusCode: 500,
        statusMessage: "invalid file name",
      });

    await fs.promises.mkdir(base, { recursive: true });
    await fs.promises.writeFile(dir, body.content, { flag: "wx" });
    const id = crypto.randomUUID();
    await useRedis()
      .multi()
      .hset(`file:${id}`, "dir", dir, "owner", user)
      .zadd("file:ids", 1, `file:${id}`)
      .exec();

    return {
      name: path.basename(dir),
      size: (await fs.promises.stat(dir)).size,
      url: `/api/file/download/${id}`,
    };
  })
);
