import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { ShDocument, useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }
    if (event.context.params.name?.includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }

    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:sh:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<ShDocument>("shs")
      .deleteDocument(event.context.params.name);

    await useRedis()
      .multi()
      .zrem("sh:ids", `sh::${event.context.params.name}`)
      .del(`sh::${event.context.params.name}`)
      .exec();

    return {};
  })
);