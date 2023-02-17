import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { useDocker } from "~/utils/server/useDocker";
import { getSafeIdFromId } from "~/utils/server/getId";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:manage")) <=
      0
    )
      throw createError({ statusMessage: "no permission" });

    const id = getSafeIdFromId(event.context.params?.id);
    const containerId = `container:${id}`;
    const dockerId = await useRedis().hget(containerId, "dockerId");

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    await useDocker().getContainer(dockerId).kill();

    return {};
  })
);
