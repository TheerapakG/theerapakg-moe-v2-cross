import fs from "fs";
import fetch from "node-fetch";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromId } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getFilePermForUser } from "~/utils/server/getFilePermForUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await readBody(event);

    if (!body.content) return;

    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params?.id);

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
