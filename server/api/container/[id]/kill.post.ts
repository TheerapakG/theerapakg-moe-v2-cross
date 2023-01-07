import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { useDocker } from "~/server/utils/useDocker";
import { getSafeIdFromId } from "~/server/utils/getId";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:manage")) <=
      0
    )
      throw createError({ statusMessage: "no permission" });

    const id = getSafeIdFromId(event.context.params.id as string);
    const containerId = `container:${id}`;
    const dockerId = await useRedis().hget(containerId, "dockerId");

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    await useDocker().getContainer(dockerId).kill();

    return {};
  })
);
