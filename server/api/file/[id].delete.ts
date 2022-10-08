import fs from "fs";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromId } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);

    const { edit } = await getFilePermForUser(`file:${id}`, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${id}`, "dir");
    if (dir) {
      await useRedis()
        .multi()
        .del(`file:${id}`, `perms:file:${id}:view`, `perms:file:${id}:edit`)
        .zrem(`file:${user}:ids`, `file:${id}`)
        .zrem("file:ids", `file:${id}`)
        .exec();
      await fs.promises.unlink(dir);
      return {};
    }
  })
);
