import fs from "fs";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  const id = (event.context.params.id as string).split(":", 2)[0];

  if (!user) {
    return sendStream(event, "");
  }

  try {
    const { view } = await getFilePermForUser(`file:${id}`, user);

    if (view) {
      const dir = await useRedis().hget(`file:${id}`, "dir");
      if (dir) {
        return sendStream(event, fs.createReadStream(dir));
      }
    }
  } catch (err) {
    console.error(err);
  }

  return sendStream(event, "");
});
