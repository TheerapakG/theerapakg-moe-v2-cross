import fs from "fs";
import path from "path";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { getIdFromIdObject } from "~/server/utils/getId";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  const id = (event.context.params.id as string).split(":", 2)[0];

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  try {
    const { view, owner } = await getFilePermForUser(`file:${id}`, user);

    if (view) {
      const dir = await useRedis().hget(`file:${id}`, "dir");
      if (dir) {
        return {
          status: 0,
          value: {
            name: path.basename(dir),
            owner: getIdFromIdObject(owner),
            size: (await fs.promises.stat(dir)).size,
            url: `/api/file/${id}/download`,
          },
        };
      }
    } else {
      return {
        status: -8,
        error: "no permission",
      };
    }
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
