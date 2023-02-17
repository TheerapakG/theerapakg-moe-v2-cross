import crypto from "crypto";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { useDocker } from "~/utils/server/useDocker";
import { getSafeIdFromId } from "~/utils/server/getId";
import { getFilePermForUser } from "~/utils/server/getFilePermForUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:manage")) <=
      0
    )
      throw createError({ statusMessage: "no permission" });

    const fileId = getSafeIdFromId(event.context.params?.id);

    const { view } = await getFilePermForUser(`file:${fileId}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${fileId}`, "dir");

    const id = crypto.randomUUID();
    const containerId = `container:${id}` as const;

    const dockerId = await new Promise<string>((resolve, reject) => {
      useDocker().createContainer(
        {
          Image: "python:3.9",
          Cmd: ["python3", "/app/app.py"],
          Volumes: {
            "/app/app.py": {},
          },
          HostConfig: {
            Binds: [`${dir}:/app/app.py:ro`],
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
