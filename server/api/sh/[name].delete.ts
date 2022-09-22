import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if ((event.context.params.name as string).includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }

    const user = await getUser(event);
    if ((await useRedis().sismember(`${user}:perms`, "perms:sh:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    await useRedis()
      .multi()
      .zrem("sh::ids", `sh:${event.context.params.name}`)
      .del(`sh:${event.context.params.name}`)
      .exec();

    return {};
  })
);
