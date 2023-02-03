import fs from "fs";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromId } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getFilePermForUser } from "~/utils/server/getFilePermForUser";
import { FileDocument, useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);

    const { edit } = await getFilePermForUser(`file:${id}`, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${id}`, "dir");
    if (dir) {
      await useMeili(useRuntimeConfig().meiliApiKey)
        .index<FileDocument>("files")
        .deleteDocument(id);

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
