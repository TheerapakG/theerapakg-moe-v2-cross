import crypto from "crypto";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { useDocker } from "~/server/utils/useDocker";
import { getSafeIdFromId } from "~/server/utils/getId";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:manage")) <=
      0
    )
      throw createError({ statusMessage: "no permission" });

    const fileId = getSafeIdFromId(event.context.params.id as string);

    const { view } = await getFilePermForUser(`file:${fileId}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${fileId}`, "dir");

    const id = crypto.randomUUID();
    const containerId = `container:${id}` as const;

    const dockerId = await new Promise<string>((resolve, reject) => {
      useDocker().createContainer(
        {
          Image: "gcc:11",
          Cmd: ["/bin/bash", "-c", "gcc /app/app.c -o /app/app; /app/app"],
          Volumes: {
            "/app/app.c": {},
          },
          HostConfig: {
            Binds: [`${dir}:/app/app.c:ro`],
          },
          WorkingDir: "/app",
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
