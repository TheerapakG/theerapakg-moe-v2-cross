import fs from "fs";
import fetch from "node-fetch";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromId } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await readBody(event);

    if (!body.content) return;

    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);

    const { edit } = await getFilePermForUser(`file:${id}`, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${id}`, "dir");
    if (dir) {
      await fs.promises.writeFile(dir, (await fetch(body.content)).body, {
        flag: "w",
      });
      return {};
    }
  })
);
