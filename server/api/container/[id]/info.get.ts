import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { useDocker } from "~/utils/server/useDocker";
import { getSafeIdFromId } from "~/utils/server/getId";

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
