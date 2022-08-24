import crypto from "crypto";
import fs from "fs";
import path from "path";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const body = await useBody(event);

  if (body.content) {
    const user = await useRedis().get(
      getCookie(event, "session_id")
        ? `session:${getCookie(event, "session_id")}`
        : "session:default"
    );

    if (!user) {
      return {
        status: -2,
        error: "session expired",
      };
    }

    if (
      user &&
      (await useRedis().sismember(`${user}:perms`, "perms:file:edit")) > 0
    ) {
      const base = path.resolve(process.env.DOWNLOAD_PATH ?? "./.dist/files");
      const dir = path.resolve(base, body.file);
      const relative = path.relative(base, dir);

      if (
        relative &&
        !relative.startsWith("..") &&
        !path.isAbsolute(relative)
      ) {
        try {
          await fs.promises.writeFile(dir, body.content, { mode: "wx" });
          const id = crypto.randomUUID();
          await useRedis()
            .multi()
            .hset(`file:${id}`, "dir", dir, "owner", user)
            .zadd("file:ids", 1, `file:${id}`)
            .exec();

          return {
            status: 0,
            value: {
              name: path.basename(dir),
              size: (await fs.promises.stat(dir)).size,
              url: `/api/file/download/${id}`,
            },
          };
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      return {
        status: -8,
        error: "no permission",
      };
    }
  }

  return {
    status: -1,
  };
});
