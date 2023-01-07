import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { useDocker } from "~/server/utils/useDocker";
import { getSafeIdFromId } from "~/server/utils/getId";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(
        `perms:${user}`,
        "perms:container:inspect"
      )) <= 0
    )
      throw createError({ statusMessage: "no permission" });

    const id = getSafeIdFromId(event.context.params.id as string);
    const dockerId = await useRedis().hget(`container:${id}`, "dockerId");

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    const {
      State: { Dead: dead, Paused: paused, Running: running, Status: status },
    } = await useDocker().getContainer(dockerId).inspect();

    return {
      state: {
        dead,
        paused,
        running,
        status,
      },
    };
  })
);
