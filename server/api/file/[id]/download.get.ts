import fs from "fs";
import mime from "mime";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { getSafeIdFromId } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);

    const { view } = await getFilePermForUser(`file:${id}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${id}`, "dir");
    if (dir) {
      appendResponseHeader(event, "Content-Type", mime.getType(dir) ?? "");
      return sendStream(event, fs.createReadStream(dir));
    }
  })
);
