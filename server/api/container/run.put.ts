import crypto from "crypto";
import z from "zod";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { useDocker } from "~/server/utils/useDocker";
import { Container } from "dockerode";
import { Stream } from "stream";

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

    const dockerId = await new Promise<string>((resolve) => {
      useDocker()
        .run(
          image,
          cmd,
          new Stream.Writable({
            write: (_chunk, _encoding, callback) => setImmediate(callback),
          }),
          { Tty: false },
          () => undefined
        )
        .on("container", (container: Container) => {
          resolve(container.id);
        });
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
