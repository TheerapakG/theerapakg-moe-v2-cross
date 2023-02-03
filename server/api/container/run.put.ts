import crypto from "crypto";
import z from "zod";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { useDocker } from "~/utils/server/useDocker";

const Cmd = z.string().array();

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:manage")) <=
      0
    )
      throw createError({ statusMessage: "no permission" });

    const image = decodeURIComponent(query.image as string);
    const cmd = Cmd.parse(JSON.parse(decodeURIComponent(query.cmd as string)));

    const id = crypto.randomUUID();
    const containerId = `container:${id}` as const;

    const dockerId = await new Promise<string>((resolve, reject) => {
      useDocker().createContainer(
        {
          Image: image,
          Cmd: cmd,
          Tty: false,
        },
        (err, container) => {
          if (!container) {
            reject(err);
            return;
          }
          resolve(container.id);
          container.start({});
        }
      );
    });

    await useRedis()
      .multi()
      .hset(containerId, "dockerId", dockerId)
      .zadd(`container:${user}:ids`, 1, containerId)
      .zadd("container:ids", 1, containerId)
      .exec();

    return {
      container: id,
    };
  })
);
